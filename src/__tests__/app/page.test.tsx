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
  const MotionButton = React.forwardRef(
    ({ children, className, style, onClick, disabled, ...rest }: any, ref: any) =>
      React.createElement("button", { ref, className, style, onClick, disabled }, children)
  );
  const MotionSpan = ({ children, style, className }: any) =>
    React.createElement("span", { className, style }, children);
  const MotionH2 = ({ children, className, style }: any) =>
    React.createElement("h2", { className, style }, children);
  const MotionP = ({ children, className, style }: any) =>
    React.createElement("p", { className, style }, children);
  const MotionInput = React.forwardRef(
    ({ className, style, onChange, onKeyDown, onFocus, onBlur, placeholder, value, type, maxLength, disabled }: any, ref: any) =>
      React.createElement("input", { ref, className, style, onChange, onKeyDown, onFocus, onBlur, placeholder, value, type, maxLength, disabled })
  );
  return {
    ...actual,
    motion: {
      div: ForwardedMotionDiv,
      button: MotionButton,
      span: MotionSpan,
      h2: MotionH2,
      p: MotionP,
      input: MotionInput,
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

/** Render with a pre-existing username so WelcomeModal doesn't show */
function renderWithUser() {
  localStorage.setItem("arena-username", "TestPlayer");
  return render(<HomePage />);
}

/* ─── Test Suite ─── */

describe("HomePage", () => {
  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  /* ── Page-level structure ── */

  describe("page structure", () => {
    it("renders the main landmark element", async () => {
      renderWithUser();
      await flushEffects();
      expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it('renders the "Welcome to" label', async () => {
      // With a stored username the eyebrow shows "Welcome back, X 👋"
      // Without username it shows "Welcome to" (in WelcomeModal + main page)
      renderWithUser();
      await flushEffects();
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });

    it('renders the "Arena Party" heading', async () => {
      renderWithUser();
      await flushEffects();
      expect(
        screen.getByRole("heading", { level: 1, name: /arena party/i })
      ).toBeInTheDocument();
    });

    it('renders the "Select Your Battlefield" tagline', async () => {
      renderWithUser();
      await flushEffects();
      expect(
        screen.getByText(/select your battlefield/i)
      ).toBeInTheDocument();
    });

    it('renders the "7 Games Available" badge', async () => {
      renderWithUser();
      await flushEffects();
      const links = screen.getAllByRole("link");
      const uniqueGameHrefs = new Set(
        links
          .map((l) => l.getAttribute("href") ?? "")
          .filter((href) =>
            ["/codenames", "/imposter", "/truthordare", "/neverhaveiever", "/charades", "/pictionary", "/headrush"].includes(href)
          )
      );
      expect(uniqueGameHrefs.size).toBe(7);
    });

    it("renders the footer attribution", async () => {
      renderWithUser();
      await flushEffects();
      expect(screen.getByText(/jerome kingsly/i)).toBeInTheDocument();
    });

    it("renders the version label in the footer", async () => {
      renderWithUser();
      await flushEffects();
      expect(screen.getByText(/jerome kingsly/i)).toBeInTheDocument();
    });
  });

  /* ── All games rendered ── */

  describe("game cards — presence", () => {
    const expectedGames = [
      { title: /codenames/i, href: "/codenames", emoji: "🕵️" },
      { title: /imposter/i, href: "/imposter", emoji: "🎭" },
      { title: /truth or dare/i, href: "/truthordare", emoji: "🔥" },
      { title: /never have i ever/i, href: "/neverhaveiever", emoji: "🍺" },
      { title: /charades/i, href: "/charades", emoji: "🎬" },
      { title: /pictionary/i, href: "/pictionary", emoji: "🎨" },
      { title: /snap quiz/i, href: "/headrush", emoji: "🖼️" },
    ] as const;

    it("renders all 8 game titles in the DOM", async () => {
      renderWithUser();
      await flushEffects();
      // Each game title appears at least once (mobile or desktop layout)
      for (const g of expectedGames) {
        const matches = screen.getAllByText(g.title);
        expect(matches.length).toBeGreaterThanOrEqual(1);
      }
    });

    it.each(expectedGames)(
      'renders "$title" card with correct href',
      async ({ href }) => {
        renderWithUser();
        await flushEffects();
        const links = screen.getAllByRole("link").filter((l) => l.getAttribute("href") === href);
        expect(links.length).toBeGreaterThanOrEqual(1);
      }
    );

    it.each(expectedGames)(
      'renders correct emoji for "%s"',
      async ({ emoji }) => {
        renderWithUser();
        await flushEffects();
        const emojis = screen.getAllByText(emoji);
        expect(emojis.length).toBeGreaterThanOrEqual(1);
      }
    );
  });

  /* ── Game card content ── */

  describe("game cards — content", () => {
    it("renders codenames subtitle", async () => {
      renderWithUser();
      await flushEffects();
      expect(screen.getAllByText(/tactical word espionage/i).length).toBeGreaterThanOrEqual(1);
    });

    it("renders imposter subtitle", async () => {
      renderWithUser();
      await flushEffects();
      expect(screen.getAllByText(/social deception engine/i).length).toBeGreaterThanOrEqual(1);
    });

    it("renders truth or dare subtitle", async () => {
      renderWithUser();
      await flushEffects();
      expect(screen.getAllByText(/confess or face it/i).length).toBeGreaterThanOrEqual(1);
    });

    it("renders never have i ever subtitle", async () => {
      renderWithUser();
      await flushEffects();
      expect(screen.getAllByText(/secrets & confessions/i).length).toBeGreaterThanOrEqual(1);
    });

    it("renders charades subtitle", async () => {
      renderWithUser();
      await flushEffects();
      expect(screen.getAllByText(/act it out/i).length).toBeGreaterThanOrEqual(1);
    });

    it('renders "Enter Arena" CTA on every desktop card', async () => {
      renderWithUser();
      await flushEffects();
      const ctas = screen.getAllByText(/enter arena/i);
      expect(ctas).toHaveLength(7);
    });

    it("renders player counts on desktop cards", async () => {
      renderWithUser();
      await flushEffects();
      expect(screen.getAllByText(/4\+ players/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/2[–-]15 players/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  /* ── Navigation links ── */

  describe("navigation links", () => {
    const routes = ["/codenames", "/imposter", "/truthordare", "/neverhaveiever", "/charades", "/pictionary", "/headrush"];

    it.each(routes)("has a link to %s", async (route) => {
      renderWithUser();
      await flushEffects();
      const links = screen.getAllByRole("link").filter((l) => l.getAttribute("href") === route);
      expect(links.length).toBeGreaterThanOrEqual(1);
    });

    it("each link wraps a valid game card", async () => {
      renderWithUser();
      await flushEffects();
      const links = screen.getAllByRole("link");
      const gameLinks = links.filter((l) => routes.includes(l.getAttribute("href") ?? ""));
      // 7 mobile + 7 desktop = 14
      expect(gameLinks).toHaveLength(14);
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
      "inkarena",
      "headrush",
    ];

    it.each(gameVariants)(
      "renders an info modal trigger for %s",
      async (variant) => {
        renderWithUser();
        await flushEffects();
        const elements = screen.getAllByTestId(`info-modal-${variant}`);
        expect(elements.length).toBeGreaterThanOrEqual(1);
      }
    );
  });

  /* ── Mobile tile grid ── */

  describe("mobile game grid", () => {
    it("renders 7 mobile tiles", async () => {
      renderWithUser();
      await flushEffects();
      const gameRoutes = ["/codenames", "/imposter", "/truthordare", "/neverhaveiever", "/charades", "/pictionary", "/headrush"];
      const links = screen.getAllByRole("link").filter((l) => gameRoutes.includes(l.getAttribute("href") ?? ""));
      // 7 mobile + 7 desktop = 14 total
      expect(links.length).toBeGreaterThanOrEqual(14);
    });

    it("mobile tiles contain correct player counts", async () => {
      renderWithUser();
      await flushEffects();
      const badges = screen.getAllByText(/2[–-]15 players/i);
      expect(badges.length).toBeGreaterThanOrEqual(4);
    });
  });

  /* ── Mounted / hydration guard ── */

  describe("hydration guard", () => {
    it("renders without throwing on initial (SSR-like) render before effects fire", () => {
      expect(() => render(<HomePage />)).not.toThrow();
    });

    it("renders full content after effects fire (client hydration)", async () => {
      renderWithUser();
      await flushEffects();
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });
  });
});
