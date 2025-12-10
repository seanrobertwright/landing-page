# Capability: Search Interface

## ADDED Requirements

### Requirement: The system SHALL provide a search input in the header
The system SHALL display a search input field in the application header that allows users to perform searches from any view without navigation.

#### Scenario: Search input visible in header
- **WHEN** user views any page in the application
- **THEN** search input is visible in the header
- **AND** has placeholder text "Search bookmarks..."

#### Scenario: Click search input focuses field
- **WHEN** user clicks the search input
- **THEN** the input receives focus
- **AND** cursor is positioned for typing

#### Scenario: Search input shows keyboard shortcut hint
- **WHEN** search input is visible
- **THEN** displays keyboard shortcut hint (Ctrl/Cmd+K)
- **AND** hint is visible on larger screens, hidden on mobile

---

### Requirement: The system SHALL open search dialog with keyboard shortcut
The system SHALL open a full-screen search dialog when users press Ctrl+K (Windows/Linux) or Cmd+K (Mac) from anywhere in the application.

#### Scenario: Press Ctrl/Cmd+K opens dialog
- **WHEN** user presses Ctrl+K (or Cmd+K on Mac)
- **THEN** search dialog opens in modal overlay
- **AND** search input is automatically focused

#### Scenario: Keyboard shortcut works from any view
- **WHEN** user presses Ctrl/Cmd+K while on any page
- **THEN** search dialog opens regardless of current focus
- **AND** previous context is preserved for return

#### Scenario: Keyboard shortcut prevented in input fields
- **WHEN** user presses Ctrl/Cmd+K while typing in another input
- **THEN** search dialog opens (overrides default behavior)
- **AND** moves focus to search dialog input

---

### Requirement: The system SHALL display type-ahead suggestions
The system SHALL display type-ahead suggestions below the search input as users type, showing up to 5 top results.

#### Scenario: Type-ahead appears while typing
- **WHEN** user types 3 or more characters in search input
- **THEN** system displays up to 5 matching results below input
- **AND** updates suggestions in real-time as typing continues

#### Scenario: Type-ahead shows result preview
- **WHEN** type-ahead suggestions are displayed
- **THEN** each result shows bookmark title, URL preview, and folder path
- **AND** results are ordered by relevance

#### Scenario: Type-ahead debounced to 200ms
- **WHEN** user types rapidly in search input
- **THEN** system waits 200ms after last keystroke before searching
- **AND** prevents excessive API calls during fast typing

---

### Requirement: The system SHALL support keyboard navigation in results
The system SHALL allow users to navigate search results using arrow keys, select with Enter, and close with Escape.

#### Scenario: Arrow down selects next result
- **WHEN** user presses arrow down key in search results
- **THEN** next result is highlighted with visual indicator
- **AND** focus moves to that result

#### Scenario: Arrow up selects previous result
- **WHEN** user presses arrow up key in search results
- **THEN** previous result is highlighted
- **AND** focus moves backward in list

#### Scenario: Enter key selects highlighted result
- **WHEN** user presses Enter on highlighted result
- **THEN** system navigates to that bookmark's folder
- **AND** search dialog closes automatically

#### Scenario: Escape key closes dialog
- **WHEN** user presses Escape in search dialog
- **THEN** dialog closes
- **AND** focus returns to previous location

---

### Requirement: The system SHALL highlight matching text in results
The system SHALL visually highlight the search query text within result titles and URLs to help users identify matches.

#### Scenario: Highlight match in title
- **WHEN** search query matches text in bookmark title
- **THEN** matching text is highlighted with distinct styling
- **AND** uses high contrast color for visibility

#### Scenario: Highlight match in URL
- **WHEN** search query matches text in bookmark URL
- **THEN** matching URL portion is highlighted
- **AND** maintains URL readability

#### Scenario: Highlight preserves case
- **WHEN** search query has different casing than match
- **THEN** highlight shows original text casing
- **AND** indicates match despite case difference

---

### Requirement: The system SHALL display folder breadcrumb paths in results
The system SHALL show the full folder path for each bookmark in search results to provide location context.

#### Scenario: Show single-level folder path
- **WHEN** bookmark is in root folder "Bookmarks"
- **THEN** result displays "Bookmarks" as path
- **AND** uses subtle styling to distinguish from title

#### Scenario: Show nested folder path with separators
- **WHEN** bookmark is in nested folder structure
- **THEN** result displays full path (e.g., "Work > Projects > GitHub")
- **AND** uses " > " separator between folder levels

#### Scenario: Long folder paths are truncated
- **WHEN** folder path exceeds available width
- **THEN** system truncates path with ellipsis (e.g., "Work > ... > GitHub")
- **AND** shows full path on hover tooltip

---

### Requirement: The system SHALL show loading state during search
The system SHALL display a loading indicator while search query is being processed to provide feedback during network delay.

#### Scenario: Show loading spinner for slow searches
- **WHEN** search takes longer than 100ms to complete
- **THEN** loading spinner appears in results area
- **AND** indicates system is processing query

#### Scenario: Hide loading spinner when results arrive
- **WHEN** search results are received from API
- **THEN** loading spinner is removed
- **AND** results are displayed immediately

---

### Requirement: The system SHALL handle empty search results gracefully
The system SHALL display a helpful message when search query returns no matches.

#### Scenario: Show "no results" message
- **WHEN** search query matches zero bookmarks or folders
- **THEN** system displays "No results found for '[query]'" message
- **AND** suggests trying different search terms

#### Scenario: Show suggestion for empty query
- **WHEN** search input is empty or whitespace only
- **THEN** system shows placeholder text
- **AND** does not execute search query

---

### Requirement: The system SHALL navigate to bookmark on result selection
The system SHALL navigate the user to the selected bookmark's folder and highlight that bookmark when a search result is clicked or selected with Enter.

#### Scenario: Click result navigates to folder
- **WHEN** user clicks a bookmark in search results
- **THEN** system navigates to that bookmark's folder
- **AND** closes search dialog

#### Scenario: Selected bookmark is highlighted in folder
- **WHEN** user selects bookmark from search
- **THEN** folder view shows that bookmark
- **AND** bookmark card has visual highlight or scroll-to effect

#### Scenario: Folder is expanded in sidebar
- **WHEN** user navigates to folder from search
- **THEN** folder tree in sidebar expands to show that folder
- **AND** folder is visually highlighted in tree

---

### Requirement: The system SHALL close search dialog on outside click
The system SHALL close the search dialog when users click outside the dialog area to provide intuitive modal behavior.

#### Scenario: Click backdrop closes dialog
- **WHEN** user clicks the dark backdrop behind search dialog
- **THEN** dialog closes
- **AND** focus returns to previous location

#### Scenario: Click inside dialog keeps it open
- **WHEN** user clicks within search dialog content area
- **THEN** dialog remains open
- **AND** focus stays in search interface
