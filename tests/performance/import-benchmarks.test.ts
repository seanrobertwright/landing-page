import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseNetscapeBookmarks } from '@/lib/parsers/netscape-bookmarks';
import { importBookmarks } from '@/lib/db/bookmark-import';
import { DuplicateStrategy } from '@/lib/validations/bookmark-import';
import { getDb } from '@/lib/db';

describe('Import Performance Benchmarks', () => {
  beforeEach(() => {
    // Clear database before each test
    const db = getDb();
    db.exec('DELETE FROM links');
    db.exec('DELETE FROM folders');
  });

  it('should parse 1000 bookmarks in under 1 second', () => {
    const html = readFileSync(
      join(process.cwd(), 'tests/fixtures/bookmarks/chrome-export.html'),
      'utf-8'
    );

    const start = performance.now();
    const result = parseNetscapeBookmarks(html);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(1000);
    expect(result.links.length).toBeGreaterThan(0);
  });

  it('should parse 5000 bookmarks in under 3 seconds', () => {
    const html = readFileSync(
      join(process.cwd(), 'tests/fixtures/bookmarks/large-export-5000.html'),
      'utf-8'
    );

    const start = performance.now();
    const result = parseNetscapeBookmarks(html);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(3000);
    expect(result.links.length).toBe(5000);
    expect(result.folders.length).toBe(100);
  });

  it('should import 1000 bookmarks in under 5 seconds', () => {
    const html = readFileSync(
      join(process.cwd(), 'tests/fixtures/bookmarks/chrome-export.html'),
      'utf-8'
    );

    const tree = parseNetscapeBookmarks(html);

    const start = performance.now();
    const result = importBookmarks(tree, { strategy: DuplicateStrategy.SKIP });
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(5000);
    expect(result.success).toBe(true);
    expect(result.stats.linksAdded).toBeGreaterThan(0);
  });

  it('should import 5000 bookmarks in under 20 seconds', () => {
    const html = readFileSync(
      join(process.cwd(), 'tests/fixtures/bookmarks/large-export-5000.html'),
      'utf-8'
    );

    const tree = parseNetscapeBookmarks(html);

    const start = performance.now();
    const result = importBookmarks(tree, { strategy: DuplicateStrategy.SKIP });
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(20000);
    expect(result.success).toBe(true);
    expect(result.stats.linksAdded).toBe(5000);
    expect(result.stats.foldersAdded).toBe(100);
  });

  it('should handle duplicate detection efficiently with skip strategy', () => {
    const html = readFileSync(
      join(process.cwd(), 'tests/fixtures/bookmarks/chrome-export.html'),
      'utf-8'
    );

    const tree = parseNetscapeBookmarks(html);

    // First import
    importBookmarks(tree, { strategy: DuplicateStrategy.SKIP });

    // Second import (all duplicates)
    const start = performance.now();
    const result = importBookmarks(tree, { strategy: DuplicateStrategy.SKIP });
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(2000);
    expect(result.success).toBe(true);
    expect(result.stats.linksSkipped).toBeGreaterThan(0);
    expect(result.stats.linksAdded).toBe(0);
  });

  it('should handle duplicate detection efficiently with update strategy', () => {
    const html = readFileSync(
      join(process.cwd(), 'tests/fixtures/bookmarks/chrome-export.html'),
      'utf-8'
    );

    const tree = parseNetscapeBookmarks(html);

    // First import
    importBookmarks(tree, { strategy: DuplicateStrategy.SKIP });

    // Second import (all updates)
    const start = performance.now();
    const result = importBookmarks(tree, { strategy: DuplicateStrategy.UPDATE });
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(3000);
    expect(result.success).toBe(true);
    expect(result.stats.linksUpdated).toBeGreaterThan(0);
  });

  it('should efficiently validate circular references', () => {
    const html = readFileSync(
      join(process.cwd(), 'tests/fixtures/bookmarks/large-export-5000.html'),
      'utf-8'
    );

    const start = performance.now();
    const result = parseNetscapeBookmarks(html);
    const duration = performance.now() - start;

    // Validation is part of parsing
    expect(duration).toBeLessThan(3000);
    expect(result.folders.length).toBeGreaterThan(0);
  });

  it('should measure memory usage for large imports', () => {
    const html = readFileSync(
      join(process.cwd(), 'tests/fixtures/bookmarks/large-export-5000.html'),
      'utf-8'
    );

    const memBefore = process.memoryUsage().heapUsed;
    const tree = parseNetscapeBookmarks(html);
    importBookmarks(tree, { strategy: DuplicateStrategy.SKIP });
    const memAfter = process.memoryUsage().heapUsed;

    const memUsedMB = (memAfter - memBefore) / 1024 / 1024;

    // Should use less than 50MB for 5000 bookmarks
    expect(memUsedMB).toBeLessThan(50);
  });

  it('should parse nested folder hierarchies efficiently', () => {
    // Create 20 nested folders with unique names
    let html = '<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<DL><p>\n';
    for (let i = 0; i < 20; i++) {
      html += `  ${'  '.repeat(i)}<DT><H3>Level${i}</H3>\n`;
      html += `  ${'  '.repeat(i)}<DL><p>\n`;
    }
    html += `  ${'  '.repeat(20)}<DT><A HREF="https://example.com">Deep Link</A>\n`;
    for (let i = 19; i >= 0; i--) {
      html += `  ${'  '.repeat(i)}</DL><p>\n`;
    }
    html += '</DL><p>';

    const start = performance.now();
    const result = parseNetscapeBookmarks(html);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(100);
    expect(result.folders.length).toBe(20);
    expect(result.links.length).toBe(1);
  });

  it('should efficiently skip invalid URLs during parsing', () => {
    const invalidUrls = Array.from({ length: 1000 }, (_, i) =>
      `<DT><A HREF="not-a-valid-url-${i}">Invalid Link ${i}</A>`
    ).join('\n');

    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p>
  ${invalidUrls}
  <DT><A HREF="https://valid.com">Valid Link</A>
</DL><p>`;

    const start = performance.now();
    const result = parseNetscapeBookmarks(html);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(500);
    expect(result.links.length).toBe(1); // Only valid URL
  });
});
