import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// ── localStorage mock ──────────────────────────────────────────────────────
const localStorageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { localStorageStore[key] = String(value); }),
  removeItem: vi.fn((key: string) => { delete localStorageStore[key]; }),
  clear: vi.fn(() => { Object.keys(localStorageStore).forEach((k) => delete localStorageStore[k]); }),
  get length() { return Object.keys(localStorageStore).length; },
  key: vi.fn((index: number) => Object.keys(localStorageStore)[index] ?? null),
};
Object.defineProperty(global, "localStorage", { value: localStorageMock, writable: true, configurable: true });

// ── sessionStorage mock ────────────────────────────────────────────────────
const sessionStorageStore: Record<string, string> = {};
const sessionStorageMock = {
  getItem: vi.fn((key: string) => sessionStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { sessionStorageStore[key] = String(value); }),
  removeItem: vi.fn((key: string) => { delete sessionStorageStore[key]; }),
  clear: vi.fn(() => { Object.keys(sessionStorageStore).forEach((k) => delete sessionStorageStore[k]); }),
  get length() { return Object.keys(sessionStorageStore).length; },
  key: vi.fn((index: number) => Object.keys(sessionStorageStore)[index] ?? null),
};
Object.defineProperty(global, "sessionStorage", { value: sessionStorageMock, writable: true, configurable: true });

// ── window.matchMedia mock (single, definitive declaration) ────────────────
// jsdom does not implement matchMedia. Define it once with configurable:true
// so vi.fn() replacements in individual tests work cleanly.
Object.defineProperty(global, "matchMedia", {
  writable: true,
  configurable: true,
  value: vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ── ResizeObserver mock ────────────────────────────────────────────────────
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
