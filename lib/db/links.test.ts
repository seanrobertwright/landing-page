import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import {
  getAllLinks,
  getLinkById,
  getLinksByFolder,
  createLink,
  updateLink,
  deleteLink,
  type Link,
} from './links';
import { createFolder, deleteFolder } from './folders';
import { closeDb, getDb } from './index';

describe('links database operations', () => {
  let testFolderId: string;

  beforeEach(() => {
    const db = getDb();
    db.prepare('DELETE FROM links').run();
    db.prepare('DELETE FROM folders').run();

    const folder = createFolder({ name: 'Test Folder' });
    testFolderId = folder.id;
  });

  afterAll(() => {
    closeDb();
  });

  describe('createLink', () => {
    it('should create a link with required fields', () => {
      const link = createLink({
        title: 'Test Link',
        url: 'https://example.com',
        folder_id: testFolderId,
      });

      expect(link).toBeDefined();
      expect(link.id).toBeTruthy();
      expect(link.title).toBe('Test Link');
      expect(link.url).toBe('https://example.com');
      expect(link.folder_id).toBe(testFolderId);
      expect(link.favicon_url).toBeNull();
      expect(link.sort_order).toBe(0);
      expect(link.created_at).toBeTruthy();
      expect(link.updated_at).toBeTruthy();
    });

    it('should create a link with favicon_url', () => {
      const link = createLink({
        title: 'Test',
        url: 'https://example.com',
        folder_id: testFolderId,
        favicon_url: 'https://example.com/favicon.ico',
      });

      expect(link.favicon_url).toBe('https://example.com/favicon.ico');
    });

    it('should create a link with explicit null favicon_url', () => {
      const link = createLink({
        title: 'Test',
        url: 'https://example.com',
        folder_id: testFolderId,
        favicon_url: null,
      });

      expect(link.favicon_url).toBeNull();
    });
  });

  describe('getAllLinks', () => {
    it('should return empty array when no links exist', () => {
      const links = getAllLinks();
      expect(links).toEqual([]);
    });

    it('should return all links', () => {
      createLink({ title: 'Link 1', url: 'https://1.com', folder_id: testFolderId });
      createLink({ title: 'Link 2', url: 'https://2.com', folder_id: testFolderId });
      createLink({ title: 'Link 3', url: 'https://3.com', folder_id: testFolderId });

      const links = getAllLinks();
      expect(links).toHaveLength(3);
    });

    it('should return links ordered by sort_order and title', () => {
      const link1 = createLink({ title: 'Zebra', url: 'https://z.com', folder_id: testFolderId });
      const link2 = createLink({ title: 'Apple', url: 'https://a.com', folder_id: testFolderId });
      updateLink(link1.id, { sort_order: 1 });

      const links = getAllLinks();
      expect(links[0].title).toBe('Apple');
      expect(links[1].title).toBe('Zebra');
    });
  });

  describe('getLinkById', () => {
    it('should return undefined for non-existent link', () => {
      const link = getLinkById('non-existent-id');
      expect(link).toBeUndefined();
    });

    it('should return link by id', () => {
      const created = createLink({ title: 'Test', url: 'https://test.com', folder_id: testFolderId });
      const found = getLinkById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.title).toBe('Test');
    });
  });

  describe('getLinksByFolder', () => {
    it('should return empty array for folder with no links', () => {
      const links = getLinksByFolder(testFolderId);
      expect(links).toEqual([]);
    });

    it('should return only links in specified folder', () => {
      const folder2 = createFolder({ name: 'Folder 2' });

      createLink({ title: 'Link 1', url: 'https://1.com', folder_id: testFolderId });
      createLink({ title: 'Link 2', url: 'https://2.com', folder_id: testFolderId });
      createLink({ title: 'Link 3', url: 'https://3.com', folder_id: folder2.id });

      const linksInFolder1 = getLinksByFolder(testFolderId);
      const linksInFolder2 = getLinksByFolder(folder2.id);

      expect(linksInFolder1).toHaveLength(2);
      expect(linksInFolder2).toHaveLength(1);
      expect(linksInFolder1.every((l) => l.folder_id === testFolderId)).toBe(true);
      expect(linksInFolder2.every((l) => l.folder_id === folder2.id)).toBe(true);
    });

    it('should return links ordered by sort_order and title', () => {
      const link1 = createLink({ title: 'Zebra', url: 'https://z.com', folder_id: testFolderId });
      const link2 = createLink({ title: 'Apple', url: 'https://a.com', folder_id: testFolderId });
      updateLink(link1.id, { sort_order: 1 });

      const links = getLinksByFolder(testFolderId);
      expect(links[0].title).toBe('Apple');
      expect(links[1].title).toBe('Zebra');
    });
  });

  describe('updateLink', () => {
    it('should update link title', () => {
      const link = createLink({ title: 'Original', url: 'https://test.com', folder_id: testFolderId });
      const updated = updateLink(link.id, { title: 'Updated' });

      expect(updated?.title).toBe('Updated');
      expect(updated?.id).toBe(link.id);
    });

    it('should update link url', () => {
      const link = createLink({ title: 'Test', url: 'https://old.com', folder_id: testFolderId });
      const updated = updateLink(link.id, { url: 'https://new.com' });

      expect(updated?.url).toBe('https://new.com');
    });

    it('should update link favicon_url', () => {
      const link = createLink({ title: 'Test', url: 'https://test.com', folder_id: testFolderId });
      const updated = updateLink(link.id, { favicon_url: 'https://test.com/icon.png' });

      expect(updated?.favicon_url).toBe('https://test.com/icon.png');
    });

    it('should update link folder_id', () => {
      const folder2 = createFolder({ name: 'Folder 2' });
      const link = createLink({ title: 'Test', url: 'https://test.com', folder_id: testFolderId });

      const updated = updateLink(link.id, { folder_id: folder2.id });

      expect(updated?.folder_id).toBe(folder2.id);
    });

    it('should update link sort_order', () => {
      const link = createLink({ title: 'Test', url: 'https://test.com', folder_id: testFolderId });
      const updated = updateLink(link.id, { sort_order: 5 });

      expect(updated?.sort_order).toBe(5);
    });

    it('should update multiple fields at once', () => {
      const folder2 = createFolder({ name: 'Folder 2' });
      const link = createLink({ title: 'Original', url: 'https://old.com', folder_id: testFolderId });

      const updated = updateLink(link.id, {
        title: 'Updated',
        url: 'https://new.com',
        folder_id: folder2.id,
        favicon_url: 'https://new.com/icon.png',
        sort_order: 3,
      });

      expect(updated?.title).toBe('Updated');
      expect(updated?.url).toBe('https://new.com');
      expect(updated?.folder_id).toBe(folder2.id);
      expect(updated?.favicon_url).toBe('https://new.com/icon.png');
      expect(updated?.sort_order).toBe(3);
    });

    it('should return existing link when no updates provided', () => {
      const link = createLink({ title: 'Test', url: 'https://test.com', folder_id: testFolderId });
      const updated = updateLink(link.id, {});

      expect(updated?.id).toBe(link.id);
      expect(updated?.title).toBe(link.title);
    });

    it('should return undefined for non-existent link', () => {
      const updated = updateLink('non-existent', { title: 'Test' });
      expect(updated).toBeUndefined();
    });
  });

  describe('deleteLink', () => {
    it('should delete a link', () => {
      const link = createLink({ title: 'To Delete', url: 'https://test.com', folder_id: testFolderId });

      deleteLink(link.id);

      const found = getLinkById(link.id);
      expect(found).toBeUndefined();
    });

    it('should not throw when deleting non-existent link', () => {
      expect(() => deleteLink('non-existent')).not.toThrow();
    });

    it('should cascade delete when folder is deleted', () => {
      const link = createLink({ title: 'Test', url: 'https://test.com', folder_id: testFolderId });

      deleteFolder(testFolderId);

      const found = getLinkById(link.id);
      expect(found).toBeUndefined();
    });
  });
});
