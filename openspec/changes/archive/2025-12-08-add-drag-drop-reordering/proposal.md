# Change: Add Drag-and-Drop Reordering

## Why
Users need an intuitive way to organize their folders and links by reordering them within the tree navigation and content area. Currently, the `sort_order` field exists in the database but there's no UI to change it. Manual reordering is essential for keeping bookmarks organized in a meaningful way.

## What Changes
- Add drag-and-drop functionality to tree navigation (sidebar) for both folders and links
- Support reordering items within the same parent folder
- Support moving folders into other folders (changing parent)
- Support moving links between folders (changing parent folder)
- Add drag-and-drop to link cards in the content area grid
- Update `sort_order` values in database when items are reordered
- Show visual feedback during drag operations (ghost preview)
- Persist order changes to SQLite database

## Impact
- Affected specs: `drag-drop` (new capability)
- Affected code:
  - `components/tree/TreeNode.tsx` - Add drag-and-drop handlers
  - `components/tree/FolderTree.tsx` - Add drag context provider
  - `components/links/LinkCard.tsx` - Add drag-and-drop to cards
  - `lib/db/folders.ts` - Add batch reorder function
  - `lib/db/links.ts` - Add batch reorder and move functions
  - `app/api/folders/reorder/route.ts` - New API endpoint for batch folder reorder
  - `app/api/links/reorder/route.ts` - New API endpoint for batch link reorder
  - `store/folderStore.ts` - Add reorder actions
  - `package.json` - Add `@dnd-kit/core` and `@dnd-kit/sortable` dependencies
