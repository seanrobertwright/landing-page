# Change: Add Main UI Layout and Components

## Why
The application currently has only the default Next.js starter page. We need to establish the core three-panel layout (header, sidebar, content area) that will serve as the foundation for the link collection organizer. This includes branding, navigation structure, and the compact link card component.

## What Changes
- Add application header with logo (`app/hw2.jpg`) and app name "LRIL Landing Page"
- Create resizable left sidebar for folder tree navigation with horizontal scroll on text overflow
- Create main content area for displaying link cards in a grid
- Adapt React Bits ProfileCard to a compact "LinkCard" variant for bookmark display
- Implement vibrant red and neon accent colors on dark background theme
- Add editable link title functionality (click to edit)

## Impact
- Affected specs: `main-ui` (new capability)
- Affected code:
  - `app/layout.tsx` - Root layout with three-panel structure
  - `app/page.tsx` - Main page content
  - `app/globals.css` - Theme colors (red/neon accents on dark)
  - `components/layout/Header.tsx` - Header with logo and app name
  - `components/layout/Sidebar.tsx` - Resizable folder navigation
  - `components/layout/ContentArea.tsx` - Link cards grid container
  - `components/links/LinkCard.tsx` - Compact card adapted from ProfileCard
  - `store/uiStore.ts` - Sidebar width state (Zustand)
