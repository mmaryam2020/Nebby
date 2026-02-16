# Nebby Navigator Changelog

## 2026-02-16

### Server & Infrastructure Fixes

- **Fixed better-sqlite3 native module**: Rebuilt with `npm rebuild better-sqlite3` — was failing with ERR_DLOPEN_FAILED
- **Fixed database permissions**: Corrected ownership of data/ directory — app was crashing with SQLITE_READONLY
- **Fixed NODE_ENV**: Was not being set properly, so Express was not serving the built frontend
- **Fixed port conflict**: Resolved port collision between multiple apps
- **Fixed dual pm2 daemon conflict**: Multiple pm2 daemons were causing restart loops. Consolidated under a single pm2 instance

### Backup Improvements

- **Fixed unsafe backup**: Old cron used cp which skips SQLite WAL data (backups were 4KB/empty). Replaced with sqlite3 .backup command
- **Created backup script**: Safe SQLite snapshot, timestamped, auto-deletes backups older than 30 days
- **Updated crontab**: Daily 3am backup now uses the new script

### Voice Input

- **Replaced Gemini transcription with Web Speech API**: Voice input now uses the browser's built-in speech recognition instead of MediaRecorder + Gemini API. Free, no API key needed, works on iOS
- **Rebuilt frontend** from source and redeployed

### HTTPS & Domain Setup

- **Enabled HTTPS**: Installed Let's Encrypt SSL via certbot with auto-renewal
- **Updated nginx**: Configured HTTPS on port 443
- **Voice now works on iOS**: HTTPS was required for Web Speech API to function in Safari/Chrome

### Data Preservation

- **Tasks are now archived, never deleted**: DELETE route moves tasks to `archived_tasks` table instead of removing them. All original data is preserved with an `archived_at` timestamp
- Completed tasks and log entries were already preserved (no delete routes existed)
- Evaporation (backlog to void after 30 days) only changes status, data stays in the database
