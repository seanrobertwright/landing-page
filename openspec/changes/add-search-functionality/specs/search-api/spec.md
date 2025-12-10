# Capability: Search API

## ADDED Requirements

### Requirement: The system SHALL search bookmarks by title
The system SHALL search all bookmarks by title using case-insensitive substring matching to enable users to find bookmarks by partial title matches.

#### Scenario: Search with exact title match
- **WHEN** user searches for a bookmark title that exists exactly
- **THEN** the system returns that bookmark as the first result
- **AND** the result includes the bookmark's title, URL, and folder information

#### Scenario: Search with partial title match
- **WHEN** user searches for part of a bookmark title (e.g., "git" for "GitHub")
- **THEN** the system returns all bookmarks containing that substring in the title
- **AND** results are ordered by relevance (exact match > prefix match > contains)

#### Scenario: Search with case-insensitive match
- **WHEN** user searches with different casing (e.g., "GITHUB" for "GitHub")
- **THEN** the system returns matching bookmarks regardless of case
- **AND** preserves original bookmark title casing in results

---

### Requirement: The system SHALL search bookmarks by URL
The system SHALL search all bookmarks by URL using case-insensitive substring matching to enable users to find bookmarks by domain or path fragments.

#### Scenario: Search by domain name
- **WHEN** user searches for a domain (e.g., "github.com")
- **THEN** the system returns all bookmarks with that domain in their URL
- **AND** results show the full URL for verification

#### Scenario: Search by URL path
- **WHEN** user searches for a URL path component (e.g., "/docs")
- **THEN** the system returns all bookmarks with that path in their URL
- **AND** results are ordered by relevance

---

### Requirement: The system SHALL search folders by name
The system SHALL search all folders by name using case-insensitive substring matching to enable users to find folders and see their contained bookmarks.

#### Scenario: Search for folder name
- **WHEN** user searches for a folder name (e.g., "Work")
- **THEN** the system returns matching folders in the results
- **AND** results indicate the folder's parent path for context

#### Scenario: Search for nested folder
- **WHEN** user searches for a deeply nested folder name
- **THEN** the system returns that folder with its full breadcrumb path
- **AND** users can navigate to that folder from results

---

### Requirement: The system SHALL rank search results by relevance
The system SHALL rank search results by relevance using exact match, prefix match, and substring match priority to surface the most relevant results first.

#### Scenario: Exact match ranks first
- **WHEN** search query exactly matches a bookmark title
- **THEN** that bookmark appears first in results
- **AND** partial matches appear below exact matches

#### Scenario: Prefix match ranks second
- **WHEN** search query matches the beginning of a bookmark title
- **THEN** that bookmark ranks higher than substring matches
- **AND** appears after exact matches but before contains matches

#### Scenario: Substring match ranks third
- **WHEN** search query matches anywhere in a bookmark title
- **THEN** that bookmark appears in results but ranks lower
- **AND** appears after exact and prefix matches

---

### Requirement: The system SHALL respond to search queries within 200ms
The system SHALL execute search queries and return results within 200 milliseconds for collections up to 1000 bookmarks to provide responsive type-ahead functionality.

#### Scenario: Search with small collection (<100 bookmarks)
- **WHEN** user searches with fewer than 100 bookmarks in database
- **THEN** results return in under 50ms
- **AND** type-ahead feels instantaneous

#### Scenario: Search with large collection (500-1000 bookmarks)
- **WHEN** user searches with 500-1000 bookmarks in database
- **THEN** results return in under 200ms
- **AND** type-ahead remains responsive

#### Scenario: Search timeout handling
- **WHEN** search query takes longer than 200ms
- **THEN** system returns cached results or shows loading state
- **AND** logs performance warning for investigation

---

### Requirement: The system SHALL limit search results to 50 items
The system SHALL return a maximum of 50 search results ordered by relevance to prevent overwhelming users and ensure fast response times.

#### Scenario: Search matches fewer than 50 items
- **WHEN** search query matches 20 bookmarks
- **THEN** system returns all 20 results
- **AND** indicates total count in response

#### Scenario: Search matches more than 50 items
- **WHEN** search query matches 100 bookmarks
- **THEN** system returns only top 50 most relevant results
- **AND** indicates "50+ results" to inform users more exist

---

### Requirement: The system SHALL sanitize search queries
The system SHALL sanitize search query input to prevent SQL injection and handle special characters safely.

#### Scenario: Search with SQL special characters
- **WHEN** user enters special characters like single quotes or semicolons
- **THEN** system escapes characters properly in SQL query
- **AND** search executes safely without errors

#### Scenario: Search with Unicode characters
- **WHEN** user searches with Unicode characters (e.g., emoji, accents)
- **THEN** system handles UTF-8 encoding correctly
- **AND** returns matching results with Unicode preserved

#### Scenario: Search with wildcard characters
- **WHEN** user enters wildcard characters (e.g., %, _)
- **THEN** system escapes wildcards to treat them as literals
- **AND** searches for exact character match instead of pattern

---

### Requirement: The system SHALL return folder breadcrumb paths in results
The system SHALL include the full folder breadcrumb path for each bookmark in search results to provide context about bookmark location.

#### Scenario: Bookmark in root folder
- **WHEN** search result is a bookmark in root folder "Bookmarks"
- **THEN** result includes path "Bookmarks"
- **AND** shows only single-level path

#### Scenario: Bookmark in nested folder
- **WHEN** search result is a bookmark in nested folder structure
- **THEN** result includes full path (e.g., "Work > Projects > GitHub")
- **AND** separates path components with " > " delimiter

#### Scenario: Multiple bookmarks with same title in different folders
- **WHEN** search matches multiple bookmarks with same title
- **THEN** results show each with distinct folder path
- **AND** users can distinguish by location
