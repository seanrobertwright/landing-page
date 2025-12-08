import { getDb } from './index';

export interface Link {
  id: string;
  title: string;
  url: string;
  favicon_url: string | null;
  folder_id: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function getAllLinks(): Link[] {
  const db = getDb();
  return db.prepare('SELECT * FROM links ORDER BY sort_order, title').all() as Link[];
}

export function getLinkById(id: string): Link | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM links WHERE id = ?').get(id) as Link | undefined;
}

export function getLinksByFolder(folderId: string): Link[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM links WHERE folder_id = ? ORDER BY sort_order, title')
    .all(folderId) as Link[];
}

export function createLink(data: {
  title: string;
  url: string;
  folder_id: string;
  favicon_url?: string | null;
}): Link {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(
    'INSERT INTO links (id, title, url, favicon_url, folder_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, data.title, data.url, data.favicon_url ?? null, data.folder_id, now, now);

  return getLinkById(id)!;
}

export function updateLink(
  id: string,
  data: {
    title?: string;
    url?: string;
    favicon_url?: string | null;
    folder_id?: string;
    sort_order?: number;
  }
): Link | undefined {
  const db = getDb();
  const now = new Date().toISOString();

  const updates: string[] = [];
  const values: any[] = [];

  if (data.title !== undefined) {
    updates.push('title = ?');
    values.push(data.title);
  }
  if (data.url !== undefined) {
    updates.push('url = ?');
    values.push(data.url);
  }
  if (data.favicon_url !== undefined) {
    updates.push('favicon_url = ?');
    values.push(data.favicon_url);
  }
  if (data.folder_id !== undefined) {
    updates.push('folder_id = ?');
    values.push(data.folder_id);
  }
  if (data.sort_order !== undefined) {
    updates.push('sort_order = ?');
    values.push(data.sort_order);
  }

  if (updates.length === 0) return getLinkById(id);

  updates.push('updated_at = ?');
  values.push(now);
  values.push(id);

  db.prepare(`UPDATE links SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  return getLinkById(id);
}

export function deleteLink(id: string): void {
  const db = getDb();
  db.prepare('DELETE FROM links WHERE id = ?').run(id);
}

export interface ReorderLinkItem {
  id: string;
  folder_id: string;
  sort_order: number;
}

export function reorderLinks(items: ReorderLinkItem[]): void {
  const db = getDb();
  const now = new Date().toISOString();

  const stmt = db.prepare(
    'UPDATE links SET folder_id = ?, sort_order = ?, updated_at = ? WHERE id = ?'
  );

  const transaction = db.transaction((links: ReorderLinkItem[]) => {
    for (const link of links) {
      stmt.run(link.folder_id, link.sort_order, now, link.id);
    }
  });

  transaction(items);
}
