'use client';

import { useEffect, useState } from 'react';
import { useFolderStore } from '@/store/folderStore';
import { TreeNode } from './TreeNode';
import { Loader2, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { TreeNode as TreeNodeType } from '@/lib/db/tree';
import { toast } from 'sonner';

interface FolderTreeProps {
  onNewFolderClick: () => void;
  onCreateSubfolder?: (parentId: string, parentName: string) => void;
  onDeleteFolder?: (folderId: string, folderName: string) => void;
}

export function FolderTree({ onNewFolderClick, onCreateSubfolder, onDeleteFolder }: FolderTreeProps) {
  const { tree, isLoading, error, fetchTree, reorderFolders, reorderLinks } = useFolderStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const activeNode = findNodeById(tree, active.id as string);
    const overNode = findNodeById(tree, over.id as string);

    if (!activeNode || !overNode) {
      return;
    }

    if (activeNode.type === 'folder') {
      handleFolderDrop(activeNode, overNode);
    } else if (activeNode.type === 'link') {
      handleLinkDrop(activeNode, overNode);
    }
  };

  const handleFolderDrop = async (activeNode: TreeNodeType, overNode: TreeNodeType) => {
    try {
      const allFolders = getAllFolders(tree);

      if (overNode.type === 'folder') {
        if (isDescendant(tree, overNode.id, activeNode.id)) {
          toast.error('Cannot move a folder into itself or its descendants');
          return;
        }

        const siblings = allFolders.filter(f => f.id !== activeNode.id && getParentId(tree, f.id) === overNode.id);
        const newSortOrder = (siblings.length + 1) * 100;

        await reorderFolders([
          { id: activeNode.id, parent_id: overNode.id, sort_order: newSortOrder }
        ]);
        toast.success('Folder moved successfully');
      }
    } catch (error) {
      console.error('Failed to reorder folders:', error);
      toast.error('Failed to move folder. Please try again.');
    }
  };

  const handleLinkDrop = async (activeNode: TreeNodeType, overNode: TreeNodeType) => {
    try {
      if (overNode.type === 'folder') {
        const allLinks = getAllLinks(tree);
        const siblings = allLinks.filter(l => l.id !== activeNode.id && getParentId(tree, l.id) === overNode.id);
        const newSortOrder = (siblings.length + 1) * 100;

        await reorderLinks([
          { id: activeNode.id, folder_id: overNode.id, sort_order: newSortOrder }
        ]);
        toast.success('Link moved successfully');
      }
    } catch (error) {
      console.error('Failed to reorder links:', error);
      toast.error('Failed to move link. Please try again.');
    }
  };

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

  const activeNode = activeId ? findNodeById(tree, activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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
            <TreeNode
              key={node.id}
              node={node}
              onCreateSubfolder={onCreateSubfolder}
              onDeleteFolder={onDeleteFolder}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeNode ? (
          <div className="bg-slate-800/90 border border-cyan-400/30 rounded-md px-3 py-2 flex items-center gap-2 opacity-80">
            <span className="text-sm text-slate-200">{activeNode.name}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// Helper functions
function findNodeById(tree: TreeNodeType[], id: string): TreeNodeType | null {
  for (const node of tree) {
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

function getAllFolders(tree: TreeNodeType[]): TreeNodeType[] {
  const folders: TreeNodeType[] = [];
  for (const node of tree) {
    if (node.type === 'folder') {
      folders.push(node);
      if (node.children) {
        folders.push(...getAllFolders(node.children));
      }
    }
  }
  return folders;
}

function getAllLinks(tree: TreeNodeType[]): TreeNodeType[] {
  const links: TreeNodeType[] = [];
  for (const node of tree) {
    if (node.type === 'link') {
      links.push(node);
    }
    if (node.children) {
      links.push(...getAllLinks(node.children));
    }
  }
  return links;
}

function getParentId(tree: TreeNodeType[], nodeId: string, parentId: string | null = null): string | null {
  for (const node of tree) {
    if (node.id === nodeId) {
      return parentId;
    }
    if (node.children) {
      const found = getParentId(node.children, nodeId, node.id);
      if (found !== null) {
        return found;
      }
    }
  }
  return null;
}

function isDescendant(tree: TreeNodeType[], ancestorId: string, descendantId: string): boolean {
  const ancestor = findNodeById(tree, ancestorId);
  if (!ancestor || !ancestor.children) {
    return false;
  }
  return findNodeById(ancestor.children, descendantId) !== null;
}
