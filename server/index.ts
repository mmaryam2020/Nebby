import dotenv from 'dotenv';

// Load environment variables BEFORE any other imports
// This ensures env vars are available when modules are loaded
dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback to .env

import express from 'express';
import path from 'path';
import { initializeDatabase, getDb } from './db/database';
import tasksRouter from './routes/tasks';
import starsRouter from './routes/completedTasks';
import logRouter from './routes/logEntries';
import preferencesRouter from './routes/preferences';
import geminiRouter from './routes/gemini';

console.log('🔑 Loaded API Key:', process.env.GEMINI_API_KEY ? 'EXISTS' : 'MISSING');
console.log('🔑 Key starts with:', process.env.GEMINI_API_KEY?.substring(0, 10));


const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '10mb' }));

// API routes
app.use('/api/tasks', tasksRouter);
app.use('/api/stars', starsRouter);
app.use('/api/log', logRouter);
app.use('/api/preferences', preferencesRouter);
app.use('/api/gemini', geminiRouter);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

// Serve static Vite build in production
if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

// Evaporation protocol: move backlog tasks older than 30 days to void
function runEvaporation() {
    const db = getDb();
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - THIRTY_DAYS_MS;
    const result = db.prepare("UPDATE tasks SET status = 'void' WHERE status = 'backlog' AND created_at < ?").run(cutoff);
    if (result.changes > 0) {
        console.log(`Evaporation: moved ${result.changes} stale tasks to void`);
    }
}

// Initialize DB, run evaporation, start server
initializeDatabase();
runEvaporation();

app.listen(PORT, () => {
    console.log(`Nebby Navigator server running on port ${PORT}`);
});
