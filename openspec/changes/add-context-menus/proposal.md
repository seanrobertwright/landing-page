# Proposal: Add Context Menus

## Change ID
`add-context-menus`

## Why
Users currently must click dedicated "New Folder" and "New Link" buttons to create items, which requires precise mouse targeting and multiple clicks. Context menus provide a faster, more intuitive workflow familiar from file managers and browsers. Power users expect right-click menus for common operations like creating, opening, and deleting items. This enhancement reduces friction and enables faster bookmark management without removing existing button-based flows.

## Summary
Add right-click context menus to the folder tree and content area, providing quick access to create, edit, and delete actions for folders and links without requiring button clicks or dialog navigation.

## Motivation
Currently, users must:
- Click the "New Folder" button in the folder tree header to create folders
- Click the "New Link" button in the content area header to create links
- These actions require multiple clicks and explicit UI chrome

Context menus will:
- Reduce friction for common operations
- Provide a more desktop-like experience
- Enable power users to work faster
- Follow familiar patterns from file managers and browsers

## Goals
- Enable right-click context menus on folders in the tree navigation
- Enable right-click context menus on empty space in the content area
- Enable right-click context menus on link cards
- Provide contextually appropriate actions based on the clicked element
- Maintain existing button-based creation flows as alternatives

## Non-Goals
- Keyboard shortcuts for menu activation (can be added later)
- Customizable menu items (stick to essential actions)
- Multi-select operations (out of scope)

## Affected Components
- **Context Menu UI**: New shadcn/ui context menu components
- **Folder Tree**: Add context menu to folder nodes
- **Content Area**: Add context menu to empty space and link cards
- **Tree Node**: Handle right-click events on folders
- **Link Card**: Handle right-click events on links

## User Impact
**Positive**:
- Faster workflow for creating and managing folders/links
- More intuitive interaction model
- Familiar desktop application patterns

**Neutral**:
- Existing button-based flows remain available
- No breaking changes to current behavior

## Implementation Approach
1. Install shadcn/ui context menu component (`@radix-ui/react-context-menu`)
2. Create context menu wrapper components for different contexts
3. Add right-click handling to TreeNode components
4. Add right-click handling to ContentArea empty space
5. Add right-click handling to LinkCard components
6. Wire up menu actions to existing create/edit/delete handlers

## Testing Strategy
- **Unit Tests**: Test context menu component rendering and action callbacks
- **E2E Tests**: Test right-click flows for creating folders and links
- **Manual Testing**: Verify context menus work across different browsers

## Risks and Mitigations
**Risk**: Context menus might interfere with drag-and-drop
**Mitigation**: Use activation constraints and proper event handling to ensure drag takes priority over context menu

**Risk**: Mobile devices don't have right-click
**Mitigation**: Keep button-based creation flows; context menus are an enhancement, not a replacement

## Dependencies
- Requires `@radix-ui/react-context-menu` from shadcn/ui
- No breaking changes to existing APIs

## Success Criteria
- [x] Users can right-click folders in tree to create subfolders or delete
- [x] Users can right-click empty space in content area to create links
- [x] Users can right-click link cards to edit or delete
- [x] Context menus don't interfere with drag-and-drop operations
- [x] All tests pass (100%)
- [x] Build succeeds with zero errors
