"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, MouseEvent, useCallback, useEffect } from "react";
import Link from "next/link";
import InfoModal from "@/components/InfoModal";

/* ─── Motion Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

/* ─── Game Card Data ─── */
const games = [
  {
    id: "codenames",
    title: "CODENAMES",
    subtitle: "Tactical Word Espionage",
    description: "2 Teams · 20 Cards · 1 Assassin. One-word clues. Find your agents. One wrong move ends it all.",
    href: "/codenames",
    accentFrom: "#FF416C",
    accentTo: "#FF4B2B",
    glowColor: "rgba(255, 65, 108, 0.35)",
    variant: "codenames" as const,
    players: "4+ Players",
    emoji: "🕵️",
  },
  {
    id: "imposter",
    title: "IMPOSTER",
    subtitle: "Social Deception Engine",
    description: "3–15 Players · 1+ Imposters. Everyone knows the word — except the fake. Describe it. Expose them.",
    href: "/imposter",
    accentFrom: "#00B4DB",
    accentTo: "#0083B0",
    glowColor: "rgba(0, 180, 219, 0.35)",
    variant: "imposter" as const,
    players: "3–15 Players",
    emoji: "🎭",
  },
  {
    id: "truthordare",
    title: "TRUTH OR DARE",
    subtitle: "Confess or Face It",
    description: "2–15 Players · 3 Intensities. Pick your poison — truth or dare. No filters. No backing out.",
    href: "/truthordare",
    accentFrom: "#A855F7",
    accentTo: "#7C3AED",
    glowColor: "rgba(168, 85, 247, 0.35)",
    variant: "truthordare" as const,
    players: "2–15 Players",
    emoji: "🔥",
  },
  {
    id: "neverhaveiever",
    title: "NEVER HAVE I EVER",
    subtitle: "Secrets & Confessions",
    description: "2–15 Players · 3 Levels. Confess or stay silent. The most experienced player is revealed at the end.",
    href: "/neverhaveiever",
    accentFrom: "#22C55E",
    accentTo: "#16A34A",
    glowColor: "rgba(34, 197, 94, 0.35)",
    variant: "neverhaveiever" as const,
    players: "2–15 Players",
    emoji: "🍺",
  },
  {
    id: "charades",
    title: "CHARADES",
    subtitle: "Act It Out",
    description: "2–15 Players · 7 Categories · Timer. No words. No sounds. Just act. Score the most to dominate.",
    href: "/charades",
    accentFrom: "#FB923C",
    accentTo: "#EA580C",
    glowColor: "rgba(251, 146, 60, 0.35)",
    variant: "charades" as const,
    players: "2–15 Players",
    emoji: "🎬",
  },
  {
    id: "mafia",
    title: "MAFIA",
    subtitle: "Night Falls. Trust No One.",
    description: "5–15 Players · Mafia · Doctor · Detective. Night falls. Lies spread. Hunt the killers before it's too late.",
    href: "/mafia",
    accentFrom: "#EC4899",
    accentTo: "#BE185D",
    glowColor: "rgba(236, 72, 153, 0.35)",
    variant: "mafia" as const,
    players: "5–15 Players",
    emoji: "🔪",
  },
  {
    id: "inkarena",
    title: "PICTIONARY",
    subtitle: "Draw · Steal · Dominate",
    description: "2 Teams · Live Drawing · Steal Points. One phone draws to the TV. Guess fast, sabotage harder.",
    href: "/pictionary",
    accentFrom: "#FF416C",
    accentTo: "#FACC15",
    glowColor: "rgba(250, 100, 80, 0.35)",
    variant: "inkarena" as const,
    players: "4–12 Players",
    emoji: "🎨",
  },
  {
    id: "headrush",
    title: "HEADRUSH",
    subtitle: "Tilt · Guess · Dominate",
    description: "2–4 Teams · Tilt to Score · Race the Clock. Phone on forehead. Teammates shout. Tilt to win.",
    href: "/headrush",
    accentFrom: "#FACC15",
    accentTo: "#CA8A04",
    glowColor: "rgba(250, 204, 21, 0.35)",
    variant: "headrush" as const,
    players: "4+ Players",
    emoji: "🎯",
  },
];

/* ─── First-time Welcome Modal ─── */
function WelcomeModal({ onDone }: { onDone: (name: string) => void }) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Longer delay on mobile so the bottom-sheet animation completes before
    // the keyboard is triggered (avoids layout jump)
    setTimeout(() => inputRef.current?.focus(), 700);
  }, []);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem("arena-username", trimmed);
    onDone(trimmed);
  };

  return (
    <motion.div
      key="welcome-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 32 }}
        transition={{ type: "spring", stiffness: 280, damping: 24, delay: 0.1 }}
        className="w-full max-w-sm rounded-t-3xl p-6 pb-8 text-center sm:rounded-3xl sm:p-8"
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(10,10,15,0.98) 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderBottom: "none",
          boxShadow: "0 -20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* Logo — hidden on mobile to save space when keyboard is up */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
          className="mx-auto mb-4 hidden h-16 w-16 items-center justify-center rounded-2xl text-4xl sm:mb-6 sm:flex"
          style={{
            background: "linear-gradient(135deg, rgba(255,65,108,0.2), rgba(0,180,219,0.15))",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 32px rgba(255,65,108,0.2)",
          }}
        >
          ⚔️
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.4em] text-white/30">
            Welcome to
          </p>
          <h2
            className="text-shimmer mb-1 text-2xl font-black uppercase tracking-[0.15em] sm:mb-2 sm:text-3xl"
            style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
          >
            The Arena
          </h2>
          <p className="mb-5 text-sm text-white/40 sm:mb-8">
            What should we call you?
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Enter your name…"
            maxLength={20}
            className="w-full rounded-xl px-4 py-3.5 text-center text-base font-semibold text-white placeholder-white/20 outline-none transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              caretColor: "#FF416C",
            }}
            onFocus={(e) => {
              e.currentTarget.style.border = "1px solid rgba(255,65,108,0.5)";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,65,108,0.12)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.border = "1px solid rgba(255,255,255,0.12)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />

          <motion.button
            onClick={handleSubmit}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            disabled={!name.trim()}
            className="w-full rounded-xl py-3.5 text-sm font-black uppercase tracking-[0.2em] text-white shadow-lg transition-opacity disabled:opacity-30"
            style={{
              background: "linear-gradient(135deg, #FF416C, #FF4B2B)",
              boxShadow: "0 8px 24px rgba(255,65,108,0.35)",
            }}
          >
            Enter the Arena →
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Per-game desktop idle animations ─── */
const desktopIdleAnimations: Record<string, { animate: object; transition: object }> = {
  codenames: {
    animate: { x: [0, -1.5, 1.5, 0] },
    transition: { duration: 7, repeat: Infinity, ease: "easeInOut" },
  },
  imposter: {
    animate: { opacity: [1, 0.9, 1], scale: [1, 1.005, 1] },
    transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
  },
  truthordare: {
    animate: { y: [0, -2, 1, 0] },
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
  neverhaveiever: {
    animate: { rotate: [0, 0.3, -0.2, 0], y: [0, -1.5, 0] },
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
  },
  charades: {
    animate: { skewX: [0, 0.4, -0.3, 0], y: [0, -1, 0] },
    transition: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
  },
  mafia: {
    animate: { opacity: [1, 0.84, 1] },
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
  inkarena: {
    animate: { rotate: [0, 0.5, -0.5, 0], scale: [1, 1.006, 1] },
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
  },
  headrush: {
    animate: { y: [0, -3, 1, 0], scale: [1, 1.008, 1] },
    transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
  },
};

/* ─── Per-game emoji idle animations (desktop cards) ─── */
const desktopEmojiAnimations: Record<string, { animate: object; transition: object }> = {
  codenames: {
    animate: { rotate: [0, -5, 5, 0] },
    transition: { duration: 6, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" },
  },
  imposter: {
    animate: { scale: [1, 1.15, 1], opacity: [1, 0.8, 1] },
    transition: { duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" },
  },
  truthordare: {
    animate: { scale: [1, 1.2, 1], rotate: [0, 8, -4, 0] },
    transition: { duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" },
  },
  neverhaveiever: {
    animate: { rotate: [0, -10, 10, -5, 0] },
    transition: { duration: 1.5, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" },
  },
  charades: {
    animate: { y: [0, -4, 1, 0], rotate: [0, -5, 5, 0] },
    transition: { duration: 1.8, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" },
  },
  mafia: {
    animate: { scale: [1, 1.1, 0.95, 1], opacity: [1, 0.7, 1] },
    transition: { duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" },
  },
  inkarena: {
    animate: { rotate: [0, -8, 8, -4, 4, 0], scale: [1, 1.1, 1] },
    transition: { duration: 2.5, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" },
  },
  headrush: {
    animate: { y: [0, -6, 2, 0], rotate: [0, -6, 6, 0] },
    transition: { duration: 1.6, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" },
  },
};

/* ─── Per-card unique idle animations (mobile) ─── */
const mobileIdleAnimations: Record<string, { animate: object; transition: object }> = {
  codenames: {
    animate: { x: [0, -2, 2, 0] },
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
  },
  imposter: {
    animate: { opacity: [1, 0.88, 1], scale: [1, 1.008, 1] },
    transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
  },
  truthordare: {
    animate: { x: [0, 2, -1, 0] },
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
  neverhaveiever: {
    animate: { y: [0, -3, 0], rotate: [0, 0.4, -0.2, 0] },
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
  },
  charades: {
    animate: { rotateY: [0, 3, 0], rotateX: [0, 1.5, 0] },
    transition: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
  },
  mafia: {
    animate: { opacity: [1, 0.82, 1] },
    transition: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
  },
  inkarena: {
    animate: { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] },
    transition: { duration: 4, repeat: Infinity, ease: "linear" },
  },
  headrush: {
    animate: { y: [0, -4, 1, 0], scale: [1, 1.012, 1] },
    transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
  },
};

/* ─── Per-card entrance animations ─── */
const mobileEntranceVariants: Record<string, object> = {
  codenames:     { hidden: { opacity: 0, x: -32 },        visible: { opacity: 1, x: 0 } },
  imposter:      { hidden: { opacity: 0, scale: 0.88 },   visible: { opacity: 1, scale: 1 } },
  truthordare:   { hidden: { opacity: 0, x: 32 },         visible: { opacity: 1, x: 0 } },
  neverhaveiever:{ hidden: { opacity: 0, y: 28, rotate: -1.5 }, visible: { opacity: 1, y: 0, rotate: 0 } },
  charades:      { hidden: { opacity: 0, rotateY: 25 },   visible: { opacity: 1, rotateY: 0 } },
  mafia:         { hidden: { opacity: 0 },                visible: { opacity: 1 } },
  inkarena:      { hidden: { opacity: 0, scale: 0.94, y: 16 }, visible: { opacity: 1, scale: 1, y: 0 } },
  headrush:      { hidden: { opacity: 0, y: -20, scale: 0.92 }, visible: { opacity: 1, y: 0, scale: 1 } },
};

/* ─── Luxury Mobile Card (phone only) ─── */
function MobileGameTile({
  game,
  index,
}: {
  game: (typeof games)[0];
  index: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const entranceVariant = mobileEntranceVariants[game.variant] ?? mobileEntranceVariants.codenames;
  const idle = mobileIdleAnimations[game.variant] ?? mobileIdleAnimations.codenames;

  const entranceTransition = {
    delay: index * 0.07 + 0.1,
    duration: game.variant === "mafia" ? 1.2 : 0.55,
    ease: [0.22, 1, 0.36, 1] as const,
    type: "tween" as const,
  };

  return (
    <motion.div
      variants={entranceVariant as Parameters<typeof motion.div>[0]["variants"]}
      initial={mounted ? "hidden" : false}
      animate={mounted ? "visible" : false}
      transition={entranceTransition}
      className="mx-auto w-full max-w-[420px]"
      style={{ perspective: 800 }}
    >
      <Link href={game.href} className="block">
        {/* Outer layer: idle looping tween animation (keyframes) */}
        <motion.div
          animate={mounted ? (idle.animate as Parameters<typeof motion.div>[0]["animate"]) : undefined}
          transition={idle.transition as Parameters<typeof motion.div>[0]["transition"]}
        >
        {/* Inner layer: tap spring — spring only ever animates to a single target */}
        <motion.div
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className="group relative overflow-hidden rounded-[20px]"
          style={{
            background: "rgba(12,12,18,0.90)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderBottom: "1px solid rgba(255,255,255,0.03)",
            boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 24px 48px rgba(0,0,0,0.65), 0 4px 16px rgba(0,0,0,0.4)",
          }}
        >
          {/* Metallic top shimmer — neutral silver, not game-color */}
          <div
            className="absolute left-0 right-0 top-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 40%, rgba(255,255,255,0.22) 60%, transparent 100%)",
            }}
          />

          {/* Accent left edge — only place color shows */}
          <div
            className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full"
            style={{
              background: `linear-gradient(180deg, ${game.accentFrom}90, ${game.accentTo}60)`,
              boxShadow: `0 0 12px ${game.accentFrom}50`,
            }}
          />

          {/* Subtle inner vignette — depth without noise */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[20px]"
            style={{
              background: "radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.015) 0%, transparent 60%)",
            }}
          />

          {/* Card content */}
          <div className="relative z-10 flex items-center gap-4 px-5 py-[14px]">

            {/* Emoji container — frosted neutral glass */}
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
              style={{
                background: "rgba(255,255,255,0.055)",
                border: "1px solid rgba(255,255,255,0.09)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset",
              }}
            >
              {game.emoji}
            </div>

            {/* Middle text block */}
            <div className="flex min-w-0 flex-1 flex-col">
              {/* Players pill — muted accent */}
              <div
                className="mb-[5px] inline-flex w-fit items-center rounded-full px-2 py-[2px] text-[7px] font-semibold uppercase tracking-[0.18em]"
                style={{
                  color: `${game.accentFrom}99`,
                  backgroundColor: `${game.accentFrom}0d`,
                  border: `1px solid ${game.accentFrom}1a`,
                }}
              >
                {game.players}
              </div>

              {/* Title — controlled gradient, not full saturated */}
              <h2
                className="leading-none tracking-[0.42em]"
                style={{
                  fontFamily: "var(--font-syne), var(--font-display)",
                  fontSize: "13px",
                  fontWeight: 700,
                  backgroundImage: game.variant === "inkarena"
                    ? "linear-gradient(90deg, rgba(255,65,108,0.95) 0%, rgba(250,204,21,0.9) 100%)"
                    : `linear-gradient(135deg, ${game.accentFrom}f0, ${game.accentTo}c0)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {game.title}
              </h2>

              {/* Subtitle */}
              <p className="mt-1 text-[8.5px] uppercase tracking-[0.14em] text-white/20">
                {game.subtitle}
              </p>

              {/* Description */}
              <p className="mt-1.5 text-[11px] leading-[1.5] text-white/40">
                {game.description}
              </p>
            </div>

            {/* Chevron — refined, not arrow */}
            <motion.span
              className="shrink-0 text-base"
              style={{ color: "rgba(255,255,255,0.18)" }}
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
            >
              ›
            </motion.span>
          </div>

          {/* Bottom separator — barely-there */}
          <div
            className="absolute bottom-0 left-[20%] right-[20%] h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)" }}
          />
        </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

/* ─── Parallax Tilt Card (tablet/desktop/TV) ─── */
function GameCard({
  game,
  index,
  featured = false,
}: {
  game: (typeof games)[0];
  index: number;
  featured?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });
  const rafRef = useRef<number>(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const idle = desktopIdleAnimations[game.variant] ?? desktopIdleAnimations.codenames;
  const emojiIdle = desktopEmojiAnimations[game.variant] ?? desktopEmojiAnimations.codenames;

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rect = ref.current!.getBoundingClientRect();
      const xPct = (e.clientX - rect.left) / rect.width;
      const yPct = (e.clientY - rect.top) / rect.height;
      const x = xPct - 0.5;
      const y = yPct - 0.5;
      // Featured card gets very subtle tilt; standard cards get more
      const tiltFactor = featured ? 6 : 11;
      setTilt({ x: y * -tiltFactor, y: x * tiltFactor });
      if (featured) {
        setSpotlight({ x: xPct * 100, y: yPct * 100 });
      }
    });
  }, [featured]);

  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
    setSpotlight({ x: 50, y: 50 });
  }, []);

  // Per-variant ambient border accent
  const variantBorder: React.CSSProperties =
    game.variant === "codenames"
      ? { borderTop: "1px solid rgba(255,65,108,0.28)", borderLeft: "1px solid rgba(255,65,108,0.12)" }
      : game.variant === "imposter"
        ? { borderLeft: "1px solid rgba(0,180,219,0.2)", borderRight: "1px solid rgba(0,180,219,0.2)" }
        : game.variant === "truthordare"
          ? { borderBottom: "1px solid rgba(168,85,247,0.3)" }
          : game.variant === "neverhaveiever"
            ? { borderLeft: "1px solid rgba(34,197,94,0.22)", borderRight: "1px solid rgba(34,197,94,0.22)" }
            : game.variant === "charades"
              ? { borderTop: "1px solid rgba(251,146,60,0.3)" }
              : game.variant === "mafia"
                ? { borderBottom: "1px solid rgba(236,72,153,0.3)", borderTop: "1px solid rgba(190,24,93,0.2)" }
                : game.variant === "inkarena"
                  ? { borderTop: "1px solid rgba(255,65,108,0.28)", borderBottom: "1px solid rgba(250,204,21,0.2)" }
                  : game.variant === "headrush"
                    ? { borderBottom: "1px solid rgba(250,204,21,0.3)" }
                    : {};

  const ambientClass =
    game.variant === "codenames"
      ? "smoke-ambient tactical-grid"
      : game.variant === "imposter"
        ? "scanline-effect"
        : game.variant === "truthordare"
          ? "ember-flicker"
          : game.variant === "neverhaveiever"
            ? "ripple-pulse"
            : game.variant === "mafia"
              ? "blood-vignette"
              : game.variant === "inkarena"
                ? "ink-splatter"
                : game.variant === "headrush"
                  ? "headrush-pulse"
                  : "spotlight-sweep";

  if (featured) {
    /* ── FEATURED CARD — large, vertical layout, dominant ── */
    return (
      <motion.div
        custom={1}
        variants={fadeUp}
        initial={mounted ? "hidden" : false}
        animate={mounted ? "visible" : false}
        className="relative h-full w-full"
      >
        <Link href={game.href} className="block h-full">
          <motion.div
            className="h-full"
            animate={mounted ? (idle.animate as Parameters<typeof motion.div>[0]["animate"]) : undefined}
            transition={idle.transition as Parameters<typeof motion.div>[0]["transition"]}
          >
            <motion.div
              ref={ref}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={handleMouseLeave}
              initial={false}
              animate={{
                rotateX: tilt.x,
                rotateY: tilt.y,
                scale: isHovered ? 1.018 : 1,
                z: isHovered ? 30 : 0,
              }}
              transition={{ type: "spring", stiffness: 180, damping: 28 }}
              whileTap={{ scale: 0.98 }}
              style={{ perspective: 1200, transformStyle: "preserve-3d", willChange: "transform" }}
              className="group relative h-full cursor-pointer"
            >
              {/* Soft outer corona — not harsh glow, just a warm breath */}
              <motion.div
                className="absolute -inset-3 rounded-3xl"
                animate={{ opacity: isHovered ? 0.7 : 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{
                  background: `radial-gradient(ellipse at ${spotlight.x}% ${spotlight.y}%, ${game.accentFrom}28 0%, transparent 65%)`,
                  filter: "blur(24px)",
                }}
              />

              {/* Card Body */}
              <div
                className={`${ambientClass} card-featured relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl lg:rounded-3xl`}
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  ...variantBorder,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.28), 0 24px 72px rgba(0,0,0,0.6), 0 6px 24px rgba(0,0,0,0.42)",
                }}
              >
                {/* Cursor-following spotlight radial */}
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-2xl lg:rounded-3xl"
                  animate={{
                    background: isHovered
                      ? `radial-gradient(circle at ${spotlight.x}% ${spotlight.y}%, ${game.accentFrom}18 0%, transparent 55%)`
                      : `radial-gradient(circle at 50% 50%, ${game.accentFrom}08 0%, transparent 55%)`,
                  }}
                  transition={{ duration: 0.08 }}
                />

                {/* Top metallic edge highlight */}
                <div
                  className="absolute left-0 right-0 top-0 h-px"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22) 35%, rgba(255,255,255,0.28) 65%, transparent)" }}
                />

                {/* Shimmer sweep on hover */}
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-2xl lg:rounded-3xl"
                  animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? "110%" : "-30%" }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  style={{ background: "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.04) 50%, transparent 80%)" }}
                />

                        {/* Content — fills the card, content at bottom, emoji top-right */}
                <div className="relative z-10 flex h-full flex-col p-5 lg:p-7">

                  {/* Top bar: accent rule + "Featured" label + emoji */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="h-[1.5px] rounded-full"
                        animate={{ width: isHovered ? "3rem" : "1.75rem" }}
                        transition={{ type: "spring", stiffness: 260, damping: 22 }}
                        style={{ background: `linear-gradient(90deg, ${game.accentFrom}, ${game.accentTo})` }}
                      />
                      <span
                        className="text-[8px] font-bold uppercase tracking-[0.35em]"
                        style={{ color: `${game.accentFrom}90` }}
                      >
                        Featured
                      </span>
                    </div>

                    {/* Emoji — accent glass badge */}
                    <motion.div
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-xl lg:h-12 lg:w-12 lg:text-2xl"
                      style={{
                        background: `linear-gradient(135deg, ${game.accentFrom}1c, ${game.accentTo}0e)`,
                        border: `1px solid ${game.accentFrom}30`,
                        backdropFilter: "blur(12px)",
                        boxShadow: isHovered
                          ? `0 0 20px ${game.accentFrom}30, inset 0 1px 0 rgba(255,255,255,0.1)`
                          : `inset 0 1px 0 rgba(255,255,255,0.06)`,
                        transition: "box-shadow 0.4s ease",
                      }}
                      animate={mounted ? (emojiIdle.animate as Parameters<typeof motion.div>[0]["animate"]) : undefined}
                      transition={emojiIdle.transition as Parameters<typeof motion.div>[0]["transition"]}
                    >
                      {game.emoji}
                    </motion.div>
                  </div>

                  {/* Spacer — pushes content to bottom */}
                  <div className="flex-1" />

                  {/* Bottom content block — title, subtitle, desc, cta */}
                  <div className="flex flex-col gap-2.5">
                    {/* Players badge */}
                    <span
                      className="inline-flex w-fit items-center rounded-full px-2.5 py-[3px] text-[8px] font-semibold uppercase tracking-[0.2em]"
                      style={{
                        color: `${game.accentFrom}c0`,
                        backgroundColor: `${game.accentFrom}10`,
                        border: `1px solid ${game.accentFrom}25`,
                      }}
                    >
                      {game.players}
                    </span>

                    {/* Title */}
                    <div>
                      <h2
                        style={{
                          fontFamily: "var(--font-syne), var(--font-display)",
                          fontSize: "clamp(1.75rem, 2.6vw, 2.8rem)",
                          fontWeight: 700,
                          letterSpacing: "0.02em",
                          lineHeight: 1.0,
                        }}
                      >
                        <span
                          style={{
                            backgroundImage: `linear-gradient(140deg, ${game.accentFrom} 0%, ${game.accentTo} 55%, rgba(255,255,255,0.85) 100%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                          }}
                        >
                          {game.title}
                        </span>
                      </h2>
                      <p
                        className="mt-1 text-[9px] font-medium uppercase tracking-[0.22em] lg:text-[10px]"
                        style={{ color: "rgba(255,255,255,0.3)" }}
                      >
                        {game.subtitle}
                      </p>
                    </div>

                    {/* Description */}
                    <p
                      className="text-[10.5px] leading-[1.65] lg:text-[11.5px]"
                      style={{ color: "rgba(255,255,255,0.44)" }}
                    >
                      {game.description}
                    </p>

                    {/* CTA */}
                    <div
                      className="flex items-center gap-2 pt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      <span className="transition-colors duration-300 group-hover:text-white/85">Enter Arena</span>
                      <motion.span
                        animate={{ x: isHovered ? 6 : 0, opacity: isHovered ? 1 : 0.4 }}
                        transition={{ type: "spring", stiffness: 340, damping: 22 }}
                        style={{ color: game.accentFrom }}
                      >
                        →
                      </motion.span>
                    </div>
                  </div>
                </div>

                {/* Soft inner vignette — depth */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl lg:rounded-3xl"
                  style={{ background: "radial-gradient(ellipse at 85% 15%, rgba(255,255,255,0.022) 0%, transparent 55%)" }}
                />
              </div>
            </motion.div>
          </motion.div>
        </Link>

        {/* Info button */}
        <div className="absolute right-4 top-4 z-20 flex h-7 w-7 items-center justify-center">
          <InfoModal game={game.variant} size="sm" />
        </div>
      </motion.div>
    );
  }

  /* ── STANDARD CARD ── */
  return (
    <motion.div
      custom={index + 1}
      variants={fadeUp}
      initial={mounted ? "hidden" : false}
      animate={mounted ? "visible" : false}
      className="relative w-full"
      style={{ minHeight: "clamp(220px, 30vh, 320px)" }}
    >
      <Link href={game.href} className="absolute inset-0">
        {/* Outer idle breathing animation */}
        <motion.div
          className="h-full"
          animate={mounted ? (idle.animate as Parameters<typeof motion.div>[0]["animate"]) : undefined}
          transition={idle.transition as Parameters<typeof motion.div>[0]["transition"]}
        >
          <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            initial={false}
            animate={{
              rotateX: tilt.x,
              rotateY: tilt.y,
              scale: isHovered ? 1.025 : 1,
              z: isHovered ? 30 : 0,
            }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            whileTap={{ scale: 0.97 }}
            style={{ perspective: 1000, transformStyle: "preserve-3d", willChange: "transform" }}
            className="group relative h-full cursor-pointer"
          >
            {/* Soft outer light breath on hover — replaces harsh box-shadow glow */}
            <motion.div
              className="absolute -inset-2 rounded-3xl"
              animate={{ opacity: isHovered ? 0.75 : 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                background: `radial-gradient(ellipse at 50% 50%, ${game.accentFrom}22 0%, transparent 70%)`,
                filter: "blur(18px)",
              }}
            />

            {/* Card Body — flex column so CTA pins to bottom */}
            <div
              className={`${ambientClass} card-premium relative flex h-full flex-col overflow-hidden rounded-2xl p-4 transition-[border-color] duration-500 group-hover:border-white/14 lg:p-5`}
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                ...variantBorder,
                overflow: "clip",
                overflowClipMargin: "0.3em",
              }}
            >
              {/* Top metallic edge */}
              <div
                className="absolute left-0 right-0 top-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18) 40%, rgba(255,255,255,0.22) 60%, transparent)" }}
              />

              {/* Shimmer streak on hover */}
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-2xl"
                animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? "110%" : "-30%" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ background: "linear-gradient(105deg, transparent 25%, rgba(255,255,255,0.042) 50%, transparent 75%)" }}
              />

              {/* Animated emoji badge — top-right, shifted left of info button */}
              <motion.div
                className="absolute right-11 top-3.5 z-10 flex h-9 w-9 items-center justify-center rounded-xl text-lg leading-none lg:h-10 lg:w-10 lg:text-xl"
                style={{
                  background: `linear-gradient(135deg, ${game.accentFrom}18, ${game.accentTo}0e)`,
                  border: `1px solid ${game.accentFrom}30`,
                  backdropFilter: "blur(8px)",
                  transition: "box-shadow 0.4s ease",
                  boxShadow: isHovered ? `0 0 20px ${game.accentFrom}40, inset 0 1px 0 rgba(255,255,255,0.08)` : "inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
                animate={mounted ? (emojiIdle.animate as Parameters<typeof motion.div>[0]["animate"]) : undefined}
                transition={emojiIdle.transition as Parameters<typeof motion.div>[0]["transition"]}
              >
                {game.emoji}
              </motion.div>

              {/* ── TOP SECTION ── */}
              <div className="mb-auto">
                {/* Accent line + players pill row */}
                <div className="mb-3 flex items-center gap-2.5">
                  <motion.div
                    className="h-[2px] rounded-full"
                    animate={{ width: isHovered ? "2.5rem" : "1.5rem" }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    style={{ background: `linear-gradient(90deg, ${game.accentFrom}, ${game.accentTo}80)` }}
                  />
                  <span
                    className="inline-flex items-center rounded-full px-2 py-[2px] text-[7px] font-bold uppercase tracking-[0.2em]"
                    style={{
                      color: `${game.accentFrom}b0`,
                      backgroundColor: `${game.accentFrom}0f`,
                      border: `1px solid ${game.accentFrom}22`,
                    }}
                  >
                    {game.players}
                  </span>
                </div>

                {/* Title */}
                <h2
                  className="mb-1 pr-20 leading-[1.05]"
                  style={{
                    fontFamily: "var(--font-syne), var(--font-display)",
                    fontSize: "clamp(1rem, 1.4vw, 1.5rem)",
                    fontWeight: 800,
                    letterSpacing: "0.02em",
                  }}
                >
                  <span
                    style={game.variant === "inkarena" ? {
                      backgroundImage: "linear-gradient(90deg, #FF416C 0%, #FF8C00 30%, #FACC15 60%, #FB923C 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    } : {
                      backgroundImage: `linear-gradient(140deg, ${game.accentFrom} 0%, ${game.accentTo}d0 60%, rgba(255,255,255,0.8) 100%)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {game.title}
                  </span>
                </h2>

                {/* Subtitle */}
                <p className="mb-3 pr-20 text-[9px] font-medium uppercase tracking-[0.16em] text-white/30 lg:text-[10px]">
                  {game.subtitle}
                </p>

                {/* Description */}
                <p className="text-[10px] leading-[1.65] text-white/50 lg:text-[11px]">
                  {game.description}
                </p>
              </div>

              {/* ── BOTTOM CTA — always at bottom ── */}
              <div className="mt-4 flex items-center justify-between border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[9px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 group-hover:text-white/90 lg:text-[10px]"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    Enter Arena
                  </span>
                  <motion.span
                    initial={false}
                    animate={{ x: isHovered ? 5 : 0, opacity: isHovered ? 1 : 0.35 }}
                    transition={{ type: "spring", stiffness: 320, damping: 22 }}
                    className="text-sm font-bold"
                    style={{ color: game.accentFrom }}
                  >
                    →
                  </motion.span>
                </div>
                {/* Hover accent pulse */}
                <motion.div
                  className="h-[1px] rounded-full"
                  animate={{ width: isHovered ? "2rem" : "0.5rem", opacity: isHovered ? 0.7 : 0.2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  style={{ background: `linear-gradient(90deg, ${game.accentTo}, ${game.accentFrom})` }}
                />
              </div>

              {/* Soft inner depth vignette */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl"
                style={{ background: "radial-gradient(ellipse at 80% 15%, rgba(255,255,255,0.02) 0%, transparent 55%)" }}
              />
            </div>
          </motion.div>
        </motion.div>
      </Link>

      {/* Info button */}
      <div className="absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center">
        <InfoModal game={game.variant} size="sm" />
      </div>
    </motion.div>
  );
}

/* ─── Landing Page ─── */
export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("arena-username");
    if (stored) {
      setUsername(stored);
    } else {
      setShowWelcome(true);
    }
  }, []);

  const handleNameSet = (name: string) => {
    setUsername(name);
    setShowWelcome(false);
  };

  return (
    <main className="grain-overlay relative flex flex-col px-3 py-2 sm:px-6 sm:py-3 md:py-4 lg:py-5 xl:py-6"
      style={{ minHeight: "100dvh", overscrollBehavior: "none" }}
    >

      {/* First-time username modal */}
      <AnimatePresence>
        {showWelcome && <WelcomeModal onDone={handleNameSet} />}
      </AnimatePresence>
      {/* Ambient Background — fixed to viewport, never scrolls with content */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ contain: "strict" }}>
        {/* Layer 0: Deep base — rich obsidian with directional gradient */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(160deg, #09090f 0%, #080b11 45%, #060810 100%)" }}
        />

        {/* Layer 1: Large slow-drifting colour fields — very low opacity, luxury not harsh */}
        <motion.div
          className="absolute"
          style={{ top: "-10%", left: "-5%", width: "65%", height: "70%", borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(255,65,108,0.055) 0%, transparent 68%)", filter: "blur(60px)", willChange: "transform" }}
          animate={{ x: [0, 18, -8, 0], y: [0, -12, 8, 0], scale: [1, 1.04, 0.98, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute"
          style={{ bottom: "-5%", right: "-8%", width: "60%", height: "65%", borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(0,180,219,0.048) 0%, transparent 65%)", filter: "blur(70px)", willChange: "transform" }}
          animate={{ x: [0, -14, 10, 0], y: [0, 10, -6, 0], scale: [1, 0.97, 1.03, 1] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
        <motion.div
          className="absolute"
          style={{ top: "20%", left: "30%", width: "50%", height: "55%", borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(168,85,247,0.038) 0%, transparent 60%)", filter: "blur(80px)", willChange: "transform" }}
          animate={{ x: [0, 10, -16, 0], y: [0, -8, 12, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 8 }}
        />

        {/* Layer 2: Smaller accent orbs — mid-depth */}
        <div className="absolute left-[15%] top-[40%] h-[280px] w-[280px] rounded-full bg-[rgba(34,197,94,0.028)] blur-[55px]" />
        <div className="absolute bottom-[25%] right-[20%] h-[240px] w-[240px] rounded-full bg-[rgba(249,115,22,0.025)] blur-[50px]" />
        <div className="absolute right-[40%] top-[55%] h-[200px] w-[200px] rounded-full bg-[rgba(192,38,211,0.03)] blur-[45px]" />

        {/* Layer 3: Fine grain texture — adds luxury tactility */}
        <div
          className="absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Layer 4: Edge vignette — draws eye to center */}
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,0.45) 75%, rgba(0,0,0,0.7) 100%)" }}
        />

        {/* Layer 5: Subtle top atmospheric haze */}
        <div
          className="absolute inset-x-0 top-0 h-[35%]"
          style={{ background: "linear-gradient(180deg, rgba(255,65,108,0.018) 0%, transparent 100%)" }}
        />
      </div>

      {/* Center Content */}
      <div className="relative z-10 flex w-full flex-1 flex-col items-center" style={{ minHeight: 0 }}>
        {/* Hero Heading */}
        <motion.div
          variants={fadeUp}
          custom={0}
          initial={mounted ? "hidden" : false}
          animate={mounted ? "visible" : false}
          className="mb-2 text-center sm:mb-2 md:mb-3 lg:mb-3"
        >
          {/* Eyebrow */}
          <div className="mb-2 inline-flex items-center gap-2 sm:mb-2">
            <span className="h-px w-6 bg-white/20 sm:w-10" />
            <p className="text-[9px] font-semibold uppercase tracking-[0.5em] text-white/30 sm:text-[10px]">
              {username ? `Welcome back, ${username} 👋` : "Welcome to"}
            </p>
            <span className="h-px w-6 bg-white/20 sm:w-10" />
          </div>

          <h1
            className="text-shimmer text-2xl font-extrabold uppercase tracking-[0.12em] sm:text-3xl sm:font-black sm:tracking-[0.25em] md:text-4xl md:tracking-[0.3em] lg:text-5xl"
            style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
          >
            The Arena
          </h1>

        </motion.div>

        {/* Battlefield Heading — desktop gets extra spacing and a luxury rule */}
        <motion.div
          variants={fadeUp}
          custom={0.5}
          initial={mounted ? "hidden" : false}
          animate={mounted ? "visible" : false}
          className="mb-2 flex flex-col items-center gap-1.5 sm:mb-2 sm:gap-2 lg:mb-3 lg:gap-2.5"
        >
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-white/10 sm:w-16" />
            <h2 className="text-center text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 sm:text-[10px] sm:tracking-[0.45em]">
              Select Your Battlefield
            </h2>
            <span className="h-px w-8 bg-white/10 sm:w-16" />
          </div>
          {/* Luxury rule — desktop only */}
          <div className="divider-luxury hidden w-full max-w-[480px] sm:block" />
        </motion.div>

        {/* Mobile Game List — single column, centered, scrollable, phone only */}
        <div className="flex w-full flex-col items-center gap-2.5 px-4 pb-8 sm:hidden">
          {games.map((game, i) => (
            <MobileGameTile key={game.id} game={game} index={i} />
          ))}
        </div>

        {/* Desktop/Tablet Game Cards — hidden on phone, responsive columns, fills remaining height */}
        <div
          className="hidden w-full max-w-7xl flex-1 grid-cols-2 gap-2 px-2 pb-6 sm:grid md:grid-cols-2 md:gap-3 md:px-4 lg:grid-cols-4 lg:gap-2 lg:px-0 xl:gap-3"
          style={{ gridTemplateRows: "1fr 1fr" }}
        >
          {games.map((game, i) => (
            <GameCard key={game.id} game={game} index={i} />
          ))}
        </div>
      </div>

      {/* Footer — absolute so it doesn't affect layout height */}
      <motion.div
        initial={mounted ? { opacity: 0 } : false}
        animate={mounted ? { opacity: 1 } : false}
        transition={{ delay: 1.4, duration: 1.2 }}
        className="absolute bottom-2 left-0 right-0 z-10 flex flex-col items-center gap-1 text-center sm:bottom-3"
      >
        <p
          className="text-[9px] tracking-[0.3em] text-white/10"
          style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
        >
          by Jerome Kingsly
        </p>
      </motion.div>
    </main>
  );
}
