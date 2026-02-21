import { describe, it, expect } from "vitest";
import { generateBoard, wordPools, type Difficulty } from "@/lib/codenames";
import { seededRandom } from "@/lib/gamecodes";

describe("codenames", () => {
  describe("wordPools", () => {
    it("has easy, medium, and hard pools", () => {
      expect(wordPools.easy.length).toBeGreaterThanOrEqual(20);
      expect(wordPools.medium.length).toBeGreaterThanOrEqual(20);
      expect(wordPools.hard.length).toBeGreaterThanOrEqual(20);
    });

    it("all words are uppercase strings", () => {
      for (const pool of Object.values(wordPools)) {
        for (const word of pool) {
          expect(word).toBe(word.toUpperCase());
          expect(word.length).toBeGreaterThan(0);
        }
      }
    });

    it("has no duplicate words within each pool", () => {
      for (const [_key, pool] of Object.entries(wordPools)) {
        const unique = new Set(pool);
        expect(unique.size).toBe(pool.length);
      }
    });
  });

  describe("generateBoard", () => {
    const difficulties: Difficulty[] = ["easy", "medium", "hard"];

    for (const difficulty of difficulties) {
      describe(`${difficulty} difficulty`, () => {
        it("generates exactly 20 cards", () => {
          const { cards } = generateBoard(difficulty);
          expect(cards).toHaveLength(20);
        });

        it("has correct type distribution (8-7-1-4)", () => {
          const { cards, startingTeam } = generateBoard(difficulty);
          const counts = { red: 0, blue: 0, assassin: 0, bystander: 0 };
          cards.forEach((c) => counts[c.type]++);

          expect(counts.assassin).toBe(1);
          expect(counts.bystander).toBe(4);
          if (startingTeam === "red") {
            expect(counts.red).toBe(8);
            expect(counts.blue).toBe(7);
          } else {
            expect(counts.red).toBe(7);
            expect(counts.blue).toBe(8);
          }
        });

        it("all cards start unrevealed", () => {
          const { cards } = generateBoard(difficulty);
          cards.forEach((c) => expect(c.revealed).toBe(false));
        });

        it("all words come from the correct pool", () => {
          const { cards } = generateBoard(difficulty);
          const pool = new Set(wordPools[difficulty]);
          cards.forEach((c) => expect(pool.has(c.word)).toBe(true));
        });

        it("has no duplicate words", () => {
          const { cards } = generateBoard(difficulty);
          const words = cards.map((c) => c.word);
          expect(new Set(words).size).toBe(20);
        });
      });
    }

    it("returns 'red' or 'blue' as startingTeam", () => {
      for (let i = 0; i < 20; i++) {
        const { startingTeam } = generateBoard("easy");
        expect(["red", "blue"]).toContain(startingTeam);
      }
    });

    it("is deterministic with seeded random", () => {
      const rng1 = seededRandom(42);
      const rng2 = seededRandom(42);
      const board1 = generateBoard("medium", rng1);
      const board2 = generateBoard("medium", rng2);
      expect(board1.startingTeam).toBe(board2.startingTeam);
      expect(board1.cards.map((c) => c.word)).toEqual(board2.cards.map((c) => c.word));
      expect(board1.cards.map((c) => c.type)).toEqual(board2.cards.map((c) => c.type));
    });
  });
});
