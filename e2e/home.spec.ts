import { test, expect } from "@playwright/test";

// Seed localStorage so the welcome modal never blocks tests
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("arena-username", "Tester");
  });
});

test.describe("Home Page — core", () => {
  test("loads and shows The Arena title", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=The Arena").first()).toBeVisible();
  });

  test("welcome modal is skipped when username is set", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=What should we call you?")).not.toBeVisible();
  });

  test("welcome modal appears on first visit", async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem("arena-username"));
    await page.goto("/");
    await expect(page.locator("text=What should we call you?")).toBeVisible();
  });

  test("welcome modal accepts a name and dismisses", async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem("arena-username"));
    await page.goto("/");
    await page.fill('input[placeholder*="Enter your name"]', "Jerome");
    await page.click("text=Enter the Arena");
    await expect(page.locator("text=What should we call you?")).not.toBeVisible();
  });

  test("displays all 8 game cards via href links", async ({ page }) => {
    await page.goto("/");
    const hrefs = [
      "/codenames", "/truthordare", "/neverhaveiever",
      "/imposter", "/charades", "/mafia", "/pictionary", "/headrush",
    ];
    for (const href of hrefs) {
      await expect(page.locator(`a[href="${href}"]`).first()).toBeAttached();
    }
  });
});

test.describe("Home Page — navigation", () => {
  const routes: [string, RegExp][] = [
    ["/codenames",        /\/codenames/],
    ["/truthordare",      /\/truthordare/],
    ["/neverhaveiever",   /\/neverhaveiever/],
    ["/imposter",         /\/imposter/],
    ["/charades",         /\/charades/],
    ["/mafia",            /\/mafia/],
    ["/pictionary",       /\/pictionary/],
    ["/headrush",         /\/headrush/],
  ];

  for (const [href, urlPattern] of routes) {
    test(`navigates to ${href}`, async ({ page }) => {
      await page.goto("/");
      // Cards use Framer Motion entrance animation (opacity: 0→1). The <a> element
      // itself has zero dimensions until its child motion.div finishes entering.
      // Use JS click to bypass Playwright's visibility check entirely.
      await page.locator(`a[href="${href}"]`).first().evaluate((el) => (el as HTMLElement).click());
      await expect(page).toHaveURL(urlPattern);
    });
  }
});
