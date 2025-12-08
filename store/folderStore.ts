import { create } from 'zustand';
import { TreeNode } from '@/lib/db/tree';
import { getFaviconUrl } from '@/lib/utils/getFaviconUrl';

interface FolderState {
  tree: TreeNode[];
  selectedFolderId: string | null;
  expandedFolderIds: Set<string>;
  isLoading: boolean;
  error: string | null;

  setTree: (tree: TreeNode[]) => void;
  toggleFolder: (id: string) => void;
  selectFolder: (id: string | null) => void;
  fetchTree: () => Promise<void>;
  createFolder: (name: string, parentId?: string) => Promise<void>;
  createLink: (title: string, url: string, folderId: string) => Promise<void>;
  reorderFolders: (items: { id: string; parent_id: string | null; sort_order: number }[]) => Promise<void>;
  reorderLinks: (items: { id: string; folder_id: string; sort_order: number }[]) => Promise<void>;
}

export const useFolderStore = create<FolderState>((set, get) => ({
  tree: [],
  selectedFolderId: null,
  expandedFolderIds: new Set(),
  isLoading: false,
  error: null,

  setTree: (tree) => set({ tree }),

  toggleFolder: (id) =>
    set((state) => {
      const newExpanded = new Set(state.expandedFolderIds);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      return { expandedFolderIds: newExpanded };
    }),

  selectFolder: (id) => set({ selectedFolderId: id }),

  fetchTree: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/tree');
      if (!response.ok) {
        throw new Error('Failed to fetch tree');
      }
      const tree = await response.json();
      set({ tree, isLoading: false });

      if (tree.length > 0 && !get().selectedFolderId) {
        set({ selectedFolderId: tree[0].id });
        set((state) => ({
          expandedFolderIds: new Set([...state.expandedFolderIds, tree[0].id]),
        }));
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
    }
  },

  createFolder: async (name: string, parentId?: string) => {
    const response = await fetch('/api/folders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, parent_id: parentId || null }),
    });

    if (!response.ok) {
      throw new Error('Failed to create folder');
    }

    await get().fetchTree();
  },

  createLink: async (title: string, url: string, folderId: string) => {
    const faviconUrl = getFaviconUrl(url);
    const response = await fetch('/api/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        url,
        folder_id: folderId,
        favicon_url: faviconUrl || undefined
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create link');
    }
  },

  reorderFolders: async (items) => {
    const previousTree = get().tree;

    try {
      const response = await fetch('/api/folders/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder folders');
      }

      await get().fetchTree();
    } catch (error) {
      set({ tree: previousTree });
      throw error;
    }
  },

  reorderLinks: async (items) => {
    const previousTree = get().tree;

    try {
      const response = await fetch('/api/links/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder links');
      }

      await get().fetchTree();
    } catch (error) {
      set({ tree: previousTree });
      throw error;
    }
  },
}));
