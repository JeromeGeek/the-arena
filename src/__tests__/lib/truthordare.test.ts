import { describe, it, expect } from "vitest";
import {
  truths,
  dares,
  getRandomPrompt,
  type Intensity,
} from "@/lib/truthordare";

describe("truthordare", () => {
  describe("prompt banks", () => {
    it("has truths for all intensities", () => {
      const intensities: Intensity[] = ["mild", "spicy", "extreme"];
      for (const intensity of intensities) {
        const count = truths.filter((t) => t.intensity === intensity).length;
        expect(count).toBeGreaterThan(0);
      }
    });

    it("has dares for all intensities", () => {
      const intensities: Intensity[] = ["mild", "spicy", "extreme"];
      for (const intensity of intensities) {
        const count = dares.filter((d) => d.intensity === intensity).length;
        expect(count).toBeGreaterThan(0);
      }
    });

    it("all truths have type 'truth'", () => {
      truths.forEach((t) => expect(t.type).toBe("truth"));
    });

    it("all dares have type 'dare'", () => {
      dares.forEach((d) => expect(d.type).toBe("dare"));
    });

    it("all prompts have non-empty text", () => {
      [...truths, ...dares].forEach((p) => {
        expect(p.text.length).toBeGreaterThan(10);
      });
    });
  });

  describe("getRandomPrompt", () => {
    it("returns a truth prompt", () => {
      const result = getRandomPrompt("truth", "mild", new Set());
      expect(result).not.toBeNull();
      expect(result!.prompt.type).toBe("truth");
    });

    it("returns a dare prompt", () => {
      const result = getRandomPrompt("dare", "mild", new Set());
      expect(result).not.toBeNull();
      expect(result!.prompt.type).toBe("dare");
    });

    it("mild intensity only returns mild prompts", () => {
      for (let i = 0; i < 20; i++) {
        const result = getRandomPrompt("truth", "mild", new Set());
        expect(result!.prompt.intensity).toBe("mild");
      }
    });

    it("spicy intensity returns mild or spicy prompts", () => {
      const results = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const result = getRandomPrompt("truth", "spicy", new Set());
        results.add(result!.prompt.intensity);
      }
      expect(results.has("extreme")).toBe(false);
    });

    it("extreme intensity can return any intensity", () => {
      const results = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const result = getRandomPrompt("truth", "extreme", new Set());
        results.add(result!.prompt.intensity);
      }
      expect(results.size).toBeGreaterThanOrEqual(2);
    });

    it("excludes used indices", () => {
      const usedIndices = new Set<number>();
      const seenTexts = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const result = getRandomPrompt("truth", "extreme", usedIndices);
        if (!result) break;
        expect(seenTexts.has(result.prompt.text)).toBe(false);
        seenTexts.add(result.prompt.text);
        usedIndices.add(result.index);
      }
    });

    it("returns null when all prompts are used", () => {
      const allIndices = new Set(truths.map((_, i) => i));
      const result = getRandomPrompt("truth", "extreme", allIndices);
      expect(result).toBeNull();
    });
  });
});
