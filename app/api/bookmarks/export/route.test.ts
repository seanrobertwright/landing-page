import { describe, it, expect, beforeEach } from 'vitest';
import { GET } from './route';
import { getDb } from '@/lib/db';
import { initSchema } from '@/lib/db/schema';
import { createFolder } from '@/lib/db/folders';
import { createLink } from '@/lib/db/links';

describe('Export API Route', () => {
  beforeEach(() => {
    const db = getDb();
    db.exec('DROP TABLE IF EXISTS links');
    db.exec('DROP TABLE IF EXISTS folders');
    initSchema(db);
  });

  it('should export all bookmarks to JSON', async () => {
    // Create test data
    const folder1 = createFolder({ name: 'Work', parent_id: null });
    const folder2 = createFolder({ name: 'Personal', parent_id: null });
    createLink({
      title: 'GitHub',
      url: 'https://github.com',
      folder_id: folder1.id,
    });
    createLink({
      title: 'Gmail',
      url: 'https://mail.google.com',
      folder_id: folder2.id,
    });

    const request = new Request('http://localhost:3000/api/bookmarks/export', {
      method: 'GET',
    });

    const response = await GET();
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.version).toBe('1.0');
    expect(result.exported_at).toBeDefined();
    expect(result.folder_count).toBeGreaterThanOrEqual(2);
    expect(result.link_count).toBe(2);
    expect(result.folders).toBeInstanceOf(Array);
    expect(result.links).toBeInstanceOf(Array);
  });

  it('should include folder hierarchy in export', async () => {
    // Create nested folders
    const parent = createFolder({ name: 'Parent', parent_id: null });
    const child = createFolder({ name: 'Child', parent_id: parent.id });
    createLink({
      title: 'Test Link',
      url: 'https://example.com',
      folder_id: child.id,
    });

    const request = new Request('http://localhost:3000/api/bookmarks/export', {
      method: 'GET',
    });

    const response = await GET();
    const result = await response.json();

    // Find folders in export
    const exportedParent = result.folders.find((f: any) => f.name === 'Parent');
    const exportedChild = result.folders.find((f: any) => f.name === 'Child');

    expect(exportedParent).toBeDefined();
    expect(exportedChild).toBeDefined();
    expect(exportedChild.parent_id).toBe(exportedParent.id);
  });

  it('should set correct Content-Type header', async () => {
    const request = new Request('http://localhost:3000/api/bookmarks/export', {
      method: 'GET',
    });

    const response = await GET();

    expect(response.headers.get('Content-Type')).toBe('application/json');
  });

  it('should set Content-Disposition header with filename', async () => {
    const request = new Request('http://localhost:3000/api/bookmarks/export', {
      method: 'GET',
    });

    const response = await GET();

    const disposition = response.headers.get('Content-Disposition');
    expect(disposition).toBeDefined();
    expect(disposition).toContain('attachment');
    expect(disposition).toContain('bookmarks-');
    expect(disposition).toContain('.json');
  });

  it('should export empty database successfully', async () => {
    // Clear default folder
    const db = getDb();
    db.exec('DELETE FROM folders');
    db.exec('DELETE FROM links');

    const request = new Request('http://localhost:3000/api/bookmarks/export', {
      method: 'GET',
    });

    const response = await GET();
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.version).toBe('1.0');
    expect(result.folder_count).toBe(0);
    expect(result.link_count).toBe(0);
    expect(result.folders).toEqual([]);
    expect(result.links).toEqual([]);
  });

  it('should include all link properties in export', async () => {
    const folder = createFolder({ name: 'Test', parent_id: null });
    createLink({
      title: 'Example Site',
      url: 'https://example.com',
      folder_id: folder.id,
      favicon_url: 'https://example.com/favicon.ico',
    });

    const request = new Request('http://localhost:3000/api/bookmarks/export', {
      method: 'GET',
    });

    const response = await GET();
    const result = await response.json();

    const link = result.links[0];
    expect(link.id).toBeDefined();
    expect(link.title).toBe('Example Site');
    expect(link.url).toBe('https://example.com');
    expect(link.folder_id).toBe(folder.id);
    expect(link.sort_order).toBeDefined();
  });

  it('should include all folder properties in export', async () => {
    const parent = createFolder({ name: 'Parent Folder', parent_id: null });
    const child = createFolder({ name: 'Child Folder', parent_id: parent.id });

    const request = new Request('http://localhost:3000/api/bookmarks/export', {
      method: 'GET',
    });

    const response = await GET();
    const result = await response.json();

    const exportedChild = result.folders.find((f: any) => f.name === 'Child Folder');
    expect(exportedChild.id).toBeDefined();
    expect(exportedChild.name).toBe('Child Folder');
    expect(exportedChild.parent_id).toBe(parent.id);
    expect(exportedChild.sort_order).toBeDefined();
  });

  it('should handle large exports without errors', async () => {
    // Create a large number of bookmarks
    const folder = createFolder({ name: 'Large Folder', parent_id: null });

    for (let i = 0; i < 100; i++) {
      createLink({
        title: `Link ${i}`,
        url: `https://example${i}.com`,
        folder_id: folder.id,
      });
    }

    const request = new Request('http://localhost:3000/api/bookmarks/export', {
      method: 'GET',
    });

    const response = await GET();
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.link_count).toBe(100);
    expect(result.links.length).toBe(100);
  });
});
