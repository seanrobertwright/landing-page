# Proposal: Add Search Functionality

## Change ID
`add-search-functionality`

## Why
Users currently have no way to quickly find specific bookmarks or folders within their collection. As bookmark collections grow beyond 50-100 items, manually browsing through nested folders becomes time-consuming and frustrating. Without search, users must remember the exact folder structure to locate bookmarks, making the application inefficient for managing large collections.

## Summary
Add a global search feature with type-ahead (autocomplete) functionality that searches across bookmark titles, URLs, and folder names, accessible via keyboard shortcut (Ctrl/Cmd+K) from anywhere in the application.

## What Changes

### New API Endpoint
- **GET /api/search**: Accepts query parameter `q` and returns matching bookmarks and folders with relevance scoring

### New Components
- **SearchBar**: Input field in header with type-ahead suggestions
- **SearchDialog**: Full-screen modal search interface with keyboard navigation (Ctrl/Cmd+K)
- **SearchResults**: Results display with highlighting and folder context

### New Utilities
- **Search Query Builder** (`lib/search/query.ts`): Constructs efficient SQL search queries with LIKE patterns
- **Result Ranking** (`lib/search/ranking.ts`): Scores and ranks results by relevance (exact match > title match > URL match)
- **Highlight Helper** (`lib/search/highlight.ts`): Highlights matching text in results

### Database Changes
- No schema changes required (uses existing tables)
- Adds indexed search queries for performance

### User Experience Changes
- Search input visible in header with placeholder "Search bookmarks..."
- Keyboard shortcut Ctrl/Cmd+K opens full search dialog from anywhere
- Type-ahead shows top 5 results as user types
- Results show folder breadcrumb path for context
- Click result navigates to folder and highlights bookmark

## Motivation

Currently:
- Users must manually browse folder tree to find bookmarks
- No way to search by partial URL or title
- Large collections (>100 bookmarks) become difficult to manage
- Users forget which folder contains specific bookmarks
- Common task of "find that GitHub repo I saved" requires manual exploration

This change will:
- Enable instant bookmark discovery with type-ahead feedback (<200ms response)
- Support search across titles, URLs, and folder names
- Provide keyboard-first workflow for power users (Ctrl/Cmd+K)
- Show folder context in results (breadcrumb path)
- Reduce time to find bookmarks from minutes to seconds

## Goals
- Implement full-text search across bookmark titles, URLs, and folder names
- Provide type-ahead suggestions with <200ms latency for responsive UX
- Support keyboard navigation (arrows, Enter, Escape) for accessibility
- Show search results with folder path context (e.g., "Work > Projects > GitHub")
- Highlight matching text in results for visual clarity
- Keyboard shortcut (Ctrl/Cmd+K) accessible from any view
- Handle special characters and Unicode in search queries
- Rank results by relevance (exact > prefix > contains)

## Non-Goals
- Advanced search operators (AND, OR, NOT) - can be added later if needed
- Search within bookmark descriptions/notes - no description field exists yet
- Search history or saved searches - simple search only for now
- Tag-based filtering - tags feature doesn't exist yet
- Fuzzy matching or spell correction - exact substring matching is sufficient
- Search result pagination - limit to top 50 results initially

## Affected Components
- **Header Component**: Add search input with type-ahead dropdown
- **Search API Route**: New `/api/search` endpoint for query execution
- **Search Dialog**: New modal component for full-screen search experience
- **Database Queries**: New search functions in `lib/db/search.ts`
- **Keyboard Shortcuts**: Add Ctrl/Cmd+K handler to open search dialog

## User Impact
**Positive**:
- Dramatically faster bookmark discovery (seconds vs minutes)
- Reduced cognitive load (no need to remember folder structure)
- Power-user workflow with keyboard shortcuts
- Improved usability for large bookmark collections (100+ items)

**Neutral**:
- New keyboard shortcut to learn (Ctrl/Cmd+K)
- Search input visible in header (minimal space usage)

**Negative**:
- None - this is a pure feature addition with no breaking changes

## Implementation Approach

1. **Phase 1: Search API Foundation**
   - Create `lib/db/search.ts` with SQL-based search functions
   - Add result ranking logic (exact > prefix > contains)
   - Implement `GET /api/search?q={query}` endpoint
   - Unit tests for search query building and ranking

2. **Phase 2: Search UI Components**
   - Add search input to Header component with type-ahead
   - Create SearchDialog modal with keyboard navigation
   - Add SearchResults component with highlighting
   - Show folder breadcrumb path in results

3. **Phase 3: Keyboard Integration**
   - Add Ctrl/Cmd+K shortcut to open search dialog
   - Implement arrow key navigation in results
   - Add Enter to select, Escape to close
   - Focus management for accessibility

4. **Phase 4: Performance & Polish**
   - Add debouncing to search input (200ms delay)
   - Optimize SQL queries with proper indexing
   - Add loading states for slow searches
   - Handle empty states and no results gracefully

## Testing Strategy
- **Unit Tests**:
  - Search query builder with various input patterns
  - Result ranking algorithm with test fixtures
  - Highlight helper with special characters
  - Debounce logic for type-ahead

- **Integration Tests**:
  - Search API endpoint with various query types
  - Full-text search across titles, URLs, folders
  - Result ordering by relevance
  - Special character and Unicode handling

- **E2E Tests**:
  - Open search dialog with Ctrl/Cmd+K
  - Type-ahead suggestions appear while typing
  - Navigate results with arrow keys
  - Select result and verify navigation to folder
  - Search with empty query shows no results

- **Manual Testing**:
  - Test with 100+ bookmarks for performance
  - Verify keyboard navigation feels natural
  - Check visual highlighting of matches
  - Test on different screen sizes (responsive)

## Risks and Mitigations

**Risk**: Search performance degrades with 1000+ bookmarks
**Mitigation**: Use indexed SQL queries with LIKE optimization, limit results to top 50, measure query time in tests (must be <200ms)

**Risk**: Type-ahead feels sluggish or overwhelming
**Mitigation**: Debounce input by 200ms, show only top 5 suggestions, add loading indicator for clarity

**Risk**: Special characters in search break queries
**Mitigation**: Sanitize input to escape SQL special characters, test with Unicode and special character fixtures

**Risk**: Keyboard shortcuts conflict with browser defaults
**Mitigation**: Use Ctrl/Cmd+K (common search pattern, low conflict), provide visible shortcut hints in UI

**Risk**: Search results don't match user expectations
**Mitigation**: Rank by relevance (exact > prefix > contains), show folder context, highlight matching text

## Dependencies
- No external libraries required
- Uses existing better-sqlite3 for database queries
- Uses existing shadcn/ui components (Dialog, Input)
- Uses existing Lucide icons (Search icon)

## Success Criteria
- [ ] Can search bookmarks by title with type-ahead suggestions
- [ ] Can search bookmarks by URL (partial match)
- [ ] Can search folders by name
- [ ] Results appear within 200ms for collections of 500+ bookmarks
- [ ] Keyboard shortcut Ctrl/Cmd+K opens search from any view
- [ ] Arrow keys navigate results, Enter selects, Escape closes
- [ ] Results show folder breadcrumb path (e.g., "Work > GitHub")
- [ ] Matching text is visually highlighted in results
- [ ] Handles special characters and Unicode correctly
- [ ] All tests pass (100%)
- [ ] Build succeeds with zero errors
