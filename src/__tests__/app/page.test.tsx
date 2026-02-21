import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import HomePage from "@/app/page";

/* ─── Mocks ─── */

// Framer Motion — strip animation logic so tests are pure DOM assertions
vi.mock("framer-motion", () => {
  const actual = vi.importActual<typeof import("framer-motion")>("framer-motion");
  const React = require("react");
  const ForwardedMotionDiv = React.forwardRef(
    ({ children, className, style, onClick, onMouseEnter, onMouseLeave, onMouseMove, ...rest }: any, ref: any) =>
      React.createElement("div", { ref, className, style, onClick, onMouseEnter, onMouseLeave, onMouseMove }, children)
  );
  const MotionSpan = ({ children, style, className }: any) =>
    React.createElement("span", { className, style }, children);
  const MotionH2 = ({ children, className, style }: any) =>
    React.createElement("h2", { className, style }, children);
  return {
    ...actual,
    motion: {
      div: ForwardedMotionDiv,
      span: MotionSpan,
      h2: MotionH2,
    },
    AnimatePresence: ({ children }: any) => children,
  };
});

// next/link — render as plain <a>
vi.mock("next/link", () => ({
  default: ({ href, children, className }: any) => {
    const React = require("react");
    return React.createElement("a", { href, className }, children);
  },
}));

// InfoModal — lightweight stub so GameCard tests stay focused
vi.mock("@/components/InfoModal", () => ({
  default: ({ game }: { game: string }) => {
    const React = require("react");
    return React.createElement("button", { "data-testid": `info-modal-${game}` }, "ℹ");
  },
}));

/* ─── Helpers ─── */

/** Wait for all pending state updates + useEffect calls to flush */
async function flushEffects() {
  await waitFor(() => {}, { timeout: 100 });
}

/* ─── Test Suite ─── */

describe("HomePage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  /* ── Page-level structure ── */

  describe("page structure", () => {
    it("renders the main landmark element", async () => {
      render(<HomePage />);
      await flushEffects();
      expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it('renders the "Welcome to" label', async () => {
      render(<HomePage />);
      await flushEffects();
      expect(screen.getByText(/welcome to/i)).toBeInTheDocument();
    });

    it('renders the "The Arena" heading', async () => {
      render(<HomePage />);
      await flushEffects();
      expect(
        screen.getByRole("heading", { level: 1, name: /the arena/i })
      ).toBeInTheDocument();
    });

    it('renders the "Select Your Battlefield" sub-heading', async () => {
      render(<HomePage />);
      await flushEffects();
      expect(
        screen.getByRole("heading", { name: /select your battlefield/i })
      ).toBeInTheDocument();
    });

    it('renders the "7 Games Available" badge', async () => {
      render(<HomePage />);
      await flushEffects();
      expect(screen.getByText(/7 games available/i)).toBeInTheDocument();
    });

    it("renders the footer attribution", async () => {
      render(<HomePage />);
      await flushEffects();
      expect(screen.getByText(/jerome kingsly/i)).toBeInTheDocument();
    });

    it("renders the version label in the footer", async () => {
      render(<HomePage />);
      await flushEffects();
      expect(screen.getByText(/v1\.0/i)).toBeInTheDocument();
    });
  });

  /* ── All 6 games rendered ── */

  describe("game cards — presence", () => {
    const expectedGames = [
      { title: /codenames/i, href: "/cn", emoji: "🕵️" },
      { title: /imposter/i, href: "/im", emoji: "🎭" },
      { title: /truth or dare/i, href: "/td", emoji: "🔥" },
      { title: /never have i ever/i, href: "/nhie", emoji: "🍺" },
      { title: /charades/i, href: "/ch", emoji: "🎬" },
      { title: /mafia/i, href: "/mf", emoji: "🔪" },
    ] as const;

    it("renders exactly 6 game titles across both grids", async () => {
      render(<HomePage />);
      await flushEffects();
      // Each game appears in both mobile tile AND desktop card — so 2 × 6 = 12 headings
      const headings = screen.getAllByRole("heading", { level: 2 });
      // Filter to only game title headings (exclude "Select Your Battlefield")
      const gameTitles = headings.filter((h) =>
        expectedGames.some((g) => g.title.test(h.textContent ?? ""))
      );
      // 6 mobile + 6 desktop = 12 instances
      expect(gameTitles).toHaveLength(12);
    });

    it.each(expectedGames)(
      'renders "$title" card with correct href',
      async ({ href }) => {
        render(<HomePage />);
        await flushEffects();
        const links = screen.getAllByRole("link").filter((l) => l.getAttribute("href") === href);
        expect(links.length).toBeGreaterThanOrEqual(1);
      }
    );

    it.each(expectedGames)(
      'renders correct emoji for "%s"',
      async ({ emoji }) => {
        render(<HomePage />);
        await flushEffects();
        const emojis = screen.getAllByText(emoji);
        expect(emojis.length).toBeGreaterThanOrEqual(1);
      }
    );
  });

  /* ── Game card content ── */

  describe("game cards — content", () => {
    it("renders codenames subtitle", async () => {
      render(<HomePage />);
      await flushEffects();
      expect(screen.getAllByText(/tactical word espionage/i).length).toBeGreaterThanOrEqual(1);
    });

    it("renders imposter subtitle", async () => {
      render(<HomePage />);
      await flushEffects();
      expect(screen.getAllByText(/social deception engine/i).length).toBeGreaterThanOrEqual(1);
    });

    it("renders truth or dare subtitle", async () => {
      render(<HomePage />);
      await flushEffects();
      expect(screen.getAllByText(/confess or face it/i).length).toBeGreaterThanOrEqual(1);
    });

    it("renders never have i ever subtitle", async () => {
      render(<HomePage />);
      await flushEffects();
      expect(screen.getAllByText(/secrets & confessions/i).length).toBeGreaterThanOrEqual(1);
    });

    it("renders charades subtitle", async () => {
      render(<HomePage />);
      await flushEffects();
      expect(screen.getAllByText(/act it out/i).length).toBeGreaterThanOrEqual(1);
    });

    it("renders mafia subtitle", async () => {
      render(<HomePage />);
      await flushEffects();
      expect(screen.getAllByText(/night falls/i).length).toBeGreaterThanOrEqual(1);
    });

    it('renders "Enter Arena" CTA on every desktop card', async () => {
      render(<HomePage />);
      await flushEffects();
      const ctas = screen.getAllByText(/enter arena/i);
      expect(ctas).toHaveLength(7);
    });

    it("renders player counts on desktop cards", async () => {
      render(<HomePage />);
      await flushEffects();
      // "2+ Players" appears for codenames
      expect(screen.getAllByText(/2\+ players/i).length).toBeGreaterThanOrEqual(1);
      // "5–15 Players" appears for mafia
      expect(screen.getAllByText(/5[–-]15 players/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  /* ── Navigation links ── */

  describe("navigation links", () => {
    const routes = ["/cn", "/im", "/td", "/nhie", "/ch", "/mf"];

    it.each(routes)("has a link to %s", async (route) => {
      render(<HomePage />);
      await flushEffects();
      const links = screen.getAllByRole("link").filter((l) => l.getAttribute("href") === route);
      expect(links.length).toBeGreaterThanOrEqual(1);
    });

    it("each link wraps a valid game card", async () => {
      render(<HomePage />);
      await flushEffects();
      const links = screen.getAllByRole("link");
      const gameLinks = links.filter((l) => routes.includes(l.getAttribute("href") ?? ""));
      // 6 mobile + 6 desktop
      expect(gameLinks).toHaveLength(12);
    });
  });

  /* ── InfoModal stubs ── */

  describe("InfoModal integration", () => {
    const gameVariants = [
      "codenames",
      "imposter",
      "truthordare",
      "neverhaveiever",
      "charades",
      "mafia",
    ];

    it.each(gameVariants)(
      "renders an info modal trigger for %s",
      async (variant) => {
        render(<HomePage />);
        await flushEffects();
        expect(screen.getByTestId(`info-modal-${variant}`)).toBeInTheDocument();
      }
    );
  });

  /* ── Mobile tile grid ── */

  describe("mobile game grid", () => {
    it("renders 7 mobile tiles", async () => {
      render(<HomePage />);
      await flushEffects();
      // Mobile tiles show player count without subtitle; codenames = "2+ Players"
      const mobileGrid = document
        .querySelector(".grid.grid-cols-2")!;
      expect(mobileGrid).not.toBeNull();
      // 7 direct motion wrapper children
      expect(mobileGrid.children).toHaveLength(7);
    });

    it("mobile tiles contain correct player counts", async () => {
      render(<HomePage />);
      await flushEffects();
      // "2–15 Players" appears for 4 games in mobile tiles
      const badges = screen.getAllByText(/2[–-]15 players/i);
      expect(badges.length).toBeGreaterThanOrEqual(4);
    });
  });

  /* ── Mounted / hydration guard ── */

  describe("hydration guard", () => {
    it("renders without throwing on initial (SSR-like) render before effects fire", () => {
      // Render synchronously without flushing effects — simulates SSR output
      expect(() => render(<HomePage />)).not.toThrow();
    });

    it("renders full content after effects fire (client hydration)", async () => {
      render(<HomePage />);
      await flushEffects();
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });
  });
});
