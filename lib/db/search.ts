import { getDb } from './index';
import { Link } from './links';
import { Folder, getFolderById } from './folders';

export interface SearchResultLink extends Link {
  type: 'link';
  score: number;
  folder_path: string[];
}

export interface SearchResultFolder extends Folder {
  type: 'folder';
  score: number;
  folder_path: string[];
}

export type SearchResult = SearchResultLink | SearchResultFolder;

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  limited: boolean;
}

/**
 * Sanitizes search query to prevent SQL injection
 * Escapes special SQLite LIKE characters: % and _
 */
export function sanitizeQuery(query: string): string {
  return query.replace(/[%_]/g, '\\$&');
}

/**
 * Calculates relevance score for a match
 * - Exact match: 100
 * - Prefix match: 50
 * - Contains match: 10
 */
export function calculateScore(query: string, text: string): number {
  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();

  if (lowerText === lowerQuery) {
    return 100; // Exact match
  }
  if (lowerText.startsWith(lowerQuery)) {
    return 50; // Prefix match
  }
  if (lowerText.includes(lowerQuery)) {
    return 10; // Contains match
  }
  return 0;
}

/**
 * Gets the folder path (breadcrumb) for a given folder ID
 * Returns array of folder names from root to current folder
 */
export function getFolderPath(folderId: string | null): string[] {
  if (!folderId) return [];

  const path: string[] = [];
  let currentId: string | null = folderId;

  // Prevent infinite loops by limiting traversal depth
  let depth = 0;
  const MAX_DEPTH = 20;

  while (currentId && depth < MAX_DEPTH) {
    const folder = getFolderById(currentId);
    if (!folder) break;
    path.unshift(folder.name);
    currentId = folder.parent_id;
    depth++;
  }

  return path;
}

/**
 * Searches bookmarks by title and URL
 */
export function searchBookmarks(query: string): SearchResultLink[] {
  const db = getDb();
  const sanitized = sanitizeQuery(query);
  const pattern = `%${sanitized}%`;

  const links = db
    .prepare(
      `SELECT * FROM links
       WHERE title LIKE ? ESCAPE '\\' OR url LIKE ? ESCAPE '\\'
       ORDER BY created_at DESC
       LIMIT 100`
    )
    .all(pattern, pattern) as Link[];

  return links.map((link) => {
    // Calculate score based on title and URL matches
    const titleScore = calculateScore(query, link.title);
    const urlScore = calculateScore(query, link.url);
    const score = Math.max(titleScore, urlScore);

    return {
      ...link,
      type: 'link' as const,
      score,
      folder_path: getFolderPath(link.folder_id),
    };
  });
}

/**
 * Searches folders by name
 */
export function searchFolders(query: string): SearchResultFolder[] {
  const db = getDb();
  const sanitized = sanitizeQuery(query);
  const pattern = `%${sanitized}%`;

  const folders = db
    .prepare(
      `SELECT * FROM folders
       WHERE name LIKE ? ESCAPE '\\'
       ORDER BY created_at DESC
       LIMIT 100`
    )
    .all(pattern) as Folder[];

  return folders.map((folder) => {
    const score = calculateScore(query, folder.name);

    return {
      ...folder,
      type: 'folder' as const,
      score,
      folder_path: getFolderPath(folder.parent_id),
    };
  });
}

/**
 * Searches across both bookmarks and folders
 * Returns combined results sorted by relevance score
 */
export function searchAll(query: string, limit = 50): SearchResponse {
  if (!query || query.trim().length === 0) {
    return { results: [], total: 0, limited: false };
  }

  const trimmedQuery = query.trim();

  const bookmarks = searchBookmarks(trimmedQuery);
  const folders = searchFolders(trimmedQuery);

  // Combine and sort by score (descending), then by created_at (descending)
  const combined = [...bookmarks, ...folders].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const total = combined.length;
  const results = combined.slice(0, limit);
  const limited = total > limit;

  return { results, total, limited };
}
