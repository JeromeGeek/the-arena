"use client";

import { motion, type TargetAndTransition, type Transition } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";

interface GameSetupShellProps {
  /** Game title shown in the header bar e.g. "IMPOSTER" */
  title: string;
  /** Large emoji icon for the hero section */
  emoji: string;
  /** Subtitle/tagline e.g. "Social Deception Engine" */
  subtitle: string;
  /** Short flavour line shown under the emoji */
  flavour: string;
  /** Primary accent colour hex e.g. "#00B4DB" */
  accentFrom: string;
  /** Secondary accent colour hex e.g. "#0083B0" */
  accentTo: string;
  /** Optional idle animation for the hero emoji */
  emojiAnimate?: TargetAndTransition;
  emojiTransition?: Transition;
  children: ReactNode;
}

export default function GameSetupShell({
  title,
  emoji,
  subtitle,
  flavour,
  accentFrom,
  accentTo,
  emojiAnimate,
  emojiTransition,
  children,
}: GameSetupShellProps) {
  return (
    <main className="grain-overlay relative min-h-[100dvh] overflow-x-hidden pb-20 sm:pb-16" style={{ overscrollBehavior: "none" }}>
      {/* ── Ambient background glows (match homepage) ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute left-1/2 top-[30%] h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
          style={{ background: `${accentFrom}09` }}
        />
        <div
          className="absolute bottom-[20%] right-[15%] h-[350px] w-[350px] rounded-full blur-[90px]"
          style={{ background: `${accentTo}06` }}
        />
      </div>

      {/* ── Desktop header — top bar, hidden on mobile ── */}
      <header className="relative z-10 hidden items-center justify-between px-6 py-4 sm:flex">
        <Link
          href="/"
          className="group flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 transition-colors hover:text-white/60"
        >
          <span className="transition-transform group-hover:-translate-x-0.5">←</span>
          <span>The Arena</span>
        </Link>
        <p
          className="text-[11px] font-bold uppercase tracking-[0.35em] text-white/40"
          style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
        >
          {title}
        </p>
        <div className="w-[72px]" />
      </header>

      {/* ── Mobile top bar — just the game title, centered ── */}
      <div className="relative z-10 flex items-center justify-center px-4 py-3 sm:hidden">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/30"
          style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
        >
          {title}
        </p>
      </div>

      {/* ── Mobile bottom back — slim pill, thumb-zone, unobtrusive ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 pt-8 sm:hidden"
        style={{ background: "linear-gradient(to top, rgba(6,6,10,0.98) 50%, transparent 100%)" }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full px-5 py-2 text-[9px] font-bold uppercase tracking-[0.3em] text-white/25 transition-colors active:text-white/50"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span className="text-[10px]">←</span>
          <span>The Arena</span>
        </Link>
      </div>

      {/* ── Hero section ── */}
      <div className="relative z-10 mx-auto max-w-2xl px-4 pt-2 sm:px-6 sm:pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-5 text-center sm:mb-8"
        >
          {/* Emoji */}
          <motion.div
            className="mb-3 text-4xl sm:text-5xl"
            animate={emojiAnimate}
            transition={emojiTransition}
          >
            {emoji}
          </motion.div>

          {/* Title */}
          <h1
            className="mb-1.5 text-2xl font-black uppercase sm:text-3xl"
            style={{
              fontFamily: "var(--font-syne), var(--font-display)",
              letterSpacing: "0.14em",
              backgroundImage: `linear-gradient(135deg, ${accentFrom}, ${accentTo})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {title}
          </h1>

          {/* Subtitle */}
          <p
            className="mt-1 text-sm font-bold uppercase tracking-[0.22em] sm:text-base"
            style={{
              backgroundImage: `linear-gradient(135deg, ${accentFrom}cc, ${accentTo}99)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {subtitle}
          </p>

          {/* Flavour line */}
          <p className="mt-1.5 text-[11px] text-white/35 sm:text-xs">{flavour}</p>

          {/* Accent divider */}
          <div className="mx-auto mt-4 h-px w-16 rounded-full opacity-40"
            style={{ background: `linear-gradient(90deg, transparent, ${accentFrom}, transparent)` }}
          />
        </motion.div>

        {/* ── Card panel — frosted glass matching mobile tiles ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
          style={{
            background: "rgba(12,12,18,0.88)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderBottom: "1px solid rgba(255,255,255,0.03)",
            boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 24px 64px rgba(0,0,0,0.6)",
          }}
        >
          {/* Metallic top shimmer */}
          <div
            className="absolute left-0 right-0 top-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 40%, rgba(255,255,255,0.22) 60%, transparent 100%)",
            }}
          />

          {/* Accent left edge — colour accent, only place game colour bleeds */}
          <div
            className="absolute bottom-4 left-0 top-4 w-[3px] rounded-r-full"
            style={{
              background: `linear-gradient(180deg, ${accentFrom}90, ${accentTo}55)`,
              boxShadow: `0 0 14px ${accentFrom}44`,
            }}
          />

          {/* Content */}
          <div className="p-4 sm:p-8">{children}</div>
        </motion.div>
      </div>
    </main>
  );
}

/* ─── Shared sub-components ─── */

/** Section label */
export function SetupLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-3 block text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
      {children}
    </label>
  );
}

/** Player / team row */
export function SetupPlayerRow({
  emoji,
  index,
  value,
  onChange,
  onRemove,
  canRemove,
  placeholder,
}: {
  emoji: string;
  index: number;
  value: string;
  onChange: (v: string) => void;
  onRemove?: () => void;
  canRemove: boolean;
  placeholder?: string;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5 transition-colors hover:border-white/[0.1] hover:bg-white/[0.04]"
    >
      <span className="text-base">{emoji}</span>
      <span className="w-5 text-[10px] font-bold text-white/20">#{index + 1}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent text-sm text-white/80 outline-none placeholder:text-white/20"
        placeholder={placeholder ?? "Enter name…"}
      />
      {canRemove && onRemove && (
        <motion.button
          onClick={onRemove}
          whileTap={{ scale: 0.85 }}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] text-white/15 transition-colors hover:bg-white/[0.05] hover:text-red-400"
        >
          ✕
        </motion.button>
      )}
    </motion.div>
  );
}

/** Add player/team input row */
export function SetupAddRow({
  value,
  onChange,
  onAdd,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  placeholder?: string;
}) {
  return (
    <div className="flex gap-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onAdd()}
        placeholder={placeholder ?? "Add player…"}
        className="flex-1 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.01] px-4 py-3 text-sm text-white/80 outline-none placeholder:text-white/20 focus:border-white/20 focus:bg-white/[0.03]"
      />
      <motion.button
        onClick={onAdd}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-xl font-bold text-white/50 transition-colors hover:bg-white/[0.07]"
      >
        +
      </motion.button>
    </div>
  );
}

/** Option pill (for category / intensity / timer / rounds) */
export function SetupOptionPill({
  selected,
  onClick,
  accentColor,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  accentColor: string;
  children: ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.93 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      className="rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-all"
      style={{
        background: selected ? `${accentColor}1a` : "rgba(255,255,255,0.03)",
        border: `1px solid ${selected ? accentColor + "44" : "rgba(255,255,255,0.07)"}`,
        color: selected ? accentColor : "rgba(255,255,255,0.35)",
        boxShadow: selected ? `0 0 18px ${accentColor}20` : "none",
      }}
    >
      {children}
    </motion.button>
  );
}

/** Full-width CTA start button */
export function SetupStartButton({
  onClick,
  disabled,
  accentFrom,
  accentTo,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  accentFrom: string;
  accentTo: string;
  children: ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      disabled={disabled}
      className="relative w-full overflow-hidden rounded-xl py-4 text-xs font-bold uppercase tracking-[0.18em] text-white disabled:cursor-not-allowed disabled:opacity-40 sm:rounded-2xl sm:py-4 sm:text-sm sm:tracking-[0.22em]"
      style={{
        background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})`,
        boxShadow: disabled ? "none" : `0 8px 32px ${accentFrom}35`,
      }}
    >
      {/* Subtle top shimmer on the button */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)" }}
      />
      {children}
    </motion.button>
  );
}
