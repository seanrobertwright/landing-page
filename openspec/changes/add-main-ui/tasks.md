## 1. Theme and Styling Setup
- [x] 1.1 Update `app/globals.css` with dark theme and red/neon accent color variables
- [x] 1.2 Verify color contrast meets accessibility standards

## 2. Layout Components
- [x] 2.1 Create `components/layout/Header.tsx` with logo and app name
- [x] 2.2 Create `components/layout/Sidebar.tsx` with resize handle and horizontal scroll
- [x] 2.3 Create `components/layout/ContentArea.tsx` as grid container for cards
- [x] 2.4 Update `app/layout.tsx` with three-panel CSS Grid structure

## 3. State Management
- [x] 3.1 Install Zustand dependency (`npm install zustand`)
- [x] 3.2 Create `store/uiStore.ts` with sidebar width state

## 4. Link Card Component
- [x] 4.1 Created custom `components/links/LinkCard.tsx` (compact card inspired by ProfileCard design)
- [x] 4.2 Implemented editable title with click-to-edit functionality
- [x] 4.3 Implemented favicon display using Google's favicon service with fallback to Lucide icon
- [x] 4.4 Styled LinkCard to match dark theme with accent colors

## 5. Main Page Integration
- [x] 5.1 Update `app/page.tsx` to render layout with sample link cards
- [x] 5.2 Add placeholder content in sidebar for future folder tree

## 6. Testing
- [x] 6.1 Add unit tests for `uiStore` (Vitest) - 5 tests passing
- [x] 6.2 Add component tests for LinkCard editable title behavior - 8 tests passing
- [x] 6.3 Add E2E test for sidebar resize functionality (Playwright)
- [x] 6.4 Add E2E test for link card click-to-edit flow

## 7. Verification
- [x] 7.1 Verify three-panel layout renders correctly at various viewport sizes
- [x] 7.2 Verify sidebar resizes within min/max constraints
- [x] 7.3 Verify horizontal scroll appears for long sidebar content
- [x] 7.4 Verify link cards display favicon and editable title
- [x] 7.5 Run `npm run build` to ensure no build errors
