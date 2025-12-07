import { getAllFolders, type Folder } from './folders';
import { getAllLinks, type Link } from './links';

export interface TreeNode {
  id: string;
  type: 'folder' | 'link';
  name: string;
  url?: string;
  favicon_url?: string;
  children?: TreeNode[];
}

export function buildTree(): TreeNode[] {
  const folders = getAllFolders();
  const links = getAllLinks();

  const folderMap = new Map<string, TreeNode>();

  folders.forEach((folder) => {
    folderMap.set(folder.id, {
      id: folder.id,
      type: 'folder',
      name: folder.name,
      children: [],
    });
  });

  links.forEach((link) => {
    const linkNode: TreeNode = {
      id: link.id,
      type: 'link',
      name: link.title,
      url: link.url,
      favicon_url: link.favicon_url ?? undefined,
    };

    const parentFolder = folderMap.get(link.folder_id);
    if (parentFolder) {
      parentFolder.children!.push(linkNode);
    }
  });

  const rootNodes: TreeNode[] = [];

  folders.forEach((folder) => {
    const node = folderMap.get(folder.id)!;
    if (folder.parent_id === null) {
      rootNodes.push(node);
    } else {
      const parent = folderMap.get(folder.parent_id);
      if (parent) {
        parent.children!.push(node);
      } else {
        rootNodes.push(node);
      }
    }
  });

  return rootNodes;
}
