"use client";

import { motion } from "framer-motion";
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
    description: "2 Teams · 20 Cards · 1 Assassin. Give one-word clues. Guess your agents. Avoid the kill shot.",
    href: "/cn",
    accentFrom: "#FF416C",
    accentTo: "#FF4B2B",
    glowColor: "rgba(255, 65, 108, 0.35)",
    variant: "codenames" as const,
    players: "2+ Players",
    emoji: "🕵️",
  },
  {
    id: "imposter",
    title: "IMPOSTER",
    subtitle: "Social Deception Engine",
    description: "3–15 Players · 1+ Imposters · 1 Secret Word. Describe, deduce, and vote out the fake.",
    href: "/im",
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
    description: "2–15 Players · 3 Intensities. Pick truth or dare. No backing out. Spill it or do it.",
    href: "/td",
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
    description: "2–15 Players · 3 Levels. Confess your sins. Most experienced player revealed at the end.",
    href: "/nhie",
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
    description: "2–15 Players · Timer · 7 Categories. No talking. Act it out. Score the most to win.",
    href: "/ch",
    accentFrom: "#F97316",
    accentTo: "#EA580C",
    glowColor: "rgba(249, 115, 22, 0.35)",
    variant: "charades" as const,
    players: "2–15 Players",
    emoji: "🎬",
  },
  {
    id: "mafia",
    title: "MAFIA",
    subtitle: "Night Falls. Trust No One.",
    description: "5–15 Players · Mafia · Doctor · Detective. Survive the night. Find the killers before it's too late.",
    href: "/mf",
    accentFrom: "#E11D48",
    accentTo: "#9F1239",
    glowColor: "rgba(225, 29, 72, 0.35)",
    variant: "mafia" as const,
    players: "5–15 Players",
    emoji: "🔪",
  },
  {
    id: "inkarena",
    title: "INK ARENA",
    subtitle: "Draw · Steal · Dominate",
    description: "2 Teams · Live Drawing · Steal Points. One phone draws live to the TV. Guess fast. Sabotage harder.",
    href: "/ia",
    accentFrom: "#FF416C",
    accentTo: "#00B4DB",
    glowColor: "rgba(236, 72, 153, 0.35)",
    variant: "inkarena" as const,
    players: "4–12 Players",
    emoji: "🎨",
  },
];

/* ─── Compact Mobile Tile (phone only) ─── */
function MobileGameTile({
  game,
  index,
}: {
  game: (typeof games)[0];
  index: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <motion.div
      custom={index + 1}
      variants={fadeUp}
      initial={mounted ? "hidden" : false}
      animate={mounted ? "visible" : false}
    >
      <Link href={game.href} className="block">
        <motion.div
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 ${
            game.variant === "codenames"
              ? "smoke-ambient tactical-grid"
              : game.variant === "imposter"
                ? "scanline-effect noise-bg"
                : game.variant === "truthordare"
                  ? "ember-flicker"
                  : game.variant === "neverhaveiever"
                    ? "ripple-pulse"
                    : game.variant === "mafia"
                      ? "blood-vignette"
                      : game.variant === "inkarena"
                        ? "ink-splatter"
                        : "spotlight-sweep"
          }`}
          style={{
            minHeight: "120px",
            overflow: "clip",
            overflowClipMargin: "0.3em",
            ...(game.variant === "codenames"
              ? { borderTop: "2px solid rgba(255,65,108,0.3)" }
              : game.variant === "imposter"
                ? { borderLeft: "2px solid rgba(0,180,219,0.25)", borderRight: "2px solid rgba(0,180,219,0.25)" }
                : game.variant === "truthordare"
                  ? { borderBottom: "2px solid rgba(168,85,247,0.35)" }
                  : game.variant === "neverhaveiever"
                    ? { borderLeft: "2px solid rgba(34,197,94,0.3)", borderRight: "2px solid rgba(34,197,94,0.3)" }
                    : game.variant === "charades"
                      ? { borderTop: "2px solid rgba(249,115,22,0.35)" }
                      : game.variant === "mafia"
                        ? { borderBottom: "2px solid rgba(225,29,72,0.35)" }
                        : game.variant === "inkarena"
                          ? { borderTop: "2px solid rgba(255,65,108,0.3)", borderBottom: "2px solid rgba(0,180,219,0.3)" }
                          : undefined),
          }}
        >
          {/* Effect clip layer */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden="true" />

          {/* Emoji + accent bar row */}
          <div className="mb-2 flex items-center justify-between">
            <div
              className="h-0.5 w-6 rounded-full"
              style={{ backgroundImage: `linear-gradient(90deg, ${game.accentFrom}, ${game.accentTo})` }}
            />
            <span className="text-base leading-none">{game.emoji}</span>
          </div>

          {/* Title */}
          <h2
            className="mb-1 text-xs font-black leading-tight"
            style={{
              fontFamily: "var(--font-syne), var(--font-display)",
              letterSpacing: "0.1em",
            }}
          >
            <span
              style={{
                backgroundImage: `linear-gradient(135deg, ${game.accentFrom}, ${game.accentTo})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                display: "inline",
              }}
            >
              {game.title}
            </span>
          </h2>

          {/* Players + arrow */}
          <div className="flex items-center justify-between">
            <p className="text-[9px] uppercase tracking-[0.08em] text-white/30">
              {game.players}
            </p>
            <span
              className="text-[10px] font-bold"
              style={{ color: game.accentFrom, opacity: 0.7 }}
            >
              →
            </span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

/* ─── Parallax Tilt Card (tablet/desktop/TV) ─── */
function GameCard({
  game,
  index,
}: {
  game: (typeof games)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const rafRef = useRef<number>(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    // Throttle to one update per animation frame
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rect = ref.current!.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: y * -12, y: x * 12 });
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  }, []);

  return (
    <motion.div
      custom={index + 1}
      variants={fadeUp}
      initial={mounted ? "hidden" : false}
      animate={mounted ? "visible" : false}
      className="w-full"
    >
      <Link href={game.href} className="block h-full">
        <motion.div
          ref={ref}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          initial={false}
          animate={{
            rotateX: tilt.x,
            rotateY: tilt.y,
            scale: isHovered ? 1.02 : 1,
            z: isHovered ? 30 : 0,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          whileTap={{ scale: 0.97 }}
          style={{ perspective: 1000, transformStyle: "preserve-3d", willChange: "transform" }}
          className="group relative h-full cursor-pointer"
        >
          {/* Glow Layer */}
          <motion.div
            className="absolute -inset-1 rounded-3xl opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
            style={{
              backgroundImage: `radial-gradient(ellipse at center, ${game.glowColor}, transparent 70%)`,
            }}
          />

          {/* Card Body */}
          <div
            className={`relative flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md transition-colors duration-300 group-hover:border-white/20 sm:p-6 lg:p-8 ${
              game.variant === "codenames"
                ? "smoke-ambient tactical-grid"
                : game.variant === "imposter"
                  ? "scanline-effect noise-bg"
                  : game.variant === "truthordare"
                    ? "ember-flicker"
                    : game.variant === "neverhaveiever"
                      ? "ripple-pulse"
                      : game.variant === "mafia"
                        ? "blood-vignette"
                        : game.variant === "inkarena"
                          ? "ink-splatter"
                          : "spotlight-sweep"
            }`}
            style={{
              overflow: "clip",
              overflowClipMargin: "0.3em",
              ...(game.variant === "codenames"
                ? { borderTop: "2px solid rgba(255,65,108,0.3)" }
                : game.variant === "imposter"
                  ? { borderLeft: "2px solid rgba(0,180,219,0.25)", borderRight: "2px solid rgba(0,180,219,0.25)" }
                  : game.variant === "truthordare"
                    ? { borderBottom: "2px solid rgba(168,85,247,0.35)" }
                    : game.variant === "neverhaveiever"
                      ? { borderLeft: "2px solid rgba(34,197,94,0.3)", borderRight: "2px solid rgba(34,197,94,0.3)" }
                      : game.variant === "charades"
                        ? { borderTop: "2px solid rgba(249,115,22,0.35)" }
                        : game.variant === "mafia"
                          ? { borderBottom: "2px solid rgba(225,29,72,0.35)" }
                          : game.variant === "inkarena"
                            ? { borderTop: "2px solid rgba(255,65,108,0.3)", borderBottom: "2px solid rgba(0,180,219,0.3)" }
                            : {}),
            }}
          >

            {/* Info Button + emoji badge — top-right corner */}
            <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 sm:right-4 sm:top-4">
              <span className="text-base leading-none opacity-70">{game.emoji}</span>
              <InfoModal game={game.variant} size="sm" />
            </div>

            {/* Accent Line */}
            <div
              className="mb-3 h-1 w-12 rounded-full sm:mb-4 sm:w-16 lg:mb-6"
              style={{
                backgroundImage: `linear-gradient(90deg, ${game.accentFrom}, ${game.accentTo})`,
              }}
            />

            {/* Title */}
            <h2
              className="mb-1.5 sm:mb-2 text-xl font-bold sm:text-2xl md:text-2xl lg:text-3xl"
              style={{
                fontFamily: "var(--font-syne), var(--font-display)",
                letterSpacing: "0.08em",
              }}
            >
              <span
                style={{
                  backgroundImage: `linear-gradient(135deg, ${game.accentFrom}, ${game.accentTo})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  display: "inline",
                }}
              >
                {game.title}
              </span>
            </h2>

            {/* Subtitle */}
            <p className="mb-1.5 text-sm font-medium uppercase tracking-[0.2em] text-white/40">
              {game.subtitle}
            </p>

            {/* Player count badge */}
            <p
              className="mb-4 inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
              style={{
                borderColor: `${game.accentFrom}33`,
                color: `${game.accentFrom}99`,
                backgroundColor: `${game.accentFrom}0d`,
              }}
            >
              {game.players}
            </p>

            {/* Description */}
            <p className="mb-3 max-w-xs flex-grow text-xs leading-relaxed text-white/50 sm:mb-4 sm:text-sm lg:mb-6">
              {game.description}
            </p>

            {/* CTA */}
            <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.15em] text-white/60 transition-colors duration-300 group-hover:text-white/90">
              <span>Enter Arena</span>
              <motion.span
                initial={false}
                animate={{ x: isHovered ? 6 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                →
              </motion.span>
            </div>

            {/* Pulsing border glow on hover */}
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-2xl"
              initial={false}
              animate={{
                boxShadow: isHovered
                  ? `inset 0 0 40px ${game.glowColor.replace("0.35", "0.08")}, 0 0 30px ${game.glowColor.replace("0.35", "0.12")}`
                  : "inset 0 0 0px transparent, 0 0 0px transparent",
              }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

/* ─── Landing Page ─── */
export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-between px-3 py-3 sm:px-6 sm:py-6 md:py-8 lg:py-10">
      {/* Ambient Background Radials */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(255,65,108,0.05)] blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full bg-[rgba(0,180,219,0.05)] blur-[80px]" />
        <div className="absolute left-1/3 top-2/3 h-[300px] w-[300px] rounded-full bg-[rgba(168,85,247,0.04)] blur-[80px]" />
        <div className="absolute right-1/3 top-1/2 h-[300px] w-[300px] rounded-full bg-[rgba(34,197,94,0.03)] blur-[60px]" />
        <div className="absolute bottom-1/3 left-1/2 h-[300px] w-[300px] rounded-full bg-[rgba(249,115,22,0.03)] blur-[60px]" />
        <div className="absolute bottom-[25%] right-[40%] h-[300px] w-[300px] rounded-full bg-[rgba(225,29,72,0.03)] blur-[60px]" />
        <div className="absolute top-[40%] left-[55%] h-[250px] w-[250px] rounded-full bg-[rgba(236,72,153,0.03)] blur-[60px]" />
      </div>

      {/* Center Content */}
      <div className="flex w-full flex-col items-center -mt-6 sm:mt-0">
        {/* Hero Heading */}
        <motion.div
          variants={fadeUp}
          custom={0}
          initial={mounted ? "hidden" : false}
          animate={mounted ? "visible" : false}
          className="mb-4 text-center sm:mb-6 md:mb-8 lg:mb-10"
        >
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-white/30 sm:mb-3 sm:text-xs">
            Welcome to
          </p>
          <h1
            className="text-shimmer text-3xl font-black uppercase tracking-[0.12em] sm:text-5xl sm:tracking-[0.35em] md:text-6xl lg:text-7xl xl:text-8xl"
            style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
          >
            The Arena
          </h1>

          {/* Animated divider */}
          <motion.div
            initial={mounted ? { scaleX: 0, opacity: 0 } : false}
            animate={mounted ? { scaleX: 1, opacity: 1 } : false}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-4 h-px w-24 sm:mt-5 sm:w-40"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }}
          />

          {/* Game count badge */}
          <motion.div
            initial={mounted ? { opacity: 0, y: 8 } : false}
            animate={mounted ? { opacity: 1, y: 0 } : false}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 sm:mt-4"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-400/60 shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 sm:text-[11px]">
              7 Games Available
            </span>
          </motion.div>
        </motion.div>

        {/* Battlefield Heading */}
        <motion.h2
          variants={fadeUp}
          custom={0.5}
          initial={mounted ? "hidden" : false}
          animate={mounted ? "visible" : false}
          className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-white/25 sm:mb-5 sm:text-sm sm:tracking-[0.35em] md:mb-6 lg:mb-8"
        >
          Select Your Battlefield
        </motion.h2>

        {/* Mobile Game Grid — compact 2×3, phone only */}
        <div className="grid w-full grid-cols-2 gap-2.5 px-1 sm:hidden">
          {games.map((game, i) => (
            <MobileGameTile key={game.id} game={game} index={i} />
          ))}
        </div>

        {/* Desktop/Tablet Game Cards — hidden on phone */}
        <div className="hidden w-full max-w-6xl gap-5 px-2 sm:grid sm:grid-cols-2 md:px-4 lg:grid-cols-3 lg:gap-6 lg:px-0">
          {games.map((game, i) => (
            <GameCard key={game.id} game={game} index={i} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={mounted ? { opacity: 0 } : false}
        animate={mounted ? { opacity: 1 } : false}
        transition={{ delay: 1.2, duration: 1 }}
        className="mt-4 flex flex-col items-center gap-1 text-center sm:mt-8"
      >
        <p
          className="text-[10px] tracking-[0.2em] text-white/20"
          style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
        >
          by Jerome Kingsly
        </p>
        <p className="text-[9px] tracking-[0.15em] text-white/10">
          v1.0 · the-arena
        </p>
      </motion.div>
    </main>
  );
}
