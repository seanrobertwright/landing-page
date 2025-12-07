import Database from 'better-sqlite3';

export function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parent_id TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_id);

    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      favicon_url TEXT,
      folder_id TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_links_folder ON links(folder_id);
  `);

  const count = db.prepare('SELECT COUNT(*) as count FROM folders').get() as { count: number };
  if (count.count === 0) {
    const defaultFolderId = crypto.randomUUID();
    db.prepare('INSERT INTO folders (id, name, parent_id) VALUES (?, ?, NULL)').run(
      defaultFolderId,
      'Bookmarks'
    );
  }
}
