CREATE TABLE IF NOT EXISTS report_rate_limits (
  key TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL,
  last_seen INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS report_rate_limits_last_seen ON report_rate_limits(last_seen);

CREATE TABLE IF NOT EXISTS ai_reports (
  id TEXT PRIMARY KEY,
  received_at INTEGER NOT NULL,
  version INTEGER NOT NULL CHECK (version = 1),
  category TEXT NOT NULL CHECK (category IN ('hate', 'harassment', 'sexual', 'violence', 'self_harm', 'illegal', 'privacy', 'other')),
  note TEXT,
  app_version TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('android', 'ios'))
);

CREATE INDEX IF NOT EXISTS ai_reports_received_at ON ai_reports(received_at);
