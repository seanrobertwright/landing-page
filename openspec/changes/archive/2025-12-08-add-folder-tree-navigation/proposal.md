# Change: Add Folder Tree Navigation with SQLite Persistence

## Why
The sidebar currently displays placeholder folders with no functionality. Users need a Windows Explorer-style tree navigation to organize links into folders and subfolders, with data persisted to SQLite so it survives page refreshes.

## What Changes
- Add SQLite database with better-sqlite3 for data persistence
- Create database schema for folders and links with parent-child relationships
- Build FolderTree component with expandable/collapsible folders
- Display links within folders in the tree (like files in Windows Explorer)
- Show selected folder's links in the content area
- Support unlimited nesting depth for folders
- Add API routes for CRUD operations on folders and links

## Impact
- Affected specs: `folder-tree` (new capability)
- Affected code:
  - `lib/db/` - SQLite database setup and queries
  - `lib/db/schema.ts` - Database schema definitions
  - `lib/db/folders.ts` - Folder CRUD operations
  - `lib/db/links.ts` - Link CRUD operations
  - `app/api/folders/` - Folder API routes
  - `app/api/links/` - Link API routes
  - `components/tree/FolderTree.tsx` - Tree navigation component
  - `components/tree/TreeNode.tsx` - Individual tree node (folder or link)
  - `store/folderStore.ts` - Zustand store for tree state
  - `app/page.tsx` - Integrate FolderTree, remove placeholder content
