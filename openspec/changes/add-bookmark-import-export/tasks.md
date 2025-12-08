# Tasks: Add Bookmark Import/Export

## 1. HTML Parser Utility
- [x] 1.1 Create `lib/parsers/netscape-bookmarks.ts` for HTML parsing
- [x] 1.2 Implement folder extraction from `<H3>` tags
- [x] 1.3 Implement bookmark extraction from `<A>` tags with HREF
- [x] 1.4 Build hierarchical tree structure from nested `<DL>` tags
- [x] 1.5 Handle special characters and HTML entities in titles
- [ ] 1.6 Add unit tests with Chrome, Firefox, Edge, Safari export samples

## 2. Import Validation
- [x] 2.1 Create `lib/validations/bookmark-import.ts` with Zod schemas
- [x] 2.2 Add URL format validation (http/https protocols)
- [x] 2.3 Add folder name validation (length, special characters)
- [x] 2.4 Implement circular reference detection algorithm
- [x] 2.5 Add file size validation (<50MB)
- [ ] 2.6 Add unit tests for validation functions

## 3. Database Import Operations
- [x] 3.1 Create `lib/db/bookmark-import.ts` for batch operations
- [x] 3.2 Implement transaction-based folder insertion
- [x] 3.3 Implement transaction-based link insertion
- [x] 3.4 Add duplicate URL detection by querying existing links
- [x] 3.5 Implement duplicate handling strategies (skip, update)
- [x] 3.6 Add rollback on error with proper cleanup
- [ ] 3.7 Add integration tests with transaction rollback scenarios

## 4. Import API Endpoint
- [x] 4.1 Create `app/api/bookmarks/import/route.ts` POST handler
- [x] 4.2 Handle multipart/form-data file upload
- [x] 4.3 Validate file type and size before processing
- [x] 4.4 Call parser to extract bookmark tree
- [x] 4.5 Call validator to check data integrity
- [x] 4.6 Call import function with transaction
- [x] 4.7 Return import summary (added, skipped, errors)
- [x] 4.8 Add error handling for malformed files
- [ ] 4.9 Add integration tests for API endpoint

## 5. Export JSON Generator
- [x] 5.1 Create `lib/exporters/json-bookmarks.ts` for export
- [x] 5.2 Query all folders with hierarchy from database
- [x] 5.3 Query all links with folder associations
- [x] 5.4 Build JSON structure with metadata (version, timestamp)
- [ ] 5.5 Add streaming support for large exports (>5000 bookmarks)
- [ ] 5.6 Add unit tests with various database states

## 6. Export API Endpoint
- [x] 6.1 Create `app/api/bookmarks/export/route.ts` GET handler
- [x] 6.2 Call export generator to create JSON
- [x] 6.3 Set Content-Type to application/json
- [x] 6.4 Set Content-Disposition with filename including date
- [ ] 6.5 Stream response for large exports
- [x] 6.6 Add error handling for database query failures
- [ ] 6.7 Add integration tests for export API

## 7. Import UI Component
- [x] 7.1 Create `components/dialogs/ImportBookmarksDialog.tsx`
- [x] 7.2 Add file input with .html accept filter
- [x] 7.3 Add duplicate strategy selector (skip/update radio buttons)
- [x] 7.4 Implement file upload with FormData
- [ ] 7.5 Add progress indicator for large imports
- [x] 7.6 Display import summary after completion
- [x] 7.7 Add error message display for failed imports
- [ ] 7.8 Add unit tests for component

## 8. Export UI Component
- [x] 8.1 Add "Export Bookmarks" button to header
- [x] 8.2 Implement export download trigger
- [x] 8.3 Add loading state during export generation
- [ ] 8.4 Add success toast notification after download
- [x] 8.5 Add error handling for export failures
- [ ] 8.6 Add unit tests for export button

## 9. Integration with Main UI
- [x] 9.1 Add "Import" button to header
- [x] 9.2 Wire Import button to open ImportDialog
- [x] 9.3 Add "Export" button to header
- [x] 9.4 Refresh folder tree after successful import
- [ ] 9.5 Add keyboard shortcut hints (optional)

## 10. Progress Tracking
- [ ] 10.1 Implement progress reporting in import function
- [ ] 10.2 Update progress every 100 bookmarks processed
- [ ] 10.3 Send progress via streaming response or polling
- [ ] 10.4 Update UI progress bar with percentage
- [ ] 10.5 Add estimated time remaining (optional)

## 11. Test Fixtures
- [ ] 11.1 Create `tests/fixtures/bookmarks/chrome-export.html`
- [ ] 11.2 Create `tests/fixtures/bookmarks/firefox-export.html`
- [ ] 11.3 Create `tests/fixtures/bookmarks/edge-export.html`
- [ ] 11.4 Create `tests/fixtures/bookmarks/safari-export.html`
- [ ] 11.5 Create `tests/fixtures/bookmarks/large-export-5000.html`
- [ ] 11.6 Create `tests/fixtures/bookmarks/malformed-export.html`
- [ ] 11.7 Create `tests/fixtures/bookmarks/circular-refs.html`

## 12. E2E Testing
- [ ] 12.1 Add E2E test for full import flow from UI
- [ ] 12.2 Add E2E test for export download
- [ ] 12.3 Add E2E test for round-trip (export then import)
- [ ] 12.4 Add E2E test for duplicate handling
- [ ] 12.5 Add E2E test for error scenarios (invalid file)
- [ ] 12.6 Add E2E test for progress indicator display

## 13. Error Handling & Edge Cases
- [x] 13.1 Handle empty HTML files gracefully
- [x] 13.2 Handle files with no bookmarks (only folders)
- [x] 13.3 Handle Unicode characters in bookmark titles
- [ ] 13.4 Handle very long URLs (>2048 characters)
- [x] 13.5 Handle bookmarks without titles
- [x] 13.6 Handle malformed HTML with missing tags
- [x] 13.7 Add user-friendly error messages for all scenarios

## 14. Performance Optimization
- [ ] 14.1 Benchmark import with 1000 bookmarks (<5 seconds)
- [ ] 14.2 Benchmark import with 5000 bookmarks (<20 seconds)
- [x] 14.3 Optimize batch insert with prepared statements
- [ ] 14.4 Add database indexes if needed for duplicate detection
- [ ] 14.5 Profile memory usage with large imports
- [ ] 14.6 Stream large files instead of loading into memory

## 15. Documentation
- [ ] 15.1 Add import/export instructions to README or help page
- [ ] 15.2 Document supported browsers and export process
- [ ] 15.3 Add screenshots of import/export dialogs
- [ ] 15.4 Document JSON export format for developers
- [ ] 15.5 Add troubleshooting guide for common issues

## 16. Verification
- [ ] 16.1 Verify Chrome bookmark import preserves hierarchy
- [ ] 16.2 Verify Firefox bookmark import works correctly
- [ ] 16.3 Verify Edge bookmark import works correctly
- [ ] 16.4 Verify Safari bookmark import works correctly
- [ ] 16.5 Verify export → import round-trip maintains data
- [ ] 16.6 Verify duplicate handling works as expected
- [ ] 16.7 Verify progress indicator shows for large imports
- [ ] 16.8 Verify error messages are clear and helpful
- [ ] 16.9 Verify 5000+ bookmarks import without errors
- [x] 16.10 Run `npm run build` to ensure no build errors
- [x] 16.11 Run `npm test` to ensure all tests pass (100%)
