CREATE TABLE IF NOT EXISTS tasks (
    id               REAL PRIMARY KEY,
    text             TEXT NOT NULL,
    type             TEXT NOT NULL CHECK(type IN ('quietNebula', 'supernova')),
    status           TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'backlog', 'void')),
    expedition_id    REAL,
    expedition_title TEXT,
    energy_level     INTEGER,
    created_at       REAL
);

CREATE TABLE IF NOT EXISTS completed_tasks (
    id               REAL PRIMARY KEY,
    text             TEXT NOT NULL,
    type             TEXT NOT NULL CHECK(type IN ('quietNebula', 'supernova', 'default')),
    x                REAL NOT NULL,
    y                REAL NOT NULL,
    completed_date   TEXT NOT NULL,
    expedition_id    REAL,
    expedition_title TEXT
);

CREATE TABLE IF NOT EXISTS log_entries (
    id         TEXT PRIMARY KEY,
    date       TEXT NOT NULL,
    created_at REAL NOT NULL,
    mood       INTEGER NOT NULL,
    text       TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS preferences (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS archived_tasks (
    id               REAL PRIMARY KEY,
    text             TEXT NOT NULL,
    type             TEXT NOT NULL,
    status           TEXT NOT NULL,
    expedition_id    REAL,
    expedition_title TEXT,
    energy_level     INTEGER,
    created_at       REAL,
    archived_at      REAL NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_log_date ON log_entries(date);
CREATE INDEX IF NOT EXISTS idx_log_created ON log_entries(created_at);
