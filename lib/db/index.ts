import Database from 'better-sqlite3';
import path from 'path';
import { initSchema } from './schema';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    // Use TEST_DB_PATH environment variable during testing, otherwise use default
    const dbFilename = process.env.NODE_ENV === 'test' || process.env.TEST_DB_PATH
      ? 'links.test.db'
      : 'links.db';
    const dbPath = path.join(process.cwd(), 'data', dbFilename);

    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    initSchema(db);
  }
  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
