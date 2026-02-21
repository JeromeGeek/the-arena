import { test, expect } from "@playwright/test";

test.describe("Truth or Dare", () => {
  test("setup page loads with default players", async ({ page }) => {
    await page.goto("/truthordare");
    await expect(page.locator("text=Player 1")).toBeVisible();
    await expect(page.locator("text=Player 2")).toBeVisible();
    await expect(page.locator("text=Player 3")).toBeVisible();
  });

  test("can add a player", async ({ page }) => {
    await page.goto("/truthordare");
    await page.fill('input[placeholder*="Add player"]', "TestPlayer");
    await page.click("text=+");
    await expect(page.locator("text=TestPlayer")).toBeVisible();
  });

  test("can select intensity", async ({ page }) => {
    await page.goto("/truthordare");
    await page.click("text=SPICY");
    // Spicy button should now be visually selected
    await expect(page.locator("text=SPICY")).toBeVisible();
  });

  test("generates a game and navigates", async ({ page }) => {
    await page.goto("/truthordare");
    await page.click("text=Enter The Arena");
    await page.waitForURL(/\/td\/.+/);
    expect(page.url()).toMatch(/\/td\/.+/);
  });

  test("game page shows choice phase", async ({ page }) => {
    await page.goto("/truthordare");
    await page.click("text=Enter The Arena");
    await page.waitForURL(/\/td\/.+/);
    // Should show Truth and Dare buttons
    await expect(page.locator("text=Truth")).toBeVisible();
    await expect(page.locator("text=Dare")).toBeVisible();
  });
});

test.describe("Never Have I Ever", () => {
  test("setup page loads", async ({ page }) => {
    await page.goto("/neverhaveiever");
    await expect(page.locator("text=Confessions")).toBeVisible();
  });

  test("generates a game and navigates", async ({ page }) => {
    await page.goto("/neverhaveiever");
    await page.click("text=Enter The Arena");
    await page.waitForURL(/\/nhie\/.+/);
    // Should show a Never Have I Ever prompt
    await expect(page.locator("text=Never have I ever")).toBeVisible();
  });
});

test.describe("Imposter", () => {
  test("setup page loads with players", async ({ page }) => {
    await page.goto("/imposter");
    await expect(page.locator("text=Player 1")).toBeVisible();
  });

  test("generates a game and shows reveal phase", async ({ page }) => {
    await page.goto("/imposter");
    await page.click("text=Enter The Arena");
    await page.waitForURL(/\/im\/.+/);
    // Should show the first player's reveal screen
    await expect(page.locator("text=Tap to Reveal")).toBeVisible();
  });
});

test.describe("Charades", () => {
  test("setup page loads with teams", async ({ page }) => {
    await page.goto("/charades");
    await expect(page.locator("text=Team 1")).toBeVisible();
    await expect(page.locator("text=Team 2")).toBeVisible();
  });

  test("generates a game and shows ready phase", async ({ page }) => {
    await page.goto("/charades");
    await page.click("text=Start Game");
    await page.waitForURL(/\/ch\/.+/);
    // Should show the team ready screen
    await expect(page.locator("text=Up Next")).toBeVisible();
  });
});

test.describe("Codenames", () => {
  test("setup page loads", async ({ page }) => {
    await page.goto("/codenames");
    await expect(page.locator("text=Codenames")).toBeVisible();
  });
});
