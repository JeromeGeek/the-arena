import { describe, it, expect } from "vitest";
import {
  prompts,
  getPromptsByIntensity,
  shufflePrompts,
  type NHIEIntensity,
} from "@/lib/neverhaveiever";

describe("neverhaveiever", () => {
  describe("prompts", () => {
    it("has prompts for all intensities", () => {
      const intensities: NHIEIntensity[] = ["wild", "spicy", "chaos"];
      for (const intensity of intensities) {
        const count = prompts.filter((p) => p.intensity === intensity).length;
        expect(count).toBeGreaterThan(0);
      }
    });

    it("all prompts start with 'Never have I ever'", () => {
      prompts.forEach((p) => {
        expect(p.text.startsWith("Never have I ever")).toBe(true);
      });
    });

    it("all prompts have non-empty text", () => {
      prompts.forEach((p) => {
        expect(p.text.length).toBeGreaterThan(20);
      });
    });
  });

  describe("getPromptsByIntensity", () => {
    it("wild returns only wild prompts", () => {
      const result = getPromptsByIntensity("wild");
      result.forEach((p) => expect(p.intensity).toBe("wild"));
      expect(result.length).toBeGreaterThan(0);
    });

    it("spicy returns wild + spicy prompts", () => {
      const result = getPromptsByIntensity("spicy");
      const intensities = new Set(result.map((p) => p.intensity));
      expect(intensities.has("chaos")).toBe(false);
      expect(intensities.has("wild")).toBe(true);
      expect(intensities.has("spicy")).toBe(true);
    });

    it("chaos returns all prompts", () => {
      const result = getPromptsByIntensity("chaos");
      expect(result.length).toBe(prompts.length);
    });
  });

  describe("shufflePrompts", () => {
    it("returns same length as input", () => {
      const pool = getPromptsByIntensity("wild");
      const shuffled = shufflePrompts(pool);
      expect(shuffled.length).toBe(pool.length);
    });

    it("contains the same elements", () => {
      const pool = getPromptsByIntensity("spicy");
      const shuffled = shufflePrompts(pool);
      const original = new Set(pool.map((p) => p.text));
      const result = new Set(shuffled.map((p) => p.text));
      expect(result).toEqual(original);
    });

    it("does not mutate the original array", () => {
      const pool = getPromptsByIntensity("wild");
      const originalTexts = pool.map((p) => p.text);
      shufflePrompts(pool);
      expect(pool.map((p) => p.text)).toEqual(originalTexts);
    });

    it("is deterministic with a seeded random", () => {
      const pool = getPromptsByIntensity("chaos");
      let i = 0;
      const rng = () => {
        i = (i + 1) % 100;
        return i / 100;
      };
      let j = 0;
      const rng2 = () => {
        j = (j + 1) % 100;
        return j / 100;
      };
      const s1 = shufflePrompts(pool, rng);
      const s2 = shufflePrompts(pool, rng2);
      expect(s1.map((p) => p.text)).toEqual(s2.map((p) => p.text));
    });
  });
});
