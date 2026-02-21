import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("loads the arena home page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=The Arena")).toBeVisible();
  });

  test("displays all 5 game cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Codenames")).toBeVisible();
    await expect(page.locator("text=Truth or Dare")).toBeVisible();
    await expect(page.locator("text=Never Have I Ever")).toBeVisible();
    await expect(page.locator("text=Imposter")).toBeVisible();
    await expect(page.locator("text=Charades")).toBeVisible();
  });

  test("navigates to Codenames setup", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Codenames");
    await expect(page).toHaveURL(/\/codenames/);
  });

  test("navigates to Truth or Dare setup", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Truth or Dare");
    await expect(page).toHaveURL(/\/truthordare/);
  });

  test("navigates to Never Have I Ever setup", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Never Have I Ever");
    await expect(page).toHaveURL(/\/neverhaveiever/);
  });

  test("navigates to Imposter setup", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Imposter");
    await expect(page).toHaveURL(/\/imposter/);
  });

  test("navigates to Charades setup", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Charades");
    await expect(page).toHaveURL(/\/charades/);
  });
});
