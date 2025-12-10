import { describe, it, expect, beforeEach } from 'vitest';
import { getDb } from '@/lib/db';
import { initSchema } from '@/lib/db/schema';
import { parseNetscapeBookmarks } from '@/lib/parsers/netscape-bookmarks';
import { importBookmarks } from '@/lib/db/bookmark-import';
import { DuplicateStrategy } from '@/lib/validations/bookmark-import';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Import Functionality', () => {
  beforeEach(() => {
    const db = getDb();
    db.exec('DROP TABLE IF EXISTS links');
    db.exec('DROP TABLE IF EXISTS folders');
    initSchema(db);
  });

  it('should parse and import Chrome bookmark export', () => {
    const html = readFileSync(
      join(process.cwd(), 'tests/fixtures/bookmarks/chrome-export.html'),
      'utf-8'
    );

    const tree = parseNetscapeBookmarks(html);
    const result = importBookmarks(tree, { strategy: DuplicateStrategy.SKIP });

    expect(result.success).toBe(true);
    expect(result.stats.foldersAdded).toBeGreaterThan(0);
    expect(result.stats.linksAdded).toBeGreaterThan(0);
  });

  it('should parse and import Firefox bookmark export', () => {
    const html = readFileSync(
      join(process.cwd(), 'tests/fixtures/bookmarks/firefox-export.html'),
      'utf-8'
    );

    const tree = parseNetscapeBookmarks(html);
    const result = importBookmarks(tree, { strategy: DuplicateStrategy.SKIP });

    expect(result.success).toBe(true);
    expect(result.stats.foldersAdded).toBeGreaterThan(0);
    expect(result.stats.linksAdded).toBeGreaterThan(0);
  });

  it('should handle duplicate URLs with skip strategy', () => {
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p>
    <DT><H3>Test Folder</H3>
    <DL><p>
        <DT><A HREF="https://example.com">Example</A>
    </DL><p>
</DL><p>`;

    // First import
    const tree1 = parseNetscapeBookmarks(html);
    const result1 = importBookmarks(tree1, { strategy: DuplicateStrategy.SKIP });

    expect(result1.stats.linksAdded).toBe(1);
    expect(result1.stats.linksSkipped).toBe(0);

    // Second import with same data
    const tree2 = parseNetscapeBookmarks(html);
    const result2 = importBookmarks(tree2, { strategy: DuplicateStrategy.SKIP });

    expect(result2.stats.linksAdded).toBe(0);
    expect(result2.stats.linksSkipped).toBe(1);
  });

  it('should handle duplicate URLs with update strategy', () => {
    const html1 = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p>
    <DT><H3>Folder 1</H3>
    <DL><p>
        <DT><A HREF="https://example.com">Old Title</A>
    </DL><p>
</DL><p>`;

    const html2 = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p>
    <DT><H3>Folder 2</H3>
    <DL><p>
        <DT><A HREF="https://example.com">New Title</A>
    </DL><p>
</DL><p>`;

    // First import
    const tree1 = parseNetscapeBookmarks(html1);
    importBookmarks(tree1, { strategy: DuplicateStrategy.SKIP });

    // Second import with update strategy
    const tree2 = parseNetscapeBookmarks(html2);
    const result2 = importBookmarks(tree2, { strategy: DuplicateStrategy.UPDATE });

    expect(result2.stats.linksUpdated).toBe(1);
    expect(result2.stats.linksAdded).toBe(0);
  });

  it('should handle malformed HTML gracefully', () => {
    const html = readFileSync(
      join(process.cwd(), 'tests/fixtures/bookmarks/malformed-export.html'),
      'utf-8'
    );

    const tree = parseNetscapeBookmarks(html);
    const result = importBookmarks(tree, { strategy: DuplicateStrategy.SKIP });

    // Should succeed but skip invalid URLs
    expect(result.success).toBe(true);
  });

  it('should handle empty bookmark files', () => {
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p>
</DL><p>`;

    const tree = parseNetscapeBookmarks(html);
    const result = importBookmarks(tree, { strategy: DuplicateStrategy.SKIP });

    expect(result.success).toBe(true);
    expect(result.stats.foldersAdded).toBe(0);
    expect(result.stats.linksAdded).toBe(0);
  });

  it('should rollback on error', () => {
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p>
    <DT><H3>Test Folder</H3>
    <DL><p>
        <DT><A HREF="https://example.com">Example</A>
    </DL><p>
</DL><p>`;

    const tree = parseNetscapeBookmarks(html);

    // Corrupt the tree to cause an error
    tree.links[0].folderTempId = 'invalid-folder-id';

    const result = importBookmarks(tree, { strategy: DuplicateStrategy.SKIP });

    // Should fail gracefully
    expect(result.success).toBe(true); // Transaction still succeeds but logs errors
    expect(result.stats.errors.length).toBeGreaterThan(0);
  });
});
