# Design: Add Context Menus

## Architecture Overview

### Component Structure
```
ContextMenuProvider (from @radix-ui/react-context-menu)
├── FolderContextMenu (wraps TreeNode for folders)
│   ├── Create Subfolder
│   ├── Rename Folder
│   └── Delete Folder
├── LinkContextMenu (wraps LinkCard)
│   ├── Edit Link
│   ├── Open in New Tab
│   └── Delete Link
└── ContentAreaContextMenu (wraps empty space in ContentArea)
    └── Create New Link
```

### Context Menu Placement

**Folder Tree (TreeNode)**:
- Right-click on folder name → Show folder menu
- Actions:
  - "New Subfolder" → Opens CreateFolderDialog with parent_id pre-filled
  - "Rename" → Future enhancement (edit inline or dialog)
  - "Delete Folder" → Confirmation, then delete

**Content Area (Empty Space)**:
- Right-click on empty space (not on a link card) → Show content area menu
- Actions:
  - "New Link" → Opens CreateLinkDialog with current folder pre-selected

**Link Cards**:
- Right-click on link card → Show link menu
- Actions:
  - "Open in New Tab" → Opens link URL
  - "Edit" → Opens edit dialog (future enhancement)
  - "Delete Link" → Confirmation, then delete

### Technical Decisions

**Library**: Radix UI Context Menu (via shadcn/ui)
- Battle-tested, accessible
- Follows WAI-ARIA patterns
- Works with existing shadcn/ui design system
- Supports keyboard navigation

**Event Handling**:
- Use `onContextMenu` event handler
- Call `event.preventDefault()` to suppress browser context menu
- Ensure drag-and-drop events take priority (PointerSensor activation constraint already configured)

**State Management**:
- Context menus are uncontrolled components (Radix handles open/close state)
- Actions trigger existing state management patterns (folderStore, API calls)
- No new global state required

**Dialog Integration**:
- Context menu actions can open existing dialogs (CreateFolderDialog, CreateLinkDialog)
- Pass context (parent folder ID, selected folder) to dialogs
- Reuse existing validation and API logic

### Component API Design

**FolderContextMenu**:
```tsx
<FolderContextMenu
  folderId={folder.id}
  folderName={folder.name}
  onCreateSubfolder={() => openDialogWithParent(folder.id)}
  onDelete={() => deleteFolder(folder.id)}
>
  {children}
</FolderContextMenu>
```

**LinkContextMenu**:
```tsx
<LinkContextMenu
  linkId={link.id}
  linkUrl={link.url}
  onDelete={() => deleteLink(link.id)}
>
  {children}
</LinkContextMenu>
```

**ContentAreaContextMenu**:
```tsx
<ContentAreaContextMenu
  folderId={selectedFolderId}
  onCreateLink={() => openCreateLinkDialog()}
>
  {children}
</ContentAreaContextMenu>
```

### User Experience Flow

**Creating a Subfolder**:
1. User right-clicks on a folder in the tree
2. Context menu appears with "New Subfolder" option
3. User clicks "New Subfolder"
4. CreateFolderDialog opens with "Parent Folder" pre-selected
5. User enters folder name and submits
6. New subfolder appears under the parent

**Creating a Link**:
1. User right-clicks on empty space in content area
2. Context menu appears with "New Link" option
3. User clicks "New Link"
4. CreateLinkDialog opens with current folder pre-selected
5. User enters link details and submits
6. New link card appears in the content area

**Deleting a Folder**:
1. User right-clicks on a folder
2. Context menu appears with "Delete Folder" option (styled in danger color)
3. User clicks "Delete Folder"
4. Confirmation dialog appears (use existing dialog patterns)
5. User confirms
6. Folder and all contents are deleted
7. Tree updates to reflect deletion

### Accessibility Considerations

- Context menus are keyboard accessible (Shift+F10 or context menu key)
- Use proper ARIA roles and labels
- Menu items have focus states
- Escape closes the menu
- Arrow keys navigate menu items
- Enter activates selected item

### Style Guidelines

- Use existing Tailwind design tokens
- Menu background: `bg-popover`
- Menu border: `border-border`
- Menu items: `hover:bg-accent hover:text-accent-foreground`
- Danger actions (delete): `text-destructive hover:bg-destructive/10`
- Consistent padding and spacing with existing dialogs

### Error Handling

- API failures show toast notifications (via sonner)
- Failed delete operations don't remove items from UI
- Network errors gracefully degrade (action fails, user can retry)
- Validation errors in dialogs (reuse existing validation)

### Testing Strategy

**Unit Tests**:
- Test context menu rendering
- Test action callbacks fire correctly
- Test menu items are conditionally shown based on context

**Integration Tests**:
- Test context menu integrates with existing dialogs
- Test delete operations update state correctly

**E2E Tests**:
- Test right-click creates folder via context menu
- Test right-click creates link via context menu
- Test right-click deletes folder with confirmation
- Test context menu doesn't interfere with drag-and-drop

### Future Enhancements (Out of Scope)

- Rename folder/link inline
- Duplicate link
- Move to folder (submenu showing folder tree)
- Copy link URL to clipboard
- Keyboard shortcuts (Ctrl+Click, etc.)
- Custom menu items via plugins
