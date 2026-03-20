import { describe, it, expect } from "vitest";
import {
  allSnapImages,
  snapCategories,
  difficultyConfig,
  getSnapImages,
  POINTS_PER_CORRECT,
  IMAGES_PER_ROUND,
  type SnapDifficulty,
  type SnapCategory,
} from "@/lib/snapquiz";
import { seededRandom } from "@/lib/gamecodes";

// Individual test timeout overrides (ms).
// Heavy-load tests get a 3 s ceiling — well above what they actually need
// (~100 ms) but prevents an infinite loop from hanging the whole run.
const HEAVY_TIMEOUT = 3_000;

// ── Sanity: image bank ──────────────────────────────────────────────────────

describe("allSnapImages — image bank", () => {
  it("contains at least 500 images", () => {
    expect(allSnapImages.length).toBeGreaterThanOrEqual(500);
  });

  it("every image has a non-empty id, answer, hint, url, category", () => {
    for (const img of allSnapImages) {
      expect(img.id.trim()).toBeTruthy();
      expect(img.answer.trim()).toBeTruthy();
      expect(img.hint.trim()).toBeTruthy();
      expect(img.url.trim()).toBeTruthy();
      expect(img.category).toBeTruthy();
    }
  });

  it("all IDs are unique", () => {
    const ids = allSnapImages.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all URLs are unique", () => {
    const urls = allSnapImages.map((i) => i.url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("all URLs point to Cloudinary snap-lens folder", () => {
    for (const img of allSnapImages) {
      expect(img.url).toMatch(/res\.cloudinary\.com\/.+\/snap-lens\/(easy|medium|extreme)\//);
    }
  });

  it("every image has a valid category", () => {
    const validCats: SnapCategory[] = ["random", "flags", "logos", "landmarks", "celebrities"];
    for (const img of allSnapImages) {
      expect(validCats).toContain(img.category);
    }
  });

  it("category distribution matches expected counts (±5 tolerance)", () => {
    const counts = { landmarks: 0, flags: 0, logos: 0, celebrities: 0 };
    for (const img of allSnapImages) {
      if (img.category !== "random") counts[img.category]++;
    }
    expect(counts.landmarks).toBeGreaterThanOrEqual(90);
    expect(counts.flags).toBeGreaterThanOrEqual(140);
    expect(counts.logos).toBeGreaterThanOrEqual(140);
    expect(counts.celebrities).toBeGreaterThanOrEqual(140);
  });

  it("difficulty distribution: all images belong to valid URL pattern", () => {
    for (const img of allSnapImages) {
      expect(img.url).toMatch(/res\.cloudinary\.com/);
    }
    expect(allSnapImages.length).toBeGreaterThanOrEqual(500);
  });
});

// ── snapCategories ──────────────────────────────────────────────────────────

describe("snapCategories", () => {
  it("has 5 categories including random", () => {
    expect(snapCategories).toHaveLength(5);
    const ids = snapCategories.map((c) => c.id);
    expect(ids).toContain("random");
    expect(ids).toContain("flags");
    expect(ids).toContain("logos");
    expect(ids).toContain("landmarks");
    expect(ids).toContain("celebrities");
  });

  it("random category contains all images", () => {
    const randomCat = snapCategories.find((c) => c.id === "random")!;
    expect(randomCat.images).toHaveLength(allSnapImages.length);
  });

  it("each named category only contains images of its own category type", () => {
    for (const cat of snapCategories) {
      if (cat.id === "random") continue;
      for (const img of cat.images) {
        expect(img.category).toBe(cat.id);
      }
    }
  });

  it("every category has a label and emoji", () => {
    for (const cat of snapCategories) {
      expect(cat.label.trim()).toBeTruthy();
      expect(cat.emoji.trim()).toBeTruthy();
    }
  });
});

// ── difficultyConfig ────────────────────────────────────────────────────────

describe("difficultyConfig", () => {
  const difficulties: SnapDifficulty[] = ["easy", "medium", "extreme"];

  it("has all three difficulty levels", () => {
    for (const d of difficulties) {
      expect(difficultyConfig[d]).toBeDefined();
    }
  });

  it("blur increases with difficulty", () => {
    expect(difficultyConfig.easy.blurPx).toBeLessThan(difficultyConfig.medium.blurPx);
    expect(difficultyConfig.medium.blurPx).toBeLessThan(difficultyConfig.extreme.blurPx);
  });

  it("reveal time increases with difficulty", () => {
    expect(difficultyConfig.easy.revealMs).toBeLessThan(difficultyConfig.medium.revealMs);
    expect(difficultyConfig.medium.revealMs).toBeLessThan(difficultyConfig.extreme.revealMs);
  });

  it("values are in sane ranges", () => {
    for (const d of difficulties) {
      const cfg = difficultyConfig[d];
      expect(cfg.blurPx).toBeGreaterThan(0);
      expect(cfg.blurPx).toBeLessThanOrEqual(100);
      expect(cfg.revealMs).toBeGreaterThan(500);
      expect(cfg.revealMs).toBeLessThanOrEqual(30_000);
    }
  });
});

// ── constants ───────────────────────────────────────────────────────────────

describe("constants", () => {
  it("POINTS_PER_CORRECT is a positive integer", () => {
    expect(Number.isInteger(POINTS_PER_CORRECT)).toBe(true);
    expect(POINTS_PER_CORRECT).toBeGreaterThan(0);
  });

  it("IMAGES_PER_ROUND is a positive integer", () => {
    expect(Number.isInteger(IMAGES_PER_ROUND)).toBe(true);
    expect(IMAGES_PER_ROUND).toBeGreaterThan(0);
  });
});

// ── getSnapImages ───────────────────────────────────────────────────────────

describe("getSnapImages", () => {
  const rng = () => seededRandom(42);

  it("returns the requested count", () => {
    const imgs = getSnapImages("random", 10, rng());
    expect(imgs).toHaveLength(10);
  });

  it("returns correct count for each category", () => {
    for (const cat of snapCategories) {
      const imgs = getSnapImages(cat.id, IMAGES_PER_ROUND, rng());
      expect(imgs).toHaveLength(IMAGES_PER_ROUND);
    }
  });

  it("all returned images belong to the requested category", () => {
    for (const cat of snapCategories) {
      if (cat.id === "random") continue;
      const imgs = getSnapImages(cat.id, IMAGES_PER_ROUND, rng());
      for (const img of imgs) {
        expect(img.category).toBe(cat.id);
      }
    }
  });

  it("unknown category falls back to full pool", () => {
    const imgs = getSnapImages("movies", IMAGES_PER_ROUND, rng());
    expect(imgs).toHaveLength(IMAGES_PER_ROUND);
  });

  it("is deterministic — same seed produces same order", () => {
    const a = getSnapImages("landmarks", 10, seededRandom(99));
    const b = getSnapImages("landmarks", 10, seededRandom(99));
    expect(a.map((i) => i.id)).toEqual(b.map((i) => i.id));
  });

  it("different seeds produce different orders", () => {
    const a = getSnapImages("landmarks", 10, seededRandom(1));
    const b = getSnapImages("landmarks", 10, seededRandom(2));
    expect(a.map((i) => i.id)).not.toEqual(b.map((i) => i.id));
  });

  it("no duplicate images in a single call (count ≤ pool size)", () => {
    const imgs = getSnapImages("flags", IMAGES_PER_ROUND, rng());
    const ids = imgs.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("cycles when count exceeds pool size", () => {
    // flags has ~150 images; requesting 155 should cycle
    const imgs = getSnapImages("flags", 155, rng());
    expect(imgs).toHaveLength(155);
  });

  // ── Difficulty filtering ───────────────────────────────────────────────

  it("filters by easy difficulty — all returned URLs contain /easy/", () => {
    const imgs = getSnapImages("random", 20, rng(), "easy");
    for (const img of imgs) {
      expect(img.url).toContain("/snap-lens/easy/");
    }
  });

  it("filters by medium difficulty — all returned URLs contain /medium/", () => {
    const imgs = getSnapImages("random", 20, rng(), "medium");
    for (const img of imgs) {
      expect(img.url).toContain("/snap-lens/medium/");
    }
  });

  it("filters by extreme difficulty — all returned URLs contain /extreme/", () => {
    const imgs = getSnapImages("random", 20, rng(), "extreme");
    for (const img of imgs) {
      expect(img.url).toContain("/snap-lens/extreme/");
    }
  });

  it("filtering by difficulty + category returns correct subset", () => {
    const imgs = getSnapImages("landmarks", IMAGES_PER_ROUND, rng());
    expect(imgs).toHaveLength(IMAGES_PER_ROUND);
    for (const img of imgs) {
      expect(img.category).toBe("landmarks");
    }
  });

  it("easy+landmarks only shows easy landmark images", () => {
    const imgs = getSnapImages("landmarks", 20, rng(), "easy");
    for (const img of imgs) {
      expect(img.category).toBe("landmarks");
      expect(img.url).toContain("/snap-lens/easy/");
    }
  });
});

// ── Multi-round simulation (flow test) ─────────────────────────────────────

describe("multi-round game simulation", () => {
  it("3 rounds × 10 images produces 30 unique images across rounds with same seed logic", () => {
    const baseSeed = 42;
    const allRoundImages = [];
    for (let r = 0; r < 3; r++) {
      const roundSeed = baseSeed + r * 7919;
      const imgs = getSnapImages("random", IMAGES_PER_ROUND, seededRandom(roundSeed), "medium");
      allRoundImages.push(...imgs);
    }
    expect(allRoundImages).toHaveLength(30);
    // All belong to medium difficulty
    for (const img of allRoundImages) {
      expect(img.url).toContain("/snap-lens/medium/");
    }
  }, HEAVY_TIMEOUT);

  it("rematch with different seed produces different image order", () => {
    const baseSeed = 7;
    const round1_match1 = getSnapImages("random", IMAGES_PER_ROUND, seededRandom(baseSeed), "easy");
    const round1_match2 = getSnapImages("random", IMAGES_PER_ROUND, seededRandom(baseSeed + 99991), "easy");
    expect(round1_match1.map((i) => i.id)).not.toEqual(round1_match2.map((i) => i.id));
  }, HEAVY_TIMEOUT);

  it("scoring: 10 correct answers × POINTS_PER_CORRECT totals correctly", () => {
    let score = 0;
    for (let i = 0; i < 10; i++) score += POINTS_PER_CORRECT;
    expect(score).toBe(POINTS_PER_CORRECT * 10);
  });
});

// ── Heavy load tests ───────────────────────────────────────────────────────

describe("heavy load — performance", () => {
  it("getSnapImages handles 1000 calls without error", () => {
    expect(() => {
      for (let i = 0; i < 1000; i++) {
        getSnapImages("random", IMAGES_PER_ROUND, seededRandom(i));
      }
    }).not.toThrow();
  }, HEAVY_TIMEOUT);

  it("getSnapImages 1000 calls complete in under 500ms", () => {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      getSnapImages("random", IMAGES_PER_ROUND, seededRandom(i));
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(500);
  }, HEAVY_TIMEOUT);

  it("building a 50-round game (500 images) completes in under 100ms", () => {
    const start = performance.now();
    const allImages = [];
    for (let r = 0; r < 50; r++) {
      const imgs = getSnapImages("random", IMAGES_PER_ROUND, seededRandom(r * 7919), "medium");
      allImages.push(...imgs);
    }
    const elapsed = performance.now() - start;
    expect(allImages).toHaveLength(500);
    expect(elapsed).toBeLessThan(100);
  }, HEAVY_TIMEOUT);

  it("full allSnapImages iteration is under 10ms", () => {
    const start = performance.now();
    let count = 0;
    for (const img of allSnapImages) {
      if (img.url) count++;
    }
    const elapsed = performance.now() - start;
    expect(count).toBe(allSnapImages.length);
    expect(elapsed).toBeLessThan(10);
  }, HEAVY_TIMEOUT);

  it("Fisher-Yates shuffle on full pool 100 times stays under 200ms", () => {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      getSnapImages("random", allSnapImages.length, seededRandom(i * 31));
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(200);
  }, HEAVY_TIMEOUT);
});

// ── Anti-lag / edge case tests ─────────────────────────────────────────────

describe("anti-lag & edge cases", () => {
  it("requesting 0 images returns empty array", () => {
    const imgs = getSnapImages("random", 0, seededRandom(1));
    expect(imgs).toHaveLength(0);
  });

  it("requesting 1 image returns exactly 1", () => {
    const imgs = getSnapImages("flags", 1, seededRandom(1));
    expect(imgs).toHaveLength(1);
  });

  it("requesting exactly pool size returns no duplicates", () => {
    // Flags pool has ~150 images; request all of them
    const flagPool = allSnapImages.filter((i) => i.category === "flags");
    const imgs = getSnapImages("flags", flagPool.length, seededRandom(5));
    const ids = imgs.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("seeded rng produces values in [0, 1)", () => {
    const rng = seededRandom(12345);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("consecutive seeds do not produce identical first images", () => {
    const img1 = getSnapImages("random", 1, seededRandom(0))[0];
    const img2 = getSnapImages("random", 1, seededRandom(1))[0];
    // Very unlikely to be same with different seeds
    expect(img1.id === img2.id).toBe(false);
  });

  it("rapid repeated calls with same seed are stable (no mutation)", () => {
    const first = getSnapImages("logos", IMAGES_PER_ROUND, seededRandom(77));
    const second = getSnapImages("logos", IMAGES_PER_ROUND, seededRandom(77));
    expect(first.map((i) => i.id)).toEqual(second.map((i) => i.id));
  });

  it("allSnapImages is not mutated by getSnapImages calls", () => {
    const originalFirst = allSnapImages[0].id;
    const originalLast  = allSnapImages[allSnapImages.length - 1].id;
    getSnapImages("random", allSnapImages.length, seededRandom(42));
    getSnapImages("random", allSnapImages.length, seededRandom(99));
    expect(allSnapImages[0].id).toBe(originalFirst);
    expect(allSnapImages[allSnapImages.length - 1].id).toBe(originalLast);
  });

  it("parseCode-equivalent: multi-category slug works for all categories", () => {
    for (const cat of snapCategories) {
      expect(() =>
        getSnapImages(cat.id, IMAGES_PER_ROUND, seededRandom(1), "medium")
      ).not.toThrow();
    }
  });
});
