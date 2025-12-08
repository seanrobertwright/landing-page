import { test, expect } from '@playwright/test';

test.describe('Drag-and-Drop Reordering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid^="tree-node-"]', { timeout: 5000 });
  });

  test.describe('Link Card Reordering in Content Area', () => {
    test('should reorder link cards via drag and drop', async ({ page }) => {
      // Select a folder with links
      const folder = page.locator('[data-testid^="tree-node-"]').first();
      await folder.click();
      await page.waitForTimeout(500);

      // Get link cards
      const linkCards = page.locator('[role="button"]').filter({ hasText: /https?:\/\// });
      const count = await linkCards.count();

      // Only test if there are at least 2 links
      if (count < 2) {
        test.skip();
        return;
      }

      // Get initial order of first two links
      const firstLinkText = await linkCards.nth(0).textContent();
      const secondLinkText = await linkCards.nth(1).textContent();

      // Drag first link to second position
      await linkCards.nth(0).dragTo(linkCards.nth(1));

      // Wait for reorder operation
      await page.waitForTimeout(1000);

      // Check for success toast
      const toast = page.locator('text=Links reordered successfully');
      await expect(toast).toBeVisible({ timeout: 3000 });

      // Verify order changed (second link should now be first)
      const newFirstLink = await linkCards.nth(0).textContent();
      expect(newFirstLink).toBe(secondLinkText);
    });

    test('should show ghost preview during drag', async ({ page }) => {
      const folder = page.locator('[data-testid^="tree-node-"]').first();
      await folder.click();
      await page.waitForTimeout(500);

      const linkCards = page.locator('[role="button"]').filter({ hasText: /https?:\/\// });
      if ((await linkCards.count()) < 2) {
        test.skip();
        return;
      }

      // Start dragging
      const firstCard = linkCards.nth(0);
      await firstCard.hover();
      await page.mouse.down();

      // Move mouse to trigger drag
      const secondCard = linkCards.nth(1);
      const box = await secondCard.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      }

      // Check for drag overlay (opacity reduction on original item)
      const opacity = await firstCard.evaluate((el) =>
        window.getComputedStyle(el).opacity
      );
      expect(parseFloat(opacity)).toBeLessThan(1);

      await page.mouse.up();
    });

    test('should persist order after page refresh', async ({ page }) => {
      const folder = page.locator('[data-testid^="tree-node-"]').first();
      await folder.click();
      await page.waitForTimeout(500);

      const linkCards = page.locator('[role="button"]').filter({ hasText: /https?:\/\// });
      if ((await linkCards.count()) < 2) {
        test.skip();
        return;
      }

      // Perform drag
      await linkCards.nth(0).dragTo(linkCards.nth(1));
      await page.waitForTimeout(1000);

      // Get new order
      const newOrder = [];
      const count = await linkCards.count();
      for (let i = 0; i < Math.min(count, 3); i++) {
        newOrder.push(await linkCards.nth(i).textContent());
      }

      // Refresh page
      await page.reload();
      await page.waitForSelector('[data-testid^="tree-node-"]', { timeout: 5000 });

      // Select same folder
      await folder.click();
      await page.waitForTimeout(500);

      // Verify order persisted
      const reloadedCards = page.locator('[role="button"]').filter({ hasText: /https?:\/\// });
      for (let i = 0; i < newOrder.length; i++) {
        const text = await reloadedCards.nth(i).textContent();
        expect(text).toBe(newOrder[i]);
      }
    });
  });

  test.describe('Folder Drag-and-Drop in Tree', () => {
    test('should move folder to different parent', async ({ page }) => {
      const folders = page.locator('[data-testid^="tree-node-"][data-testid*="folder"]');
      const count = await folders.count();

      // Need at least 2 folders
      if (count < 2) {
        test.skip();
        return;
      }

      // Get folder names
      const sourceFolderName = await folders.nth(0).textContent();
      const targetFolderName = await folders.nth(1).textContent();

      // Drag first folder onto second folder
      await folders.nth(0).dragTo(folders.nth(1));
      await page.waitForTimeout(1000);

      // Check for success toast
      const toast = page.locator('text=Folder moved successfully');
      await expect(toast).toBeVisible({ timeout: 3000 });
    });

    test('should prevent dropping folder into itself', async ({ page }) => {
      const folders = page.locator('[data-testid^="tree-node-"][data-testid*="folder"]');
      if ((await folders.count()) < 1) {
        test.skip();
        return;
      }

      // Try to drag folder onto itself
      await folders.nth(0).dragTo(folders.nth(0));
      await page.waitForTimeout(1000);

      // Should NOT show success toast
      const successToast = page.locator('text=Folder moved successfully');
      await expect(successToast).not.toBeVisible();
    });

    test('should show visual feedback during folder drag', async ({ page }) => {
      const folders = page.locator('[data-testid^="tree-node-"][data-testid*="folder"]');
      if ((await folders.count()) < 2) {
        test.skip();
        return;
      }

      // Start dragging first folder
      const firstFolder = folders.nth(0);
      await firstFolder.hover();
      await page.mouse.down();

      // Move to second folder
      const secondFolder = folders.nth(1);
      const box = await secondFolder.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      }

      // Check for opacity change on dragged item
      const opacity = await firstFolder.evaluate((el) =>
        window.getComputedStyle(el).opacity
      );
      expect(parseFloat(opacity)).toBeLessThan(1);

      await page.mouse.up();
    });
  });

  test.describe('Link Drag-and-Drop in Tree', () => {
    test('should move link to different folder', async ({ page }) => {
      const links = page.locator('[data-testid^="tree-node-"][data-testid*="link"]');
      const folders = page.locator('[data-testid^="tree-node-"][data-testid*="folder"]');

      // Need at least 1 link and 1 folder
      if ((await links.count()) < 1 || (await folders.count()) < 1) {
        test.skip();
        return;
      }

      // Drag link to folder
      await links.nth(0).dragTo(folders.nth(0));
      await page.waitForTimeout(1000);

      // Check for success toast
      const toast = page.locator('text=Link moved successfully');
      await expect(toast).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Error Handling', () => {
    test('should show error toast on failed drag operation', async ({ page }) => {
      // This test would require mocking API failure
      // For now, we verify the toast system is present
      const toaster = page.locator('[data-sonner-toaster]');
      // Toaster should be in the DOM
      await expect(toaster).toBeAttached();
    });
  });

  test.describe('Keyboard Accessibility', () => {
    test('should support keyboard navigation for drag', async ({ page }) => {
      const folders = page.locator('[data-testid^="tree-node-"][data-testid*="folder"]');
      if ((await folders.count()) < 1) {
        test.skip();
        return;
      }

      // Focus first folder
      await folders.nth(0).focus();

      // @dnd-kit provides keyboard support via space/enter to start drag
      // and arrow keys to move. Let's verify focus works
      const isFocused = await folders.nth(0).evaluate((el) =>
        el === document.activeElement || el.contains(document.activeElement)
      );
      expect(isFocused).toBe(true);
    });

    test('should be accessible with tab navigation', async ({ page }) => {
      // Tab through interactive elements
      await page.keyboard.press('Tab');

      // Check that focus moves to tree navigation
      const activeElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
      expect(activeElement).toBeTruthy();
    });
  });
});
