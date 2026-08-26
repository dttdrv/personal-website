const allowedKeys = new Set(["version", "category", "note", "appVersion", "platform"])
const categories = new Set(["hate", "harassment", "sexual", "violence", "self_harm", "illegal", "privacy", "other"])
const platforms = new Set(["android", "ios"])
const encoder = new TextEncoder()

function response(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  })
}

function text(value, name, maximum, required = false, multiline = false) {
  if (value === undefined && !required) return undefined
  if (typeof value !== "string") throw new Error(`${name} must be a string`)
  const clean = value.trim()
  if ((required && clean.length === 0) || clean.length > maximum) throw new Error(`${name} is invalid`)
  if (multiline ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(clean) : /[\u0000-\u001f\u007f]/u.test(clean)) {
    throw new Error(`${name} contains invalid characters`)
  }
  return clean || undefined
}

function validate(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("body must be an object")
  const keys = Object.keys(value)
  if (keys.some((key) => !allowedKeys.has(key))) throw new Error("body contains an unknown field")
  if (value.version !== 1) throw new Error("version must be 1")
  if (!categories.has(value.category)) throw new Error("category is invalid")
  if (!platforms.has(value.platform)) throw new Error("platform is invalid")
  return {
    version: 1,
    category: value.category,
    note: text(value.note, "note", 1000, false, true),
    appVersion: text(value.appVersion, "appVersion", 32, true),
    platform: value.platform,
  }
}

async function readBody(request) {
  if (!/^application\/json(?:\s*;|$)/iu.test(request.headers.get("Content-Type") || "")) throw new Error("content type must be application/json")
  const declared = Number(request.headers.get("Content-Length") || 0)
  if (declared > 4096) throw new Error("body is too large")
  const bytes = new Uint8Array(await request.arrayBuffer())
  if (bytes.byteLength === 0 || bytes.byteLength > 4096) throw new Error("body is invalid")
  return validate(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)))
}

async function hash(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")
}

async function rateLimit(database, salt, ip, now) {
  const day = Math.floor(now / 86400000)
  const key = await hash(`${salt}\u0000${day}\u0000${ip}`)
  const second = Math.floor(now / 1000)
  const cutoff = second - 600
  const row = await database.prepare(`
    INSERT INTO report_rate_limits (key, window_start, count, last_seen)
    VALUES (?, ?, 1, ?)
    ON CONFLICT(key) DO UPDATE SET
      count = CASE WHEN report_rate_limits.window_start <= ? THEN 1 ELSE report_rate_limits.count + 1 END,
      window_start = CASE WHEN report_rate_limits.window_start <= ? THEN excluded.window_start ELSE report_rate_limits.window_start END,
      last_seen = excluded.last_seen
    RETURNING count
  `).bind(key, second, second, cutoff, cutoff).first()
  const count = Number(row?.count)
  return Number.isInteger(count) && count > 0 && count <= 5
}

export async function onRequest(context) {
  const { request, env } = context
  if (request.method !== "POST") return response(405, { error: "method not allowed" }, { Allow: "POST" })
  if (request.headers.has("Origin") || request.headers.has("Sec-Fetch-Site")) return response(403, { error: "browser requests are not accepted" })
  if (!env.REPORT_DB || typeof env.REPORT_RATE_SALT !== "string" || env.REPORT_RATE_SALT.length < 32) return response(503, { error: "reporting is not configured" })
  const ip = request.headers.get("CF-Connecting-IP")
  if (!ip) return response(400, { error: "request source is unavailable" })

  let report
  try {
    report = await readBody(request)
  } catch (error) {
    return response(400, { error: error instanceof Error ? error.message : "invalid request" })
  }

  let allowed
  try {
    allowed = await rateLimit(env.REPORT_DB, env.REPORT_RATE_SALT, ip, Date.now())
  } catch {
    return response(503, { error: "reporting is temporarily unavailable" })
  }
  if (!allowed) return response(429, { error: "too many reports" }, { "Retry-After": "600" })

  const now = Math.floor(Date.now() / 1000)
  const id = crypto.randomUUID()
  try {
    const results = await env.REPORT_DB.batch([
      env.REPORT_DB.prepare(`
        INSERT INTO ai_reports (id, received_at, version, category, note, app_version, platform)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(id, now, report.version, report.category, report.note ?? null, report.appVersion, report.platform),
      env.REPORT_DB.prepare("DELETE FROM ai_reports WHERE received_at < ?").bind(now - 7776000),
      env.REPORT_DB.prepare("DELETE FROM report_rate_limits WHERE last_seen < ?").bind(now - 172800),
    ])
    if (results.some((result) => result?.success === false)) throw new Error("database rejected report")
  } catch {
    return response(503, { error: "reporting is temporarily unavailable" })
  }
  return response(202, { accepted: true, id })
}
