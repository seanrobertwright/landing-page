# link-management Specification

## Purpose
TBD - created by archiving change add-create-actions. Update Purpose after archive.
## Requirements
### Requirement: Users can create new links via UI dialog
The system SHALL provide an accessible, validated dialog interface for adding new links to the currently selected folder.

#### Scenario: User creates a link in selected folder
```gherkin
GIVEN the user has selected the "Development" folder
AND the folder is displayed in the content area
WHEN the user clicks the "New Link" button in the content area header
AND enters "GitHub" as the link title
AND enters "https://github.com" as the URL
AND clicks "Create"
THEN a new link card appears in the "Development" folder's content area
AND the dialog closes
AND the link card displays "GitHub" as the title
AND the link card displays "github.com" as the URL hint
AND the link card shows the GitHub favicon
```

#### Scenario: User creates link without selecting a folder
```gherkin
GIVEN no folder is currently selected
WHEN the user views the content area
THEN the "New Link" button is disabled
AND hovering shows tooltip "Select a folder first"
```

#### Scenario: User creates link with auto-fetched favicon
```gherkin
GIVEN the user is creating a new link
WHEN the user enters "https://stackoverflow.com" as the URL
AND creates the link
THEN the system automatically fetches the favicon from Google's favicon service
AND stores it as "https://www.google.com/s2/favicons?domain=stackoverflow.com&sz=64"
AND the link card displays the fetched favicon
```

#### Scenario: Favicon fetch fails gracefully
```gherkin
GIVEN the user creates a link with URL "https://example-that-has-no-favicon.com"
WHEN the favicon cannot be fetched or fails to load
THEN the link card displays a default link icon
AND the link is still created successfully
```

### Requirement: Link title validation
The system MUST validate link titles before creation.

#### Scenario: User attempts to create link with empty title
```gherkin
GIVEN the user has opened the "New Link" dialog
WHEN the user leaves the title field empty
AND enters a valid URL
AND clicks "Create"
THEN an error message "Link title is required" appears below the title field
AND the dialog remains open
AND no link is created
```

#### Scenario: Link title exceeds maximum length
```gherkin
GIVEN the user is creating a new link
WHEN the user enters a title longer than 255 characters
AND attempts to create the link
THEN an error message "Link title must be 255 characters or less" appears
AND the link is not created
```

### Requirement: URL validation
The system MUST validate URLs to ensure they are valid web addresses.

#### Scenario: User enters valid URL
```gherkin
GIVEN the user is creating a new link
WHEN the user enters "https://example.com" in the URL field
THEN no error is shown
AND the link can be created
```

#### Scenario: User enters invalid URL format
```gherkin
GIVEN the user is creating a new link
WHEN the user enters "not-a-valid-url" in the URL field
AND attempts to create the link
THEN an error message "Invalid URL format" appears below the URL field
AND the link is not created
```

#### Scenario: User enters URL without protocol
```gherkin
GIVEN the user is creating a new link
WHEN the user enters "example.com" (without https://)
AND attempts to create the link
THEN an error message "Invalid URL format" appears
AND the link is not created
```

#### Scenario: User corrects invalid URL
```gherkin
GIVEN the user entered "not-a-url" and saw an error
WHEN the user changes the URL to "https://example.com"
THEN the error message disappears
AND the user can create the link
```

### Requirement: Target folder indication
The dialog MUST clearly show which folder the link will be added to.

#### Scenario: Dialog shows target folder
```gherkin
GIVEN the user has selected the "Development" folder
WHEN the user opens the "New Link" dialog
THEN the dialog shows "Add link to: Development" or similar text
AND the folder field is read-only (user cannot change it)
```

#### Scenario: User wants to add link to different folder
```gherkin
GIVEN the user has the "New Link" dialog open for "Development" folder
WHEN the user wants to add the link to "Design" folder instead
THEN the user must cancel the dialog
AND select the "Design" folder
AND click "New Link" again
```

### Requirement: Create button accessibility
The "New Link" button MUST be keyboard accessible and contextually enabled.

#### Scenario: User accesses button via keyboard
```gherkin
GIVEN the user has selected a folder
AND is navigating via keyboard
WHEN the user tabs to the "New Link" button
AND presses Enter or Space
THEN the "New Link" dialog opens
```

#### Scenario: Dialog supports keyboard navigation
```gherkin
GIVEN the "New Link" dialog is open
WHEN the user presses Tab
THEN focus moves through: title input → URL input → Create button → Cancel button
AND pressing Shift+Tab moves focus backwards
AND pressing ESC closes the dialog
```

### Requirement: Link creation refreshes content area
The content area MUST refresh after successful link creation to show the new link.

#### Scenario: New link appears immediately after creation
```gherkin
GIVEN the user is viewing the "Development" folder with 5 existing links
WHEN the user creates a new link titled "New Resource"
THEN the content area refreshes
AND shows 6 links including "New Resource"
AND the new link is sorted according to the existing sort order
```

