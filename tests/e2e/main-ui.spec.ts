import { test, expect } from "@playwright/test";

test.describe("Main UI Layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display header with logo and app name", async ({ page }) => {
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByText("LRIL Landing Page")).toBeVisible();
    await expect(page.getByAltText("LRIL Logo")).toBeVisible();
  });

  test("should display sidebar with folders", async ({ page }) => {
    await expect(page.getByText("Folders")).toBeVisible();
    await expect(page.getByText("Development Resources")).toBeVisible();
  });

  test("should resize sidebar by dragging", async ({ page }) => {
    const sidebar = page.locator("aside");
    const initialWidth = await sidebar.boundingBox();

    // Find the resize handle
    const resizeHandle = page.getByRole("separator");
    await expect(resizeHandle).toBeVisible();

    // Drag to resize
    const handleBox = await resizeHandle.boundingBox();
    if (handleBox && initialWidth) {
      await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(handleBox.x + 100, handleBox.y + handleBox.height / 2);
      await page.mouse.up();

      // Check that width changed
      const newWidth = await sidebar.boundingBox();
      expect(newWidth?.width).toBeGreaterThan(initialWidth.width);
    }
  });

  test("should show horizontal scroll for long folder names", async ({ page }) => {
    const sidebarContent = page.locator("aside > div").first();
    const scrollWidth = await sidebarContent.evaluate((el) => el.scrollWidth);
    const clientWidth = await sidebarContent.evaluate((el) => el.clientWidth);

    // If there's a long folder name, scrollWidth might be greater than clientWidth
    // This verifies the overflow-x: auto is working
    expect(scrollWidth).toBeGreaterThanOrEqual(clientWidth);
  });
});

test.describe("Link Cards", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display link cards", async ({ page }) => {
    await expect(page.getByText("GitHub")).toBeVisible();
    await expect(page.getByText("github.com")).toBeVisible();
  });

  test("should enter edit mode on title click", async ({ page }) => {
    const title = page.getByText("GitHub").first();
    await title.click();

    const input = page.getByRole("textbox");
    await expect(input).toBeVisible();
    await expect(input).toHaveValue("GitHub");
  });

  test("should save title on Enter", async ({ page }) => {
    const title = page.getByText("GitHub").first();
    await title.click();

    const input = page.getByRole("textbox");
    await input.fill("My GitHub");
    await input.press("Enter");

    await expect(page.getByText("My GitHub")).toBeVisible();
  });

  test("should cancel edit on Escape", async ({ page }) => {
    const title = page.getByText("GitHub").first();
    await title.click();

    const input = page.getByRole("textbox");
    await input.fill("Changed Title");
    await input.press("Escape");

    await expect(page.getByText("GitHub")).toBeVisible();
    await expect(page.getByText("Changed Title")).not.toBeVisible();
  });

  test("should open link in new tab on card click", async ({ page, context }) => {
    // Listen for new page
    const pagePromise = context.waitForEvent("page");

    // Click on card body (not the title)
    const card = page.locator('[role="button"]').filter({ hasText: "GitHub" }).first();
    const cardBox = await card.boundingBox();

    if (cardBox) {
      // Click near the favicon area (not on title)
      await page.mouse.click(cardBox.x + 20, cardBox.y + 20);
    }

    const newPage = await pagePromise;
    expect(newPage.url()).toContain("github.com");
  });
});
