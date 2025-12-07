'use client';

import { useEffect } from 'react';
import { useFolderStore } from '@/store/folderStore';
import { TreeNode } from './TreeNode';
import { Loader2 } from 'lucide-react';

export function FolderTree() {
  const { tree, isLoading, error, fetchTree } = useFolderStore();

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-400">
        Error loading folders: {error}
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div className="p-4 text-sm text-slate-400">
        No folders found
      </div>
    );
  }

  return (
    <div className="py-2" data-testid="folder-tree">
      {tree.map((node) => (
        <TreeNode key={node.id} node={node} />
      ))}
    </div>
  );
}
