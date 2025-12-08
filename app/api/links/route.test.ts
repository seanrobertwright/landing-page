import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { GET, POST } from './route';
import { getDb, closeDb } from '@/lib/db';

describe('Links API Routes', () => {
  let testFolderId: string;

  beforeEach(async () => {
    const db = getDb();
    await new Promise(resolve => setTimeout(resolve, 10)); // Small delay to avoid race conditions

    // Delete in correct order: links first, then folders
    db.prepare('DELETE FROM links').run();
    db.prepare('DELETE FROM folders').run();

    // Create a test folder after cleanup
    testFolderId = crypto.randomUUID();
    const now = new Date().toISOString();
    db.prepare(
      'INSERT INTO folders (id, name, parent_id, created_at, updated_at, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(testFolderId, 'Test Folder', null, now, now, 0);
  });

  afterAll(() => {
    closeDb();
  });

  describe('GET /api/links', () => {
    it('should return empty array when no links exist', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should return all links', async () => {
      const db = getDb();
      const id1 = crypto.randomUUID();
      const id2 = crypto.randomUUID();
      const now = new Date().toISOString();

      db.prepare(
        'INSERT INTO links (id, title, url, folder_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(id1, 'Link 1', 'https://1.com', testFolderId, now, now);

      db.prepare(
        'INSERT INTO links (id, title, url, folder_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(id2, 'Link 2', 'https://2.com', testFolderId, now, now);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data.find((l: any) => l.title === 'Link 1')).toBeDefined();
      expect(data.find((l: any) => l.title === 'Link 2')).toBeDefined();
    });

    it('should return links ordered by sort_order and title', async () => {
      const db = getDb();
      const id1 = crypto.randomUUID();
      const id2 = crypto.randomUUID();
      const now = new Date().toISOString();

      db.prepare(
        'INSERT INTO links (id, title, url, folder_id, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(id1, 'Zebra', 'https://z.com', testFolderId, 1, now, now);

      db.prepare(
        'INSERT INTO links (id, title, url, folder_id, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(id2, 'Apple', 'https://a.com', testFolderId, 0, now, now);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data[0].title).toBe('Apple');
      expect(data[1].title).toBe('Zebra');
    });
  });

  describe('POST /api/links', () => {
    it('should create a link with valid data', async () => {
      const request = new Request('http://localhost/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Link',
          url: 'https://example.com',
          folder_id: testFolderId,
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBeTruthy();
      expect(data.title).toBe('Test Link');
      expect(data.url).toBe('https://example.com');
      expect(data.folder_id).toBe(testFolderId);
    });

    it('should create a link with favicon_url', async () => {
      const request = new Request('http://localhost/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Link',
          url: 'https://example.com',
          folder_id: testFolderId,
          favicon_url: 'https://example.com/favicon.ico',
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.favicon_url).toBe('https://example.com/favicon.ico');
    });

    it('should reject request without title', async () => {
      const request = new Request('http://localhost/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'https://example.com',
          folder_id: testFolderId,
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });

    it('should reject request without url', async () => {
      const request = new Request('http://localhost/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Link',
          folder_id: testFolderId,
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });

    it('should reject request without folder_id', async () => {
      const request = new Request('http://localhost/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Link',
          url: 'https://example.com',
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });

    it('should reject request with empty title', async () => {
      const request = new Request('http://localhost/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '',
          url: 'https://example.com',
          folder_id: testFolderId,
        }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });

    it('should handle invalid JSON', async () => {
      const request = new Request('http://localhost/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create link');
    });
  });
});
