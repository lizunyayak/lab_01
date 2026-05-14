import Database from 'better-sqlite3';
import { readFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import path from 'path';

const DATA_DIR   = path.join(__dirname, '../../data');
const DB_PATH    = path.join(DATA_DIR, 'app.db');
const MIGRATIONS = path.join(__dirname, '../../migrations');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
  }
  return _db;
}

export function runMigrations(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL
    )
  `);

  const applied = new Set(
    (db.prepare('SELECT name FROM schema_migrations').all() as { name: string }[])
      .map(r => r.name)
  );

  const files = readdirSync(MIGRATIONS)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = readFileSync(path.join(MIGRATIONS, file), 'utf8');
    db.exec(sql);
    db.exec(
      `INSERT INTO schema_migrations (name, applied_at) VALUES ('${file}', '${new Date().toISOString()}')`
    );
    console.log(`\x1b[36m[DB] Migration applied: ${file}\x1b[0m`);
  }

  console.log('\x1b[36m[DB] Schema ready\x1b[0m');
}
