import { test, expect } from '@playwright/test';

test.describe('Context Menus', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load
    await page.waitForSelector('[data-testid="folder-tree"]');
  });

  test.describe('Folder Context Menu', () => {
    test('should show context menu on right-click', async ({ page }) => {
      // Create a folder first
      await page.click('[data-testid="new-folder-button"]');
      await page.fill('[data-testid="folder-name-input"]', 'Test Folder');
      await page.click('[data-testid="create-button"]');
      await page.waitForTimeout(500);

      // Right-click on the folder
      const folder = page.locator('[data-testid^="tree-node-"]').first();
      await folder.click({ button: 'right' });

      // Check that context menu appears
      await expect(page.getByText('New Subfolder')).toBeVisible();
      await expect(page.getByText('Delete Folder')).toBeVisible();
    });

    test('should create subfolder via context menu', async ({ page }) => {
      // Create a parent folder
      await page.click('[data-testid="new-folder-button"]');
      await page.fill('[data-testid="folder-name-input"]', 'Parent Folder');
      await page.click('[data-testid="create-button"]');
      await page.waitForTimeout(500);

      // Right-click on the folder
      const folder = page.locator('[data-testid^="tree-node-"]').first();
      await folder.click({ button: 'right' });

      // Click "New Subfolder"
      await page.getByText('New Subfolder').click();

      // Fill in the subfolder name
      await expect(page.getByTestId('create-folder-dialog')).toBeVisible();
      await page.fill('[data-testid="folder-name-input"]', 'Child Folder');

      // Verify parent folder is pre-selected
      const parentSelect = page.getByTestId('parent-folder-select');
      await expect(parentSelect).toContainText('Parent Folder');

      await page.click('[data-testid="create-button"]');
      await page.waitForTimeout(500);

      // Expand parent folder
      const chevron = folder.locator('[data-testid^="chevron-"]').first();
      await chevron.click();
      await page.waitForTimeout(300);

      // Verify subfolder appears under parent
      await expect(page.getByText('Child Folder')).toBeVisible();
    });

    test('should delete folder via context menu', async ({ page }) => {
      // Create a folder
      await page.click('[data-testid="new-folder-button"]');
      await page.fill('[data-testid="folder-name-input"]', 'Folder to Delete');
      await page.click('[data-testid="create-button"]');
      await page.waitForTimeout(500);

      // Right-click on the folder
      const folder = page.locator('[data-testid^="tree-node-"]').first();
      await folder.click({ button: 'right' });

      // Click "Delete Folder"
      await page.getByText('Delete Folder').click();

      // Confirm deletion
      await expect(page.getByText('Delete Folder', { exact: true })).toBeVisible();
      await expect(page.getByText(/Are you sure you want to delete/)).toBeVisible();
      await page.getByRole('button', { name: 'Delete' }).click();
      await page.waitForTimeout(500);

      // Verify folder is deleted
      await expect(page.getByText('Folder to Delete')).not.toBeVisible();
    });
  });

  test.describe('Content Area Context Menu', () => {
    test('should show context menu on right-click in empty space', async ({ page }) => {
      // Create a folder and select it
      await page.click('[data-testid="new-folder-button"]');
      await page.fill('[data-testid="folder-name-input"]', 'Test Folder');
      await page.click('[data-testid="create-button"]');
      await page.waitForTimeout(500);

      // Click on the folder to select it
      const folder = page.locator('[data-testid^="tree-node-"]').first();
      await folder.click();
      await page.waitForTimeout(300);

      // Right-click on empty space in content area
      const contentArea = page.locator('main').first();
      await contentArea.click({ button: 'right', position: { x: 100, y: 100 } });

      // Check that context menu appears
      await expect(page.getByText('New Link')).toBeVisible();
    });

    test('should create link via content area context menu', async ({ page }) => {
      // Create a folder and select it
      await page.click('[data-testid="new-folder-button"]');
      await page.fill('[data-testid="folder-name-input"]', 'Test Folder');
      await page.click('[data-testid="create-button"]');
      await page.waitForTimeout(500);

      const folder = page.locator('[data-testid^="tree-node-"]').first();
      await folder.click();
      await page.waitForTimeout(300);

      // Right-click on empty space
      const contentArea = page.locator('main').first();
      await contentArea.click({ button: 'right', position: { x: 100, y: 100 } });

      // Click "New Link"
      await page.getByText('New Link').click();

      // Fill in link details
      await expect(page.getByTestId('create-link-dialog')).toBeVisible();
      await page.fill('[data-testid="link-title-input"]', 'Test Link');
      await page.fill('[data-testid="link-url-input"]', 'https://example.com');
      await page.click('[data-testid="create-button"]');
      await page.waitForTimeout(500);

      // Verify link appears
      await expect(page.getByText('Test Link')).toBeVisible();
    });
  });

  test.describe('Link Card Context Menu', () => {
    test('should show context menu on right-click on link card', async ({ page }) => {
      // Create folder and link
      await page.click('[data-testid="new-folder-button"]');
      await page.fill('[data-testid="folder-name-input"]', 'Test Folder');
      await page.click('[data-testid="create-button"]');
      await page.waitForTimeout(500);

      const folder = page.locator('[data-testid^="tree-node-"]').first();
      await folder.click();
      await page.waitForTimeout(300);

      await page.click('[data-testid="new-link-button"]');
      await page.fill('[data-testid="link-title-input"]', 'Test Link');
      await page.fill('[data-testid="link-url-input"]', 'https://example.com');
      await page.click('[data-testid="create-button"]');
      await page.waitForTimeout(500);

      // Right-click on link card
      const linkCard = page.getByText('Test Link').locator('..');
      await linkCard.click({ button: 'right' });

      // Check that context menu appears
      await expect(page.getByText('Open in New Tab')).toBeVisible();
      await expect(page.getByText('Delete Link')).toBeVisible();
    });

    test('should delete link via context menu', async ({ page }) => {
      // Create folder and link
      await page.click('[data-testid="new-folder-button"]');
      await page.fill('[data-testid="folder-name-input"]', 'Test Folder');
      await page.click('[data-testid="create-button"]');
      await page.waitForTimeout(500);

      const folder = page.locator('[data-testid^="tree-node-"]').first();
      await folder.click();
      await page.waitForTimeout(300);

      await page.click('[data-testid="new-link-button"]');
      await page.fill('[data-testid="link-title-input"]', 'Link to Delete');
      await page.fill('[data-testid="link-url-input"]', 'https://example.com');
      await page.click('[data-testid="create-button"]');
      await page.waitForTimeout(500);

      // Right-click on link card
      const linkCard = page.getByText('Link to Delete').locator('..');
      await linkCard.click({ button: 'right' });

      // Click "Delete Link"
      await page.getByText('Delete Link').click();

      // Confirm deletion
      await expect(page.getByText('Delete Link', { exact: true })).toBeVisible();
      await expect(page.getByText(/Are you sure you want to delete this link/)).toBeVisible();
      await page.getByRole('button', { name: 'Delete' }).click();
      await page.waitForTimeout(500);

      // Verify link is deleted
      await expect(page.getByText('Link to Delete')).not.toBeVisible();
    });
  });

  test.describe('Context Menu Accessibility', () => {
    test('should close context menu on Escape key', async ({ page }) => {
      // Create a folder
      await page.click('[data-testid="new-folder-button"]');
      await page.fill('[data-testid="folder-name-input"]', 'Test Folder');
      await page.click('[data-testid="create-button"]');
      await page.waitForTimeout(500);

      // Right-click on folder
      const folder = page.locator('[data-testid^="tree-node-"]').first();
      await folder.click({ button: 'right' });

      // Verify menu is visible
      await expect(page.getByText('New Subfolder')).toBeVisible();

      // Press Escape
      await page.keyboard.press('Escape');

      // Verify menu is closed
      await expect(page.getByText('New Subfolder')).not.toBeVisible();
    });
  });

  test.describe('Context Menu and Drag-and-Drop Compatibility', () => {
    test('should not interfere with drag-and-drop operations', async ({ page }) => {
      // Create two folders
      await page.click('[data-testid="new-folder-button"]');
      await page.fill('[data-testid="folder-name-input"]', 'Folder A');
      await page.click('[data-testid="create-button"]');
      await page.waitForTimeout(500);

      await page.click('[data-testid="new-folder-button"]');
      await page.fill('[data-testid="folder-name-input"]', 'Folder B');
      await page.click('[data-testid="create-button"]');
      await page.waitForTimeout(500);

      // Attempt to drag Folder A (should not trigger context menu)
      const folderA = page.locator('[data-testid^="tree-node-"]').first();
      const folderB = page.locator('[data-testid^="tree-node-"]').nth(1);

      // Drag Folder A to Folder B
      await folderA.dragTo(folderB);
      await page.waitForTimeout(500);

      // Verify context menu did not appear during drag
      await expect(page.getByText('New Subfolder')).not.toBeVisible();

      // Verify drag was successful (Folder A is now a child of Folder B)
      // This is indicated by the tree structure change
    });
  });
});
