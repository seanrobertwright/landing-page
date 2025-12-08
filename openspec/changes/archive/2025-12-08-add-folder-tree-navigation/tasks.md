## 1. Database Setup
- [x] 1.1 Install better-sqlite3 dependency (`npm install better-sqlite3 @types/better-sqlite3`)
- [x] 1.2 Create `lib/db/index.ts` - database connection singleton
- [x] 1.3 Create `lib/db/schema.ts` - table creation and migrations
- [x] 1.4 Create `data/` directory with `.gitkeep` (database location)
- [x] 1.5 Add `data/*.db` to `.gitignore`

## 2. Database Operations
- [x] 2.1 Create `lib/db/folders.ts` - folder CRUD functions
- [x] 2.2 Create `lib/db/links.ts` - link CRUD functions
- [x] 2.3 Create `lib/db/tree.ts` - build nested tree structure from flat data
- [x] 2.4 Add unit tests for database operations

## 3. API Routes
- [x] 3.1 Create `app/api/folders/route.ts` - GET (list), POST (create)
- [x] 3.2 Create `app/api/folders/[id]/route.ts` - GET, PATCH, DELETE
- [x] 3.3 Create `app/api/links/route.ts` - GET (list), POST (create)
- [x] 3.4 Create `app/api/links/[id]/route.ts` - GET, PATCH, DELETE
- [x] 3.5 Create `app/api/tree/route.ts` - GET full tree structure
- [x] 3.6 Add integration tests for API routes

## 4. Zod Validation Schemas
- [x] 4.1 Create `lib/validations/folder.ts` - folder create/update schemas
- [x] 4.2 Create `lib/validations/link.ts` - link create/update schemas

## 5. State Management
- [x] 5.1 Create `store/folderStore.ts` - tree state, selection, expand/collapse
- [x] 5.2 Add unit tests for folderStore

## 6. Tree Components
- [x] 6.1 Create `components/tree/TreeNode.tsx` - recursive node component
- [x] 6.2 Create `components/tree/FolderTree.tsx` - tree container with data fetching
- [x] 6.3 Add `data-testid` attributes for testing
- [x] 6.4 Style tree to match dark theme with neon accents

## 7. Page Integration
- [x] 7.1 Update `app/page.tsx` - replace placeholder with FolderTree
- [x] 7.2 Connect ContentArea to show selected folder's links
- [x] 7.3 Remove hardcoded sample links

## 8. Testing
- [x] 8.1 Add component tests for TreeNode expand/collapse
- [x] 8.2 Add component tests for folder selection
- [x] 8.3 Add E2E tests for tree navigation flow
- [x] 8.4 Add E2E tests for link display in content area

## 9. Verification
- [x] 9.1 Verify tree renders with nested folders
- [x] 9.2 Verify expand/collapse works correctly
- [x] 9.3 Verify folder selection updates content area
- [x] 9.4 Verify clicking link in tree opens new tab
- [x] 9.5 Verify default "Bookmarks" folder created on first run
- [x] 9.6 Run `npm run build` to ensure no build errors
