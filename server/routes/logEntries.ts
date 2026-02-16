import { Router } from 'express';
import { getDb } from '../db/database';

const router = Router();

router.get('/', (_req, res) => {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM log_entries ORDER BY created_at DESC').all();
    res.json(rows);
});

router.post('/', (req, res) => {
    const db = getDb();
    const { mood, text } = req.body;
    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];
    const id = `log-${now}`;

    db.prepare(
        'INSERT INTO log_entries (id, date, created_at, mood, text) VALUES (?, ?, ?, ?, ?)'
    ).run(id, today, now, mood, text || '');

    res.json({ id, date: today, createdAt: now, mood, text: text || '' });
});

export default router;
