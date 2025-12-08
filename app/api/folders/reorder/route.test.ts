import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { POST } from './route';
import { createFolder, getAllFolders } from '@/lib/db/folders';
import { closeDb, getDb } from '@/lib/db';

describe('Folders Reorder API Route', () => {
  beforeEach(() => {
    const db = getDb();
    db.prepare('DELETE FROM links').run();
    db.prepare('DELETE FROM folders').run();
  });

  afterAll(() => {
    closeDb();
  });

  describe('POST /api/folders/reorder', () => {
    it('should reorder folders successfully', async () => {
      const folder1 = createFolder({ name: 'Folder 1' });
      const folder2 = createFolder({ name: 'Folder 2' });
      const folder3 = createFolder({ name: 'Folder 3' });

      const request = new Request('http://localhost/api/folders/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            { id: folder1.id, parent_id: null, sort_order: 300 },
            { id: folder2.id, parent_id: null, sort_order: 100 },
            { id: folder3.id, parent_id: null, sort_order: 200 },
          ],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      const folders = getAllFolders();
      const updated1 = folders.find(f => f.id === folder1.id);
      const updated2 = folders.find(f => f.id === folder2.id);
      const updated3 = folders.find(f => f.id === folder3.id);

      expect(updated1?.sort_order).toBe(300);
      expect(updated2?.sort_order).toBe(100);
      expect(updated3?.sort_order).toBe(200);
    });

    it('should move folder to different parent', async () => {
      const parent = createFolder({ name: 'Parent' });
      const child = createFolder({ name: 'Child' });

      const request = new Request('http://localhost/api/folders/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            { id: child.id, parent_id: parent.id, sort_order: 100 },
          ],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      const folders = getAllFolders();
      const updated = folders.find(f => f.id === child.id);
      expect(updated?.parent_id).toBe(parent.id);
      expect(updated?.sort_order).toBe(100);
    });

    it('should reject empty items array', async () => {
      const request = new Request('http://localhost/api/folders/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [],
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should reject invalid request body', async () => {
      const request = new Request('http://localhost/api/folders/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: 'invalid',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should reject items with invalid UUIDs', async () => {
      const request = new Request('http://localhost/api/folders/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            { id: 'not-a-uuid', parent_id: null, sort_order: 100 },
          ],
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should reject items with negative sort_order', async () => {
      const folder = createFolder({ name: 'Test' });

      const request = new Request('http://localhost/api/folders/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            { id: folder.id, parent_id: null, sort_order: -1 },
          ],
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should handle invalid JSON', async () => {
      const request = new Request('http://localhost/api/folders/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });

      const response = await POST(request);
      expect(response.status).toBe(500);
    });
  });
});
