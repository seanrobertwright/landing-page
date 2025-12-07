# Spec: folder-management

## Overview
Enables users to create new folders in the hierarchical folder tree, either at the root level or as children of existing folders.

## ADDED Requirements

### Requirement: Users can create new folders via UI dialog
The system SHALL provide an accessible, validated dialog interface for creating new folders.

#### Scenario: User creates a root-level folder
```gherkin
GIVEN the user is viewing the folder tree
WHEN the user clicks the "New Folder" button in the sidebar header
AND enters "Development" as the folder name
AND selects "(Root)" as the parent
AND clicks "Create"
THEN a new folder named "Development" appears at the root level of the tree
AND the dialog closes
AND the folder tree is refreshed to show the new folder
```

#### Scenario: User creates a nested folder
```gherkin
GIVEN the user is viewing the folder tree
AND a folder named "Development" exists at the root
WHEN the user clicks the "New Folder" button
AND enters "Frontend" as the folder name
AND selects "Development" as the parent
AND clicks "Create"
THEN a new folder named "Frontend" appears as a child of "Development"
AND the "Development" folder is automatically expanded to show the new child
AND the dialog closes
```

#### Scenario: User attempts to create folder with empty name
```gherkin
GIVEN the user has opened the "New Folder" dialog
WHEN the user leaves the folder name field empty
AND clicks "Create"
THEN an error message "Folder name is required" appears below the name field
AND the dialog remains open
AND no folder is created
```

#### Scenario: User cancels folder creation
```gherkin
GIVEN the user has opened the "New Folder" dialog
AND entered "Test Folder" as the name
WHEN the user clicks "Cancel" or presses ESC
THEN the dialog closes
AND no folder is created
```

### Requirement: Folder name validation
The system MUST validate folder names before creation to ensure data integrity.

#### Scenario: Folder name exceeds maximum length
```gherkin
GIVEN the user is creating a new folder
WHEN the user enters a name longer than 255 characters
AND attempts to create the folder
THEN an error message "Folder name must be 255 characters or less" appears
AND the folder is not created
```

#### Scenario: Folder name contains only whitespace
```gherkin
GIVEN the user is creating a new folder
WHEN the user enters "   " (only spaces) as the folder name
AND attempts to create the folder
THEN an error message "Folder name is required" appears
AND the folder is not created
```

### Requirement: Parent folder selection
The system SHALL allow users to select any existing folder as the parent, or choose to create at root level.

#### Scenario: User views available parent folders
```gherkin
GIVEN folders exist in the tree: Bookmarks, Development (with children Frontend, Backend), Design
WHEN the user opens the "New Folder" dialog
THEN the parent folder dropdown shows:
  - (Root)
  - Bookmarks
  - Development
  - ├─ Frontend
  - ├─ Backend
  - Design
AND "(Root)" is selected by default
```

#### Scenario: User creates folder under deeply nested parent
```gherkin
GIVEN the folder hierarchy is: Development > Frontend > React > Components
WHEN the user selects "Components" as the parent
AND creates a folder named "Buttons"
THEN "Buttons" appears as a child of "Components" in the tree
AND all ancestor folders (React, Frontend, Development) are expanded
```

### Requirement: Create button accessibility
The "New Folder" button MUST be keyboard accessible and clearly labeled.

#### Scenario: User accesses button via keyboard
```gherkin
GIVEN the user is navigating via keyboard
WHEN the user tabs to the "New Folder" button
AND presses Enter or Space
THEN the "New Folder" dialog opens
```

#### Scenario: Dialog supports keyboard navigation
```gherkin
GIVEN the "New Folder" dialog is open
WHEN the user presses Tab
THEN focus moves through: folder name input → parent dropdown → Create button → Cancel button
AND pressing Shift+Tab moves focus backwards
AND pressing ESC closes the dialog
```
