import { getDb } from './index';
import { BookmarkTree } from '../parsers/netscape-bookmarks';
import { DuplicateStrategy, ImportResult } from '../validations/bookmark-import';

export interface ImportOptions {
  strategy: DuplicateStrategy;
}

/**
 * Import bookmarks from parsed bookmark tree
 * Uses a transaction to ensure atomicity
 */
export function importBookmarks(
  tree: BookmarkTree,
  options: ImportOptions = { strategy: DuplicateStrategy.SKIP }
): ImportResult {
  const db = getDb();
  const stats = {
    foldersAdded: 0,
    linksAdded: 0,
    linksUpdated: 0,
    linksSkipped: 0,
    errors: [] as string[],
  };

  try {
    // Use transaction for atomicity
    const result = db.transaction(() => {
      // Map temporary IDs to real database IDs
      const folderIdMap = new Map<string, string>();

      // Step 1: Insert folders in order (respecting hierarchy)
      // Sort folders by depth to ensure parents are created before children
      const sortedFolders = [...tree.folders].sort((a, b) => a.depth - b.depth);

      const insertFolderStmt = db.prepare(
        'INSERT INTO folders (id, name, parent_id, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      );

      for (const folder of sortedFolders) {
        const folderId = crypto.randomUUID();
        const parentId = folder.parentTempId ? folderIdMap.get(folder.parentTempId) || null : null;
        const now = new Date().toISOString();

        insertFolderStmt.run(
          folderId,
          folder.name,
          parentId,
          0, // sort_order
          now,
          now
        );

        folderIdMap.set(folder.tempId, folderId);
        stats.foldersAdded++;
      }

      // Step 2: Get existing URLs for duplicate detection
      const existingUrls = new Map<string, string>();
      if (options.strategy !== DuplicateStrategy.SKIP && tree.links.length > 0) {
        const urls = tree.links.map(l => l.url);
        const placeholders = urls.map(() => '?').join(',');
        const existing = db
          .prepare(`SELECT id, url FROM links WHERE url IN (${placeholders})`)
          .all(...urls) as Array<{ id: string; url: string }>;

        existing.forEach(link => existingUrls.set(link.url, link.id));
      } else if (tree.links.length > 0) {
        // For skip strategy, just get URLs without IDs
        const urls = tree.links.map(l => l.url);
        const placeholders = urls.map(() => '?').join(',');
        const existing = db
          .prepare(`SELECT url FROM links WHERE url IN (${placeholders})`)
          .all(...urls) as Array<{ url: string }>;

        existing.forEach(link => existingUrls.set(link.url, ''));
      }

      // Step 3: Insert or update links
      const insertLinkStmt = db.prepare(
        'INSERT INTO links (id, title, url, folder_id, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );

      const updateLinkStmt = db.prepare(
        'UPDATE links SET title = ?, folder_id = ?, updated_at = ? WHERE id = ?'
      );

      for (const link of tree.links) {
        const folderId = folderIdMap.get(link.folderTempId);
        if (!folderId) {
          stats.errors.push(`Link "${link.title}" has invalid folder reference`);
          continue;
        }

        const existingId = existingUrls.get(link.url);

        if (existingId !== undefined) {
          // URL already exists
          if (options.strategy === DuplicateStrategy.SKIP) {
            stats.linksSkipped++;
            continue;
          } else if (options.strategy === DuplicateStrategy.UPDATE && existingId) {
            // Update existing link
            const now = new Date().toISOString();
            updateLinkStmt.run(link.title, folderId, now, existingId);
            stats.linksUpdated++;
            continue;
          }
        }

        // Insert new link
        const linkId = crypto.randomUUID();
        const now = new Date().toISOString();

        insertLinkStmt.run(
          linkId,
          link.title,
          link.url,
          folderId,
          0, // sort_order
          now,
          now
        );

        stats.linksAdded++;
      }

      return stats;
    })();

    return {
      success: true,
      stats: result,
    };
  } catch (error) {
    // Transaction will automatically rollback on error
    return {
      success: false,
      stats: {
        ...stats,
        errors: [error instanceof Error ? error.message : 'Unknown error during import'],
      },
    };
  }
}

/**
 * Check if import would exceed reasonable limits
 */
export function validateImportSize(tree: BookmarkTree): void {
  const MAX_FOLDERS = 10000;
  const MAX_LINKS = 50000;

  if (tree.folders.length > MAX_FOLDERS) {
    throw new Error(`Too many folders. Maximum is ${MAX_FOLDERS}`);
  }

  if (tree.links.length > MAX_LINKS) {
    throw new Error(`Too many bookmarks. Maximum is ${MAX_LINKS}`);
  }
}
