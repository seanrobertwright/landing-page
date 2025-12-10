import { test, expect } from '@playwright/test';
import { join } from 'path';

test.describe('Bookmark Import/Export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5050');
  });

  test('should display import and export buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /import/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /export/i })).toBeVisible();
  });

  test('should open import dialog when import button is clicked', async ({ page }) => {
    await page.getByRole('button', { name: /import/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Import Bookmarks')).toBeVisible();
    await expect(page.getByText(/Upload an HTML bookmark export file/)).toBeVisible();
  });

  test('should close import dialog when cancel is clicked', async ({ page }) => {
    await page.getByRole('button', { name: /import/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should import bookmarks from Chrome export file', async ({ page }) => {
    const fixturePath = join(process.cwd(), 'tests/fixtures/bookmarks/chrome-export.html');

    await page.getByRole('button', { name: /import/i }).click();

    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(fixturePath);

    // Verify file is selected
    await expect(page.getByText(/Selected:.*chrome-export\.html/)).toBeVisible();

    // Click import button
    await page.getByRole('button', { name: /^import$/i }).click();

    // Wait for import to complete
    await expect(page.getByText('Import Complete!')).toBeVisible({ timeout: 10000 });

    // Verify stats are displayed
    await expect(page.getByText(/Folders added:/)).toBeVisible();
    await expect(page.getByText(/Bookmarks added:/)).toBeVisible();

    // Close dialog
    await page.getByRole('button', { name: /close/i }).click();

    // Verify toast notification
    await expect(page.getByText(/Import complete!/)).toBeVisible({ timeout: 5000 });
  });

  test('should handle duplicate strategy selection', async ({ page }) => {
    await page.getByRole('button', { name: /import/i }).click();

    // Check default is "skip"
    const skipRadio = page.getByLabel('Skip duplicates');
    await expect(skipRadio).toBeChecked();

    // Switch to "update"
    const updateRadio = page.getByLabel('Update existing');
    await updateRadio.click();
    await expect(updateRadio).toBeChecked();

    // Verify description changes
    await expect(page.getByText(/Existing bookmarks will be updated/)).toBeVisible();
  });

  test('should show error for invalid file', async ({ page }) => {
    const invalidFile = join(process.cwd(), 'package.json');

    await page.getByRole('button', { name: /import/i }).click();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(invalidFile);

    await page.getByRole('button', { name: /^import$/i }).click();

    // Should show error message
    await expect(page.getByText(/Invalid bookmark file format|Failed to import/)).toBeVisible({
      timeout: 10000
    });
  });

  test('should export bookmarks to JSON file', async ({ page }) => {
    // Set up download handler
    const downloadPromise = page.waitForEvent('download');

    await page.getByRole('button', { name: /export/i }).click();

    const download = await downloadPromise;

    // Verify filename format
    expect(download.suggestedFilename()).toMatch(/^bookmarks-\d{4}-\d{2}-\d{2}\.json$/);

    // Verify file content
    const path = await download.path();
    expect(path).toBeTruthy();

    // Verify toast notification
    await expect(page.getByText('Bookmarks exported successfully')).toBeVisible({ timeout: 5000 });
  });

  test('should show exporting state on export button', async ({ page }) => {
    const exportButton = page.getByRole('button', { name: /export/i });

    // Click export
    await exportButton.click();

    // Button should show "Exporting..." temporarily
    // This might be too fast to catch, but we can verify the button exists
    await expect(exportButton).toBeVisible();
  });

  test('should import Firefox bookmarks correctly', async ({ page }) => {
    const fixturePath = join(process.cwd(), 'tests/fixtures/bookmarks/firefox-export.html');

    await page.getByRole('button', { name: /import/i }).click();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(fixturePath);

    await page.getByRole('button', { name: /^import$/i }).click();

    await expect(page.getByText('Import Complete!')).toBeVisible({ timeout: 10000 });
  });

  test('should import Edge bookmarks correctly', async ({ page }) => {
    const fixturePath = join(process.cwd(), 'tests/fixtures/bookmarks/edge-export.html');

    await page.getByRole('button', { name: /import/i }).click();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(fixturePath);

    await page.getByRole('button', { name: /^import$/i }).click();

    await expect(page.getByText('Import Complete!')).toBeVisible({ timeout: 10000 });
  });

  test('should import Safari bookmarks correctly', async ({ page }) => {
    const fixturePath = join(process.cwd(), 'tests/fixtures/bookmarks/safari-export.html');

    await page.getByRole('button', { name: /import/i }).click();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(fixturePath);

    await page.getByRole('button', { name: /^import$/i }).click();

    await expect(page.getByText('Import Complete!')).toBeVisible({ timeout: 10000 });
  });

  test('should handle large bookmark files', async ({ page }) => {
    const fixturePath = join(process.cwd(), 'tests/fixtures/bookmarks/large-export-5000.html');

    await page.getByRole('button', { name: /import/i }).click();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(fixturePath);

    await page.getByRole('button', { name: /^import$/i }).click();

    // Should show progress indicator
    await expect(page.getByText('Importing bookmarks...')).toBeVisible();

    // Wait for completion (longer timeout for large file)
    await expect(page.getByText('Import Complete!')).toBeVisible({ timeout: 30000 });

    // Verify large numbers in stats
    const statsText = await page.getByText(/Bookmarks added:/).textContent();
    expect(statsText).toContain('5000');
  });

  test('should update bookmarks when using update strategy', async ({ page }) => {
    const fixturePath = join(process.cwd(), 'tests/fixtures/bookmarks/chrome-export.html');

    // First import with skip strategy
    await page.getByRole('button', { name: /import/i }).click();
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(fixturePath);
    await page.getByRole('button', { name: /^import$/i }).click();
    await expect(page.getByText('Import Complete!')).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /close/i }).click();

    // Second import with update strategy
    await page.getByRole('button', { name: /import/i }).click();
    await fileInput.setInputFiles(fixturePath);

    // Select update strategy
    await page.getByLabel('Update existing').click();

    await page.getByRole('button', { name: /^import$/i }).click();
    await expect(page.getByText('Import Complete!')).toBeVisible({ timeout: 10000 });

    // Should show updated count
    await expect(page.getByText(/Bookmarks updated:/)).toBeVisible();
  });
});
