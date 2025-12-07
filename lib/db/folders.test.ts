import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import {
  getAllFolders,
  getFolderById,
  createFolder,
  updateFolder,
  deleteFolder,
  type Folder,
} from './folders';
import { closeDb, getDb } from './index';

describe('folders database operations', () => {
  beforeEach(() => {
    const db = getDb();
    db.prepare('DELETE FROM links').run();
    db.prepare('DELETE FROM folders').run();
  });

  afterAll(() => {
    closeDb();
  });

  describe('createFolder', () => {
    it('should create a folder with required fields', () => {
      const folder = createFolder({ name: 'Test Folder' });

      expect(folder).toBeDefined();
      expect(folder.id).toBeTruthy();
      expect(folder.name).toBe('Test Folder');
      expect(folder.parent_id).toBeNull();
      expect(folder.sort_order).toBe(0);
      expect(folder.created_at).toBeTruthy();
      expect(folder.updated_at).toBeTruthy();
    });

    it('should create a folder with a parent', () => {
      const parent = createFolder({ name: 'Parent' });
      const child = createFolder({ name: 'Child', parent_id: parent.id });

      expect(child.parent_id).toBe(parent.id);
    });

    it('should create a folder with explicit null parent_id', () => {
      const folder = createFolder({ name: 'Root Folder', parent_id: null });

      expect(folder.parent_id).toBeNull();
    });
  });

  describe('getAllFolders', () => {
    it('should return empty array when no folders exist', () => {
      const folders = getAllFolders();
      expect(folders).toEqual([]);
    });

    it('should return all folders', () => {
      createFolder({ name: 'Folder 1' });
      createFolder({ name: 'Folder 2' });
      createFolder({ name: 'Folder 3' });

      const folders = getAllFolders();
      expect(folders).toHaveLength(3);
    });

    it('should return folders ordered by sort_order and name', () => {
      const folder1 = createFolder({ name: 'Zebra' });
      const folder2 = createFolder({ name: 'Apple' });
      updateFolder(folder1.id, { sort_order: 1 });

      const folders = getAllFolders();
      expect(folders[0].name).toBe('Apple');
      expect(folders[1].name).toBe('Zebra');
    });
  });

  describe('getFolderById', () => {
    it('should return undefined for non-existent folder', () => {
      const folder = getFolderById('non-existent-id');
      expect(folder).toBeUndefined();
    });

    it('should return folder by id', () => {
      const created = createFolder({ name: 'Test' });
      const found = getFolderById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe('Test');
    });
  });

  describe('updateFolder', () => {
    it('should update folder name', () => {
      const folder = createFolder({ name: 'Original' });
      const updated = updateFolder(folder.id, { name: 'Updated' });

      expect(updated?.name).toBe('Updated');
      expect(updated?.id).toBe(folder.id);
    });

    it('should update folder parent_id', () => {
      const parent = createFolder({ name: 'Parent' });
      const folder = createFolder({ name: 'Child' });

      const updated = updateFolder(folder.id, { parent_id: parent.id });

      expect(updated?.parent_id).toBe(parent.id);
    });

    it('should update folder sort_order', () => {
      const folder = createFolder({ name: 'Test' });
      const updated = updateFolder(folder.id, { sort_order: 5 });

      expect(updated?.sort_order).toBe(5);
    });

    it('should update multiple fields at once', () => {
      const parent = createFolder({ name: 'Parent' });
      const folder = createFolder({ name: 'Original' });

      const updated = updateFolder(folder.id, {
        name: 'Updated',
        parent_id: parent.id,
        sort_order: 3,
      });

      expect(updated?.name).toBe('Updated');
      expect(updated?.parent_id).toBe(parent.id);
      expect(updated?.sort_order).toBe(3);
    });

    it('should return existing folder when no updates provided', () => {
      const folder = createFolder({ name: 'Test' });
      const updated = updateFolder(folder.id, {});

      expect(updated?.id).toBe(folder.id);
      expect(updated?.name).toBe(folder.name);
    });

    it('should return undefined for non-existent folder', () => {
      const updated = updateFolder('non-existent', { name: 'Test' });
      expect(updated).toBeUndefined();
    });
  });

  describe('deleteFolder', () => {
    it('should delete a folder', () => {
      const folder = createFolder({ name: 'To Delete' });

      deleteFolder(folder.id);

      const found = getFolderById(folder.id);
      expect(found).toBeUndefined();
    });

    it('should cascade delete child folders', () => {
      const parent = createFolder({ name: 'Parent' });
      const child = createFolder({ name: 'Child', parent_id: parent.id });

      deleteFolder(parent.id);

      expect(getFolderById(parent.id)).toBeUndefined();
      expect(getFolderById(child.id)).toBeUndefined();
    });

    it('should not throw when deleting non-existent folder', () => {
      expect(() => deleteFolder('non-existent')).not.toThrow();
    });
  });
});
