/**
 * Parser for Netscape HTML bookmark format
 * Supports exports from Chrome, Firefox, Edge, and Safari
 */

export interface ParsedFolder {
  tempId: string;
  name: string;
  parentTempId: string | null;
  depth: number;
}

export interface ParsedLink {
  title: string;
  url: string;
  folderTempId: string;
  addDate?: number;
}

export interface BookmarkTree {
  folders: ParsedFolder[];
  links: ParsedLink[];
}

/**
 * Parse Netscape HTML bookmark format
 * @param html - HTML content from browser export
 * @returns Parsed bookmark tree with folders and links
 * @throws Error if HTML format is invalid
 */
export function parseNetscapeBookmarks(html: string): BookmarkTree {
  // Validate basic HTML structure
  if (!html.includes('<!DOCTYPE NETSCAPE-Bookmark-file-1>') &&
      !html.toLowerCase().includes('<dl')) {
    throw new Error('Invalid bookmark file format');
  }

  const folders: ParsedFolder[] = [];
  const links: ParsedLink[] = [];

  // Stack to track folder hierarchy
  const folderStack: string[] = [];
  let currentFolderId: string | null = null;
  let tempIdCounter = 0;

  // Split into lines for easier parsing
  const lines = html.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Parse folder headings (<H3> tags)
    const folderMatch = line.match(/<H3[^>]*>(.*?)<\/H3>/i);
    if (folderMatch) {
      const folderName = decodeHtmlEntities(folderMatch[1].trim());
      if (folderName) {
        const tempId = `temp_folder_${tempIdCounter++}`;
        const parentTempId = currentFolderId;

        folders.push({
          tempId,
          name: folderName.substring(0, 255), // Truncate to max length
          parentTempId,
          depth: folderStack.length,
        });

        currentFolderId = tempId;
        folderStack.push(tempId);
      }
      continue;
    }

    // Parse bookmark links (<A> tags)
    const linkMatch = line.match(/<A\s+([^>]*?)>(.*?)<\/A>/i);
    if (linkMatch) {
      const attributes = linkMatch[1];
      const title = decodeHtmlEntities(linkMatch[2].trim());

      // Extract HREF
      const hrefMatch = attributes.match(/HREF="([^"]+)"/i);
      if (hrefMatch && title) {
        const url = hrefMatch[1];

        // Extract ADD_DATE if present
        const addDateMatch = attributes.match(/ADD_DATE="(\d+)"/i);
        const addDate = addDateMatch ? parseInt(addDateMatch[1], 10) : undefined;

        // Only add if we have a valid URL
        if (isValidUrl(url)) {
          links.push({
            title,
            url,
            folderTempId: currentFolderId || '',
            addDate,
          });
        }
      }
      continue;
    }

    // Track closing DL tags to pop folder stack
    if (line.includes('</DL>') || line.includes('</dl>')) {
      if (folderStack.length > 0) {
        folderStack.pop();
        currentFolderId = folderStack.length > 0 ? folderStack[folderStack.length - 1] : null;
      }
    }
  }

  // Validate for circular references
  validateNoCircularReferences(folders);

  return { folders, links };
}

/**
 * Decode HTML entities in text
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
  };

  return text.replace(/&[a-z]+;|&#\d+;/gi, (match) => {
    return entities[match.toLowerCase()] || match;
  });
}

/**
 * Validate URL format and length
 */
function isValidUrl(url: string): boolean {
  // Reject URLs longer than 2048 characters (browser limit)
  if (url.length > 2048) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate that there are no circular folder references
 */
function validateNoCircularReferences(folders: ParsedFolder[]): void {
  const folderMap = new Map<string, ParsedFolder>();
  folders.forEach(f => folderMap.set(f.tempId, f));

  for (const folder of folders) {
    const visited = new Set<string>();
    let current: ParsedFolder | undefined = folder;

    while (current && current.parentTempId) {
      if (visited.has(current.tempId)) {
        throw new Error('Circular folder reference detected');
      }
      visited.add(current.tempId);
      current = folderMap.get(current.parentTempId);
    }
  }
}
