import { describe, it, expect } from "vitest";
import {
  categories,
  setupImposterGame,
} from "@/lib/imposter";
import { seededRandom } from "@/lib/gamecodes";

describe("imposter", () => {
  describe("categories", () => {
    it("has at least 5 categories", () => {
      expect(categories.length).toBeGreaterThanOrEqual(5);
    });

    it("each category has a name and words", () => {
      categories.forEach((cat) => {
        expect(cat.name.length).toBeGreaterThan(0);
        expect(cat.words.length).toBeGreaterThanOrEqual(5);
      });
    });

    it("no duplicate words within a category", () => {
      categories.forEach((cat) => {
        const unique = new Set(cat.words);
        expect(unique.size).toBe(cat.words.length);
      });
    });
  });

  describe("setupImposterGame", () => {
    const players = ["Alice", "Bob", "Charlie", "Dave"];

    it("returns correct number of players", () => {
      const { players: gamePlayers } = setupImposterGame(players);
      expect(gamePlayers).toHaveLength(4);
    });

    it("assigns exactly 1 imposter by default", () => {
      const { players: gamePlayers } = setupImposterGame(players);
      const imposters = gamePlayers.filter((p) => p.isImposter);
      expect(imposters).toHaveLength(1);
    });

    it("assigns correct imposter count", () => {
      const { players: gamePlayers } = setupImposterGame(players, 2);
      const imposters = gamePlayers.filter((p) => p.isImposter);
      expect(imposters).toHaveLength(2);
    });

    it("imposter gets '???' as word", () => {
      const { players: gamePlayers } = setupImposterGame(players);
      const imposter = gamePlayers.find((p) => p.isImposter)!;
      expect(imposter.word).toBe("???");
    });

    it("non-imposters get the secret word", () => {
      const { players: gamePlayers, secretWord } = setupImposterGame(players);
      const nonImposters = gamePlayers.filter((p) => !p.isImposter);
      nonImposters.forEach((p) => expect(p.word).toBe(secretWord));
    });

    it("all players start non-eliminated", () => {
      const { players: gamePlayers } = setupImposterGame(players);
      gamePlayers.forEach((p) => expect(p.eliminated).toBe(false));
    });

    it("returns a valid category name", () => {
      const { category } = setupImposterGame(players);
      const names = categories.map((c) => c.name);
      expect(names).toContain(category);
    });

    it("secret word exists in the category", () => {
      const { category, secretWord } = setupImposterGame(players);
      const cat = categories.find((c) => c.name === category)!;
      expect(cat.words).toContain(secretWord);
    });

    it("uses specified category", () => {
      const { category } = setupImposterGame(players, 1, Math.random, "Objects");
      expect(category).toBe("Objects");
    });

    it("handles URL-slug category names", () => {
      const { category } = setupImposterGame(players, 1, Math.random, "countries-cities");
      expect(category).toBe("Countries & Cities");
    });

    it("is deterministic with seeded random", () => {
      const rng1 = seededRandom(42);
      const rng2 = seededRandom(42);
      const game1 = setupImposterGame(players, 1, rng1);
      const game2 = setupImposterGame(players, 1, rng2);
      expect(game1.category).toBe(game2.category);
      expect(game1.secretWord).toBe(game2.secretWord);
      expect(game1.players.map((p) => p.isImposter)).toEqual(
        game2.players.map((p) => p.isImposter)
      );
    });

    it("preserves player names and IDs", () => {
      const { players: gamePlayers } = setupImposterGame(players);
      expect(gamePlayers.map((p) => p.name)).toEqual(players);
      expect(gamePlayers.map((p) => p.id)).toEqual([0, 1, 2, 3]);
    });
  });
});
