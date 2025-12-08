import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  globalSetup: "./tests/setup/global-setup.ts",
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:5050",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: process.env.BASE_URL || "http://localhost:5050",
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_ENV: "test",
      TEST_DB_PATH: "data/links.test.db",
    },
  },
});
