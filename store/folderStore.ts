import { create } from 'zustand';
import { TreeNode } from '@/lib/db/tree';

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
}));
