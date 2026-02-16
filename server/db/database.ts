import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

let db: Database.Database;

export function getDb(): Database.Database {
    if (!db) {
        const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'data', 'nebby.db');
        const dir = path.dirname(dbPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        db = new Database(dbPath);
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');
    }
    return db;
}

export function initializeDatabase(): void {
    const database = getDb();
    const schema = fs.readFileSync(path.join(process.cwd(), 'server', 'db', 'schema.sql'), 'utf-8');
    database.exec(schema);

    // Run migrations for existing databases
    runMigrations(database);
}

function runMigrations(database: Database.Database): void {
    // Migration: Add text and completed_date to completed_tasks table
    try {
        // Check if columns exist by trying to select them
        const hasTextColumn = database.prepare("SELECT text FROM completed_tasks LIMIT 0").pluck();
        hasTextColumn.get(); // Will throw if column doesn't exist
    } catch {
        // Column doesn't exist, add it
        console.log('🔄 Migration: Adding text column to completed_tasks');
        database.exec(`ALTER TABLE completed_tasks ADD COLUMN text TEXT NOT NULL DEFAULT 'Completed Task'`);
    }

    try {
        const hasDateColumn = database.prepare("SELECT completed_date FROM completed_tasks LIMIT 0").pluck();
        hasDateColumn.get(); // Will throw if column doesn't exist
    } catch {
        // Column doesn't exist, add it
        console.log('🔄 Migration: Adding completed_date column to completed_tasks');
        const today = new Date().toISOString().split('T')[0];
        database.exec(`ALTER TABLE completed_tasks ADD COLUMN completed_date TEXT NOT NULL DEFAULT '${today}'`);
    }
}
