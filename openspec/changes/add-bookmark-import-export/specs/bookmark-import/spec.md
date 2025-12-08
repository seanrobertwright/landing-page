# Capability: Bookmark Import

## ADDED Requirements

### Requirement: The system SHALL parse Netscape HTML bookmark files
The system SHALL parse Netscape HTML bookmark format files exported from Chrome, Firefox, Edge, and Safari browsers to extract folder hierarchy and bookmark data for import into the application.

#### Scenario: Import Chrome HTML export
- **WHEN** a user uploads a valid Chrome HTML bookmark export file
- **THEN** the system parses all folders preserving the hierarchical structure
- **AND** the system extracts all bookmarks with titles and URLs
- **AND** the system maintains the folder nesting relationships

#### Scenario: Import Firefox HTML export
- **WHEN** a user uploads a valid Firefox HTML bookmark export file
- **THEN** the system successfully parses the bookmark structure
- **AND** the system handles Firefox-specific HTML variations

#### Scenario: Invalid HTML format
- **WHEN** a user uploads a file that is not a valid Netscape bookmark format
- **THEN** the system rejects the file with error message "Invalid bookmark file format"
- **AND** the system does not modify the database

---

### Requirement: The system SHALL validate imported bookmark data
The system SHALL validate all imported bookmark data including URLs, folder names, and hierarchy to ensure data integrity before database insertion.

#### Scenario: Valid bookmark data
- **WHEN** imported bookmarks have valid URLs and folder names
- **THEN** the system accepts all bookmarks for import
- **AND** the system proceeds with database insertion

#### Scenario: Invalid URL format
- **WHEN** a bookmark contains an invalid URL (e.g., "not-a-url")
- **THEN** the system skips that bookmark
- **AND** the system reports the invalid bookmark in the import summary
- **AND** the system continues processing remaining bookmarks

#### Scenario: Circular folder references
- **WHEN** the import contains circular folder references (folder A contains B contains A)
- **THEN** the system detects the circular reference
- **AND** the system rejects the import with error "Circular folder reference detected"

#### Scenario: Folder name too long
- **WHEN** a folder name exceeds 255 characters
- **THEN** the system truncates the name to 255 characters
- **AND** the system proceeds with the truncated name

---

### Requirement: The system SHALL handle duplicate bookmarks during import
The system SHALL detect duplicate bookmarks by URL and handle them according to the configured duplicate strategy to prevent database conflicts.

#### Scenario: Duplicate URL with skip strategy
- **WHEN** importing a bookmark with a URL that already exists
- **AND** the duplicate strategy is set to "skip"
- **THEN** the system skips the duplicate bookmark
- **AND** the system increments the skipped count in the import summary
- **AND** the system keeps the existing bookmark unchanged

#### Scenario: Duplicate URL with update strategy
- **WHEN** importing a bookmark with a URL that already exists
- **AND** the duplicate strategy is set to "update"
- **THEN** the system updates the existing bookmark's title and folder
- **AND** the system increments the updated count in the import summary

#### Scenario: No duplicates
- **WHEN** importing bookmarks with unique URLs
- **THEN** the system imports all bookmarks
- **AND** the skipped count is zero

---

### Requirement: The system SHALL import bookmarks in a single database transaction
The system SHALL import all folders and bookmarks within a single database transaction to ensure atomicity and enable rollback on errors.

#### Scenario: Successful import
- **WHEN** all bookmarks and folders are valid
- **THEN** the system commits the transaction
- **AND** all folders and bookmarks are saved to the database
- **AND** the system returns a success message with statistics

#### Scenario: Import failure during processing
- **WHEN** an error occurs during bookmark insertion (e.g., database constraint violation)
- **THEN** the system rolls back the entire transaction
- **AND** no partial data is saved to the database
- **AND** the system returns an error message explaining the failure

---

### Requirement: The system SHALL provide progress feedback for large imports
The system SHALL report import progress for bookmark files containing more than 100 bookmarks to provide user feedback during long-running operations.

#### Scenario: Large import with progress updates
- **WHEN** importing a file with 1000 bookmarks
- **THEN** the system sends progress updates every 100 bookmarks processed
- **AND** the progress includes the count of processed bookmarks
- **AND** the user sees a progress indicator in the UI

#### Scenario: Small import without progress
- **WHEN** importing a file with 50 bookmarks
- **THEN** the system processes the import without progress updates
- **AND** the import completes quickly without UI progress indicator

---

### Requirement: The system SHALL generate an import summary report
The system SHALL generate a detailed summary report after import completion showing the number of folders added, bookmarks added, duplicates skipped, and any errors encountered.

#### Scenario: Successful import summary
- **WHEN** an import completes successfully
- **THEN** the system displays a summary showing:
  - Number of folders added
  - Number of bookmarks added
  - Number of duplicates skipped
  - Total processing time
- **AND** the summary has a success indicator

#### Scenario: Import with errors
- **WHEN** an import completes with some errors
- **THEN** the system displays a summary showing successful imports
- **AND** the system lists all errors with descriptions
- **AND** the summary indicates partial success

---

### Requirement: The system SHALL limit import file size to 50MB
The system SHALL reject bookmark import files larger than 50 megabytes to prevent memory exhaustion and ensure reasonable processing times.

#### Scenario: File within size limit
- **WHEN** a user uploads a 10MB bookmark file
- **THEN** the system accepts the file for processing
- **AND** the import proceeds normally

#### Scenario: File exceeds size limit
- **WHEN** a user uploads a 60MB bookmark file
- **THEN** the system rejects the file immediately
- **AND** the system displays error "File too large. Maximum size is 50MB"
- **AND** the system does not process the file
