# drag-drop Specification

## Purpose
TBD - created by archiving change add-drag-drop-reordering. Update Purpose after archive.
## Requirements
### Requirement: The tree navigation SHALL support drag-and-drop reordering of folders
The tree navigation SHALL allow users to drag folders to reorder them within the same parent or move them into other folders, updating their sort_order and parent_id accordingly.

#### Scenario: Reorder folder within same parent
- **WHEN** a user drags a folder and drops it between two sibling folders
- **THEN** the folder's sort_order is updated to place it at the new position
- **AND** the folder's parent_id remains unchanged
- **AND** the tree re-renders with the new order

#### Scenario: Move folder into another folder
- **WHEN** a user drags a folder and drops it onto another folder
- **THEN** the folder's parent_id is updated to the target folder's id
- **AND** the folder's sort_order is set to appear last in the new parent
- **AND** the folder and its children appear nested under the new parent

#### Scenario: Prevent dropping folder into itself
- **WHEN** a user attempts to drag a folder and drop it into itself or one of its descendants
- **THEN** the drop is prevented
- **AND** the cursor shows a "not-allowed" indicator
- **AND** no changes are made to the database

---

### Requirement: The tree navigation SHALL support drag-and-drop reordering of links
The tree navigation SHALL allow users to drag links to reorder them within the same folder or move them to different folders, updating their sort_order and folder_id accordingly.

#### Scenario: Reorder link within same folder
- **WHEN** a user drags a link within the tree and drops it between two sibling links
- **THEN** the link's sort_order is updated to place it at the new position
- **AND** the link's folder_id remains unchanged
- **AND** the tree re-renders with the new order

#### Scenario: Move link to different folder via tree
- **WHEN** a user drags a link in the tree and drops it onto a folder
- **THEN** the link's folder_id is updated to the target folder
- **AND** the link's sort_order is set to appear last in the new folder
- **AND** the link appears under the new folder in the tree

---

### Requirement: The content area SHALL support drag-and-drop reordering of link cards
The content area SHALL allow users to drag link cards to reorder them within the currently displayed folder, updating their sort_order in the database.

#### Scenario: Reorder link cards within current folder
- **WHEN** a user drags a link card and drops it between two other link cards in the grid
- **THEN** the link's sort_order is updated to place it at the new position
- **AND** the grid re-renders with the new order
- **AND** the link remains in the same folder

#### Scenario: Visual grid layout adapts to drag position
- **WHEN** a user drags a link card across the grid
- **THEN** other cards shift to show where the dragged card will land
- **AND** a visual indicator appears at the drop position

---

### Requirement: The application SHALL persist drag-and-drop order changes to the database
The application SHALL save all drag-and-drop reordering operations to the SQLite database, ensuring changes persist across page refreshes and sessions.

#### Scenario: Single item reorder persists
- **WHEN** a user completes a drag-and-drop operation
- **THEN** the item's sort_order is updated in SQLite
- **AND** the change persists after page refresh

#### Scenario: Batch reorder when gaps are exhausted
- **WHEN** a drag operation would create a sort_order conflict (no gap available)
- **THEN** all siblings in the same parent are renumbered with even spacing
- **AND** the new order is persisted atomically

#### Scenario: Failed reorder rolls back UI
- **WHEN** a drag-and-drop operation fails due to network or database error
- **THEN** the UI is reverted to the pre-drag state
- **AND** an error message is displayed to the user
- **AND** the tree is refetched from the server

---

### Requirement: The application SHALL provide visual feedback during drag operations
The application SHALL display clear visual indicators during drag operations, including a ghost preview and drop position markers, to help users understand where items will be placed.

#### Scenario: Ghost preview follows cursor
- **WHEN** a user starts dragging an item
- **THEN** a semi-transparent ghost preview of the item follows the cursor
- **AND** the original item remains in place with reduced opacity

#### Scenario: Drop indicator shows target position
- **WHEN** a user drags an item over a valid drop zone
- **THEN** a horizontal line indicator appears at the insertion point
- **AND** the indicator color matches the theme (cyan accent)

#### Scenario: Cursor indicates invalid drop
- **WHEN** a user drags an item over an invalid drop location
- **THEN** the cursor changes to "not-allowed"
- **AND** no drop indicator is shown

---

### Requirement: The application SHALL support keyboard-based reordering for accessibility
The application SHALL provide keyboard shortcuts for reordering items, ensuring users who cannot use a mouse can still organize their bookmarks effectively.

#### Scenario: Keyboard reorder within parent
- **WHEN** a user focuses an item and presses Ctrl+Up or Ctrl+Down
- **THEN** the item moves up or down one position within its parent
- **AND** the sort_order is updated in the database
- **AND** focus remains on the moved item

#### Scenario: Keyboard move to different parent
- **WHEN** a user focuses a folder in the tree and presses Ctrl+Right
- **THEN** the folder moves into the next sibling folder as the last child
- **AND** when the user presses Ctrl+Left on a nested item
- **THEN** the item moves out to its grandparent folder

#### Scenario: Screen reader announces drag state
- **WHEN** a drag operation starts
- **THEN** a screen reader announces "Dragging [item name]"
- **AND** when the drag completes
- **THEN** the screen reader announces "Moved [item name] to [new location]"

---

### Requirement: The application SHALL provide REST API endpoints for reordering operations
The application SHALL expose REST API endpoints for batch reordering of folders and links, allowing atomic updates of multiple items' positions.

#### Scenario: Batch folder reorder endpoint
- **WHEN** POST /api/folders/reorder is called with an array of folder updates
- **THEN** all folder positions are updated atomically
- **AND** the response includes the updated folders
- **AND** if any update fails, all changes are rolled back

#### Scenario: Batch link reorder endpoint
- **WHEN** POST /api/links/reorder is called with an array of link updates
- **THEN** all link positions are updated atomically
- **AND** the response includes the updated links
- **AND** if any update fails, all changes are rolled back

---

### Requirement: Drag operations SHALL use optimistic updates for responsive UI
Drag operations SHALL update the UI immediately upon drop, before the API call completes, to provide a responsive user experience while persisting changes in the background.

#### Scenario: UI updates immediately on drop
- **WHEN** a user completes a drag-and-drop operation
- **THEN** the UI updates immediately before the API call completes
- **AND** the user can continue interacting with the interface
- **AND** a loading indicator is NOT shown during the background API call

#### Scenario: Successful API call confirms optimistic update
- **WHEN** the reorder API call succeeds
- **THEN** the UI remains in its updated state
- **AND** no additional UI changes occur

#### Scenario: Failed API call reverts optimistic update
- **WHEN** the reorder API call fails
- **THEN** the UI reverts to the pre-drag state
- **AND** an error toast notification appears
- **AND** the tree data is refetched from the server

