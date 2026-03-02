import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    css: false,

    // ── Timeouts & reliability ──────────────────────────────────────────
    // Each individual test must complete within 5 s.
    // Hook (beforeAll / afterAll) budget is 10 s.
    // If more than 3 tests fail, abort the whole run immediately — no point
    // waiting for a hung suite to time out.
    testTimeout: 5_000,
    hookTimeout: 10_000,
    bail: 3,

    // Run suites in parallel across worker threads for speed, but cap
    // workers so we don't thrash CPU on a laptop/CI box.
    pool: "threads",

    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/lib/**/*.ts", "src/components/**/*.tsx"],
      exclude: ["src/__tests__/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
