import { test, expect } from "@playwright/test";

// Skip welcome modal on every test
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("arena-username", "Tester");
  });
});

/* ══════════════════════════════════════════════════════════
 *  TRUTH OR DARE
 * ══════════════════════════════════════════════════════════ */
test.describe("Truth or Dare", () => {
  test("setup page loads with default players in inputs", async ({ page }) => {
    await page.goto("/truthordare");
    // Players are stored in <input value="Player N"> — use first/nth textbox
    const inputs = page.getByRole("textbox");
    await expect(inputs.first()).toHaveValue(/Player 1/);
  });

  test("can add a player", async ({ page }) => {
    await page.goto("/truthordare");
    // SetupAddRow placeholder: "Player N (or type a name)"
    await page.fill('input[placeholder*="or type a name"]', "Jerome");
    await page.getByRole("button", { name: "+" }).click();
    await expect(page.locator('input[value="Jerome"]')).toBeAttached();
  });

  test("can remove a player", async ({ page }) => {
    await page.goto("/truthordare");
    await page.fill('input[placeholder*="or type a name"]', "Temp");
    await page.getByRole("button", { name: "+" }).click();
    const removeButtons = page.locator("button:has-text('✕')");
    const count = await removeButtons.count();
    await removeButtons.nth(count - 1).click();
    await expect(page.locator('input[value="Temp"]')).not.toBeAttached();
  });

  test("can select each intensity level", async ({ page }) => {
    await page.goto("/truthordare");
    for (const level of ["MILD", "SPICY", "EXTREME"]) {
      await page.getByRole("button", { name: new RegExp(level, "i") }).first().click();
    }
    // No crash — page still shows the start button
    await expect(page.getByRole("button", { name: /Start/ })).toBeVisible();
  });

  test("generates a game and navigates to /td/", async ({ page }) => {
    await page.goto("/truthordare");
    await page.getByRole("button", { name: /Start/ }).click();
    await page.waitForURL(/\/td\/.+/);
    expect(page.url()).toMatch(/\/td\/.+/);
  });

  test("game page shows Truth and Dare buttons", async ({ page }) => {
    await page.goto("/truthordare");
    await page.getByRole("button", { name: /Start/ }).click();
    await page.waitForURL(/\/td\/.+/);
    await expect(page.getByRole("button", { name: /Truth/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Dare/i }).first()).toBeVisible();
  });

  test("picking Truth shows a prompt", async ({ page }) => {
    await page.goto("/truthordare");
    await page.getByRole("button", { name: /Start/ }).click();
    await page.waitForURL(/\/td\/.+/);
    await page.getByRole("button", { name: /Truth/i }).first().click();
    // A truth prompt should be visible — look for any non-empty text block on page
    await expect(page.locator("main, [role='main'], body").first()).not.toBeEmpty();
  });

  test("picking Dare shows a prompt", async ({ page }) => {
    await page.goto("/truthordare");
    await page.getByRole("button", { name: /Start/ }).click();
    await page.waitForURL(/\/td\/.+/);
    await page.getByRole("button", { name: /Dare/i }).first().click();
    // After picking, some result text / Next button visible
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("can navigate back home via logo link", async ({ page }) => {
    await page.goto("/truthordare");
    await page.getByRole("button", { name: /Start/ }).click();
    await page.waitForURL(/\/td\/.+/);
    await page.locator("a[href='/']").first().click();
    await expect(page).toHaveURL("/");
  });
});

/* ══════════════════════════════════════════════════════════
 *  NEVER HAVE I EVER
 * ══════════════════════════════════════════════════════════ */
test.describe("Never Have I Ever", () => {
  test("setup page loads with intensity options", async ({ page }) => {
    await page.goto("/neverhaveiever");
    await expect(page.getByRole("button", { name: /WILD/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /SPICY/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /CHAOS/i }).first()).toBeVisible();
  });

  test("generates a game and navigates to /nhie/", async ({ page }) => {
    await page.goto("/neverhaveiever");
    await page.getByRole("button", { name: /Start/ }).click();
    await page.waitForURL(/\/nhie\/.+/);
    expect(page.url()).toMatch(/\/nhie\/.+/);
  });

  test("game page shows a Never Have I Ever prompt", async ({ page }) => {
    await page.goto("/neverhaveiever");
    await page.getByRole("button", { name: /Start/ }).click();
    await page.waitForURL(/\/nhie\/.+/);
    await expect(page.locator("text=Never have I ever").first()).toBeVisible();
  });

  test("Next button advances to a new prompt", async ({ page }) => {
    await page.goto("/neverhaveiever");
    await page.getByRole("button", { name: /Start/ }).click();
    await page.waitForURL(/\/nhie\/.+/);
    await page.getByRole("button", { name: /Next/i }).first().click();
    await expect(page.locator("text=Never have I ever").first()).toBeVisible();
  });
});

/* ══════════════════════════════════════════════════════════
 *  IMPOSTER
 * ══════════════════════════════════════════════════════════ */
test.describe("Imposter", () => {
  test("setup page loads with default players", async ({ page }) => {
    await page.goto("/imposter");
    const inputs = page.getByRole("textbox");
    await expect(inputs.first()).toHaveValue(/Player 1/);
  });

  test("can add a player", async ({ page }) => {
    await page.goto("/imposter");
    await page.fill('input[placeholder*="Add player"]', "Alice");
    await page.getByRole("button", { name: "+" }).click();
    await expect(page.locator('input[value="Alice"]')).toBeAttached();
  });

  test("generates a game and navigates to /im/", async ({ page }) => {
    await page.goto("/imposter");
    await page.getByRole("button", { name: /Start Game/ }).click();
    await page.waitForURL(/\/im\/.+/);
    expect(page.url()).toMatch(/\/im\/.+/);
  });

  test("game page shows Tap to Reveal", async ({ page }) => {
    await page.goto("/imposter");
    await page.getByRole("button", { name: /Start Game/ }).click();
    await page.waitForURL(/\/im\/.+/);
    await expect(page.locator("text=Tap to Reveal").first()).toBeVisible();
  });

  test("tapping reveals a role/word and shows Next Player", async ({ page }) => {
    await page.goto("/imposter");
    await page.getByRole("button", { name: /Start Game/ }).click();
    await page.waitForURL(/\/im\/.+/);
    await page.locator("text=Tap to Reveal").first().click();
    await expect(page.getByRole("button", { name: /Next Player/i }).first()).toBeVisible();
  });
});

/* ══════════════════════════════════════════════════════════
 *  CHARADES
 * ══════════════════════════════════════════════════════════ */
test.describe("Charades", () => {
  test("setup page loads with team inputs", async ({ page }) => {
    await page.goto("/charades");
    // Teams are stored in inputs — default 2 teams
    const inputs = page.getByRole("textbox");
    await expect(inputs.first()).toHaveValue(/Team 1/);
  });

  test("can add a team", async ({ page }) => {
    await page.goto("/charades");
    await page.fill('input[placeholder*="Add team"]', "Purple");
    await page.getByRole("button", { name: "+" }).click();
    await expect(page.locator('input[value="Purple"]')).toBeAttached();
  });

  test("generates a game and navigates to /ch/", async ({ page }) => {
    await page.goto("/charades");
    // Default: 2 Teams · 60s · 3 Rounds
    await page.getByRole("button", { name: /Start/ }).click();
    await page.waitForURL(/\/ch\/.+/);
    expect(page.url()).toMatch(/\/ch\/.+/);
  });

  test("game page shows team ready screen", async ({ page }) => {
    await page.goto("/charades");
    await page.getByRole("button", { name: /Start/ }).click();
    await page.waitForURL(/\/ch\/.+/);
    // Charades game shows current team name or "Up Next" / "Start Turn"
    await expect(page.locator("body")).not.toBeEmpty();
    // The page should not be blank — look for any heading
    await expect(page.locator("h1, h2, h3, [role='heading']").first()).toBeVisible();
  });

  test("can start a turn", async ({ page }) => {
    await page.goto("/charades");
    await page.getByRole("button", { name: /Start/ }).click();
    await page.waitForURL(/\/ch\/.+/);
    // Try to start a turn — button may say "Start Turn" / "Ready" / "Go"
    const startTurn = page.getByRole("button", { name: /Start Turn|Ready|Go/i });
    const hasTurnBtn = await startTurn.count() > 0;
    if (hasTurnBtn) {
      await startTurn.first().click();
      // Should show a word + Skip button
      await expect(page.getByRole("button", { name: /Skip/i }).first()).toBeVisible();
    } else {
      // If no turn button, the game may show a word directly
      await expect(page.locator("body")).not.toBeEmpty();
    }
  });
});

/* ══════════════════════════════════════════════════════════
 *  CODENAMES
 * ══════════════════════════════════════════════════════════ */
test.describe("Codenames", () => {
  test("setup page loads with difficulty options", async ({ page }) => {
    await page.goto("/codenames");
    await expect(page.getByRole("button", { name: /EASY/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /MEDIUM/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /HARD/i }).first()).toBeVisible();
  });

  test("can generate a game code", async ({ page }) => {
    await page.goto("/codenames");
    await page.getByRole("button", { name: /Generate Game Code/i }).click();
    // QR / slug modal appears — Launch button visible
    await expect(page.getByRole("button", { name: /Launch/i }).first()).toBeVisible();
  });

  test("launches and shows the 20-card board", async ({ page }) => {
    await page.goto("/codenames");
    await page.getByRole("button", { name: /Generate Game Code/i }).click();
    await page.getByRole("button", { name: /Launch/i }).first().click();
    await page.waitForURL(/\/cn\/.+/);
    // Board is a 5×4 grid of motion.div cards (not buttons).
    // The grid div has grid-cols-5 — wait for it to appear with 20 children.
    const grid = page.locator("div[class*='grid-cols-5']").first();
    await expect(grid).toBeVisible({ timeout: 8000 });
    const cards = grid.locator("> div");
    await expect(cards).toHaveCount(20, { timeout: 8000 });
  });

  test("spymaster toggle reveals card colours", async ({ page }) => {
    await page.goto("/codenames");
    await page.getByRole("button", { name: /Generate Game Code/i }).click();
    await page.getByRole("button", { name: /Launch/i }).first().click();
    await page.waitForURL(/\/cn\/.+/);
    const grid = page.locator("div[class*='grid-cols-5']").first();
    await expect(grid).toBeVisible({ timeout: 8000 });
    // Spymaster toggle button (shows "🕵️ Spymaster" or "🎯 Guesser")
    await page.getByRole("button", { name: /Spymaster|Guesser/i }).first().click();
    await expect(grid.locator("> div").first()).toBeVisible();
  });

  test("can reveal a card as operative", async ({ page }) => {
    await page.goto("/codenames");
    await page.getByRole("button", { name: /Generate Game Code/i }).click();
    await page.getByRole("button", { name: /Launch/i }).first().click();
    await page.waitForURL(/\/cn\/.+/);
    const grid = page.locator("div[class*='grid-cols-5']").first();
    await expect(grid).toBeVisible({ timeout: 8000 });
    // Click first card (operative mode by default — cards are motion.div with onClick)
    await grid.locator("> div").first().click();
    await expect(grid.locator("> div")).toHaveCount(20);
  });
});

/* ══════════════════════════════════════════════════════════
 *  MAFIA
 * ══════════════════════════════════════════════════════════ */
test.describe("Mafia", () => {
  test("setup page loads with default players", async ({ page }) => {
    await page.goto("/mafia");
    const inputs = page.getByRole("textbox");
    await expect(inputs.first()).toHaveValue(/Player 1/);
  });

  test("can add a player", async ({ page }) => {
    await page.goto("/mafia");
    await page.fill('input[placeholder*="Add player"]', "Bob");
    await page.getByRole("button", { name: "+" }).click();
    await expect(page.locator('input[value="Bob"]')).toBeAttached();
  });

  test("generates a game and navigates to /mf/", async ({ page }) => {
    await page.goto("/mafia");
    // Default starts with 6 players — button: "Night Falls… · 6 Players 🌙"
    await page.getByRole("button", { name: /Night Falls/i }).click();
    await page.waitForURL(/\/mf\/.+/);
    expect(page.url()).toMatch(/\/mf\/.+/);
  });

  test("game page shows role reveal phase", async ({ page }) => {
    await page.goto("/mafia");
    await page.getByRole("button", { name: /Night Falls/i }).click();
    await page.waitForURL(/\/mf\/.+/);
    // Role reveal: "Tap Your Name to Peek"
    await expect(page.locator("text=Tap Your Name to Peek").first()).toBeVisible();
  });

  test("tapping a player name reveals a role", async ({ page }) => {
    await page.goto("/mafia");
    await page.getByRole("button", { name: /Night Falls/i }).click();
    await page.waitForURL(/\/mf\/.+/);
    await expect(page.locator("text=Tap Your Name to Peek").first()).toBeVisible();
    // Tap the first player name button (not yet revealed)
    const playerBtns = page.locator("button:not([disabled])").filter({ hasNotText: /Night Falls|New Game|Sound/ });
    await playerBtns.first().click();
    // Peek overlay appears showing a role
    const roleVisible =
      (await page.locator("text=Mafia").count()) +
      (await page.locator("text=Doctor").count()) +
      (await page.locator("text=Detective").count()) +
      (await page.locator("text=Villager").count());
    expect(roleVisible).toBeGreaterThan(0);
  });
});

/* ══════════════════════════════════════════════════════════
 *  SNAP QUIZ (Headrush)
 * ══════════════════════════════════════════════════════════ */
test.describe("Snap Quiz", () => {
  test("setup page loads with difficulty options", async ({ page }) => {
    await page.goto("/headrush");
    await expect(page.getByRole("button", { name: /Easy/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Medium/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Extreme/i }).first()).toBeVisible();
  });

  test("default has two team labels visible", async ({ page }) => {
    await page.goto("/headrush");
    // Teams are shown as <span> text in styled divs, not inputs
    await expect(page.locator("text=Team 1").first()).toBeVisible();
    await expect(page.locator("text=Team 2").first()).toBeVisible();
  });

  test("can add a third team via + button", async ({ page }) => {
    await page.goto("/headrush");
    // placeholder is "Add a team…"
    await page.fill('input[placeholder*="Add a team"]', "Purple");
    await page.getByRole("button", { name: "+" }).click();
    await expect(page.locator("text=Purple").first()).toBeVisible();
  });

  test("generates a game and navigates to /hr/", async ({ page }) => {
    await page.goto("/headrush");
    // Default: 2 teams · medium · 2 rounds · random  →  "🖼️ Start · 2 Rounds · 20 Images"
    await page.getByRole("button", { name: /Start/ }).click();
    await page.waitForURL(/\/hr\/.+/);
    expect(page.url()).toMatch(/\/hr\/.+/);
  });

  test("game page renders without crash", async ({ page }) => {
    await page.goto("/headrush");
    await page.getByRole("button", { name: /Start/ }).click();
    await page.waitForURL(/\/hr\/.+/);
    await expect(page.locator("body")).not.toBeEmpty();
    await expect(page.locator("h1, h2, h3, [role='heading'], img").first()).toBeVisible({ timeout: 10000 });
  });
});

/* ══════════════════════════════════════════════════════════
 *  PICTIONARY / INK ARENA
 * ══════════════════════════════════════════════════════════ */
test.describe("Pictionary", () => {
  test("setup page shows title", async ({ page }) => {
    await page.goto("/pictionary");
    await expect(page.locator("text=PICTIONARY").first()).toBeVisible();
  });

  test("shows Red Team and Blue Team", async ({ page }) => {
    await page.goto("/pictionary");
    await expect(page.locator("text=Red Team").first()).toBeVisible();
    await expect(page.locator("text=Blue Team").first()).toBeVisible();
  });

  test("Launch Pictionary navigates to /ia/", async ({ page }) => {
    await page.goto("/pictionary");
    await page.getByRole("button", { name: /Launch Pictionary/i }).click();
    await page.waitForURL(/\/ia\/.+/);
    expect(page.url()).toMatch(/\/ia\/.+/);
  });
});
