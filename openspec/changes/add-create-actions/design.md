# Design: Add Create Actions for Folders and Links

## Context
The folder tree navigation system is currently read-only. Users can view the default "Bookmarks" folder and any nested structure, but cannot create new folders or add links. This change adds the minimum viable UI for creating folders and links.

## Goals / Non-Goals
- **Goals:**
  - Enable users to create new folders (at root or as children of existing folders)
  - Enable users to add new links to the currently selected folder
  - Provide simple, intuitive modal dialogs for input
  - Validate inputs before submission
  - Auto-refresh the UI after successful creation
  - Match the existing dark theme with neon accents

- **Non-Goals:**
  - Context menus (planned for future iteration)
  - Inline editing in the tree (too complex for first iteration)
  - Drag-and-drop creation (future feature)
  - Edit or delete actions (separate future change)

## Decisions

### UI Placement
- **Decision:** Add "New Folder" button to sidebar header, "New Link" button to content area header
- **Alternatives considered:**
  - Floating action button (FAB) - Common in mobile but less discoverable in desktop apps
  - Context menus only - More discoverable but deferred to future iteration
  - Toolbar buttons in app header - Less contextual, harder to understand what they apply to
- **Rationale:**
  - Sidebar button creates folders → obvious placement near the folder tree
  - Content area button creates links in selected folder → clear context
  - Always visible, no hidden functionality
  - Simple implementation, no complex state management

### Dialog Components
- **Decision:** Use shadcn/ui Dialog, Button, Input, and Label components
- **Rationale:**
  - Already using shadcn/ui ecosystem (specified in project.md)
  - Accessible by default (ARIA, keyboard nav, focus trapping)
  - Customizable with Tailwind to match dark theme
  - Standard pattern the team is familiar with

### Folder Creation Flow
- **Decision:** Single dialog with two fields:
  1. Folder name (required, 1-255 chars)
  2. Parent folder (optional dropdown, defaults to root)
- **Alternatives considered:**
  - Two-step wizard (name first, then parent) - Overcomplicated for 2 fields
  - Always create at root, move later - Extra step, poor UX
  - Create as child of selected folder only - Limits flexibility
- **Rationale:**
  - All information on one screen
  - Parent dropdown shows full folder hierarchy (like Windows Explorer "New Folder" dialog)
  - Flexible: can create at root or nest under any folder in one action

### Parent Folder Selection
- **Decision:** Dropdown (HTML `<select>`) showing folder hierarchy with indentation
- **Implementation:** Flatten tree with depth indicators like:
  ```
  (Root)
  ├─ Bookmarks
  ├─ Development
  │  ├─ Frontend
  │  └─ Backend
  └─ Design
  ```
- **Alternatives considered:**
  - Tree picker component - Too complex, requires new component
  - Text input with autocomplete - Harder to discover available folders
  - Radio buttons - Takes too much space for many folders
- **Rationale:**
  - Native HTML select is simple, accessible, works everywhere
  - Indentation (via Unicode or repeated chars) shows hierarchy clearly
  - No additional dependencies

### Link Creation Flow
- **Decision:** Dialog with three fields:
  1. Link title (required, 1-255 chars)
  2. URL (required, must be valid URL)
  3. Folder (read-only, shows currently selected folder)
- **Rationale:**
  - Context is clear: "Add link to [Current Folder]"
  - No need for folder selection since user just clicked from that folder's view
  - If user wants different folder, they select it first, then click "New Link"
  - Simpler flow than folder creation

### Favicon Handling
- **Decision:** Auto-fetch favicon from URL after link creation
- **Implementation:**
  - Use existing `getFaviconUrl` logic from LinkCard.tsx
  - Fetch `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
  - Store as `favicon_url` in database (already supported by schema)
  - Graceful degradation if fetch fails (default icon)
- **Rationale:**
  - Consistent with existing LinkCard behavior
  - No user input needed for favicon
  - Works offline (fails gracefully with default icon)

### State Management
- **Decision:** Add `createFolder` and `createLink` actions to folderStore
- **Implementation:**
  ```typescript
  createFolder: async (name: string, parentId?: string) => {
    const response = await fetch('/api/folders', {
      method: 'POST',
      body: JSON.stringify({ name, parent_id: parentId }),
    });
    if (response.ok) {
      await get().fetchTree(); // Refresh tree
    }
  }

  createLink: async (title: string, url: string, folderId: string) => {
    const faviconUrl = getFaviconUrl(url);
    const response = await fetch('/api/links', {
      method: 'POST',
      body: JSON.stringify({ title, url, folder_id: folderId, favicon_url: faviconUrl }),
    });
    if (response.ok) {
      // Trigger re-fetch of links for selected folder in page component
    }
  }
  ```
- **Rationale:**
  - Keeps API logic centralized in store
  - Components just call actions, don't worry about fetch details
  - Tree refresh happens automatically via fetchTree

### Form Validation
- **Decision:** Client-side validation with Zod schemas (reuse existing validations)
- **Fields:**
  - Folder name: 1-255 chars, required
  - Link title: 1-255 chars, required
  - Link URL: Valid URL format, required
- **Error Display:** Show error message below field in red text
- **Rationale:**
  - Immediate feedback, no server round-trip for validation errors
  - Reuses existing Zod schemas from lib/validations
  - Server still validates (defense in depth)

### Success Feedback
- **Decision:** Close dialog immediately, show created item in UI
- **Alternatives considered:**
  - Toast notification "Folder created!" - Adds dependency, maybe overkill
  - Keep dialog open with success message - Slower workflow
  - Highlight new item in tree - Complex implementation
- **Rationale:**
  - Seeing the new item appear is feedback enough
  - Fast workflow: create, close, create another
  - Can add toast later if users want more obvious confirmation

### Error Handling
- **Decision:** Display error message in dialog, keep dialog open
- **Cases:**
  - Network error: "Failed to create folder. Please try again."
  - Validation error: Show specific field errors
  - Server error: "An error occurred. Please try again."
- **Rationale:**
  - User keeps their input, can fix and retry
  - Clear error messages help debug issues
  - Don't close dialog on error (frustrating UX)

## Risks / Trade-offs
- **Risk:** Dropdown with many folders could be hard to navigate
  - **Mitigation:** Add search/filter to dropdown in future if needed. For MVP, assume reasonable folder counts (<100).

- **Risk:** No confirmation of success besides seeing the item
  - **Mitigation:** Could add toast notifications later. Visual appearance is usually sufficient.

- **Trade-off:** Separate buttons for folder/link creation vs unified "+" button
  - **Pro (separate):** Clear what each button does, no submenu needed
  - **Con (separate):** Two buttons take more space
  - **Decision:** Separate buttons for clarity. Space is not constrained.

## Open Questions
None - scope is clear and straightforward.
