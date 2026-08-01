import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../data/color-collector.db');

let db: Database.Database | null = null;

export function initializeDatabase(): Database.Database {
  if (db) {
    return db;
  }

  db = new Database(dbPath);
  console.log(`[Database] SQLite database initialized at: ${dbPath}`);

  // 接続確認
  const version = db.prepare('SELECT sqlite_version()').get() as {
    'sqlite_version()': string;
  };
  console.log(`[Database] SQLite version: ${version['sqlite_version()']}`);

  // テーブル作成
  createTables(db);

  return db;
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('データベースが初期化されていません。先に initializeDatabase() を呼び出してください。');
  }
  return db;
}

function createTables(database: Database.Database): void {
  // Players テーブル作成
  database.exec(`
    CREATE TABLE IF NOT EXISTS Players (
      id TEXT PRIMARY KEY,
      player_name TEXT NOT NULL,
      coins INTEGER NOT NULL DEFAULT 0,
      energy INTEGER NOT NULL DEFAULT 0,
      energy_max INTEGER NOT NULL DEFAULT 100,
      last_energy_update TEXT NOT NULL,
      stocks TEXT NOT NULL,
      tap_counts TEXT NOT NULL DEFAULT '{"red":0,"blue":0,"yellow":0}',
      gacha_ticket INTEGER NOT NULL DEFAULT 0,
      total_gacha_count INTEGER NOT NULL DEFAULT 0,
      total_paint_count INTEGER NOT NULL DEFAULT 0,
      gacha_last_claim_date TEXT NOT NULL DEFAULT '',
      constellation TEXT NOT NULL DEFAULT '{"red":0,"blue":0,"yellow":0}',
      created_at TEXT NOT NULL
    );
  `);
  console.log('[Database] Players table created (or already exists)');

  ensurePlayersColumns(database);

  // Maps テーブル作成
  database.exec(`
    CREATE TABLE IF NOT EXISTS Maps (
      id TEXT PRIMARY KEY,
      width INTEGER NOT NULL,
      height INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  console.log('[Database] Maps table created (or already exists)');

  // Cells テーブル作成
  database.exec(`
    CREATE TABLE IF NOT EXISTS Cells (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      map_id TEXT NOT NULL,
      cell_index INTEGER NOT NULL,
      color TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL,
      UNIQUE(map_id, cell_index)
    );
  `);
  console.log('[Database] Cells table created (or already exists)');
}

function ensurePlayersColumns(database: Database.Database): void {
  const columns = database.prepare('PRAGMA table_info(Players)').all() as Array<{ name: string }>;
  const columnNames = new Set(columns.map((column) => column.name));

  if (!columnNames.has('gacha_ticket')) {
    database.exec('ALTER TABLE Players ADD COLUMN gacha_ticket INTEGER NOT NULL DEFAULT 0');
    console.log('[Database] Added Players.gacha_ticket column');
  }

  if (!columnNames.has('gacha_last_claim_date')) {
    database.exec("ALTER TABLE Players ADD COLUMN gacha_last_claim_date TEXT NOT NULL DEFAULT ''");
    console.log('[Database] Added Players.gacha_last_claim_date column');
  }

  if (!columnNames.has('total_gacha_count')) {
    database.exec('ALTER TABLE Players ADD COLUMN total_gacha_count INTEGER NOT NULL DEFAULT 0');
    console.log('[Database] Added Players.total_gacha_count column');
  }

  if (!columnNames.has('total_paint_count')) {
    database.exec('ALTER TABLE Players ADD COLUMN total_paint_count INTEGER NOT NULL DEFAULT 0');
    console.log('[Database] Added Players.total_paint_count column');
  }

  if (!columnNames.has('constellation')) {
    database.exec("ALTER TABLE Players ADD COLUMN constellation TEXT NOT NULL DEFAULT '{\"red\":0,\"blue\":0,\"yellow\":0}'");
    console.log('[Database] Added Players.constellation column');
  }

  if (!columnNames.has('tap_counts')) {
    database.exec("ALTER TABLE Players ADD COLUMN tap_counts TEXT NOT NULL DEFAULT '{\"red\":0,\"blue\":0,\"yellow\":0}'");
    console.log('[Database] Added Players.tap_counts column');
  }
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    console.log('[Database] Database connection closed');
    db = null;
  }
}