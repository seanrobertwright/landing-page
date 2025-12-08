# Capability: Bookmark Export

## ADDED Requirements

### Requirement: The system SHALL export all bookmarks to JSON format
The system SHALL export all folders and bookmarks from the database to a structured JSON format that preserves hierarchy and can be used for backup or re-import.

#### Scenario: Export all bookmarks
- **WHEN** a user requests a bookmark export
- **THEN** the system queries all folders and bookmarks from the database
- **AND** the system generates a JSON file containing all data
- **AND** the system includes folder hierarchy relationships
- **AND** the system includes all bookmark metadata (title, URL, folder association)

#### Scenario: Export empty database
- **WHEN** a user requests export with no bookmarks in the database
- **THEN** the system generates a valid JSON file with empty arrays
- **AND** the export includes metadata (version, timestamp)

---

### Requirement: The system SHALL include export metadata in JSON output
The system SHALL include metadata in the exported JSON file containing the export version, timestamp, and application information for future compatibility.

#### Scenario: Export metadata included
- **WHEN** the system generates an export file
- **THEN** the JSON includes a "version" field with value "1.0"
- **AND** the JSON includes an "exported_at" field with ISO 8601 timestamp
- **AND** the JSON includes folder and link counts

#### Scenario: Future import compatibility
- **WHEN** the export version is "1.0"
- **THEN** future versions of the application can recognize the format
- **AND** the import process can handle version-specific parsing

---

### Requirement: The system SHALL generate a downloadable export file
The system SHALL trigger a browser download of the JSON export file with an appropriate filename including the export date.

#### Scenario: Download export file
- **WHEN** the export generation completes
- **THEN** the browser downloads a file named "bookmarks-YYYY-MM-DD.json"
- **AND** the file has Content-Type "application/json"
- **AND** the file has Content-Disposition "attachment"

#### Scenario: Large export download
- **WHEN** exporting 10,000+ bookmarks
- **THEN** the system streams the JSON to avoid memory issues
- **AND** the download starts within 2 seconds
- **AND** the file downloads successfully

---

### Requirement: The system SHALL preserve folder hierarchy in export
The system SHALL export folders with parent-child relationships intact so that re-importing maintains the original folder structure.

#### Scenario: Nested folders exported
- **WHEN** the database contains nested folders (3 levels deep)
- **THEN** the export JSON includes all folders with parent_id references
- **AND** the folder structure can be reconstructed from the export

#### Scenario: Root-level folders
- **WHEN** folders have no parent (parent_id is null)
- **THEN** the export represents them as root-level folders
- **AND** re-importing places them at the root level

---

### Requirement: The system SHALL allow re-import of exported JSON files
The system SHALL support importing previously exported JSON files to enable backup restoration and data portability between installations.

#### Scenario: Round-trip export and import
- **WHEN** a user exports all bookmarks to JSON
- **AND** imports the same JSON file into a clean database
- **THEN** all folders are recreated with the same hierarchy
- **AND** all bookmarks are recreated with correct folder associations
- **AND** the folder/bookmark counts match the original

#### Scenario: Import into existing data
- **WHEN** importing a JSON file into a database with existing bookmarks
- **THEN** the system applies duplicate handling strategies
- **AND** the import does not corrupt existing data

---

### Requirement: The system SHALL handle export errors gracefully
The system SHALL handle database errors or export failures gracefully without corrupting data or crashing the application.

#### Scenario: Database query failure
- **WHEN** a database error occurs during export
- **THEN** the system returns an error message "Failed to export bookmarks"
- **AND** the system does not generate a partial file
- **AND** the system logs the error for debugging

#### Scenario: File system write failure
- **WHEN** the export file cannot be generated (disk full, permissions)
- **THEN** the system displays error "Failed to create export file"
- **AND** the system does not leave partial files
