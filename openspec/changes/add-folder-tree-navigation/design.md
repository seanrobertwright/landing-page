## Context
This feature introduces the core data model and navigation for the link organizer. It requires SQLite for persistence and a hierarchical tree UI component. The design must support unlimited folder nesting while keeping queries efficient.

## Goals / Non-Goals
- **Goals:**
  - Persist folders and links to SQLite database
  - Display hierarchical folder tree in sidebar
  - Show links as leaf nodes within folders (Windows Explorer style)
  - Support expand/collapse for folders
  - Select folder to display its links in content area
  - Efficient queries for tree operations

- **Non-Goals:**
  - Drag-and-drop reordering (future feature)
  - Context menu for create/delete (future feature)
  - Search functionality (future feature)
  - Import/export (future feature)

## Decisions

### Database Choice
- **Decision:** Use better-sqlite3 (synchronous SQLite driver)
- **Rationale:** Recommended in project.md. Synchronous API simplifies code in API routes. Single file database for easy backup.

### Database Schema
- **Decision:** Adjacency list model with `parent_id` foreign key
```sql
CREATE TABLE folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
);

CREATE TABLE links (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  favicon_url TEXT,
  folder_id TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
);

CREATE INDEX idx_folders_parent ON folders(parent_id);
CREATE INDEX idx_links_folder ON links(folder_id);
```
- **Alternatives considered:**
  - Nested set model - Complex updates, overkill for this use case
  - Materialized path - Good for reads but complex for moves
- **Rationale:** Adjacency list is simple, well-understood, and sufficient for reasonable nesting depths. Recursive CTEs can fetch subtrees if needed.

### ID Generation
- **Decision:** Use `crypto.randomUUID()` for IDs
- **Rationale:** No external dependencies, built into Node.js, globally unique.

### Root Folder
- **Decision:** Use `NULL` parent_id to represent root-level items. No explicit "root" folder row.
- **Rationale:** Simpler schema. Query `WHERE parent_id IS NULL` to get top-level items.

### API Structure
- **Decision:** Use Next.js Route Handlers in `app/api/`
```
app/api/
  folders/
    route.ts          # GET (list), POST (create)
    [id]/
      route.ts        # GET, PATCH, DELETE
  links/
    route.ts          # GET (list), POST (create)
    [id]/
      route.ts        # GET, PATCH, DELETE
  tree/
    route.ts          # GET full tree structure
```
- **Rationale:** RESTful design. Separate `/tree` endpoint returns pre-built hierarchy for efficient initial load.

### Tree Data Structure
- **Decision:** API returns nested tree structure for rendering:
```typescript
interface TreeNode {
  id: string;
  type: 'folder' | 'link';
  name: string;
  url?: string;           // only for links
  children?: TreeNode[];  // only for folders
  isExpanded?: boolean;   // UI state, not persisted
}
```
- **Rationale:** Single API call to fetch entire tree. Client manages expand/collapse state in Zustand.

### State Management
- **Decision:** Create `folderStore.ts` with Zustand:
```typescript
interface FolderState {
  tree: TreeNode[];
  selectedFolderId: string | null;
  expandedFolderIds: Set<string>;
  toggleFolder: (id: string) => void;
  selectFolder: (id: string) => void;
  fetchTree: () => Promise<void>;
}
```
- **Rationale:** Zustand already in use for UI state. Keep tree data and UI state together.

### Tree Component Architecture
```
FolderTree
├── TreeNode (recursive)
│   ├── FolderIcon / LinkIcon
│   ├── ChevronIcon (folders only)
│   ├── Name label
│   └── TreeNode[] (children, if expanded)
```
- **Decision:** Single recursive `TreeNode` component handles both folders and links
- **Rationale:** Simpler than separate components. Type discriminated by `node.type`.

### Content Area Behavior
- **Decision:** When a folder is selected, ContentArea shows LinkCards for that folder's direct links only (not recursive)
- **Rationale:** Matches Windows Explorer behavior. Shows what's "in" the folder.

### Initial State
- **Decision:** Create a default "Bookmarks" folder on first run if database is empty
- **Rationale:** User has somewhere to add links immediately. Avoids empty state confusion.

## Risks / Trade-offs
- **Risk:** better-sqlite3 requires native compilation
  - **Mitigation:** Document in README. Works fine in Docker with standard Node image.
- **Risk:** Large trees could cause performance issues
  - **Mitigation:** Virtual scrolling can be added later if needed. For now, assume reasonable tree sizes (<1000 nodes).

## Open Questions
- None - scope is clear
