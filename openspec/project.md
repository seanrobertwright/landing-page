# Project Context

## Purpose
A developer-centric link collection organizer - a local bookmarking application that organizes favorite websites using cards within a hierarchical folder structure.

### Goals
- Provide a clean, intuitive interface for organizing links
- Support nested folders for hierarchical organization
- Enable right-click context menus for creating links and folders
- Allow import from major browsers and export for backup/restore
- Run locally without external dependencies (suitable for local AI installations)
- Be containerizable via Docker

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **UI Library**: ShadCN (React 19)
- **Styling**: Tailwind CSS v4
- **Component Library**: shadcn/ui (new-york style, zinc base color)
- **Icons**: Lucide React
- **Card Component**: React Bits ProfileCard (`npx shadcn@latest add @react-bits/ProfileCard-TS-CSS`) use docs\React Bits - Profile Card Component.md as a reference with exmples.
- **State Management**: Zustand
- **Form Validation**: Zod
- **Database**: SQLite (via better-sqlite3)
- **Testing**: Vitest (unit/integration), Playwright (e2e)
- **Containerization**: Docker (standard Node image)

## Project Conventions

### Code Style
- **Component files**: PascalCase (e.g., `LinkCard.tsx`, `FolderTree.tsx`)
- **Utility files**: camelCase (e.g., `formatUrl.ts`)
- **Functions**: Arrow functions preferred for components and callbacks
- **Imports**: Group by external, internal (@/), then relative; alphabetize within groups
- **TypeScript**: Strict mode enabled; prefer explicit types for function parameters and return values

### Architecture Patterns
- **Server Components**: Use by default for static content and data fetching
- **Client Components**: Use only when necessary (interactivity, browser APIs, Zustand state)
- **File Structure**:
  ```
  app/                    # Next.js App Router pages and layouts
  components/
    ui/                   # shadcn/ui components
    [feature]/            # Feature-specific components
  lib/
    db/                   # SQLite database utilities
    utils.ts              # General utilities (cn, etc.)
    validations/          # Zod schemas
  hooks/                  # Custom React hooks
  store/                  # Zustand stores
  ```
- **Layout**: Three-panel layout
  - Header (top): App title, search, global actions
  - Sidebar (left): Folder navigation tree
  - Content (right): Link cards grid for selected folder
- **Context Menus**: Right-click for creating new links and folders

### Testing Strategy
- **Unit Tests** (Vitest): Test individual utilities, Zod schemas, Zustand stores
- **Integration Tests** (Vitest): Test component interactions, database operations
- **E2E Tests** (Playwright): Test full user flows (creating folders, adding links, import/export)
- **Test Location**: Co-locate unit tests with source (`*.test.ts`), e2e tests in `/tests/e2e/`

### Quality Standards

All implementations must meet these standards before marking tasks as complete:

**Required Verification (No Exceptions):**
- ✅ **Test Coverage**: 100% of tests passing (not 99%, not "most tests")
  - Run: `npm test`
  - Required: All tests pass, zero failures
  - No dismissing "minor" or "timing-related" failures

- ✅ **Build**: Zero errors, zero warnings
  - Run: `npm run build`
  - Required: Clean production build
  - TypeScript must compile without errors

- ✅ **Type Safety**: Strict TypeScript compliance
  - Strict mode enabled (tsconfig.json)
  - Zero type errors (`tsc --noEmit`)
  - Explicit types for function parameters and returns

- ✅ **Manual Testing**: Core functionality verified
  - Critical user paths tested in browser
  - No console errors during normal operation
  - UI renders correctly, interactions work

- ✅ **No Regressions**: Existing features continue to work
  - Previously working features still function
  - No breaking changes to existing APIs
  - Database migrations backward compatible (when applicable)

**Completion Definition:**
A task is complete ONLY when:
1. Code is written and implements the requirement
2. ALL tests pass (100%, no exceptions)
3. Build succeeds with zero errors
4. TypeScript compilation passes with no errors
5. Manual testing confirms functionality works
6. No regressions in existing features

**Red Flags - Never Accept These:**
- ❌ "Most tests pass" → All tests must pass
- ❌ "Build works but tests fail" → Tests must pass
- ❌ "Minor timing issues" → Investigate and fix
- ❌ "Probably not important" → Every failure matters
- ❌ "Will fix later" → Fix now, before claiming complete

Partial completion is not completion. If verification fails, the work is not done.

### Git Workflow
- **Branching**: Feature branches off `main`
  - Format: `feature/description`, `fix/description`, `chore/description`
- **Commits**: Conventional Commits format
  - `feat:` new features
  - `fix:` bug fixes
  - `docs:` documentation
  - `style:` formatting (no code change)
  - `refactor:` code restructuring
  - `test:` adding/updating tests
  - `chore:` maintenance tasks
- **PRs**: Merge feature branches to `main` via pull request

## Domain Context

### Core Entities
- **Link**: A bookmark with name, URL, and icon
- **Folder**: A container that can hold links and other folders (unlimited nesting depth, but keep reasonable)
- **Root**: The top-level container; all folders and links exist within this hierarchy

### Key Features
- **Folder Tree Navigation**: Expandable/collapsible tree in sidebar
- **Link Cards**: Display link name, URL, and icon using React Bits ProfileCard component
- **Context Menus**: Right-click to create new links or folders
- **Search**: Filter links and folders across the entire collection
- **Import**: Support importing bookmarks from Chrome, Firefox, Safari, Edge
- **Export**: Backup entire collection as importable format (JSON)

## Important Constraints
- **Local Only**: No external API calls, authentication, or cloud services
- **Offline Capable**: Must function without internet (except for fetching favicons on link creation)
- **SQLite**: Single-file database for easy backup and portability
- **Docker Ready**: Application must be containerizable with standard Node image

## External Dependencies
- **None** - This is a fully local application
- Future consideration: Optional favicon fetching service for link icons (graceful degradation if unavailable)
