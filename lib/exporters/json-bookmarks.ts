import { getAllFolders, Folder } from '../db/folders';
import { getAllLinks, Link } from '../db/links';

export interface BookmarkExport {
  version: string;
  exported_at: string;
  folder_count: number;
  link_count: number;
  folders: ExportFolder[];
  links: ExportLink[];
}

export interface ExportFolder {
  id: string;
  name: string;
  parent_id: string | null;
  sort_order: number;
}

export interface ExportLink {
  id: string;
  title: string;
  url: string;
  folder_id: string;
  sort_order: number;
}

/**
 * Export all bookmarks to JSON format
 * Includes metadata for version compatibility
 */
export function exportBookmarksToJson(): BookmarkExport {
  // Query all folders and links
  const folders = getAllFolders();
  const links = getAllLinks();

  // Map to export format (excluding timestamps and favicon_url)
  const exportFolders: ExportFolder[] = folders.map(folder => ({
    id: folder.id,
    name: folder.name,
    parent_id: folder.parent_id,
    sort_order: folder.sort_order,
  }));

  const exportLinks: ExportLink[] = links.map(link => ({
    id: link.id,
    title: link.title,
    url: link.url,
    folder_id: link.folder_id,
    sort_order: link.sort_order,
  }));

  return {
    version: '1.0',
    exported_at: new Date().toISOString(),
    folder_count: exportFolders.length,
    link_count: exportLinks.length,
    folders: exportFolders,
    links: exportLinks,
  };
}

/**
 * Generate filename for export with date
 */
export function generateExportFilename(): string {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `bookmarks-${date}.json`;
}
