## ADDED Requirements

### Requirement: SQLite Database Persistence
The application SHALL persist folders and links to a SQLite database using better-sqlite3.

#### Scenario: Database initialization
- **WHEN** the application starts
- **THEN** the SQLite database file is created if it does not exist
- **AND** the folders and links tables are created

#### Scenario: Database location
- **WHEN** the database is initialized
- **THEN** it is stored at `data/bookmarks.db` relative to the project root

---

### Requirement: Folder Data Model
The application SHALL store folders with hierarchical parent-child relationships.

#### Scenario: Create root-level folder
- **WHEN** a folder is created with no parent
- **THEN** it is stored with `parent_id` as NULL
- **AND** it appears at the root level of the tree

#### Scenario: Create nested folder
- **WHEN** a folder is created with a parent folder ID
- **THEN** it is stored with the parent's ID as `parent_id`
- **AND** it appears as a child of that parent folder

#### Scenario: Delete folder cascades
- **WHEN** a folder is deleted
- **THEN** all child folders and links within it are also deleted

---

### Requirement: Link Data Model
The application SHALL store links associated with folders.

#### Scenario: Create link in folder
- **WHEN** a link is created with a folder ID
- **THEN** it is stored with that `folder_id`
- **AND** it appears within that folder in the tree

#### Scenario: Link requires folder
- **WHEN** a link is created
- **THEN** it MUST have a valid folder_id
- **AND** links cannot exist at root level without a folder

---

### Requirement: Folder Tree Display
The sidebar SHALL display folders and links in a hierarchical tree structure.

#### Scenario: Tree renders hierarchy
- **WHEN** the tree is displayed
- **THEN** folders appear with a folder icon
- **AND** links appear with a link icon
- **AND** nested items are indented under their parent

#### Scenario: Empty state
- **WHEN** the database has no folders
- **THEN** a default "Bookmarks" folder is created automatically
- **AND** it appears in the tree

---

### Requirement: Folder Expand/Collapse
Folders in the tree SHALL be expandable and collapsible.

#### Scenario: Expand folder
- **WHEN** the user clicks the chevron on a collapsed folder
- **THEN** the folder expands to show its children (subfolders and links)
- **AND** the chevron rotates to indicate expanded state

#### Scenario: Collapse folder
- **WHEN** the user clicks the chevron on an expanded folder
- **THEN** the folder collapses to hide its children
- **AND** the chevron rotates to indicate collapsed state

#### Scenario: Expand state persistence during session
- **WHEN** a folder is expanded or collapsed
- **THEN** that state is maintained while navigating the application

---

### Requirement: Folder Selection
The user SHALL be able to select a folder to view its contents.

#### Scenario: Select folder
- **WHEN** the user clicks on a folder name (not the chevron)
- **THEN** that folder becomes selected
- **AND** the folder is visually highlighted in the tree

#### Scenario: Selected folder content display
- **WHEN** a folder is selected
- **THEN** the content area displays link cards for all links directly in that folder
- **AND** links in subfolders are NOT displayed (only direct children)

---

### Requirement: Link Display in Tree
Links SHALL appear as leaf nodes within their parent folder in the tree.

#### Scenario: Link in tree
- **WHEN** a folder is expanded
- **THEN** links in that folder appear below the folder
- **AND** links display with a link icon and their title

#### Scenario: Click link in tree
- **WHEN** the user clicks a link in the tree
- **THEN** the link opens in a new browser tab

---

### Requirement: Folder API Endpoints
The application SHALL provide REST API endpoints for folder operations.

#### Scenario: List folders
- **WHEN** GET `/api/folders` is called
- **THEN** all folders are returned as a flat list

#### Scenario: Create folder
- **WHEN** POST `/api/folders` is called with name and optional parent_id
- **THEN** a new folder is created and returned

#### Scenario: Update folder
- **WHEN** PATCH `/api/folders/[id]` is called with updated fields
- **THEN** the folder is updated and returned

#### Scenario: Delete folder
- **WHEN** DELETE `/api/folders/[id]` is called
- **THEN** the folder and all its contents are deleted

---

### Requirement: Link API Endpoints
The application SHALL provide REST API endpoints for link operations.

#### Scenario: List links
- **WHEN** GET `/api/links` is called with optional folder_id query param
- **THEN** links are returned, filtered by folder if specified

#### Scenario: Create link
- **WHEN** POST `/api/links` is called with title, url, and folder_id
- **THEN** a new link is created and returned

#### Scenario: Update link
- **WHEN** PATCH `/api/links/[id]` is called with updated fields
- **THEN** the link is updated and returned

#### Scenario: Delete link
- **WHEN** DELETE `/api/links/[id]` is called
- **THEN** the link is deleted

---

### Requirement: Tree API Endpoint
The application SHALL provide an API endpoint to fetch the complete tree structure.

#### Scenario: Get tree
- **WHEN** GET `/api/tree` is called
- **THEN** the complete folder/link hierarchy is returned as a nested structure
- **AND** the response includes all folders and links organized by parent-child relationships
