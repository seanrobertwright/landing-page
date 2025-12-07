import { TreeNode } from '@/lib/db/tree';

export interface FolderOption {
  id: string;
  label: string;
  depth: number;
}

/**
 * Flattens a tree of folders into a list of options for a dropdown select.
 * Each option includes indentation to show hierarchy.
 *
 * @param tree - The tree of folders to flatten
 * @returns Array of folder options with labels showing hierarchy
 */
export const buildFolderOptions = (tree: TreeNode[]): FolderOption[] => {
  const options: FolderOption[] = [{ id: 'ROOT', label: '(Root)', depth: 0 }];

  const traverse = (nodes: TreeNode[], depth: number = 0) => {
    nodes.forEach((node) => {
      if (node.type === 'folder') {
        const indent = '  '.repeat(depth);
        const prefix = depth > 0 ? '└─ ' : '';
        options.push({
          id: node.id,
          label: `${indent}${prefix}${node.name}`,
          depth,
        });

        if (node.children && node.children.length > 0) {
          traverse(node.children.filter((child) => child.type === 'folder'), depth + 1);
        }
      }
    });
  };

  traverse(tree);
  return options;
};
