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

/**
 * Create a streaming export for large datasets
 * Uses async generator to avoid loading everything into memory
 */
export async function* streamBookmarkExport(): AsyncGenerator<string> {
  const folders = getAllFolders();
  const links = getAllLinks();

  // Stream header
  yield '{\n';
  yield `  "version": "1.0",\n`;
  yield `  "exported_at": "${new Date().toISOString()}",\n`;
  yield `  "folder_count": ${folders.length},\n`;
  yield `  "link_count": ${links.length},\n`;
  yield `  "folders": [\n`;

  // Stream folders in chunks
  for (let i = 0; i < folders.length; i++) {
    const folder = folders[i];
    const exportFolder = {
      id: folder.id,
      name: folder.name,
      parent_id: folder.parent_id,
      sort_order: folder.sort_order,
    };
    yield `    ${JSON.stringify(exportFolder)}${i < folders.length - 1 ? ',' : ''}\n`;
  }

  yield `  ],\n`;
  yield `  "links": [\n`;

  // Stream links in chunks
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const exportLink = {
      id: link.id,
      title: link.title,
      url: link.url,
      folder_id: link.folder_id,
      sort_order: link.sort_order,
    };
    yield `    ${JSON.stringify(exportLink)}${i < links.length - 1 ? ',' : ''}\n`;
  }

  yield `  ]\n`;
  yield '}\n';
}
