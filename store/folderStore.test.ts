import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useFolderStore } from './folderStore';
import { TreeNode } from '@/lib/db/tree';

describe('folderStore', () => {
  beforeEach(() => {
    const store = useFolderStore.getState();
    store.setTree([]);
    store.selectFolder(null);
    useFolderStore.setState({ expandedFolderIds: new Set(), isLoading: false, error: null });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have empty tree initially', () => {
      const { tree } = useFolderStore.getState();
      expect(tree).toEqual([]);
    });

    it('should have no selected folder initially', () => {
      const { selectedFolderId } = useFolderStore.getState();
      expect(selectedFolderId).toBeNull();
    });

    it('should have no expanded folders initially', () => {
      const { expandedFolderIds } = useFolderStore.getState();
      expect(expandedFolderIds.size).toBe(0);
    });

    it('should not be loading initially', () => {
      const { isLoading } = useFolderStore.getState();
      expect(isLoading).toBe(false);
    });

    it('should have no error initially', () => {
      const { error } = useFolderStore.getState();
      expect(error).toBeNull();
    });
  });

  describe('setTree', () => {
    it('should set the tree', () => {
      const mockTree: TreeNode[] = [
        { id: '1', type: 'folder', name: 'Folder 1', children: [] },
        { id: '2', type: 'folder', name: 'Folder 2', children: [] },
      ];

      useFolderStore.getState().setTree(mockTree);

      const { tree } = useFolderStore.getState();
      expect(tree).toEqual(mockTree);
    });
  });

  describe('toggleFolder', () => {
    it('should add folder to expanded set when not expanded', () => {
      useFolderStore.getState().toggleFolder('folder-1');

      const { expandedFolderIds } = useFolderStore.getState();
      expect(expandedFolderIds.has('folder-1')).toBe(true);
    });

    it('should remove folder from expanded set when already expanded', () => {
      useFolderStore.getState().toggleFolder('folder-1');
      expect(useFolderStore.getState().expandedFolderIds.has('folder-1')).toBe(true);

      useFolderStore.getState().toggleFolder('folder-1');
      expect(useFolderStore.getState().expandedFolderIds.has('folder-1')).toBe(false);
    });

    it('should handle multiple folders being expanded', () => {
      const store = useFolderStore.getState();
      store.toggleFolder('folder-1');
      store.toggleFolder('folder-2');
      store.toggleFolder('folder-3');

      const { expandedFolderIds } = useFolderStore.getState();
      expect(expandedFolderIds.has('folder-1')).toBe(true);
      expect(expandedFolderIds.has('folder-2')).toBe(true);
      expect(expandedFolderIds.has('folder-3')).toBe(true);
      expect(expandedFolderIds.size).toBe(3);
    });
  });

  describe('selectFolder', () => {
    it('should set the selected folder id', () => {
      useFolderStore.getState().selectFolder('folder-1');

      const { selectedFolderId } = useFolderStore.getState();
      expect(selectedFolderId).toBe('folder-1');
    });

    it('should allow setting null to deselect', () => {
      const store = useFolderStore.getState();
      store.selectFolder('folder-1');
      store.selectFolder(null);

      const { selectedFolderId } = useFolderStore.getState();
      expect(selectedFolderId).toBeNull();
    });

    it('should replace previous selection', () => {
      const store = useFolderStore.getState();
      store.selectFolder('folder-1');
      store.selectFolder('folder-2');

      const { selectedFolderId } = useFolderStore.getState();
      expect(selectedFolderId).toBe('folder-2');
    });
  });

  describe('fetchTree', () => {
    it('should set loading state while fetching', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => [],
        })
      );
      global.fetch = mockFetch as any;

      const fetchPromise = useFolderStore.getState().fetchTree();

      const { isLoading } = useFolderStore.getState();
      expect(isLoading).toBe(true);

      await fetchPromise;
    });

    it('should fetch and set tree data', async () => {
      const mockTree: TreeNode[] = [
        { id: '1', type: 'folder', name: 'Folder 1', children: [] },
      ];

      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockTree,
        })
      );
      global.fetch = mockFetch as any;

      await useFolderStore.getState().fetchTree();

      expect(mockFetch).toHaveBeenCalledWith('/api/tree');
      const { tree, isLoading } = useFolderStore.getState();
      expect(tree).toEqual(mockTree);
      expect(isLoading).toBe(false);
    });

    it('should select and expand first folder if none selected', async () => {
      const mockTree: TreeNode[] = [
        { id: 'folder-1', type: 'folder', name: 'Folder 1', children: [] },
      ];

      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockTree,
        })
      );
      global.fetch = mockFetch as any;

      await useFolderStore.getState().fetchTree();

      const { selectedFolderId, expandedFolderIds } = useFolderStore.getState();
      expect(selectedFolderId).toBe('folder-1');
      expect(expandedFolderIds.has('folder-1')).toBe(true);
    });

    it('should not change selection if folder already selected', async () => {
      const mockTree: TreeNode[] = [
        { id: 'folder-1', type: 'folder', name: 'Folder 1', children: [] },
        { id: 'folder-2', type: 'folder', name: 'Folder 2', children: [] },
      ];

      useFolderStore.getState().selectFolder('folder-2');

      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockTree,
        })
      );
      global.fetch = mockFetch as any;

      await useFolderStore.getState().fetchTree();

      const { selectedFolderId } = useFolderStore.getState();
      expect(selectedFolderId).toBe('folder-2');
    });

    it('should set error state on fetch failure', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
        })
      );
      global.fetch = mockFetch as any;

      await useFolderStore.getState().fetchTree();

      const { error, isLoading } = useFolderStore.getState();
      expect(error).toBe('Failed to fetch tree');
      expect(isLoading).toBe(false);
    });

    it('should handle network errors', async () => {
      const mockFetch = vi.fn(() => Promise.reject(new Error('Network error')));
      global.fetch = mockFetch as any;

      await useFolderStore.getState().fetchTree();

      const { error, isLoading } = useFolderStore.getState();
      expect(error).toBe('Network error');
      expect(isLoading).toBe(false);
    });
  });

  describe('createFolder', () => {
    it('should create folder and refresh tree', async () => {
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'new-folder', name: 'New Folder' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ id: 'new-folder', type: 'folder', name: 'New Folder', children: [] }],
        });

      global.fetch = mockFetch as any;

      await useFolderStore.getState().createFolder('New Folder');

      expect(mockFetch).toHaveBeenCalledWith('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'New Folder', parent_id: null }),
      });
      expect(mockFetch).toHaveBeenCalledWith('/api/tree');
    });

    it('should create folder with parent id', async () => {
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'new-folder', name: 'Child Folder' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        });

      global.fetch = mockFetch as any;

      await useFolderStore.getState().createFolder('Child Folder', 'parent-id');

      expect(mockFetch).toHaveBeenCalledWith('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Child Folder', parent_id: 'parent-id' }),
      });
    });

    it('should throw error on failed request', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
        })
      );
      global.fetch = mockFetch as any;

      await expect(useFolderStore.getState().createFolder('Test')).rejects.toThrow(
        'Failed to create folder'
      );
    });
  });

  describe('createLink', () => {
    it('should create link with favicon url', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ id: 'new-link', title: 'Test Link' }),
        })
      );
      global.fetch = mockFetch as any;

      await useFolderStore.getState().createLink('Test Link', 'https://example.com', 'folder-1');

      expect(mockFetch).toHaveBeenCalledWith('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('Test Link'),
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.title).toBe('Test Link');
      expect(callBody.url).toBe('https://example.com');
      expect(callBody.folder_id).toBe('folder-1');
      expect(callBody.favicon_url).toBeTruthy();
    });

    it('should throw error on failed request', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
        })
      );
      global.fetch = mockFetch as any;

      await expect(
        useFolderStore.getState().createLink('Test', 'https://test.com', 'folder-1')
      ).rejects.toThrow('Failed to create link');
    });
  });
});
