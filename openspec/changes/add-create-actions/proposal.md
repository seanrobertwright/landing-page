# Change: Add Create Actions for Folders and Links

## Why
Currently, users can only view the default "Bookmarks" folder created on first run. There's no way to create new folders or add links, making the application view-only. Users need the ability to create and organize their own folder structure and add links to folders.

## What Changes
- Add "New Folder" button in sidebar header to create folders at root level or as children
- Add "New Link" button in content area header to add links to the currently selected folder
- Create modal dialogs for folder and link creation with form validation
- Integrate with existing API routes (POST /api/folders and POST /api/links)
- Refresh tree and content area after successful creation
- Add shadcn/ui Dialog and Button components for the UI

## Impact
- Affected specs: `folder-management` (new), `link-management` (new)
- Affected code:
  - `components/ui/button.tsx` - shadcn Button component (new)
  - `components/ui/dialog.tsx` - shadcn Dialog component (new)
  - `components/ui/input.tsx` - shadcn Input component (new)
  - `components/ui/label.tsx` - shadcn Label component (new)
  - `components/dialogs/CreateFolderDialog.tsx` - Modal for creating folders (new)
  - `components/dialogs/CreateLinkDialog.tsx` - Modal for creating links (new)
  - `components/layout/Sidebar.tsx` - Add "New Folder" button
  - `components/layout/ContentArea.tsx` - Add "New Link" button in header
  - `store/folderStore.ts` - Add createFolder and createLink actions
  - `app/page.tsx` - Wire up dialog state and refresh logic

## Non-Goals
- Right-click context menus (future feature)
- Drag-and-drop folder/link creation (future feature)
- Bulk import (future feature)
- Edit or delete functionality (future feature)
