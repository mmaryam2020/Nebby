import { Router } from 'express';
import { getDb } from '../db/database';

const router = Router();

interface TaskRow {
    id: number;
    text: string;
    type: string;
    status: string;
    expedition_id: number | null;
    expedition_title: string | null;
    energy_level: number | null;
    created_at: number | null;
}

function rowToTask(row: TaskRow) {
    return {
        id: row.id,
        text: row.text,
        type: row.type,
        status: row.status,
        expeditionId: row.expedition_id ?? undefined,
        expeditionTitle: row.expedition_title ?? undefined,
        energyLevel: row.energy_level ?? undefined,
        createdAt: row.created_at ?? undefined,
    };
}

router.get('/', (req, res) => {
    const db = getDb();
    const status = req.query.status as string;
    if (status) {
        const rows = db.prepare('SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC').all(status) as TaskRow[];
        res.json(rows.map(rowToTask));
    } else {
        const rows = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all() as TaskRow[];
        res.json(rows.map(rowToTask));
    }
});

router.post('/', (req, res) => {
    const db = getDb();
    const insert = db.prepare(
        'INSERT INTO tasks (id, text, type, status, expedition_id, expedition_title, energy_level, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const tasks = Array.isArray(req.body) ? req.body : [req.body];
    const insertMany = db.transaction((items: any[]) => {
        for (const t of items) {
            insert.run(
                t.id ?? Date.now() + Math.random(),
                t.text,
                t.type,
                t.status ?? 'active',
                t.expeditionId ?? null,
                t.expeditionTitle ?? null,
                t.energyLevel ?? null,
                t.createdAt ?? Date.now()
            );
        }
    });
    insertMany(tasks);
    res.json({ ok: true, count: tasks.length });
});

router.put('/:id/status', (req, res) => {
    const db = getDb();
    const { status } = req.body;
    const id = parseFloat(req.params.id);
    if (status === 'backlog') {
        // When restoring from void or delegating, refresh createdAt
        db.prepare('UPDATE tasks SET status = ?, created_at = ? WHERE id = ?').run(status, Date.now(), id);
    } else {
        db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(status, id);
    }
    res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
    const db = getDb();
    const id = parseFloat(req.params.id);
    const archiveAndDelete = db.transaction(() => {
        db.prepare(
            'INSERT OR REPLACE INTO archived_tasks (id, text, type, status, expedition_id, expedition_title, energy_level, created_at, archived_at) SELECT id, text, type, status, expedition_id, expedition_title, energy_level, created_at, ? FROM tasks WHERE id = ?'
        ).run(Date.now(), id);
        db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    });
    archiveAndDelete();
    res.json({ ok: true });
});

export default router;
