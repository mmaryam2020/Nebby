
# Nebby Navigator

**Your Intergalactic Co-Pilot for Navigating Life**

Nebby Navigator is a gamified self-care and productivity companion designed to help you manage energy and tasks. At its heart is **Nebby**, a friendly, glowing space-blob who adapts to your "fuel levels" to help you decide when to cruise and when to engage warp drive.

**Live at**: [https://nebby.hexora.ca](https://nebby.hexora.ca)

---

## Key Features

### 1. Life-Sign Scan & Adaptive Modes
Start your day by setting your energy level.
- **Quiet Nebula (`< 50%`)**: A calming purple theme. Nebby encourages maintenance and rest. Only essential tasks are visible.
- **Supernova (`>= 50%`)**: A vibrant orange theme. Nebby is ready for action. All tasks are visible for high-output days.

### 2. The Black Hole (AI Brain Dump)
Dump your chaotic thoughts into the "Black Hole" using text or **Voice Input**.
- **AI Processing**: Uses Google's **Gemini Flash Lite** model to analyze your dump.
- **Auto-Triage**: Thoughts are converted into actionable tasks, categorized by energy type (`quietNebula` vs `supernova`), and assigned an effort level (1-5).

### 3. Data Persistence
- **SQLite Database**: All data (tasks, logs, stars, preferences) is stored server-side in a SQLite database with WAL mode for reliability.
- **Task Archiving**: Deleted tasks are archived (never permanently lost) with timestamps for data preservation.
- **The Void**: Tasks sitting in the backlog for over 30 days "evaporate" into The Void. You can visit The Void to restore them if needed, but Nebby encourages letting go.
- **Automated Backups**: Daily SQLite snapshots using safe `.backup` command.

### 4. Gamified Dashboard
- **Console**: Your main flight deck for active tasks and daily protocols.
- **Expeditions**: Group tasks into long-term projects.
- **Cargo Hold**: A backlog for tasks you aren't ready for yet.
- **Logbook**: Track your daily mood ("Energy Signature") and write supplemental logs. Multiple entries per day supported.
- **Star Map**: Every completed task adds a star to your personal nebula. Watch it grow over time!

### 5. Voice Input
- Click the **Microphone** button in the Brain Dump or Expedition Log to dictate tasks and thoughts hands-free.
- Uses the browser's built-in **Web Speech API** — free, no API key needed, works on iOS with HTTPS.

---

## Tech Stack

### Frontend
- **React 19** + **TypeScript**
- **Vite** (dev server & build)
- **Tailwind CSS** + Glassmorphism design
- **Google Material Symbols** (icons)

### Backend
- **Express.js** server with TypeScript
- **better-sqlite3** (SQLite with WAL mode)
- **dotenv** for environment config
- Runs via **tsx** (TypeScript execution)

### AI Integration
- **Google Generative AI** (`@google/genai` SDK)
- Model: `gemini-flash-lite-latest`
- Features: Brain dump triage (text to structured tasks)

### Infrastructure
- **HTTPS** via Let's Encrypt (auto-renewal)
- **nginx** reverse proxy
- **pm2** process manager

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Google Gemini API key

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mmaryam2020/Nebby.git
   cd Nebby
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up API Key**:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your key:
   ```
   GEMINI_API_KEY=your_google_gemini_key_here
   ```

4. **Run in development** (two terminals):
   ```bash
   # Terminal 1: Frontend (Vite dev server)
   npm run dev

   # Terminal 2: Backend (Express API server)
   npm run dev:server
   ```

5. **Run in production**:
   ```bash
   npm run build
   npm start
   ```
   This builds the React app and serves it alongside the API from a single Express process.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks?status=` | Get tasks by status (active, backlog, void) |
| POST | `/api/tasks` | Create tasks |
| PUT | `/api/tasks/:id/status` | Update task status |
| DELETE | `/api/tasks/:id` | Archive and delete task |
| GET | `/api/stars` | Get completed tasks for Star Map |
| POST | `/api/stars` | Add a completed star |
| GET | `/api/log` | Get logbook entries |
| POST | `/api/log` | Create log entry |
| GET | `/api/preferences` | Get user preferences |
| PUT | `/api/preferences` | Save preferences |
| POST | `/api/gemini/brain-dump` | AI triage for brain dump text |
| GET | `/api/health` | Health check |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GEMINI_API_KEY` | (required) | Google Gemini API key |
| `PORT` | `3001` | Server port |
| `DB_PATH` | `data/nebby.db` | SQLite database path |
| `NODE_ENV` | `development` | Set to `production` to serve built frontend |

---

*"Even stars need to dim sometimes to save fuel."* — Nebby
