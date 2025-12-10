# Design: Add Search Functionality

## Architecture Overview

### Search Flow
```
User Input → Debounce (200ms) → API Request → SQL Query → Rank Results → Return JSON → Display UI
```

### Component Structure
```
Header
  └─ SearchButton (opens dialog)
SearchDialog (modal)
  ├─ SearchInput (with debounce)
  └─ SearchResults
       ├─ ResultItem (clickable)
       │    ├─ Title (highlighted)
       │    ├─ URL (highlighted)
       │    └─ FolderPath (breadcrumb)
       └─ EmptyState / LoadingSpinner
```

## Technical Decisions

### 1. Search Implementation: SQL LIKE vs Full-Text Search

**Decision**: Use SQL `LIKE` queries with wildcards

**Rationale**:
- SQLite full-text search (FTS5) requires additional setup and table duplication
- LIKE queries are sufficient for substring matching
- With proper indexing, LIKE performs well for collections up to 1000+ items
- Simpler implementation without migration overhead

**Trade-offs**:
- **Pro**: Simple, no schema changes, works immediately
- **Pro**: Handles Unicode and special characters naturally
- **Con**: May need optimization if collections grow to 10,000+ items
- **Con**: Cannot do fuzzy matching or typo tolerance (acceptable for v1)

**Query Pattern**:
```sql
SELECT * FROM links
WHERE title LIKE '%' || ? || '%' OR url LIKE '%' || ? || '%'
ORDER BY
  CASE
    WHEN title = ? THEN 1        -- Exact match
    WHEN title LIKE ? || '%' THEN 2  -- Prefix match
    ELSE 3                        -- Substring match
  END
LIMIT 50
```

### 2. Type-Ahead Debouncing: 200ms

**Decision**: Debounce search input by 200ms

**Rationale**:
- Balances responsiveness with API call reduction
- Typical typing speed is ~50-80 WPM (120-200ms per character)
- 200ms feels instant to humans but prevents excessive queries
- Standard debounce duration for search UIs

**Implementation**:
```typescript
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    if (query.length >= 1) {
      fetchSearchResults(query);
    }
  }, 200),
  []
);
```

### 3. Keyboard Shortcut: Ctrl/Cmd+K

**Decision**: Use Ctrl+K (Windows/Linux) and Cmd+K (Mac)

**Rationale**:
- Industry standard for search (VS Code, GitHub, Slack, Linear)
- Low conflict with browser defaults (Chrome uses Ctrl+K for search bar, but we override)
- Memorable and ergonomic (K for "Keyword search")
- Single key makes it fast to invoke

**Alternative Considered**: Ctrl+F
- **Rejected**: Conflicts with browser find-in-page (important to preserve)

### 4. Result Limit: 50 Items

**Decision**: Limit search results to top 50 matches

**Rationale**:
- Prevents UI performance issues with rendering hundreds of items
- Users rarely scroll beyond first 20-30 results
- Encourages more specific search queries
- Keeps API response size small (<50KB typical)

**User Feedback**:
- Show "50+ results found" indicator when limit is reached
- Suggest refining search query for better matches

### 5. Ranking Algorithm: Exact > Prefix > Contains

**Decision**: Three-tier relevance ranking

**Ranking Tiers**:
1. **Exact match** (score 100): Query exactly equals title/URL
2. **Prefix match** (score 50): Query matches start of title/URL
3. **Contains match** (score 10): Query appears anywhere in title/URL

**Tie-Breaking**:
- Within same tier, order by `created_at DESC` (most recent first)
- Bookmarks ranked before folders (more commonly searched)

**Example**:
- Query: "git"
- Ranking:
  1. "git" (exact) - score 100
  2. "GitHub" (prefix) - score 50
  3. "My Git Repos" (contains) - score 10

### 6. Search Scope: Title + URL + Folder Names

**Decision**: Search across three fields simultaneously

**Fields Searched**:
- Bookmark titles (primary match target)
- Bookmark URLs (useful for domain/path searches)
- Folder names (enables folder discovery)

**Not Searched** (for v1):
- Bookmark descriptions (field doesn't exist yet)
- Tags (feature not implemented yet)
- Created/updated dates (not useful for text search)

### 7. Folder Breadcrumb Path Generation

**Decision**: Build breadcrumb paths by traversing parent_id chain

**Algorithm**:
```typescript
function getFolderPath(folderId: string): string[] {
  const path: string[] = [];
  let currentId = folderId;

  while (currentId) {
    const folder = getFolderById(currentId);
    if (!folder) break;
    path.unshift(folder.name);
    currentId = folder.parent_id;
  }

  return path; // ["Work", "Projects", "GitHub"]
}
```

**Display Format**: `Work > Projects > GitHub`

**Truncation** (for long paths):
- Max 3 visible levels: `Work > ... > GitHub`
- Full path shown on hover tooltip

### 8. Search Dialog vs Inline Search

**Decision**: Provide both search input in header AND full-screen dialog

**Rationale**:
- Header input: Quick access, always visible, type-ahead for simple searches
- Dialog (Ctrl/Cmd+K): Focus mode, keyboard-first, better for power users
- Both share same backend API and results logic

**Behavior**:
- Clicking header search input opens dialog for better UX
- Dialog dismissible via Escape or outside click
- Dialog traps focus for accessibility

### 9. Highlighting Matches in Results

**Decision**: Highlight matching text with `<mark>` tag and CSS styling

**Implementation**:
```typescript
function highlightMatches(text: string, query: string): string {
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}
```

**Styling**:
- Background: Yellow (#fef08a) for visibility
- Font weight: Bold to emphasize match
- Preserve original text casing

### 10. Performance Targets

**Target Response Times**:
- < 50ms for collections under 100 items
- < 150ms for collections of 500 items
- < 200ms for collections of 1000 items

**Optimization Strategies** (if needed):
1. Add database indexes on searched columns
2. Cache recent search queries (client-side)
3. Implement result pagination (show first 20, load more on scroll)
4. Consider FTS5 migration for collections over 5000 items

**Monitoring**:
- Log slow queries (>200ms) to identify performance issues
- Add performance tests to catch regressions

## Database Schema

**No schema changes required** - uses existing tables:

```sql
-- Existing tables (no modifications)
CREATE TABLE folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,           -- Searched
  parent_id TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
);

CREATE TABLE links (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,          -- Searched
  url TEXT NOT NULL,             -- Searched
  favicon_url TEXT,
  folder_id TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
);
```

**Indexes** (verify existence or create):
```sql
CREATE INDEX IF NOT EXISTS idx_links_title ON links(title);
CREATE INDEX IF NOT EXISTS idx_links_url ON links(url);
CREATE INDEX IF NOT EXISTS idx_folders_name ON folders(name);
```

## API Contract

### GET /api/search

**Request**:
```
GET /api/search?q=github
```

**Query Parameters**:
- `q` (required): Search query string (min 1 character, max 100 characters)

**Response** (200 OK):
```json
{
  "results": [
    {
      "type": "link",
      "id": "uuid-1",
      "title": "GitHub",
      "url": "https://github.com",
      "folder_id": "uuid-folder",
      "folder_path": ["Work", "Coding", "Repositories"],
      "score": 100
    },
    {
      "type": "folder",
      "id": "uuid-folder-2",
      "name": "GitHub Projects",
      "parent_id": "uuid-parent",
      "folder_path": ["Work", "Projects"],
      "score": 50
    }
  ],
  "total": 2,
  "limited": false
}
```

**Response** (400 Bad Request):
```json
{
  "error": "Query parameter 'q' is required"
}
```

**Response** (500 Internal Server Error):
```json
{
  "error": "Search query failed"
}
```

## UI Components

### SearchDialog

**Props**:
```typescript
interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**State**:
- `query: string` - Current search query
- `results: SearchResult[]` - Search results from API
- `isLoading: boolean` - Loading state
- `selectedIndex: number` - Keyboard navigation index

**Keyboard Handlers**:
- `ArrowDown`: Increment selectedIndex (wrap at end)
- `ArrowUp`: Decrement selectedIndex (wrap at start)
- `Enter`: Navigate to selected result, close dialog
- `Escape`: Close dialog

### SearchResults

**Props**:
```typescript
interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  selectedIndex: number;
  onSelect: (result: SearchResult) => void;
}
```

**Rendering**:
- Each result shows title/name with highlighted match
- Shows URL for bookmarks (truncated if >50 chars)
- Shows folder breadcrumb path below title
- Selected result has distinct background color

## Error Handling

### Client-Side Errors
- Empty query: Show placeholder, don't call API
- Whitespace-only query: Trim and treat as empty
- API error: Show toast notification, fallback to empty results

### Server-Side Errors
- SQL query error: Log error, return 500 status
- Invalid input: Return 400 status with error message
- Timeout (>5s): Cancel query, return 500 status

## Accessibility

### ARIA Labels
- Search input: `aria-label="Search bookmarks"`
- Search dialog: `role="dialog"` with `aria-modal="true"`
- Results list: `role="listbox"` with `aria-activedescendant`
- Result items: `role="option"` with `aria-selected`

### Keyboard Navigation
- Tab order: Input → Results (arrow navigation) → Close button
- Focus trap: Tab cycles within dialog, doesn't escape
- Screen reader: Announce result count on search completion

### Color Contrast
- Highlight color (#fef08a) has 4.5:1 contrast ratio
- Selected result background has sufficient contrast
- All text meets WCAG AA standards

## Future Enhancements (Out of Scope)

### Phase 2 Features
- Search history (store last 10 searches)
- Recent searches dropdown (show on dialog open)
- Advanced operators (AND, OR, NOT)
- Search within specific folder (scope filter)
- Date range filtering (created/updated in last week)

### Phase 3 Features
- Fuzzy matching for typo tolerance
- Tag-based search (requires tags feature first)
- Search result thumbnails (favicon + screenshot)
- Search analytics (most searched terms)
- Saved searches / search shortcuts

### Performance Optimizations
- Result caching (client-side, 5-minute TTL)
- Query suggestion (autocomplete based on history)
- Migrate to FTS5 for very large collections (10,000+ items)
- Elasticsearch integration for advanced features
