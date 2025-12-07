# Tasks: Add Create Actions for Folders and Links

## 1. Install shadcn/ui Components
- [x] 1.1 Install shadcn Button component (`npx shadcn@latest add button`)
- [x] 1.2 Install shadcn Dialog component (`npx shadcn@latest add dialog`)
- [x] 1.3 Install shadcn Input component (`npx shadcn@latest add input`)
- [x] 1.4 Install shadcn Label component (`npx shadcn@latest add label`)
- [x] 1.5 Install shadcn Select component (`npx shadcn@latest add select`)

## 2. Create Utility Functions
- [x] 2.1 Create `lib/utils/getFaviconUrl.ts` - Extract favicon URL logic from LinkCard
- [x] 2.2 Create `lib/utils/buildFolderOptions.ts` - Flatten tree for parent folder dropdown

## 3. Update State Management
- [x] 3.1 Add `createFolder` action to `store/folderStore.ts`
- [x] 3.2 Add `createLink` action to `store/folderStore.ts`
- [x] 3.3 Add dialog state management (open/close) to store or local component state

## 4. Create Dialog Components
- [x] 4.1 Create `components/dialogs/CreateFolderDialog.tsx` - Folder creation modal
  - [x] 4.1.1 Folder name input field with validation
  - [x] 4.1.2 Parent folder dropdown (select component)
  - [x] 4.1.3 Create and Cancel buttons
  - [x] 4.1.4 Error message display
  - [x] 4.1.5 Form submission handler with Zod validation
- [x] 4.2 Create `components/dialogs/CreateLinkDialog.tsx` - Link creation modal
  - [x] 4.2.1 Link title input field with validation
  - [x] 4.2.2 URL input field with validation
  - [x] 4.2.3 Target folder display (read-only)
  - [x] 4.2.4 Create and Cancel buttons
  - [x] 4.2.5 Error message display
  - [x] 4.2.6 Form submission handler with Zod validation

## 5. Update Layout Components
- [x] 5.1 Update `components/tree/FolderTree.tsx` (updated instead of Sidebar.tsx)
  - [x] 5.1.1 Add "New Folder" button to header
  - [x] 5.1.2 Wire up button to open CreateFolderDialog
  - [x] 5.1.3 Style button to match dark theme with neon accents
- [x] 5.2 Update `components/layout/ContentArea.tsx`
  - [x] 5.2.1 Add header section if not present
  - [x] 5.2.2 Add "New Link" button to header
  - [x] 5.2.3 Disable button when no folder is selected
  - [x] 5.2.4 Wire up button to open CreateLinkDialog
  - [x] 5.2.5 Style button to match dark theme

## 6. Update Page Integration
- [x] 6.1 Update `app/page.tsx`
  - [x] 6.1.1 Add state for CreateFolderDialog open/closed
  - [x] 6.1.2 Add state for CreateLinkDialog open/closed
  - [x] 6.1.3 Pass dialog state and handlers to Sidebar and ContentArea
  - [x] 6.1.4 Add dialog components to page with proper state management
  - [x] 6.1.5 Trigger link refresh after successful link creation

## 7. Testing
- [x] 7.1 Add unit tests for `buildFolderOptions` utility
- [x] 7.2 Add component tests for CreateFolderDialog
  - [x] 7.2.1 Test folder name validation
  - [x] 7.2.2 Test parent folder selection
  - [x] 7.2.3 Test form submission
  - [x] 7.2.4 Test cancel behavior
- [x] 7.3 Add component tests for CreateLinkDialog
  - [x] 7.3.1 Test link title validation
  - [x] 7.3.2 Test URL validation
  - [x] 7.3.3 Test form submission
  - [x] 7.3.4 Test cancel behavior
- [x] 7.4 Add integration tests for folder creation flow
- [x] 7.5 Add integration tests for link creation flow

## 8. Styling and Polish
- [x] 8.1 Ensure dialogs match dark theme (slate background, cyan/purple accents)
- [x] 8.2 Add focus styles for accessibility
- [x] 8.3 Add hover states for buttons
- [x] 8.4 Test keyboard navigation (Tab, Shift+Tab, ESC, Enter)
- [x] 8.5 Add loading states for async operations
- [x] 8.6 Add data-testid attributes for testing

## 9. Documentation
- [x] 9.1 Update README with instructions for creating folders and links (skipped per CLAUDE.md - no proactive documentation)
- [x] 9.2 Add JSDoc comments to utility functions
- [x] 9.3 Add comments explaining dialog state management (inline comments in components)

## 10. Verification
- [x] 10.1 Verify folder creation at root level works
- [x] 10.2 Verify folder creation as child of existing folder works
- [x] 10.3 Verify link creation in selected folder works
- [x] 10.4 Verify "New Link" button is disabled when no folder selected
- [x] 10.5 Verify validation errors display correctly
- [x] 10.6 Verify tree refreshes after folder creation
- [x] 10.7 Verify content area refreshes after link creation
- [x] 10.8 Verify favicon auto-fetch works for new links
- [x] 10.9 Verify keyboard navigation works in dialogs
- [x] 10.10 Run `npm run build` to ensure no build errors
