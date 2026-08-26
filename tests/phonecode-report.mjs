import assert from "node:assert/strict"
import { onRequest } from "../functions/api/phonecode/report.js"

let count = 0
const database = {
  prepare(sql) {
    return {
      bind() {
        return {
          sql,
          async first() {
            count += 1
            return { count }
          },
        }
      },
    }
  },
  async batch(statements) {
    assert.equal(statements.length, 3)
    assert.match(statements[0].sql, /INSERT INTO ai_reports/)
    return statements.map(() => ({ success: true }))
  },
}
const env = {
  REPORT_DB: database,
  REPORT_RATE_SALT: "test-salt-that-is-at-least-32-bytes",
}
const makeRequest = (body, headers = {}) => new Request("https://dttdrv.xyz/api/phonecode/report", {
  method: "POST",
  headers: {
    "CF-Connecting-IP": "192.0.2.1",
    "Content-Type": "application/json",
    ...headers,
  },
  body: JSON.stringify(body),
})
const valid = {
  version: 1,
  category: "other",
  note: "The response was not appropriate.",
  appVersion: "0.2.4",
  platform: "android",
}
const accepted = await onRequest({ request: makeRequest(valid), env, waitUntil() {} })
assert.equal(accepted.status, 202)
assert.equal((await accepted.json()).accepted, true)

const browser = await onRequest({ request: makeRequest(valid, { Origin: "https://dttdrv.xyz" }), env })
assert.equal(browser.status, 403)

const unknown = await onRequest({ request: makeRequest({ ...valid, assistantOutput: "secret" }), env })
assert.equal(unknown.status, 400)

for (let i = 0; i < 4; i += 1) await onRequest({ request: makeRequest(valid), env, waitUntil() {} })
const limited = await onRequest({ request: makeRequest(valid), env, waitUntil() {} })
assert.equal(limited.status, 429)

const unconfigured = await onRequest({ request: makeRequest(valid), env: {} })
assert.equal(unconfigured.status, 503)
