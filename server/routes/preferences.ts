import { Router } from 'express';
import { getDb } from '../db/database';

const router = Router();

router.get('/', (_req, res) => {
    const db = getDb();
    const rows = db.prepare('SELECT key, value FROM preferences').all() as { key: string; value: string }[];
    const prefs: Record<string, any> = {};
    for (const row of rows) {
        try {
            prefs[row.key] = JSON.parse(row.value);
        } catch {
            prefs[row.key] = row.value;
        }
    }
    res.json(prefs);
});

router.put('/', (req, res) => {
    const db = getDb();
    const upsert = db.prepare('INSERT INTO preferences (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
    const updateMany = db.transaction((prefs: Record<string, any>) => {
        for (const [key, value] of Object.entries(prefs)) {
            upsert.run(key, JSON.stringify(value));
        }
    });
    updateMany(req.body);
    res.json({ ok: true });
});

export default router;
