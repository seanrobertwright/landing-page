# Tasks: Add Create Actions for Folders and Links

## 1. Install shadcn/ui Components
- [ ] 1.1 Install shadcn Button component (`npx shadcn@latest add button`)
- [ ] 1.2 Install shadcn Dialog component (`npx shadcn@latest add dialog`)
- [ ] 1.3 Install shadcn Input component (`npx shadcn@latest add input`)
- [ ] 1.4 Install shadcn Label component (`npx shadcn@latest add label`)
- [ ] 1.5 Install shadcn Select component (`npx shadcn@latest add select`)

## 2. Create Utility Functions
- [ ] 2.1 Create `lib/utils/getFaviconUrl.ts` - Extract favicon URL logic from LinkCard
- [ ] 2.2 Create `lib/utils/buildFolderOptions.ts` - Flatten tree for parent folder dropdown

## 3. Update State Management
- [ ] 3.1 Add `createFolder` action to `store/folderStore.ts`
- [ ] 3.2 Add `createLink` action to `store/folderStore.ts`
- [ ] 3.3 Add dialog state management (open/close) to store or local component state

## 4. Create Dialog Components
- [ ] 4.1 Create `components/dialogs/CreateFolderDialog.tsx` - Folder creation modal
  - [ ] 4.1.1 Folder name input field with validation
  - [ ] 4.1.2 Parent folder dropdown (select component)
  - [ ] 4.1.3 Create and Cancel buttons
  - [ ] 4.1.4 Error message display
  - [ ] 4.1.5 Form submission handler with Zod validation
- [ ] 4.2 Create `components/dialogs/CreateLinkDialog.tsx` - Link creation modal
  - [ ] 4.2.1 Link title input field with validation
  - [ ] 4.2.2 URL input field with validation
  - [ ] 4.2.3 Target folder display (read-only)
  - [ ] 4.2.4 Create and Cancel buttons
  - [ ] 4.2.5 Error message display
  - [ ] 4.2.6 Form submission handler with Zod validation

## 5. Update Layout Components
- [ ] 5.1 Update `components/layout/Sidebar.tsx`
  - [ ] 5.1.1 Add "New Folder" button to header
  - [ ] 5.1.2 Wire up button to open CreateFolderDialog
  - [ ] 5.1.3 Style button to match dark theme with neon accents
- [ ] 5.2 Update `components/layout/ContentArea.tsx`
  - [ ] 5.2.1 Add header section if not present
  - [ ] 5.2.2 Add "New Link" button to header
  - [ ] 5.2.3 Disable button when no folder is selected
  - [ ] 5.2.4 Wire up button to open CreateLinkDialog
  - [ ] 5.2.5 Style button to match dark theme

## 6. Update Page Integration
- [ ] 6.1 Update `app/page.tsx`
  - [ ] 6.1.1 Add state for CreateFolderDialog open/closed
  - [ ] 6.1.2 Add state for CreateLinkDialog open/closed
  - [ ] 6.1.3 Pass dialog state and handlers to Sidebar and ContentArea
  - [ ] 6.1.4 Add dialog components to page with proper state management
  - [ ] 6.1.5 Trigger link refresh after successful link creation

## 7. Testing
- [ ] 7.1 Add unit tests for `buildFolderOptions` utility
- [ ] 7.2 Add component tests for CreateFolderDialog
  - [ ] 7.2.1 Test folder name validation
  - [ ] 7.2.2 Test parent folder selection
  - [ ] 7.2.3 Test form submission
  - [ ] 7.2.4 Test cancel behavior
- [ ] 7.3 Add component tests for CreateLinkDialog
  - [ ] 7.3.1 Test link title validation
  - [ ] 7.3.2 Test URL validation
  - [ ] 7.3.3 Test form submission
  - [ ] 7.3.4 Test cancel behavior
- [ ] 7.4 Add integration tests for folder creation flow
- [ ] 7.5 Add integration tests for link creation flow

## 8. Styling and Polish
- [ ] 8.1 Ensure dialogs match dark theme (slate background, cyan/purple accents)
- [ ] 8.2 Add focus styles for accessibility
- [ ] 8.3 Add hover states for buttons
- [ ] 8.4 Test keyboard navigation (Tab, Shift+Tab, ESC, Enter)
- [ ] 8.5 Add loading states for async operations
- [ ] 8.6 Add data-testid attributes for testing

## 9. Documentation
- [ ] 9.1 Update README with instructions for creating folders and links
- [ ] 9.2 Add JSDoc comments to utility functions
- [ ] 9.3 Add comments explaining dialog state management

## 10. Verification
- [ ] 10.1 Verify folder creation at root level works
- [ ] 10.2 Verify folder creation as child of existing folder works
- [ ] 10.3 Verify link creation in selected folder works
- [ ] 10.4 Verify "New Link" button is disabled when no folder selected
- [ ] 10.5 Verify validation errors display correctly
- [ ] 10.6 Verify tree refreshes after folder creation
- [ ] 10.7 Verify content area refreshes after link creation
- [ ] 10.8 Verify favicon auto-fetch works for new links
- [ ] 10.9 Verify keyboard navigation works in dialogs
- [ ] 10.10 Run `npm run build` to ensure no build errors
