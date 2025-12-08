# Design: Add Bookmark Import/Export

## Architecture Overview

### File Format Decisions

**Import Format: Netscape HTML**
- Universal standard supported by all major browsers
- Human-readable for debugging
- Hierarchical structure with `<DL>`, `<DT>`, `<DD>` tags
- Backwards compatible across browser versions

**Export Format: JSON**
- Structured data, easy to parse
- Includes metadata (version, export date)
- Compact and efficient
- Can be re-imported without data loss

### Component Structure

```
Import Flow:
Browser Export → HTML File → Upload → Parser → Validator → DB Batch Insert → Summary

Export Flow:
Database Query → JSON Generator → File Download → Browser Save
```

### Import Processing Pipeline

**Step 1: File Upload & Validation**
```typescript
POST /api/bookmarks/import
- Validate file size (<50MB)
- Check file type (text/html)
- Read file content
- Initial format validation
```

**Step 2: HTML Parsing**
```typescript
parseNetscapeBookmarks(html: string): BookmarkTree
- Parse HTML structure
- Extract folders (<H3> tags)
- Extract bookmarks (<A> tags with HREF)
- Build hierarchical tree structure
- Track folder parent/child relationships
```

**Step 3: Data Validation**
```typescript
validateBookmarkTree(tree: BookmarkTree): ValidationResult
- Validate URLs (format, protocol)
- Check for circular folder references
- Validate folder names (length, characters)
- Detect duplicates by URL
```

**Step 4: Database Import**
```typescript
importBookmarks(tree: BookmarkTree, options: ImportOptions): ImportResult
- Transaction-based import (all or nothing)
- Batch insert folders (optimize with single transaction)
- Batch insert links with folder references
- Handle duplicates (skip, update, or fail)
- Return statistics (added, skipped, errors)
```

### Export Generation

**Database Extraction**
```typescript
exportBookmarks(): BookmarkExport
- Query all folders with hierarchy
- Query all links with folder associations
- Build JSON structure with metadata
- Include export version and timestamp
```

**JSON Structure**
```json
{
  "version": "1.0",
  "exported_at": "2025-01-15T10:30:00Z",
  "folders": [
    {
      "id": "uuid",
      "name": "Work",
      "parent_id": null,
      "sort_order": 100
    }
  ],
  "links": [
    {
      "id": "uuid",
      "title": "GitHub",
      "url": "https://github.com",
      "folder_id": "uuid",
      "sort_order": 100
    }
  ]
}
```

### HTML Parser Implementation

**Netscape Bookmark Format Structure:**
```html
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3>Folder Name</H3>
    <DL><p>
        <DT><A HREF="https://example.com" ADD_DATE="1234567890">Link Title</A>
        <DT><H3>Subfolder</H3>
        <DL><p>
            <DT><A HREF="https://sub.example.com">Sub Link</A>
        </DL><p>
    </DL><p>
</DL><p>
```

**Parsing Strategy:**
- Use regular expressions for simple extraction
- Or use HTML parser library (cheerio) for robust parsing
- Track depth level to maintain hierarchy
- Map `<H3>` to folders, `<A>` to links
- Handle `<DD>` (descriptions) as optional metadata

### Database Operations

**Batch Insert Strategy:**
```typescript
// Import uses transaction for atomicity
db.transaction(() => {
  // 1. Insert all folders (breadth-first to handle parent refs)
  const folderMap = new Map<string, string>(); // temp_id -> real_id

  for (const folder of folders) {
    const realId = crypto.randomUUID();
    folderMap.set(folder.tempId, realId);

    db.prepare(
      'INSERT INTO folders (id, name, parent_id, sort_order) VALUES (?, ?, ?, ?)'
    ).run(realId, folder.name, folder.parent_id ? folderMap.get(folder.parent_id) : null, folder.sort_order);
  }

  // 2. Insert all links (using mapped folder IDs)
  for (const link of links) {
    const folderId = folderMap.get(link.folder_id);
    db.prepare(
      'INSERT INTO links (id, title, url, folder_id, sort_order) VALUES (?, ?, ?, ?, ?)'
    ).run(crypto.randomUUID(), link.title, link.url, folderId, link.sort_order);
  }
});
```

**Duplicate Handling:**
```typescript
enum DuplicateStrategy {
  SKIP = 'skip',        // Skip if URL exists
  UPDATE = 'update',    // Update metadata (title, folder)
  ERROR = 'error'       // Fail import on duplicates
}

// Check for duplicates before insert
const existingUrls = db.prepare(
  'SELECT url FROM links WHERE url IN (' + urls.map(() => '?').join(',') + ')'
).all(...urls);
```

### UI Component Design

**Import Dialog:**
```tsx
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Import Bookmarks</DialogTitle>
      <DialogDescription>
        Upload an HTML bookmark export from your browser
      </DialogDescription>
    </DialogHeader>

    <FileUpload
      accept=".html"
      onUpload={handleImport}
      maxSize={50 * 1024 * 1024} // 50MB
    />

    {importing && (
      <Progress value={progress} />
      <Text>{processedCount} / {totalCount} bookmarks</Text>
    )}

    {complete && (
      <ImportSummary
        foldersAdded={stats.foldersAdded}
        linksAdded={stats.linksAdded}
        duplicatesSkipped={stats.skipped}
        errors={stats.errors}
      />
    )}
  </DialogContent>
</Dialog>
```

**Export Button:**
```tsx
<Button onClick={handleExport}>
  <Download className="h-4 w-4 mr-2" />
  Export Bookmarks
</Button>
```

### API Endpoints

**POST /api/bookmarks/import**
```typescript
Request:
- Content-Type: multipart/form-data
- Body: { file: File, strategy: 'skip' | 'update' | 'error' }

Response:
{
  success: true,
  stats: {
    foldersAdded: 25,
    linksAdded: 350,
    skipped: 10,
    errors: []
  }
}

Error Response:
{
  success: false,
  error: "Invalid HTML format",
  details: "Expected <DL> tag at line 5"
}
```

**GET /api/bookmarks/export**
```typescript
Response:
- Content-Type: application/json
- Content-Disposition: attachment; filename="bookmarks-2025-01-15.json"
- Body: JSON structure with folders and links
```

### Error Handling

**File Validation Errors:**
- File too large (>50MB)
- Invalid file type (not HTML)
- Empty file

**Parsing Errors:**
- Malformed HTML
- Missing required tags
- Invalid URL format
- Circular folder references

**Database Errors:**
- Transaction rollback on failure
- Foreign key violations
- Unique constraint violations

**User-Friendly Messages:**
```typescript
const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'File must be under 50MB',
  INVALID_FORMAT: 'File is not a valid bookmark export',
  CIRCULAR_REF: 'Folder structure contains circular references',
  DUPLICATE_URL: 'Some bookmarks already exist and were skipped',
  DB_ERROR: 'Failed to save bookmarks. Please try again.'
};
```

### Performance Considerations

**Large File Handling:**
- Stream large files instead of loading entirely into memory
- Process in chunks of 1000 bookmarks
- Use prepared statements for batch inserts
- Show progress updates every 100 bookmarks

**Database Optimization:**
- Single transaction for entire import (atomicity + speed)
- Prepared statements reused across inserts
- Disable foreign key checks temporarily during bulk import (re-enable after)
- Vacuum/analyze database after large imports

**Memory Management:**
- Limit concurrent imports to 1 per user
- Clean up temp files after processing
- Stream export generation for very large datasets (10,000+ bookmarks)

### Testing Strategy

**Unit Tests:**
- HTML parser with various browser exports
- JSON generator with different data sizes
- Duplicate detection logic
- Validation functions

**Integration Tests:**
- Full import pipeline
- Round-trip (export → import)
- Transaction rollback on errors
- Large dataset handling (5000+ bookmarks)

**E2E Tests:**
- Upload file via UI
- Download export file
- Verify imported data in UI
- Error message display

**Test Data:**
```
tests/fixtures/bookmarks/
  - chrome-export.html
  - firefox-export.html
  - edge-export.html
  - safari-export.html
  - large-export-5000.html
  - malformed-export.html
  - circular-refs.html
```

### Future Enhancements (Out of Scope)

- Import from other formats (JSON, CSV)
- Selective import (choose folders)
- Merge strategies (smart duplicate resolution)
- Import history and rollback
- Scheduled exports (automatic backups)
- Cloud storage integration (Dropbox, Google Drive)
