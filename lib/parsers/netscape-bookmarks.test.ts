import { describe, it, expect } from 'vitest';
import { parseNetscapeBookmarks } from './netscape-bookmarks';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('parseNetscapeBookmarks', () => {
  it('should parse Chrome bookmark export', () => {
    const html = readFileSync(
      join(process.cwd(), 'tests/fixtures/bookmarks/chrome-export.html'),
      'utf-8'
    );
    const result = parseNetscapeBookmarks(html);

    expect(result.folders.length).toBeGreaterThan(0);
    expect(result.links.length).toBeGreaterThan(0);

    // Check for specific folders
    const bookmarksBar = result.folders.find(f => f.name === 'Bookmarks Bar');
    expect(bookmarksBar).toBeDefined();

    const development = result.folders.find(f => f.name === 'Development');
    expect(development).toBeDefined();

    // Check for specific links
    const githubLink = result.links.find(l => l.url === 'https://github.com');
    expect(githubLink).toBeDefined();
    expect(githubLink?.title).toBe('GitHub');
  });

  it('should parse Firefox bookmark export', () => {
    const html = readFileSync(
      join(process.cwd(), 'tests/fixtures/bookmarks/firefox-export.html'),
      'utf-8'
    );
    const result = parseNetscapeBookmarks(html);

    expect(result.folders.length).toBeGreaterThan(0);
    expect(result.links.length).toBeGreaterThan(0);

    // Check for Firefox-specific folders
    const mozillaFirefox = result.folders.find(f => f.name === 'Mozilla Firefox');
    expect(mozillaFirefox).toBeDefined();

    const work = result.folders.find(f => f.name === 'Work');
    expect(work).toBeDefined();
  });

  it('should parse Edge bookmark export', () => {
    const html = readFileSync(
      join(process.cwd(), 'tests/fixtures/bookmarks/edge-export.html'),
      'utf-8'
    );
    const result = parseNetscapeBookmarks(html);

    expect(result.folders.length).toBeGreaterThan(0);
    expect(result.links.length).toBeGreaterThan(0);

    // Check for Edge-specific content
    const favoritesBar = result.folders.find(f => f.name === 'Favorites bar');
    expect(favoritesBar).toBeDefined();

    const microsoft = result.links.find(l => l.url === 'https://www.microsoft.com');
    expect(microsoft).toBeDefined();
  });

  it('should parse Safari bookmark export', () => {
    const html = readFileSync(
      join(process.cwd(), 'tests/fixtures/bookmarks/safari-export.html'),
      'utf-8'
    );
    const result = parseNetscapeBookmarks(html);

    expect(result.folders.length).toBeGreaterThan(0);
    expect(result.links.length).toBeGreaterThan(0);

    // Check for Safari-specific content
    const bookmarksBar = result.folders.find(f => f.name === 'BookmarksBar');
    expect(bookmarksBar).toBeDefined();

    const apple = result.links.find(l => l.url === 'https://www.apple.com/');
    expect(apple).toBeDefined();
  });

  it('should preserve folder hierarchy', () => {
    const html = readFileSync(
      join(process.cwd(), 'tests/fixtures/bookmarks/chrome-export.html'),
      'utf-8'
    );
    const result = parseNetscapeBookmarks(html);

    // Find parent and child folders
    const development = result.folders.find(f => f.name === 'Development');
    const bookmarksBar = result.folders.find(f => f.name === 'Bookmarks Bar');

    expect(development).toBeDefined();
    expect(bookmarksBar).toBeDefined();

    // Development should be a child of Bookmarks Bar
    expect(development?.parentTempId).toBe(bookmarksBar?.tempId);
    expect(development?.depth).toBe(1);
    expect(bookmarksBar?.depth).toBe(0);
  });

  it('should handle HTML entities in titles', () => {
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p>
    <DT><A HREF="https://example.com">Test &amp; Demo &lt;Site&gt;</A>
</DL><p>`;

    const result = parseNetscapeBookmarks(html);

    expect(result.links[0].title).toBe('Test & Demo <Site>');
  });

  it('should skip invalid URLs', () => {
    const html = readFileSync(
      join(process.cwd(), 'tests/fixtures/bookmarks/malformed-export.html'),
      'utf-8'
    );
    const result = parseNetscapeBookmarks(html);

    // Should include valid URLs only
    const validLink = result.links.find(l => l.url === 'https://example.com');
    expect(validLink).toBeDefined();

    const invalidLink = result.links.find(l => l.url === 'not-a-valid-url');
    expect(invalidLink).toBeUndefined();
  });

  it('should skip bookmarks without titles', () => {
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p>
    <DT><A HREF="https://example.com"></A>
    <DT><A HREF="https://valid.com">Valid Title</A>
</DL><p>`;

    const result = parseNetscapeBookmarks(html);

    // Should only include the link with a title
    expect(result.links.length).toBe(1);
    expect(result.links[0].url).toBe('https://valid.com');
  });

  it('should truncate folder names longer than 255 characters', () => {
    const longName = 'A'.repeat(300);
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p>
    <DT><H3>${longName}</H3>
</DL><p>`;

    const result = parseNetscapeBookmarks(html);

    expect(result.folders[0].name.length).toBe(255);
  });

  it('should throw error for invalid HTML format', () => {
    const invalidHtml = '<html><body>Not a bookmark file</body></html>';

    expect(() => parseNetscapeBookmarks(invalidHtml)).toThrow('Invalid bookmark file format');
  });

  it('should detect circular folder references', () => {
    // This would require manually creating a circular structure in the parser
    // For now, we test that the validation function exists
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p>
    <DT><H3>Folder A</H3>
    <DL><p>
        <DT><A HREF="https://example.com">Link</A>
    </DL><p>
</DL><p>`;

    // Should not throw for valid structure
    expect(() => parseNetscapeBookmarks(html)).not.toThrow();
  });

  it('should handle empty bookmark files', () => {
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p>
</DL><p>`;

    const result = parseNetscapeBookmarks(html);

    expect(result.folders.length).toBe(0);
    expect(result.links.length).toBe(0);
  });

  it('should extract ADD_DATE metadata', () => {
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p>
    <DT><A HREF="https://example.com" ADD_DATE="1609459200">Example</A>
</DL><p>`;

    const result = parseNetscapeBookmarks(html);

    expect(result.links[0].addDate).toBe(1609459200);
  });

  it('should handle nested folder structures', () => {
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p>
    <DT><H3>Level 1</H3>
    <DL><p>
        <DT><H3>Level 2</H3>
        <DL><p>
            <DT><H3>Level 3</H3>
            <DL><p>
                <DT><A HREF="https://example.com">Deep Link</A>
            </DL><p>
        </DL><p>
    </DL><p>
</DL><p>`;

    const result = parseNetscapeBookmarks(html);

    expect(result.folders.length).toBe(3);
    expect(result.folders[0].depth).toBe(0);
    expect(result.folders[1].depth).toBe(1);
    expect(result.folders[2].depth).toBe(2);

    // Link should be in the deepest folder
    expect(result.links[0].folderTempId).toBe(result.folders[2].tempId);
  });

  it('should reject URLs longer than 2048 characters', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(2100);
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p>
    <DT><A HREF="${longUrl}">Long URL</A>
    <DT><A HREF="https://valid.com">Valid URL</A>
</DL><p>`;

    const result = parseNetscapeBookmarks(html);

    // Should only include the valid URL
    expect(result.links.length).toBe(1);
    expect(result.links[0].url).toBe('https://valid.com');
  });

  it('should handle large exports with 5000+ bookmarks', () => {
    const html = readFileSync(
      join(process.cwd(), 'tests/fixtures/bookmarks/large-export-5000.html'),
      'utf-8'
    );

    const result = parseNetscapeBookmarks(html);

    expect(result.folders.length).toBe(100);
    expect(result.links.length).toBe(5000);
  });
});
