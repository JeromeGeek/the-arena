import { test, expect } from "@playwright/test";

test.describe("PWA Features", () => {
  test("serves manifest.json", async ({ page }) => {
    const response = await page.goto("/manifest.json");
    expect(response?.status()).toBe(200);
    const manifest = await response?.json();
    expect(manifest.name).toBe("The Arena — Party Game Hub");
    expect(manifest.short_name).toBe("The Arena");
    expect(manifest.display).toBe("standalone");
    expect(manifest.theme_color).toBe("#0B0E14");
    expect(manifest.icons.length).toBeGreaterThanOrEqual(4);
  });

  test("serves service worker", async ({ page }) => {
    const response = await page.goto("/sw.js");
    expect(response?.status()).toBe(200);
    const text = await response?.text();
    expect(text).toContain("the-arena-v1");
  });

  test("has PWA meta tags", async ({ page }) => {
    await page.goto("/");
    // Theme color
    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute("content");
    expect(themeColor).toBe("#0B0E14");

    // Apple touch icon
    const appleIcon = await page.locator('link[rel="apple-touch-icon"]').getAttribute("href");
    expect(appleIcon).toBe("/icons/icon-192.png");

    // Manifest link
    const manifestLink = await page.locator('link[rel="manifest"]').getAttribute("href");
    expect(manifestLink).toBe("/manifest.json");
  });

  test("serves icon files", async ({ page }) => {
    for (const icon of ["/icons/icon-192.png", "/icons/icon-512.png"]) {
      const response = await page.goto(icon);
      expect(response?.status()).toBe(200);
      expect(response?.headers()["content-type"]).toContain("image/png");
    }
  });
});

test.describe("Mobile Responsiveness", () => {
  test("home page renders correctly on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
    await page.goto("/");
    await expect(page.locator("text=The Arena")).toBeVisible();
    // Game cards should be visible
    await expect(page.locator("text=Codenames")).toBeVisible();
  });

  test("game setup pages don't overflow horizontally", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    
    const pages = ["/truthordare", "/neverhaveiever", "/imposter", "/charades"];
    for (const url of pages) {
      await page.goto(url);
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // 1px tolerance
    }
  });

  test("viewport meta prevents zoom on mobile", async ({ page }) => {
    await page.goto("/");
    const viewport = await page.locator('meta[name="viewport"]').getAttribute("content");
    expect(viewport).toContain("width=device-width");
    expect(viewport).toContain("initial-scale=1");
  });
});
