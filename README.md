
# Nebby Navigator 🌌

**Your Intergalactic Co-Pilot for Navigating Life**

Nebby Navigator is a gamified self-care and productivity companion designed to help you manage energy and tasks. At its heart is **Nebby**, a friendly, glowing space-blob who adapts to your "fuel levels" to help you decide when to cruise and when to engage warp drive.

---

## 🛸 Key Features

### 1. Life-Sign Scan & Adaptive Modes
Start your day by setting your energy level.
- **Quiet Nebula (`< 50%`)**: A calming purple theme. Nebby encourages maintenance and rest. Only essential tasks are visible.
- **Supernova (`>= 50%`)**: A vibrant orange theme. Nebby is ready for action. All tasks are visible for high-output days.

### 2. The Black Hole (AI Brain Dump)
Dump your chaotic thoughts into the "Black Hole" using text or **Voice Input**.
- **AI Processing**: The app uses Google's **Gemini 3 Flash** model to analyze your dump.
- **Auto-Triage**: Thoughts are converted into actionable tasks, categorized by energy type (`quietNebula` vs `supernova`), and assigned an effort level (1-5).

### 3. Smart Persistence
- **Local Storage**: Your mission data (tasks, logs, fuel) is saved directly in your browser. No login required.
- **The Void**: To prevent hoarding, tasks sitting in the backlog for over 30 days "evaporate" into The Void. You can visit The Void to restore them if needed, but Nebby encourages letting go.

### 4. Gamified Dashboard
- **Console**: Your main flight deck for active tasks and daily protocols.
- **Expeditions**: Group tasks into long-term projects.
- **Cargo Hold**: A backlog for tasks you aren't ready for yet.
- **Logbook**: Track your daily mood ("Energy Signature") and write supplemental logs.
- **Star Map**: Every completed task adds a star to your personal nebula. Watch it grow over time!

### 5. Voice Command
- Click the **Microphone** button in the Brain Dump or Expedition Log to dictate your tasks and thoughts hands-free.

---

## 🛠 Tech Stack

- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS + Glassmorphism design
- **AI**: Google GenAI SDK (`@google/genai`)
- **Icons**: Google Material Symbols
- **State**: React Hooks + LocalStorage

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/nebby-navigator.git
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up API Key**:
   - Create a `.env` file in the root directory.
   - Add your key: `API_KEY=your_google_gemini_key_here`
   - **IMPORTANT**: Never commit the `.env` file to GitHub.
4. **Run the app**:
   ```bash
   npm start
   ```

## 🔒 Security & Deployment

### Is the API Key Safe?
The source code references `process.env.API_KEY`, so your actual key is **not** hardcoded in the files. It is safe to push this code to GitHub as long as you **do not commit your `.env` file**. A `.gitignore` file is included to prevent this.

### Deployment (e.g., Vercel, Netlify, GitHub Pages)
Since this is a client-side application, your API key will be embedded in the browser code so the app can talk to Google.
To secure your key:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Locate your API Key.
3. Under "Application restrictions", select **Websites**.
4. Add the URL of your deployed app (e.g., `https://your-username.github.io` or `https://nebby-navigator.vercel.app`).

This ensures that even if someone finds your key, they cannot use it from a different website.

---

*“Even stars need to dim sometimes to save fuel.”* — Nebby
