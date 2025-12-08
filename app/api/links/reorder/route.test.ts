import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { POST } from './route';
import { createFolder } from '@/lib/db/folders';
import { createLink, getAllLinks, getLinkById } from '@/lib/db/links';
import { closeDb, getDb } from '@/lib/db';

describe('Links Reorder API Route', () => {
  let testFolderId: string;

  beforeEach(async () => {
    const db = getDb();
    await new Promise(resolve => setTimeout(resolve, 10)); // Small delay to avoid race conditions

    // Delete in correct order: links first, then folders
    db.prepare('DELETE FROM links').run();
    db.prepare('DELETE FROM folders').run();

    // Create folder after cleanup and verify it exists
    const folder = createFolder({ name: 'Test Folder' });
    testFolderId = folder.id;

    // Verify the folder was created
    const verifyFolder = db.prepare('SELECT id FROM folders WHERE id = ?').get(testFolderId);
    if (!verifyFolder) {
      throw new Error('Test folder was not created');
    }
  });

  afterAll(() => {
    closeDb();
  });

  describe('POST /api/links/reorder', () => {
    it('should reorder links successfully', async () => {
      const link1 = createLink({ title: 'Link 1', url: 'https://test1.com', folder_id: testFolderId });
      const link2 = createLink({ title: 'Link 2', url: 'https://test2.com', folder_id: testFolderId });
      const link3 = createLink({ title: 'Link 3', url: 'https://test3.com', folder_id: testFolderId });

      const request = new Request('http://localhost/api/links/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            { id: link1.id, folder_id: testFolderId, sort_order: 300 },
            { id: link2.id, folder_id: testFolderId, sort_order: 100 },
            { id: link3.id, folder_id: testFolderId, sort_order: 200 },
          ],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Query fresh from database
      const updated1 = getLinkById(link1.id);
      const updated2 = getLinkById(link2.id);
      const updated3 = getLinkById(link3.id);

      expect(updated1?.sort_order).toBe(300);
      expect(updated2?.sort_order).toBe(100);
      expect(updated3?.sort_order).toBe(200);
    });

    it('should move link to different folder', async () => {
      const folder2 = createFolder({ name: 'Folder 2' });
      const link = createLink({ title: 'Test', url: 'https://test.com', folder_id: testFolderId });

      const request = new Request('http://localhost/api/links/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            { id: link.id, folder_id: folder2.id, sort_order: 100 },
          ],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      const updated = getLinkById(link.id);
      expect(updated?.folder_id).toBe(folder2.id);
      expect(updated?.sort_order).toBe(100);
    });

    it('should reject empty items array', async () => {
      const request = new Request('http://localhost/api/links/reorder', {
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
      const request = new Request('http://localhost/api/links/reorder', {
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
      const request = new Request('http://localhost/api/links/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            { id: 'not-a-uuid', folder_id: testFolderId, sort_order: 100 },
          ],
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should reject items with negative sort_order', async () => {
      const link = createLink({ title: 'Test', url: 'https://test.com', folder_id: testFolderId });

      const request = new Request('http://localhost/api/links/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            { id: link.id, folder_id: testFolderId, sort_order: -1 },
          ],
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should handle invalid JSON', async () => {
      const request = new Request('http://localhost/api/links/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });

      const response = await POST(request);
      expect(response.status).toBe(500);
    });
  });
});
