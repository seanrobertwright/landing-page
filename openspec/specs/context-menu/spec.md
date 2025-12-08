# context-menu Specification

## Purpose
TBD - created by archiving change add-context-menus. Update Purpose after archive.
## Requirements
### Requirement: Folder Context Menu
The system SHALL display a context menu when the user right-clicks on a folder in the navigation tree, providing quick access to folder-specific actions.

#### Scenario: Right-click on folder shows context menu
- **GIVEN** a folder exists in the tree navigation
- **WHEN** the user right-clicks on the folder
- **THEN** a context menu SHALL appear with the following options:
  - "New Subfolder" to create a child folder
  - "Delete Folder" to remove the folder and its contents

#### Scenario: Create subfolder from context menu
- **GIVEN** the folder context menu is open
- **WHEN** the user clicks "New Subfolder"
- **THEN** the CreateFolderDialog SHALL open
- **AND** the parent folder SHALL be pre-selected to the right-clicked folder

#### Scenario: Delete folder from context menu
- **GIVEN** the folder context menu is open
- **WHEN** the user clicks "Delete Folder"
- **THEN** a confirmation dialog SHALL appear
- **AND** if the user confirms, the folder and all its contents SHALL be deleted
- **AND** the tree SHALL update to reflect the deletion

### Requirement: Content Area Context Menu
The system SHALL display a context menu when the user right-clicks on empty space in the content area, enabling quick link creation in the currently selected folder.

#### Scenario: Right-click on empty space shows context menu
- **GIVEN** a folder is selected
- **AND** the content area is visible
- **WHEN** the user right-clicks on empty space (not on a link card)
- **THEN** a context menu SHALL appear with the option "New Link"

#### Scenario: Create link from content area context menu
- **GIVEN** the content area context menu is open
- **WHEN** the user clicks "New Link"
- **THEN** the CreateLinkDialog SHALL open
- **AND** the folder SHALL be pre-selected to the currently selected folder

#### Scenario: No context menu when no folder selected
- **GIVEN** no folder is currently selected
- **WHEN** the user right-clicks in the content area
- **THEN** no context menu SHALL appear

### Requirement: Link Card Context Menu
The system SHALL display a context menu when the user right-clicks on a link card, providing quick access to link-specific actions.

#### Scenario: Right-click on link card shows context menu
- **GIVEN** a link card is displayed in the content area
- **WHEN** the user right-clicks on the link card
- **THEN** a context menu SHALL appear with the following options:
  - "Open in New Tab" to open the link URL
  - "Delete Link" to remove the link

#### Scenario: Open link in new tab from context menu
- **GIVEN** the link context menu is open
- **WHEN** the user clicks "Open in New Tab"
- **THEN** the link URL SHALL open in a new browser tab
- **AND** the context menu SHALL close

#### Scenario: Delete link from context menu
- **GIVEN** the link context menu is open
- **WHEN** the user clicks "Delete Link"
- **THEN** a confirmation dialog SHALL appear
- **AND** if the user confirms, the link SHALL be deleted
- **AND** the content area SHALL update to reflect the deletion

### Requirement: Context Menu Accessibility
The system SHALL ensure context menus are fully accessible via keyboard and screen readers, following WAI-ARIA guidelines.

#### Scenario: Keyboard activation of context menu
- **GIVEN** an element supports context menus (folder, link, or content area)
- **AND** the element has keyboard focus
- **WHEN** the user presses Shift+F10 or the context menu key
- **THEN** the context menu SHALL appear at the focused element
- **AND** focus SHALL move to the first menu item

#### Scenario: Keyboard navigation within context menu
- **GIVEN** a context menu is open
- **WHEN** the user presses the Down Arrow key
- **THEN** focus SHALL move to the next menu item
- **AND** when the user presses the Up Arrow key
- **THEN** focus SHALL move to the previous menu item

#### Scenario: Keyboard activation of menu item
- **GIVEN** a context menu is open
- **AND** a menu item has focus
- **WHEN** the user presses Enter or Space
- **THEN** the menu item action SHALL be triggered
- **AND** the context menu SHALL close

#### Scenario: Close context menu with Escape
- **GIVEN** a context menu is open
- **WHEN** the user presses the Escape key
- **THEN** the context menu SHALL close
- **AND** focus SHALL return to the element that triggered the menu

### Requirement: Context Menu and Drag-Drop Compatibility
The system SHALL ensure context menus do not interfere with existing drag-and-drop functionality for folders and links.

#### Scenario: Drag-and-drop takes priority over context menu
- **GIVEN** a draggable element (folder or link) is being dragged
- **WHEN** the user moves the mouse while holding down the button
- **THEN** the drag operation SHALL proceed
- **AND** the context menu SHALL NOT appear

#### Scenario: Context menu appears only on right-click
- **GIVEN** a draggable element supports context menus
- **WHEN** the user right-clicks on the element
- **THEN** the context menu SHALL appear
- **AND** no drag operation SHALL start

### Requirement: Context Menu Visual Design
The system SHALL render context menus with consistent styling that matches the application's design system and provides clear visual hierarchy for menu items.

#### Scenario: Context menu styling
- **GIVEN** a context menu is displayed
- **THEN** the menu SHALL use the application's design tokens:
  - Background color matching popover components
  - Border matching the application border color
  - Proper padding and spacing for readability

#### Scenario: Menu item hover states
- **GIVEN** a context menu is displayed
- **WHEN** the user hovers over a menu item
- **THEN** the menu item SHALL display a hover background color
- **AND** the text color SHALL update for contrast

#### Scenario: Danger action styling
- **GIVEN** a context menu contains a destructive action (e.g., "Delete")
- **THEN** the destructive menu item SHALL be styled with a danger color (red)
- **AND** when hovered, SHALL display a destructive background color
- **AND** SHALL be visually distinct from non-destructive actions

### Requirement: Context Menu Performance
The system SHALL render context menus efficiently without impacting application responsiveness or causing layout shifts.

#### Scenario: Fast context menu rendering
- **GIVEN** the user right-clicks on an element
- **WHEN** the context menu is triggered
- **THEN** the menu SHALL appear within 100ms
- **AND** SHALL NOT cause visible layout shifts or reflows

#### Scenario: Context menu cleanup on unmount
- **GIVEN** a context menu is open
- **WHEN** the user navigates away or the component unmounts
- **THEN** the context menu SHALL be properly cleaned up
- **AND** no memory leaks SHALL occur

