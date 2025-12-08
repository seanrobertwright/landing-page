## Context
This feature adds visual drag-and-drop reordering to both the tree navigation (sidebar) and link cards (content area). Users can reorder items, move links between folders, and nest folders within other folders. The implementation must handle complex scenarios like maintaining tree structure, updating multiple sort orders, and providing smooth visual feedback.

## Goals / Non-Goals
- **Goals:**
  - Enable drag-and-drop reordering for folders in tree navigation
  - Enable drag-and-drop reordering for links in tree navigation
  - Support moving folders into other folders (changing parent)
  - Support moving links between folders
  - Enable drag-and-drop reordering for link cards in content area
  - Update `sort_order` field in database to persist order
  - Show ghost preview during drag
  - Prevent invalid drops (e.g., folder into its own child)

- **Non-Goals:**
  - Multi-select drag (drag multiple items at once) - future feature
  - Drag-and-drop for creating new items - use existing create dialogs
  - Undo/redo for drag operations - future feature
  - Drag from external sources (browser bookmarks) - import feature handles this

## Decisions

### Library Choice
- **Decision:** Use `@dnd-kit/core` and `@dnd-kit/sortable`
- **Rationale:**
  - Modern, accessible, performant
  - Built for React with hooks-first API
  - Supports complex scenarios (nested lists, multiple containers)
  - Better TypeScript support than react-beautiful-dnd
  - Actively maintained (react-beautiful-dnd is deprecated)
  - Smaller bundle size
  - Works well with virtual scrolling if needed later

### Sort Order Strategy
- **Decision:** Use gap-based integer sort_order (0, 100, 200, 300...)
- **Rationale:**
  - Allows inserting between items without reordering entire list
  - When gap runs out, batch update all items in that container
  - Simple integer comparison for sorting
  - No floating point precision issues
- **Algorithm:**
  ```
  Insert between A (order=100) and B (order=200):
    - If gap > 1: Use midpoint (150)
    - If gap = 1: Batch reorder all siblings (100, 200, 300, 400...)
  ```

### Tree Navigation Drag Behavior
- **Decision:** Support both reordering and re-parenting
- **Drop Zones:**
  - **Between items**: Reorder within same parent
  - **On folder**: Move into folder (change parent)
  - **Above first item**: Move to top of parent
  - **Below last item**: Move to bottom of parent
- **Constraints:**
  - Cannot drop folder into itself or its descendants
  - Cannot drop root-level items if they would lose their parent

### Content Area Drag Behavior
- **Decision:** Support reordering within current folder and moving between folders
- **Implementation:**
  - Within same folder: Update sort_order only
  - Between folders: Update both folder_id and sort_order
  - Only links are draggable in content area (folders don't appear there)

### Visual Feedback
- **Decision:** Use ghost preview with cursor
- **Implementation:**
  - Semi-transparent clone of dragged item follows cursor
  - Drop indicator (horizontal line) shows where item will land
  - No hover highlighting on folders (drop line is sufficient)
  - Cursor changes to "not-allowed" for invalid drops

### API Design
- **Decision:** Create dedicated reorder endpoints (not PATCH)
- **Endpoints:**
  ```
  POST /api/folders/reorder
  Body: { items: [{ id, parent_id, sort_order }] }

  POST /api/links/reorder
  Body: { items: [{ id, folder_id, sort_order }] }
  ```
- **Rationale:**
  - Batch updates are atomic (all or nothing)
  - Single API call for entire reorder operation
  - Easier to validate and rollback on error
  - Clear intent (reorder vs general update)

### State Management
- **Decision:** Optimistic updates with rollback
- **Flow:**
  1. User drops item
  2. Immediately update UI (optimistic)
  3. Call API in background
  4. On success: Keep UI as-is
  5. On error: Rollback UI, show error toast, refetch tree
- **Rationale:**
  - Feels instant to users
  - Network latency doesn't block UI
  - Clear error handling

### Accessibility
- **Decision:** Keyboard shortcuts for reordering
- **Implementation:**
  - Focus item + Ctrl+Up/Down: Reorder within parent
  - Focus item + Ctrl+Left/Right: Change parent (tree only)
  - Screen reader announcements for drag start/end
- **Rationale:**
  - @dnd-kit includes keyboard support out of the box
  - Meets WCAG 2.1 guidelines
  - Power users benefit from keyboard shortcuts

## Risks / Trade-offs
- **Risk:** Drag conflicts with click/select interactions
  - **Mitigation:** Use drag threshold (must move 5px before drag starts). Click fires if threshold not met.

- **Risk:** Complex tree updates could cause race conditions
  - **Mitigation:** Use optimistic locking (version field) or timestamp-based conflict detection. For V1, simple last-write-wins is acceptable.

- **Risk:** Large lists could have performance issues
  - **Mitigation:** @dnd-kit is optimized for large lists. Virtual scrolling can be added later if needed.

- **Trade-off:** Gap-based sort_order vs continuous renumbering
  - **Chosen:** Gap-based (better performance)
  - **Alternative:** Always renumber (simpler logic, slower)

## Open Questions
None - all clarified via user input.
