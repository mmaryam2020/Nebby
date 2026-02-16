# Nebby Navigator Changelog

## 2026-02-16

### Server & Infrastructure Fixes

- **Fixed better-sqlite3 native module**: Rebuilt with `npm rebuild better-sqlite3` — was failing with ERR_DLOPEN_FAILED
- **Fixed database permissions**: Changed ownership of data/ from root to maryam — app was crashing with SQLITE_READONLY
- **Fixed NODE_ENV**: Was not being set properly, so Express was not serving the built frontend
- **Fixed port conflict**: Both nebby and rescript default to port 3001. Set nebby to run on port 3002 to match nginx config (nginx proxies 8080 to 3002)
- **Fixed dual pm2 daemon conflict**: Root pm2 (/root/.pm2) and maryam pm2 (/home/maryam/.pm2) were both trying to run the same apps, causing 192,000+ restart loops. Consolidated under root pm2
- **Created pm2 ecosystem config** at /home/maryam/ecosystem.config.cjs with correct PORT env vars for both apps

### Backup Improvements

- **Fixed unsafe backup**: Old cron used cp which skips SQLite WAL data (backups were 4KB/empty). Replaced with sqlite3 .backup command
- **Created backup script**: /opt/backups/backup-nebby.sh — safe SQLite snapshot, timestamped, auto-deletes backups older than 30 days
- **Updated root crontab**: Daily 3am backup now uses the new script
- **Manual backup**: Run `sudo /opt/backups/backup-nebby.sh` before making changes

### Voice Input

- **Replaced Gemini transcription with Web Speech API**: Voice input now uses the browser's built-in speech recognition instead of MediaRecorder + Gemini API. Free, no API key needed, works on iOS
- **Rebuilt frontend** from source and redeployed (old build backed up to dist_old/)
- **Source files** copied to /opt/nebby-navigator/src/ and project root for future rebuilds

### HTTPS & Domain Setup

- **Added domain**: nebby.hexora.ca and rescript.hexora.ca (A records pointing to 95.217.188.79)
- **Enabled HTTPS**: Installed Let's Encrypt SSL via certbot with auto-renewal (expires 2026-05-17)
- **Updated nginx**: Changed nebby from port 8080 to port 80 with server_name, certbot auto-configured HTTPS on port 443
- **Voice now works on iOS**: HTTPS was required for Web Speech API to function in Safari/Chrome

### Data Preservation

- **Tasks are now archived, never deleted**: DELETE route moves tasks to `archived_tasks` table instead of removing them. All original data is preserved with an `archived_at` timestamp
- Completed tasks and log entries were already preserved (no delete routes existed)
- Evaporation (backlog to void after 30 days) only changes status, data stays in the database

### Current Architecture

| App      | Internal Port | Nginx Proxy | Access                      |
|----------|--------------|-------------|-----------------------------|
| Nebby    | 3002         | :443 (HTTPS)| https://nebby.hexora.ca     |
| Rescript | 3001         | :443 (HTTPS)| https://rescript.hexora.ca   |
