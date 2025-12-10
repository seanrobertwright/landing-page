import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import {
  searchAll,
  searchBookmarks,
  searchFolders,
  sanitizeQuery,
  calculateScore,
  getFolderPath,
} from './search';
import { createFolder, deleteFolder } from './folders';
import { createLink } from './links';
import { closeDb, getDb } from './index';

describe('search functionality', () => {
  let rootFolderId: string;
  let subFolderId: string;
  let linkId1: string;
  let linkId2: string;

  beforeEach(() => {
    const db = getDb();
    db.prepare('DELETE FROM links').run();
    db.prepare('DELETE FROM folders').run();

    // Create test folder structure
    const rootFolder = createFolder({ name: 'Work' });
    rootFolderId = rootFolder.id;

    const subFolder = createFolder({ name: 'GitHub Projects', parent_id: rootFolderId });
    subFolderId = subFolder.id;

    // Create test links
    const link1 = createLink({
      title: 'GitHub',
      url: 'https://github.com',
      folder_id: rootFolderId,
    });
    linkId1 = link1.id;

    const link2 = createLink({
      title: 'My Git Repository',
      url: 'https://example.com/repo',
      folder_id: subFolderId,
    });
    linkId2 = link2.id;
  });

  afterAll(() => {
    closeDb();
  });

  describe('sanitizeQuery', () => {
    it('should escape % character', () => {
      expect(sanitizeQuery('test%query')).toBe('test\\%query');
    });

    it('should escape _ character', () => {
      expect(sanitizeQuery('test_query')).toBe('test\\_query');
    });

    it('should escape multiple special characters', () => {
      expect(sanitizeQuery('%_test_%')).toBe('\\%\\_test\\_\\%');
    });

    it('should not modify regular text', () => {
      expect(sanitizeQuery('github')).toBe('github');
    });
  });

  describe('calculateScore', () => {
    it('should return 100 for exact match', () => {
      expect(calculateScore('github', 'github')).toBe(100);
      expect(calculateScore('GitHub', 'github')).toBe(100); // case insensitive
    });

    it('should return 50 for prefix match', () => {
      expect(calculateScore('git', 'github')).toBe(50);
      expect(calculateScore('Git', 'GitHub')).toBe(50); // case insensitive
    });

    it('should return 10 for contains match', () => {
      expect(calculateScore('hub', 'github')).toBe(10);
      expect(calculateScore('Hub', 'GitHub')).toBe(10); // case insensitive
    });

    it('should return 0 for no match', () => {
      expect(calculateScore('test', 'github')).toBe(0);
    });
  });

  describe('getFolderPath', () => {
    it('should return empty array for null folder ID', () => {
      expect(getFolderPath(null)).toEqual([]);
    });

    it('should return single folder name for root folder', () => {
      const path = getFolderPath(rootFolderId);
      expect(path).toEqual(['Work']);
    });

    it('should return breadcrumb path for nested folder', () => {
      const path = getFolderPath(subFolderId);
      expect(path).toEqual(['Work', 'GitHub Projects']);
    });

    it('should handle non-existent folder ID', () => {
      const path = getFolderPath('non-existent-id');
      expect(path).toEqual([]);
    });
  });

  describe('searchBookmarks', () => {
    it('should find bookmarks by title', () => {
      const results = searchBookmarks('GitHub');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toBe('GitHub');
      expect(results[0].type).toBe('link');
    });

    it('should find bookmarks by partial title', () => {
      const results = searchBookmarks('Git');
      expect(results.length).toBe(2); // Both 'GitHub' and 'My Git Repository'
    });

    it('should find bookmarks by URL', () => {
      const results = searchBookmarks('github.com');
      expect(results.length).toBe(1);
      expect(results[0].url).toBe('https://github.com');
    });

    it('should return empty array for no matches', () => {
      const results = searchBookmarks('nonexistent');
      expect(results).toEqual([]);
    });

    it('should include folder path in results', () => {
      const results = searchBookmarks('GitHub');
      expect(results[0].folder_path).toBeDefined();
    });

    it('should be case insensitive', () => {
      const results = searchBookmarks('github');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('searchFolders', () => {
    it('should find folders by name', () => {
      const results = searchFolders('GitHub');
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('GitHub Projects');
      expect(results[0].type).toBe('folder');
    });

    it('should find folders by partial name', () => {
      const results = searchFolders('Git');
      expect(results.length).toBe(1);
    });

    it('should return empty array for no matches', () => {
      const results = searchFolders('nonexistent');
      expect(results).toEqual([]);
    });

    it('should be case insensitive', () => {
      const results = searchFolders('work');
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Work');
    });
  });

  describe('searchAll', () => {
    it('should search across both bookmarks and folders', () => {
      const result = searchAll('Git');
      expect(result.results.length).toBeGreaterThan(0);
      const types = result.results.map((r) => r.type);
      expect(types).toContain('link');
      expect(types).toContain('folder');
    });

    it('should return empty results for empty query', () => {
      const result = searchAll('');
      expect(result.results).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should return empty results for whitespace-only query', () => {
      const result = searchAll('   ');
      expect(result.results).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should sort results by score', () => {
      const result = searchAll('Git');
      const scores = result.results.map((r) => r.score);
      // Check if scores are in descending order
      for (let i = 1; i < scores.length; i++) {
        expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
      }
    });

    it('should limit results to specified limit', () => {
      // Create many test links
      for (let i = 0; i < 60; i++) {
        createLink({
          title: `Test Link ${i}`,
          url: `https://test${i}.com`,
          folder_id: rootFolderId,
        });
      }

      const result = searchAll('test', 50);
      expect(result.results.length).toBe(50);
      expect(result.limited).toBe(true);
      expect(result.total).toBeGreaterThan(50);
    });

    it('should handle special characters', () => {
      createLink({
        title: 'Test 100% Complete',
        url: 'https://test.com',
        folder_id: rootFolderId,
      });

      const result = searchAll('100%');
      expect(result.results.length).toBeGreaterThan(0);
    });

    it('should handle Unicode characters', () => {
      createLink({
        title: 'Test 测试 ',
        url: 'https://test.com',
        folder_id: rootFolderId,
      });

      const result = searchAll('测试');
      expect(result.results.length).toBeGreaterThan(0);
    });
  });
});
