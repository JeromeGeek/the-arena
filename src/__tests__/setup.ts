import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// ── localStorage mock ──────────────────────────────────────────────────────
// jsdom provides localStorage, but some environments strip it. Provide a
// reliable in-memory mock so any test that renders components using
// localStorage won't blow up.
const localStorageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageStore[key] = String(value);
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageStore[key];
  }),
  clear: vi.fn(() => {
    Object.keys(localStorageStore).forEach((k) => delete localStorageStore[k]);
  }),
  get length() {
    return Object.keys(localStorageStore).length;
  },
  key: vi.fn((index: number) => Object.keys(localStorageStore)[index] ?? null),
};
Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// ── sessionStorage mock ───────────────────────────────────────────────────
const sessionStorageStore: Record<string, string> = {};
const sessionStorageMock = {
  getItem: vi.fn((key: string) => sessionStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    sessionStorageStore[key] = String(value);
  }),
  removeItem: vi.fn((key: string) => {
    delete sessionStorageStore[key];
  }),
  clear: vi.fn(() => {
    Object.keys(sessionStorageStore).forEach((k) => delete sessionStorageStore[k]);
  }),
  get length() {
    return Object.keys(sessionStorageStore).length;
  },
  key: vi.fn((index: number) => Object.keys(sessionStorageStore)[index] ?? null),
};
Object.defineProperty(global, "sessionStorage", {
  value: sessionStorageMock,
  writable: true,
});
