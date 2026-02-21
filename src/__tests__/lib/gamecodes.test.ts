import { describe, it, expect } from "vitest";
import {
  lookupSlug,
  getRandomSlug,
  seedToSlug,
  slugToSeed,
  generateSeed,
  seededRandom,
} from "@/lib/gamecodes";

describe("gamecodes", () => {
  describe("lookupSlug", () => {
    it("returns entry for valid easy slug", () => {
      const entry = lookupSlug("lmao");
      expect(entry).not.toBeNull();
      expect(entry!.difficulty).toBe("easy");
      expect(typeof entry!.seed).toBe("number");
    });

    it("returns entry for valid medium slug", () => {
      const entry = lookupSlug("rekt");
      expect(entry).not.toBeNull();
      expect(entry!.difficulty).toBe("medium");
    });

    it("returns entry for valid hard slug", () => {
      const entry = lookupSlug("gitgud");
      expect(entry).not.toBeNull();
      expect(entry!.difficulty).toBe("hard");
    });

    it("returns null for unknown slug", () => {
      expect(lookupSlug("nonexistent")).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(lookupSlug("")).toBeNull();
    });
  });

  describe("getRandomSlug", () => {
    it("returns a valid easy slug", () => {
      const slug = getRandomSlug("easy");
      expect(typeof slug).toBe("string");
      expect(slug.length).toBeGreaterThan(0);
      const entry = lookupSlug(slug);
      expect(entry).not.toBeNull();
      expect(entry!.difficulty).toBe("easy");
    });

    it("returns a valid medium slug", () => {
      const slug = getRandomSlug("medium");
      const entry = lookupSlug(slug);
      expect(entry!.difficulty).toBe("medium");
    });

    it("returns a valid hard slug", () => {
      const slug = getRandomSlug("hard");
      const entry = lookupSlug(slug);
      expect(entry!.difficulty).toBe("hard");
    });
  });

  describe("seedToSlug / slugToSeed", () => {
    it("converts seed to slug and back", () => {
      const seed = 5;
      const slug = seedToSlug(seed);
      expect(typeof slug).toBe("string");
      const recovered = slugToSeed(slug);
      expect(recovered).toBe(seed);
    });

    it("wraps around for seeds larger than slug pool", () => {
      // seedToSlug uses modulo, so seed 0 and seed N (pool size) should give the same slug
      const slug0 = seedToSlug(0);
      // Find the pool size by checking when it wraps
      let poolSize = 1;
      while (seedToSlug(poolSize) !== slug0 && poolSize < 500) poolSize++;
      expect(poolSize).toBeLessThan(500); // should find a wrap point
      expect(seedToSlug(poolSize)).toBe(slug0);
    });

    it("slugToSeed returns null for unknown slug", () => {
      expect(slugToSeed("nonexistent")).toBeNull();
    });
  });

  describe("generateSeed", () => {
    it("returns a non-negative number", () => {
      const seed = generateSeed();
      expect(seed).toBeGreaterThanOrEqual(0);
    });

    it("returns an integer", () => {
      const seed = generateSeed();
      expect(Number.isInteger(seed)).toBe(true);
    });
  });

  describe("seededRandom", () => {
    it("produces deterministic output for same seed", () => {
      const rng1 = seededRandom(42);
      const rng2 = seededRandom(42);
      const seq1 = Array.from({ length: 10 }, () => rng1());
      const seq2 = Array.from({ length: 10 }, () => rng2());
      expect(seq1).toEqual(seq2);
    });

    it("produces different output for different seeds", () => {
      const rng1 = seededRandom(42);
      const rng2 = seededRandom(99);
      const v1 = rng1();
      const v2 = rng2();
      expect(v1).not.toBe(v2);
    });

    it("produces values between 0 and 1", () => {
      const rng = seededRandom(123);
      for (let i = 0; i < 100; i++) {
        const v = rng();
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
      }
    });

    it("produces good distribution (not all same)", () => {
      const rng = seededRandom(7);
      const values = new Set(Array.from({ length: 50 }, () => rng()));
      expect(values.size).toBeGreaterThan(40); // should all be unique
    });
  });
});
