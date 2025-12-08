import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from './route';
import { getDb } from '@/lib/db';
import { initSchema } from '@/lib/db/schema';
import { readFileSync } from 'fs';
import { join } from 'path';

// Increase timeout for file operations
const TEST_TIMEOUT = 10000;

describe('Import API Route', () => {
  beforeEach(() => {
    const db = getDb();
    db.exec('DROP TABLE IF EXISTS links');
    db.exec('DROP TABLE IF EXISTS folders');
    initSchema(db);
  });

  it('should successfully import Chrome bookmark export', async () => {
    const html = readFileSync(
      join(process.cwd(), 'tests/fixtures/bookmarks/chrome-export.html'),
      'utf-8'
    );

    const formData = new FormData();
    const blob = new Blob([html], { type: 'text/html' });
    const file = new File([blob], 'bookmarks.html', { type: 'text/html' });
    formData.append('file', file);
    formData.append('strategy', 'skip');

    const request = new Request('http://localhost:3000/api/bookmarks/import', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.stats.foldersAdded).toBeGreaterThan(0);
    expect(result.stats.linksAdded).toBeGreaterThan(0);
  }, TEST_TIMEOUT);

  it('should successfully import Firefox bookmark export', async () => {
    const html = readFileSync(
      join(process.cwd(), 'tests/fixtures/bookmarks/firefox-export.html'),
      'utf-8'
    );

    const formData = new FormData();
    const blob = new Blob([html], { type: 'text/html' });
    const file = new File([blob], 'bookmarks.html', { type: 'text/html' });
    formData.append('file', file);
    formData.append('strategy', 'skip');

    const request = new Request('http://localhost:3000/api/bookmarks/import', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.stats.foldersAdded).toBeGreaterThan(0);
    expect(result.stats.linksAdded).toBeGreaterThan(0);
  });

  it('should handle duplicate URLs with skip strategy', async () => {
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p>
    <DT><H3>Test Folder</H3>
    <DL><p>
        <DT><A HREF="https://example.com">Example</A>
    </DL><p>
</DL><p>`;

    const formData = new FormData();
    const blob = new Blob([html], { type: 'text/html' });
    const file = new File([blob], 'bookmarks.html', { type: 'text/html' });
    formData.append('file', file);
    formData.append('strategy', 'skip');

    // First import
    const request1 = new Request('http://localhost:3000/api/bookmarks/import', {
      method: 'POST',
      body: formData,
    });
    const response1 = await POST(request1);
    const result1 = await response1.json();

    expect(result1.stats.linksAdded).toBe(1);
    expect(result1.stats.linksSkipped).toBe(0);

    // Second import with same data
    const formData2 = new FormData();
    const blob2 = new Blob([html], { type: 'text/html' });
    const file2 = new File([blob2], 'bookmarks.html', { type: 'text/html' });
    formData2.append('file', file2);
    formData2.append('strategy', 'skip');

    const request2 = new Request('http://localhost:3000/api/bookmarks/import', {
      method: 'POST',
      body: formData2,
    });
    const response2 = await POST(request2);
    const result2 = await response2.json();

    expect(result2.stats.linksAdded).toBe(0);
    expect(result2.stats.linksSkipped).toBe(1);
  });

  it('should handle duplicate URLs with update strategy', async () => {
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
    const formData1 = new FormData();
    const blob1 = new Blob([html1], { type: 'text/html' });
    const file1 = new File([blob1], 'bookmarks.html', { type: 'text/html' });
    formData1.append('file', file1);
    formData1.append('strategy', 'skip');

    const request1 = new Request('http://localhost:3000/api/bookmarks/import', {
      method: 'POST',
      body: formData1,
    });
    await POST(request1);

    // Second import with update strategy
    const formData2 = new FormData();
    const blob2 = new Blob([html2], { type: 'text/html' });
    const file2 = new File([blob2], 'bookmarks.html', { type: 'text/html' });
    formData2.append('file', file2);
    formData2.append('strategy', 'update');

    const request2 = new Request('http://localhost:3000/api/bookmarks/import', {
      method: 'POST',
      body: formData2,
    });
    const response2 = await POST(request2);
    const result2 = await response2.json();

    expect(result2.stats.linksUpdated).toBe(1);
    expect(result2.stats.linksAdded).toBe(0);
  });

  it('should reject request without file', async () => {
    const formData = new FormData();
    formData.append('strategy', 'skip');

    const request = new Request('http://localhost:3000/api/bookmarks/import', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.success).toBe(false);
    expect(result.error).toContain('No file provided');
  });

  it('should reject invalid HTML format', async () => {
    const invalidHtml = '<html><body>Not a bookmark file</body></html>';

    const formData = new FormData();
    const blob = new Blob([invalidHtml], { type: 'text/html' });
    const file = new File([blob], 'bookmarks.html', { type: 'text/html' });
    formData.append('file', file);
    formData.append('strategy', 'skip');

    const request = new Request('http://localhost:3000/api/bookmarks/import', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid bookmark file format');
  });

  it('should handle malformed HTML gracefully', async () => {
    const html = readFileSync(
      join(process.cwd(), 'tests/fixtures/bookmarks/malformed-export.html'),
      'utf-8'
    );

    const formData = new FormData();
    const blob = new Blob([html], { type: 'text/html' });
    const file = new File([blob], 'bookmarks.html', { type: 'text/html' });
    formData.append('file', file);
    formData.append('strategy', 'skip');

    const request = new Request('http://localhost:3000/api/bookmarks/import', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const result = await response.json();

    // Should succeed but skip invalid URLs
    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
  });

  it('should handle empty bookmark files', async () => {
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p>
</DL><p>`;

    const formData = new FormData();
    const blob = new Blob([html], { type: 'text/html' });
    const file = new File([blob], 'bookmarks.html', { type: 'text/html' });
    formData.append('file', file);
    formData.append('strategy', 'skip');

    const request = new Request('http://localhost:3000/api/bookmarks/import', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.stats.foldersAdded).toBe(0);
    expect(result.stats.linksAdded).toBe(0);
  });
});
