import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { GET, POST } from './route';
import { getDb, closeDb } from '@/lib/db';

describe('Folders API Routes', () => {
  beforeEach(() => {
    const db = getDb();
    db.prepare('DELETE FROM links').run();
    db.prepare('DELETE FROM folders').run();
    // Note: Schema init creates a default "Bookmarks" folder, so we start with 1 folder
  });

  afterAll(() => {
    closeDb();
  });

  describe('GET /api/folders', () => {
    it('should return status 200 and array of folders', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should return all folders when folders exist', async () => {
      // Create test folders directly in DB
      const db = getDb();
      const id1 = crypto.randomUUID();
      const id2 = crypto.randomUUID();
      const now = new Date().toISOString();

      db.prepare(
        'INSERT INTO folders (id, name, parent_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
      ).run(id1, 'Folder 1', null, now, now);

      db.prepare(
        'INSERT INTO folders (id, name, parent_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
      ).run(id2, 'Folder 2', null, now, now);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data.find((f: any) => f.name === 'Folder 1')).toBeDefined();
      expect(data.find((f: any) => f.name === 'Folder 2')).toBeDefined();
    });

    it('should return folders ordered by sort_order and name', async () => {
      const db = getDb();
      const id1 = crypto.randomUUID();
      const id2 = crypto.randomUUID();
      const now = new Date().toISOString();

      db.prepare(
        'INSERT INTO folders (id, name, parent_id, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(id1, 'Zebra', null, 1, now, now);

      db.prepare(
        'INSERT INTO folders (id, name, parent_id, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(id2, 'Apple', null, 0, now, now);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data[0].name).toBe('Apple');
      expect(data[1].name).toBe('Zebra');
    });
  });

  describe('POST /api/folders', () => {
    it('should create a folder with valid data', async () => {
      const request = new Request('http://localhost/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Folder' }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBeTruthy();
      expect(data.name).toBe('New Folder');
      expect(data.parent_id).toBeNull();
    });

    it('should create a folder with parent_id', async () => {
      // Create parent folder
      const db = getDb();
      const parentId = crypto.randomUUID();
      const now = new Date().toISOString();

      db.prepare(
        'INSERT INTO folders (id, name, parent_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
      ).run(parentId, 'Parent', null, now, now);

      const request = new Request('http://localhost/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Child Folder', parent_id: parentId }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe('Child Folder');
      expect(data.parent_id).toBe(parentId);
    });

    it('should reject request without name', async () => {
      const request = new Request('http://localhost/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });

    it('should reject request with empty name', async () => {
      const request = new Request('http://localhost/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '' }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });

    it('should handle invalid JSON', async () => {
      const request = new Request('http://localhost/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create folder');
    });
  });
});
