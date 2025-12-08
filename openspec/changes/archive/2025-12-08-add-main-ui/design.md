## Context
This is the foundational UI implementation for the LRIL Landing Page application. The layout must support future features (folder tree, context menus, search) while keeping the initial implementation minimal. The user wants a dark theme with vibrant red and neon accent colors.

## Goals / Non-Goals
- **Goals:**
  - Establish three-panel layout (header, sidebar, content)
  - Create resizable sidebar with horizontal scroll for overflow
  - Adapt ProfileCard to compact LinkCard for bookmark display
  - Implement dark theme with red/neon accents
  - Support editable link titles (click to edit)

- **Non-Goals:**
  - Folder tree implementation (future change)
  - Context menu functionality (future change)
  - Database integration (future change)
  - Search functionality (future change)

## Decisions

### Layout Structure
- **Decision:** Use CSS Grid for the main layout with fixed header height, flexible sidebar width, and fluid content area
- **Rationale:** CSS Grid provides clean control over the three-panel layout without complex nesting. The sidebar width will be controlled via CSS custom property updated by Zustand state.

### Sidebar Resizing
- **Decision:** Implement drag-to-resize with a visible handle on the sidebar's right edge. Store width in Zustand for persistence.
- **Alternatives considered:**
  - CSS `resize` property - Limited styling control, inconsistent browser behavior
  - Third-party library (react-resizable-panels) - Overkill for single resizable panel
- **Rationale:** Custom implementation is minimal (~50 lines) and provides full control over UX.

### Sidebar Overflow
- **Decision:** Apply `overflow-x: auto` to sidebar content area, allowing horizontal scroll when folder names exceed container width.
- **Rationale:** Matches user requirement. Text will not be truncated; users can scroll to see full folder names.

### LinkCard Component
- **Decision:** Create a compact variant of ProfileCard with:
  - Smaller dimensions (~200x120px vs original ~540px height)
  - Favicon display from URL (with fallback to generic icon)
  - Editable title on click (inline contentEditable or input)
  - Simplified styling (remove tilt effects for performance with many cards)
  - Click on card body opens link in new tab
- **Alternatives considered:**
  - Keep full ProfileCard with tilt - Too large, performance concern with many items
  - Build from scratch - Loses visual consistency with React Bits aesthetic
- **Rationale:** Adapting ProfileCard preserves the design language while optimizing for the use case.

### Editable Title
- **Decision:** Use controlled input that appears on title click, saves on blur or Enter key.
- **Rationale:** Simple, accessible pattern. No need for complex inline editing library.

### Color Theme
- **Decision:** Dark background (`--background: oklch(0.12 0.01 285)`) with:
  - Primary accent: Vibrant red (`oklch(0.65 0.25 25)`)
  - Secondary accents: Neon cyan (`oklch(0.75 0.15 195)`), neon magenta (`oklch(0.7 0.2 320)`)
  - Use accents for interactive elements, hover states, and highlights
- **Rationale:** Maintains readability on dark background while providing vibrant, developer-friendly aesthetic.

### Logo Placement
- **Decision:** Logo in header, positioned in top-right corner. App name "LRIL Landing Page" to the left of the logo.
- **Rationale:** Matches user specification. Right-aligned branding leaves left side for future search/actions.

## Component Hierarchy
```
RootLayout
├── Header
│   ├── AppName ("LRIL Landing Page")
│   └── Logo (hw2.jpg)
├── Sidebar (resizable)
│   ├── ResizeHandle
│   └── FolderTree (placeholder for future)
└── ContentArea
    └── LinkCardsGrid
        └── LinkCard[] (compact ProfileCard variant)
```

## State Management (Zustand)
```typescript
// store/uiStore.ts
interface UIState {
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
}
```

## Risks / Trade-offs
- **Risk:** ProfileCard CSS may conflict with shadcn/ui styles
  - **Mitigation:** Scope ProfileCard styles with unique prefix, adjust as needed
- **Risk:** Favicon fetching may fail for some URLs
  - **Mitigation:** Use Google's favicon service as fallback, then generic icon

## Open Questions
- None - all requirements clarified with user
