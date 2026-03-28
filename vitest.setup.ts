import "@testing-library/jest-dom/vitest";
import { afterEach, beforeAll, vi } from "vitest";

beforeAll(() => {
  process.env.TZ = "UTC";

  if (typeof window === "undefined") {
    return;
  }

  if (!window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  }

  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = vi.fn();
  }
});

afterEach(() => {
  if (typeof window !== "undefined") {
    localStorage.clear();
    sessionStorage.clear();
  }
});
