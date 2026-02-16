"use client";

import { motion } from "framer-motion";
import { useState, useRef, MouseEvent } from "react";
import Link from "next/link";

/* ─── Motion Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

/* ─── Game Card Data ─── */
const games = [
  {
    id: "codenames",
    title: "CODENAMES",
    subtitle: "Tactical Word Espionage",
    description: "2 Teams · 20 Cards · 1 Assassin. Give one-word clues. Guess your agents. Avoid the kill shot.",
    href: "/codenames",
    accentFrom: "#FF416C",
    accentTo: "#FF4B2B",
    glowColor: "rgba(255, 65, 108, 0.35)",
    variant: "codenames" as const,
  },
  {
    id: "imposter",
    title: "IMPOSTER",
    subtitle: "Social Deception Engine",
    description: "3–15 Players · 1+ Imposters · 1 Secret Word. Describe, deduce, and vote out the fake.",
    href: "/imposter",
    accentFrom: "#00B4DB",
    accentTo: "#0083B0",
    glowColor: "rgba(0, 180, 219, 0.35)",
    variant: "imposter" as const,
  },
];

/* ─── Parallax Tilt Card ─── */
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

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -12, y: x * 12 });
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  }

  return (
    <motion.div
      custom={index + 1}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="w-full max-w-[480px] md:max-w-none md:flex-1"
    >
      <Link href={game.href} className="block h-full">
        <motion.div
          ref={ref}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          animate={{
            rotateX: tilt.x,
            rotateY: tilt.y,
            scale: isHovered ? 1.02 : 1,
            z: isHovered ? 30 : 0,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          whileTap={{ scale: 0.97 }}
          style={{ perspective: 1000, transformStyle: "preserve-3d" }}
          className="group relative h-full cursor-pointer"
        >
          {/* Glow Layer */}
          <motion.div
            className="absolute -inset-1 rounded-3xl opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: `radial-gradient(ellipse at center, ${game.glowColor}, transparent 70%)`,
            }}
          />

          {/* Card Body */}
          <div
            className={`relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl transition-colors duration-300 group-hover:border-white/20 sm:p-6 lg:p-8 ${
              game.variant === "codenames"
                ? "smoke-ambient tactical-grid"
                : "scanline-effect noise-bg"
            }`}
          >
            {/* Accent Line */}
            <div
              className="mb-3 h-1 w-12 rounded-full sm:mb-4 sm:w-16 lg:mb-6"
              style={{
                background: `linear-gradient(90deg, ${game.accentFrom}, ${game.accentTo})`,
              }}
            />

            {/* Title */}
            <h2
              className="mb-1.5 text-2xl font-bold tracking-[0.2em] sm:mb-2 sm:text-3xl sm:tracking-[0.25em] md:text-3xl lg:text-4xl"
              style={{
                fontFamily: "var(--font-syne), var(--font-display)",
                background: `linear-gradient(135deg, ${game.accentFrom}, ${game.accentTo})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {game.title}
            </h2>

            {/* Subtitle */}
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-white/40">
              {game.subtitle}
            </p>

            {/* Description */}
            <p className="mb-3 max-w-xs flex-grow text-xs leading-relaxed text-white/50 sm:mb-4 sm:text-sm lg:mb-6">
              {game.description}
            </p>

            {/* CTA */}
            <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.15em] text-white/60 transition-colors duration-300 group-hover:text-white/90">
              <span>Enter Arena</span>
              <motion.span
                animate={{ x: isHovered ? 6 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                →
              </motion.span>
            </div>

            {/* Pulsing border glow on hover */}
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-2xl"
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
  return (
    <main className="relative flex h-screen max-h-screen flex-col items-center justify-between px-4 py-4 overflow-hidden sm:px-6 sm:py-6 md:py-8 lg:py-10">
      {/* Ambient Background Radials */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(255,65,108,0.04)] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[600px] w-[600px] translate-x-1/2 translate-y-1/2 rounded-full bg-[rgba(0,180,219,0.04)] blur-[120px]" />
      </div>

      {/* Top Spacer */}
      <div />

      {/* Center Content */}
      <div className="flex flex-col items-center">
        {/* Hero Heading */}
        <motion.div
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate="visible"
          className="mb-4 text-center sm:mb-6 md:mb-8 lg:mb-10"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.4em] text-white/30">
            Welcome to
          </p>
          <h1
            className="text-shimmer text-4xl font-black uppercase tracking-[0.25em] sm:text-5xl sm:tracking-[0.35em] md:text-6xl lg:text-7xl xl:text-8xl"
            style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
          >
            The Arena
          </h1>
        </motion.div>

        {/* Battlefield Heading */}
        <motion.h2
          variants={fadeUp}
          custom={0.5}
          initial="hidden"
          animate="visible"
          className="mb-4 text-center text-sm font-bold uppercase tracking-[0.35em] text-white/25 sm:mb-5 md:mb-6 lg:mb-8"
        >
          Select Your Battlefield
        </motion.h2>

        {/* Game Cards */}
        <div className="flex w-full max-w-5xl flex-col items-center justify-center gap-4 px-2 sm:gap-5 md:flex-row md:items-stretch md:gap-6 md:px-4 lg:gap-10 lg:px-0">
          {games.map((game, i) => (
            <GameCard key={game.id} game={game} index={i} />
          ))}
        </div>
      </div>

      {/* Footer with name */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="mt-8 text-center"
      >
        <p
          className="text-[10px] tracking-[0.2em] text-white/20"
          style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
        >
          by Jerome Kingsly
        </p>
      </motion.div>
    </main>
  );
}
