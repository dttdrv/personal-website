# PhoneCode AI report endpoint

The endpoint is `POST /api/phonecode/report`. It accepts only native, non-browser requests and durably stores an allowlisted report in a private D1 database. It never accepts prompts, assistant output, files, tool activity, credentials, device identifiers, or chat history.

The JSON body requires `version: 1`, `category`, `appVersion`, and `platform`. Categories are `hate`, `harassment`, `sexual`, `violence`, `self_harm`, `illegal`, `privacy`, or `other`; platforms are `android` or `ios`. The optional user-authored `note` is limited to 1000 characters. Unknown fields are rejected, and the complete UTF-8 body is limited to 4096 bytes.

## Cloudflare setup

1. Create the free-tier D1 database and apply its schema:

   ```sh
   npx wrangler d1 create phonecode-report-rate-limit
   npx wrangler d1 execute phonecode-report-rate-limit --remote --file=migrations/0001_report_rate_limits.sql
   ```

2. In the existing Pages project, open Settings → Bindings, add a Production D1 binding named `REPORT_DB`, and select `phonecode-report-rate-limit`. Use a separate database for Preview or leave Preview unconfigured.

3. Get the existing Pages project name, set it locally, and create an encrypted Production secret with at least 32 random characters:

   ```sh
   npx wrangler pages project list
   PAGES_PROJECT=replace-with-project-name
   npx wrangler pages secret put REPORT_RATE_SALT --project-name "$PAGES_PROJECT"
   ```

4. Deploy through the existing Pages Git integration. Confirm the production function, not a static fallback, answers the health check honestly:

   ```sh
   curl -i -X POST https://dttdrv.xyz/api/phonecode/report -H 'Content-Type: application/json' --data '{"version":1,"category":"other","appVersion":"0.0.0-check","platform":"android"}'
   ```

Cloudflare supplies `CF-Connecting-IP` at the edge. A working configuration returns `202`. Missing bindings or secrets return `503`, invalid input returns `400`, browser-origin requests return `403`, and rate limiting returns `429`.

Inspect reports privately with `npx wrangler d1 execute phonecode-report-rate-limit --remote --command 'SELECT * FROM ai_reports ORDER BY received_at DESC LIMIT 50'`. Do not expose this database through a public read endpoint.

The rate-limit table stores only a salted daily hash of the connecting IP, a ten-minute counter window, and timestamps. Rate-limit rows older than 48 hours and reports older than 90 days are deleted transactionally when a report is accepted. The endpoint allows five requests per connecting IP in ten minutes. Cloudflare may retain ordinary request metadata under the Pages account settings; configure Cloudflare log retention consistently with the published privacy policy.
