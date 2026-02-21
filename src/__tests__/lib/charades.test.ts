import { describe, it, expect } from "vitest";
import {
  charadesCategories,
  setupCharadesGame,
} from "@/lib/charades";
import { seededRandom } from "@/lib/gamecodes";

describe("charades", () => {
  describe("charadesCategories", () => {
    it("has at least 5 categories", () => {
      expect(charadesCategories.length).toBeGreaterThanOrEqual(5);
    });

    it("each category has a name and at least 10 words", () => {
      charadesCategories.forEach((cat) => {
        expect(cat.name.length).toBeGreaterThan(0);
        expect(cat.words.length).toBeGreaterThanOrEqual(10);
      });
    });

    it("no duplicate words within a category", () => {
      charadesCategories.forEach((cat) => {
        const unique = new Set(cat.words);
        expect(unique.size).toBe(cat.words.length);
      });
    });
  });

  describe("setupCharadesGame", () => {
    const players = ["Alice", "Bob", "Charlie"];

    it("returns 20 words by default", () => {
      const { words } = setupCharadesGame(players);
      expect(words).toHaveLength(20);
    });

    it("returns custom word count", () => {
      const { words } = setupCharadesGame(players, undefined, Math.random, 10);
      expect(words).toHaveLength(10);
    });

    it("returns a category name", () => {
      const { category } = setupCharadesGame(players);
      expect(category.length).toBeGreaterThan(0);
    });

    it("uses specified category", () => {
      const { category } = setupCharadesGame(players, "Movies");
      expect(category).toBe("Movies");
    });

    it("words from specified category belong to that category", () => {
      const { words } = setupCharadesGame(players, "Animals");
      const pool = new Set(charadesCategories.find((c) => c.name === "Animals")!.words);
      words.forEach((w) => expect(pool.has(w)).toBe(true));
    });

    it("random category pulls from all categories", () => {
      const { category } = setupCharadesGame(players, "random");
      expect(category).toBe("Random");
    });

    it("no duplicate words in result", () => {
      const { words } = setupCharadesGame(players);
      expect(new Set(words).size).toBe(words.length);
    });

    it("is deterministic with seeded random", () => {
      const rng1 = seededRandom(42);
      const rng2 = seededRandom(42);
      const game1 = setupCharadesGame(players, "Movies", rng1);
      const game2 = setupCharadesGame(players, "Movies", rng2);
      expect(game1.words).toEqual(game2.words);
      expect(game1.category).toEqual(game2.category);
    });

    it("handles unknown category gracefully (falls back to random)", () => {
      const { words } = setupCharadesGame(players, "nonexistent");
      expect(words.length).toBeGreaterThan(0);
    });
  });
});
