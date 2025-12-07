'use client';

import { ChevronRight, Folder, Link as LinkIcon } from 'lucide-react';
import { TreeNode as TreeNodeType } from '@/lib/db/tree';
import { useFolderStore } from '@/store/folderStore';
import { cn } from '@/lib/utils';

interface TreeNodeProps {
  node: TreeNodeType;
  depth?: number;
}

export function TreeNode({ node, depth = 0 }: TreeNodeProps) {
  const { expandedFolderIds, selectedFolderId, toggleFolder, selectFolder } = useFolderStore();
  const isExpanded = expandedFolderIds.has(node.id);
  const isSelected = selectedFolderId === node.id;

  const handleClick = () => {
    if (node.type === 'folder') {
      toggleFolder(node.id);
      selectFolder(node.id);
    } else if (node.type === 'link' && node.url) {
      window.open(node.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors rounded-md group',
          'hover:bg-slate-800/50',
          isSelected && node.type === 'folder' && 'bg-slate-800/70'
        )}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
        onClick={handleClick}
        data-testid={`tree-node-${node.id}`}
      >
        {node.type === 'folder' && (
          <ChevronRight
            className={cn(
              'h-4 w-4 transition-transform shrink-0 text-cyan-400',
              isExpanded && 'rotate-90'
            )}
            data-testid={`chevron-${node.id}`}
          />
        )}
        {node.type === 'link' && <div className="w-4" />}

        {node.type === 'folder' ? (
          <Folder className="h-4 w-4 text-cyan-400 shrink-0" />
        ) : (
          <LinkIcon className="h-4 w-4 text-purple-400 shrink-0" />
        )}

        <span className="text-sm text-slate-200 truncate">{node.name}</span>
      </div>

      {node.type === 'folder' && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
