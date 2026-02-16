import { Router } from 'express';
import { getDb } from '../db/database';

const router = Router();

interface StarRow {
    id: number;
    text: string;
    type: string;
    x: number;
    y: number;
    completed_date: string;
    expedition_id: number | null;
    expedition_title: string | null;
}

function rowToStar(row: StarRow) {
    return {
        id: row.id,
        text: row.text,
        type: row.type,
        x: row.x,
        y: row.y,
        completedDate: row.completed_date,
        expeditionId: row.expedition_id ?? undefined,
        expeditionTitle: row.expedition_title ?? undefined,
    };
}

router.get('/', (_req, res) => {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM completed_tasks').all() as StarRow[];
    res.json(rows.map(rowToStar));
});

router.post('/', (req, res) => {
    const db = getDb();
    const s = req.body;
    db.prepare(
        'INSERT INTO completed_tasks (id, text, type, x, y, completed_date, expedition_id, expedition_title) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
        s.id,
        s.text,
        s.type,
        s.x,
        s.y,
        s.completedDate,
        s.expeditionId ?? null,
        s.expeditionTitle ?? null
    );
    res.json({ ok: true });
});

export default router;
