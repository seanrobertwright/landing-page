'use client';

import { useEffect } from 'react';
import { useFolderStore } from '@/store/folderStore';
import { TreeNode } from './TreeNode';
import { Loader2, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FolderTreeProps {
  onNewFolderClick: () => void;
}

export function FolderTree({ onNewFolderClick }: FolderTreeProps) {
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
    <div className="flex flex-col h-full">
      {/* Header with New Folder button */}
      <div className="flex items-center justify-between px-2 pb-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Folders</h2>
        <Button
          onClick={onNewFolderClick}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          data-testid="new-folder-button"
          title="New Folder"
        >
          <FolderPlus className="h-4 w-4" />
        </Button>
      </div>

      {/* Tree content */}
      <div className="flex-1 overflow-y-auto py-2" data-testid="folder-tree">
        {tree.map((node) => (
          <TreeNode key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}
