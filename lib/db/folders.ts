import { getDb } from './index';

export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function getAllFolders(): Folder[] {
  const db = getDb();
  return db.prepare('SELECT * FROM folders ORDER BY sort_order, name').all() as Folder[];
}

export function getFolderById(id: string): Folder | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM folders WHERE id = ?').get(id) as Folder | undefined;
}

export function createFolder(data: { name: string; parent_id?: string | null }): Folder {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(
    'INSERT INTO folders (id, name, parent_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
  ).run(id, data.name, data.parent_id ?? null, now, now);

  return getFolderById(id)!;
}

export function updateFolder(
  id: string,
  data: { name?: string; parent_id?: string | null; sort_order?: number }
): Folder | undefined {
  const db = getDb();
  const now = new Date().toISOString();

  const updates: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.parent_id !== undefined) {
    updates.push('parent_id = ?');
    values.push(data.parent_id);
  }
  if (data.sort_order !== undefined) {
    updates.push('sort_order = ?');
    values.push(data.sort_order);
  }

  if (updates.length === 0) return getFolderById(id);

  updates.push('updated_at = ?');
  values.push(now);
  values.push(id);

  db.prepare(`UPDATE folders SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  return getFolderById(id);
}

export function deleteFolder(id: string): void {
  const db = getDb();
  db.prepare('DELETE FROM folders WHERE id = ?').run(id);
}

export interface ReorderFolderItem {
  id: string;
  parent_id: string | null;
  sort_order: number;
}

export function reorderFolders(items: ReorderFolderItem[]): void {
  const db = getDb();
  const now = new Date().toISOString();

  const stmt = db.prepare(
    'UPDATE folders SET parent_id = ?, sort_order = ?, updated_at = ? WHERE id = ?'
  );

  const transaction = db.transaction((folders: ReorderFolderItem[]) => {
    for (const folder of folders) {
      stmt.run(folder.parent_id, folder.sort_order, now, folder.id);
    }
  });

  transaction(items);
}
