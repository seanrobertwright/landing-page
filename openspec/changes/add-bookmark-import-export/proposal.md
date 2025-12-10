# Proposal: Add Bookmark Import/Export

## Change ID
`add-bookmark-import-export`

## Why
Users currently cannot migrate their existing browser bookmarks into the application, forcing them to manually recreate their entire bookmark collection. Additionally, there's no way to backup or transfer bookmarks between installations, creating a risk of data loss and preventing users from trying the application without committing to manual data entry. This is a critical barrier to adoption.

## Summary
Add browser bookmark import functionality supporting Netscape HTML format (Chrome, Firefox, Edge, Safari) and JSON export/import for backup/restore, enabling seamless migration and data portability.

## What Changes

### New API Endpoints
- **POST /api/bookmarks/import**: Accepts HTML files in Netscape bookmark format, parses them, validates data, and imports bookmarks with folder hierarchy preservation
- **GET /api/bookmarks/export**: Exports all bookmarks and folders to JSON format with metadata

### New Components
- **Import/Export Buttons**: Added to header with keyboard shortcuts (Ctrl/Cmd+I for import, Ctrl/Cmd+E for export)
- **ImportBookmarksDialog**: Modal dialog for uploading HTML bookmark files with progress indicator and import summary
- **Toast Notifications**: Success/error feedback for import/export operations

### New Utilities
- **HTML Parser** (`lib/parsers/netscape-bookmarks.ts`): Parses Netscape HTML bookmark format from all major browsers
- **JSON Export Generator** (`lib/exporters/json-bookmarks.ts`): Generates structured JSON exports with metadata
- **Import Validation** (`lib/validations/bookmark-import.ts`): Zod schemas for validating imported data
- **Batch Import Operations** (`lib/db/bookmark-import.ts`): Transaction-based database operations for bulk imports

### Database Changes
- No schema changes required (uses existing folders and links tables)
- Added batch insert operations with transaction support
- Added duplicate detection by URL

### User Experience Changes
- Import button in header opens file picker for HTML bookmark files
- Export button in header downloads JSON file with timestamp
- Progress indicator shows during large imports
- Import summary displays folders/links added and duplicates skipped
- Keyboard shortcuts for quick access

## Motivation
Currently:
- Users must manually recreate all bookmarks from their browsers
- No way to backup bookmarks for disaster recovery
- Cannot transfer bookmarks between installations or devices
- New users face a high barrier to adoption (empty state problem)
- Existing users risk data loss with no export mechanism

This change will:
- Enable one-click import from all major browsers (Chrome, Firefox, Edge, Safari)
- Provide backup/restore functionality via JSON export
- Preserve folder hierarchy during import
- Allow users to try the application with real data immediately
- Reduce onboarding friction from hours to seconds

## Goals
- Import bookmarks from Netscape HTML format (universal browser export format)
- Export bookmarks to JSON format for backup/restore
- Preserve folder hierarchy and nested structure during import
- Handle duplicate URLs gracefully (skip or update based on user preference)
- Provide progress feedback for large imports (1000+ bookmarks)
- Validate imported data and report errors clearly

## Non-Goals
- Direct browser integration (reading browser databases) - security and compatibility concerns
- Real-time sync with browsers - this is an import tool, not a sync service
- Favicon import during bulk import - too slow, will be fetched on-demand later
- Import from proprietary formats (only standard Netscape HTML)
- Merge conflict resolution UI - first iteration uses simple skip/overwrite strategy

## Affected Components
- **Import Parser**: New utility to parse Netscape HTML bookmark format
- **Export Generator**: New utility to generate JSON backup format
- **API Routes**: New endpoints for `/api/bookmarks/import` and `/api/bookmarks/export`
- **UI Components**: New import/export dialog in header or settings
- **Database Operations**: Batch insert operations for performance
- **Validation**: Zod schemas for import data validation

## User Impact
**Positive**:
- Can migrate existing bookmarks from browsers in seconds
- Data is safe with export/backup functionality
- Onboarding time reduced from hours to minutes
- Can try the app with real data immediately

**Neutral**:
- Need to export bookmarks from browser first (one-time step)
- Import is one-way (not continuous sync)

**Negative**:
- Large imports (5000+ bookmarks) may take 30-60 seconds
- Duplicate handling may require user decisions

## Implementation Approach
1. **Phase 1: Import Foundation**
   - Create Netscape HTML parser utility
   - Add validation for bookmark structure
   - Implement batch database insertion
   - Add import API endpoint with progress tracking

2. **Phase 2: Export Functionality**
   - Create JSON export generator
   - Add export API endpoint
   - Include metadata (export date, version)

3. **Phase 3: UI Integration**
   - Add import/export buttons to header or settings
   - Create import dialog with file upload
   - Add progress indicator for large imports
   - Show import summary (added X folders, Y links, Z skipped)

4. **Phase 4: Error Handling**
   - Validate file format before processing
   - Handle malformed HTML gracefully
   - Report parsing errors with line numbers
   - Rollback on critical failures

## Testing Strategy
- **Unit Tests**:
  - HTML parser with various browser exports
  - JSON export generator
  - Duplicate detection logic
  - Validation schemas
- **Integration Tests**:
  - End-to-end import from real browser export files
  - Export then re-import (round-trip test)
  - Large file handling (5000+ bookmarks)
- **E2E Tests**:
  - Full import flow via UI
  - Export download and verification
  - Error handling UI
- **Manual Testing**:
  - Import from Chrome, Firefox, Edge, Safari
  - Verify folder hierarchy preservation
  - Check unicode/special characters

## Risks and Mitigations
**Risk**: Malformed HTML from browsers crashes the parser
**Mitigation**: Robust error handling, validation before processing, detailed error messages

**Risk**: Large imports (10,000+ bookmarks) cause UI freeze
**Mitigation**: Process imports server-side, streaming progress updates, batch operations

**Risk**: Duplicate URLs create database conflicts
**Mitigation**: Skip duplicates by default, optionally update timestamps, report in summary

**Risk**: Circular folder references in malformed exports
**Mitigation**: Track parent chain during import, reject circular references, flatten if needed

**Risk**: Memory issues with very large exports
**Mitigation**: Stream processing for large files, limit to 50MB, chunked database writes

## Dependencies
- No external libraries required (use Node.js built-in HTML parsing or cheerio if needed)
- Existing database utilities (`folders.ts`, `links.ts`)
- Existing validation patterns (Zod)
- File upload handling (Next.js built-in with FormData)

## Success Criteria
- [x] Can import Chrome HTML bookmark export successfully
- [x] Can import Firefox HTML bookmark export successfully
- [x] Folder hierarchy is preserved during import
- [x] Duplicate URLs are handled gracefully (no crashes)
- [x] Can export all bookmarks to JSON format
- [x] Can re-import exported JSON (round-trip works)
- [x] Progress indicator shows for imports >100 bookmarks
- [x] Import summary shows folders/links added and skipped
- [x] Handles 5000+ bookmarks without errors
- [x] All tests pass (100%)
- [x] Build succeeds with zero errors
