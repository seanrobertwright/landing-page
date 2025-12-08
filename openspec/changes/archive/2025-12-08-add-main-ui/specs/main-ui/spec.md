## ADDED Requirements

### Requirement: Three-Panel Layout
The application SHALL display a three-panel layout consisting of a fixed header at the top, a resizable sidebar on the left, and a main content area on the right.

#### Scenario: Initial layout render
- **WHEN** the application loads
- **THEN** the header is displayed at the top spanning full width
- **AND** the sidebar is displayed on the left with default width of 280px
- **AND** the content area fills the remaining horizontal space

#### Scenario: Responsive behavior
- **WHEN** the viewport is resized
- **THEN** the content area adjusts to fill available space
- **AND** the sidebar maintains its configured width

---

### Requirement: Application Header
The application SHALL display a header containing the app name "LRIL Landing Page" and the logo image (`app/hw2.jpg`) positioned in the top-right corner.

#### Scenario: Header branding display
- **WHEN** the header is rendered
- **THEN** the app name "LRIL Landing Page" is displayed
- **AND** the logo image is displayed in the top-right corner of the header
- **AND** the header has a dark background with appropriate contrast

---

### Requirement: Resizable Sidebar
The sidebar SHALL be resizable by the user via a drag handle on its right edge.

#### Scenario: Resize sidebar via drag
- **WHEN** the user drags the resize handle on the sidebar's right edge
- **THEN** the sidebar width changes to match the drag position
- **AND** the width is constrained between 200px minimum and 500px maximum
- **AND** the content area adjusts accordingly

#### Scenario: Sidebar width persistence
- **WHEN** the user resizes the sidebar
- **THEN** the new width is stored in application state
- **AND** the width persists during the session

---

### Requirement: Sidebar Horizontal Scroll
The sidebar content area SHALL display a horizontal scrollbar when content overflows the container width.

#### Scenario: Long folder names overflow
- **WHEN** folder names exceed the sidebar width
- **THEN** a horizontal scrollbar appears
- **AND** the user can scroll horizontally to view the full text
- **AND** text is NOT truncated

---

### Requirement: Dark Theme with Accent Colors
The application SHALL use a dark background theme with vibrant red and neon accent colors.

#### Scenario: Theme colors applied
- **WHEN** the application renders
- **THEN** the background uses a dark color scheme
- **AND** interactive elements use vibrant red as the primary accent
- **AND** secondary accents include neon cyan and magenta colors
- **AND** text maintains readable contrast against the dark background

---

### Requirement: Link Card Display
The application SHALL display bookmark links as compact cards in a grid layout within the content area.

#### Scenario: Link cards grid display
- **WHEN** links exist in the current view
- **THEN** each link is displayed as a compact card
- **AND** cards are arranged in a responsive grid layout
- **AND** each card displays the link title, favicon, and URL

#### Scenario: Link card click opens URL
- **WHEN** the user clicks on a link card (excluding the title)
- **THEN** the link URL opens in a new browser tab

---

### Requirement: Editable Link Title
Link card titles SHALL be editable by clicking on the title text.

#### Scenario: Enter edit mode
- **WHEN** the user clicks on a link card title
- **THEN** the title becomes an editable input field
- **AND** the current title text is selected

#### Scenario: Save edited title
- **WHEN** the user presses Enter or clicks outside the title input
- **THEN** the new title is saved
- **AND** the input field reverts to display mode

#### Scenario: Cancel edit
- **WHEN** the user presses Escape while editing
- **THEN** the original title is restored
- **AND** the input field reverts to display mode

---

### Requirement: Link Card Favicon
Each link card SHALL display a favicon extracted from the link URL, with fallback to a default icon.

#### Scenario: Favicon successfully loaded
- **WHEN** a favicon can be retrieved for the link URL
- **THEN** the favicon is displayed on the card

#### Scenario: Favicon unavailable
- **WHEN** a favicon cannot be retrieved for the link URL
- **THEN** a default generic link icon is displayed
