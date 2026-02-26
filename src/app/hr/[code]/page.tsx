"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { slugToSeed, seededRandom } from "@/lib/gamecodes";
import { getSnapImages, difficultyConfig, POINTS_PER_CORRECT, SnapImage, SnapDifficulty } from "@/lib/snapquiz";
import SoundToggle from "@/components/SoundToggle";
import { useSoundEnabled } from "@/hooks/useSoundEnabled";
import {
  playCorrectAnswer,
  playSkip,
  playGameOverFanfare,
} from "@/lib/sounds";

// ── Constants ─────────────────────────────────────────────────────────────────
const IMAGES_PER_GAME = 60; // generous pool

const TEAM_COLORS = [
  { accent: "#FF416C", bg: "rgba(255,65,108,0.12)", border: "rgba(255,65,108,0.35)", gradient: "linear-gradient(135deg,#FF416C,#FF4B2B)" },
  { accent: "#00B4DB", bg: "rgba(0,180,219,0.12)",  border: "rgba(0,180,219,0.35)",  gradient: "linear-gradient(135deg,#00B4DB,#0083B0)" },
  { accent: "#A855F7", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.35)", gradient: "linear-gradient(135deg,#A855F7,#7C3AED)" },
  { accent: "#22C55E", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.35)",  gradient: "linear-gradient(135deg,#22C55E,#16A34A)" },
];

type Phase = "lobby" | "revealing" | "answered" | "gameover";

// ── Code parser ───────────────────────────────────────────────────────────────
function parseCode(code: string, teamsList?: string[]) {
  const parts = code.split("-");
  if (parts.length < 5) return null;

  const teamCount  = parseInt(parts[0], 10);
  const difficulty = parts[1] as SnapDifficulty;
  const rounds     = parseInt(parts[2], 10);
  const slug       = parts[parts.length - 1];
  const category   = parts.slice(3, -1).join("-");

  if (isNaN(teamCount) || teamCount < 2 || teamCount > 4) return null;
  if (!["easy", "medium", "extreme"].includes(difficulty)) return null;
  if (isNaN(rounds) || rounds < 1) return null;

  const seed = slugToSeed(slug);
  if (seed === null) return null;

  const teamNames =
    teamsList && teamsList.length === teamCount
      ? teamsList
      : Array.from({ length: teamCount }, (_, i) => `Team ${i + 1}`);

  return { teamNames, difficulty, totalImages: rounds, category, baseSeed: seed };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Syne({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <span className={`font-black uppercase tracking-[0.15em] ${className}`}
      style={{ fontFamily: "var(--font-syne),var(--font-display)", ...style }}>
      {children}
    </span>
  );
}

// ── Blur-reveal image component ───────────────────────────────────────────────
function BlurImage({
  image,
  blurPx,
  revealMs,
  revealed,
  onRevealComplete,
}: {
  image: SnapImage;
  blurPx: number;
  revealMs: number;
  revealed: boolean;
  onRevealComplete: () => void;
}) {
  const revealDone = useRef(false);

  // Reset when image changes
  useEffect(() => {
    revealDone.current = false;
  }, [image.id]);

  return (
    <motion.div
      className="relative h-full w-full"
      initial={{ filter: `blur(${blurPx}px)` }}
      animate={{ filter: revealed ? "blur(0px)" : `blur(${blurPx}px)` }}
      transition={
        revealed
          ? { duration: revealMs / 1000, ease: "easeOut" }
          : { duration: 0 }
      }
      onAnimationComplete={() => {
        if (revealed && !revealDone.current) {
          revealDone.current = true;
          onRevealComplete();
        }
      }}
    >
      <Image
        src={image.url}
        alt="Snap Quiz image"
        fill
        className="object-cover"
        sizes="100vw"
        priority
        unoptimized // external URLs from Wikimedia
      />
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SnapQuizGamePage() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const code         = params.code as string;

  const teamsList = useMemo(() => {
    const raw = searchParams.get("teams");
    return raw ? decodeURIComponent(raw).split(",") : undefined;
  }, [searchParams]);

  const parsed = useMemo(() => parseCode(code, teamsList), [code, teamsList]);
  const { soundEnabled, toggleSound } = useSoundEnabled();

  // ── Rematch counter — increment to get a fresh image shuffle ──────────────
  const [rematchCount, setRematchCount] = useState(0);

  // ── Derive image pool — reshuffle on each rematch ─────────────────────────
  const images = useMemo(() => {
    if (!parsed) return [];
    const seed   = parsed.baseSeed + rematchCount * 99991;
    const random = seededRandom(seed);
    return getSnapImages(parsed.category, IMAGES_PER_GAME, random);
  }, [parsed, rematchCount]);

  // ── Game state ─────────────────────────────────────────────────────────────
  const [phase, setPhase]         = useState<Phase>("lobby");
  const [imgIndex, setImgIndex]   = useState(0);
  const [scores, setScores]       = useState<number[]>(() => new Array(parsed?.teamNames.length ?? 2).fill(0));
  const [revealed, setRevealed]   = useState(false);
  const [showHint, setShowHint]   = useState(false);
  const [lastWinner, setLastWinner] = useState<number | null>(null); // team index
  const [countdown, setCountdown] = useState(3);
  const [countdownActive, setCountdownActive] = useState(false);

  // Controls for the reveal progress bar
  const barControls = useAnimationControls();
  const revealTimerRef = useRef<NodeJS.Timeout | null>(null);

  const teams       = parsed?.teamNames ?? [];
  const totalImages = parsed?.totalImages ?? 4;
  const difficulty  = parsed?.difficulty ?? "medium";
  const diffCfg     = difficultyConfig[difficulty];

  const currentImage = images[imgIndex];

  // ── Leaderboard ────────────────────────────────────────────────────────────
  const leaderboard = useMemo(() =>
    teams.map((name, i) => ({ name, score: scores[i] ?? 0, i }))
      .sort((a, b) => b.score - a.score),
    [teams, scores]
  );
  const winner = leaderboard[0];

  // ── Countdown before first image ──────────────────────────────────────────
  useEffect(() => {
    if (!countdownActive) return;
    if (countdown <= 0) {
      setCountdownActive(false);
      setPhase("revealing");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdownActive, countdown]);

  // ── Auto-reveal progress bar when "revealing" ─────────────────────────────
  useEffect(() => {
    if (phase !== "revealing") return;
    setRevealed(false);
    setShowHint(false);

    // Animate progress bar over revealMs
    barControls.set({ scaleX: 0 });
    barControls.start({ scaleX: 1, transition: { duration: diffCfg.revealMs / 1000, ease: "linear" } });

    // After revealMs → fully reveal
    revealTimerRef.current = setTimeout(() => {
      setRevealed(true);
    }, diffCfg.revealMs);

    return () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      barControls.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, imgIndex]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleAward = useCallback((teamIdx: number) => {
    if (phase !== "revealing" && phase !== "answered") return;
    if (soundEnabled) playCorrectAnswer();

    // Stop auto-reveal timer
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    barControls.stop();

    setRevealed(true);
    setLastWinner(teamIdx);
    setScores((prev) => {
      const next = [...prev];
      next[teamIdx] = (next[teamIdx] ?? 0) + POINTS_PER_CORRECT;
      return next;
    });
    setPhase("answered");
  }, [phase, soundEnabled, barControls]);

  const handlePass = useCallback(() => {
    if (phase !== "revealing" && phase !== "answered") return;
    if (soundEnabled) playSkip();

    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    barControls.stop();

    setRevealed(true);
    setLastWinner(null);
    setPhase("answered");
  }, [phase, soundEnabled, barControls]);

  const handleNext = useCallback(() => {
    const nextIdx = imgIndex + 1;
    if (nextIdx >= totalImages) {
      setPhase("gameover");
      if (soundEnabled) setTimeout(() => playGameOverFanfare(), 400);
      return;
    }
    setImgIndex(nextIdx);
    setLastWinner(null);
    setRevealed(false);
    setShowHint(false);
    setPhase("revealing");
  }, [imgIndex, totalImages, soundEnabled]);

  const handleRevealComplete = useCallback(() => {
    // no-op for now — just ensures the full blur is gone
  }, []);

  // ── Invalid code ───────────────────────────────────────────────────────────
  if (!parsed || !currentImage) {
    return (
      <main className="flex h-[100dvh] flex-col items-center justify-center gap-4 px-4">
        <Syne className="text-2xl text-white/80">Invalid Game Code</Syne>
        <Link href="/headrush"
          className="rounded-xl border border-white/15 bg-white/[0.05] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white/70 transition-colors hover:bg-white/[0.1]">
          New Game
        </Link>
      </main>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <main
      className="relative flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[#0B0E14]"
      style={{ overscrollBehavior: "none" }}
    >
      {/* ── LOBBY / COUNTDOWN ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === "lobby" && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[#0B0E14] px-6 text-center"
          >
            {/* glow */}
            <div className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(ellipse at 50% 35%, #06B6D41A 0%, transparent 65%)" }} />

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
              className="text-6xl"
            >
              🖼️
            </motion.div>
            <div>
              <Syne className="text-3xl text-white">Snap Quiz</Syne>
              <p className="mt-1 text-sm text-white/40">{totalImages} images · {diffCfg.label} · {teams.length} teams</p>
            </div>

            {/* Team list */}
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {teams.map((name, i) => {
                const col = TEAM_COLORS[i % TEAM_COLORS.length];
                return (
                  <div key={i}
                    className="flex items-center gap-2 rounded-xl border px-4 py-2.5"
                    style={{ borderColor: col.border, background: col.bg }}
                  >
                    <span className="text-xs font-black uppercase tracking-widest" style={{ color: col.accent }}>{name}</span>
                  </div>
                );
              })}
            </div>

            {!countdownActive ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onClick={() => { setCountdown(3); setCountdownActive(true); }}
                className="rounded-2xl px-10 py-4 text-sm font-black uppercase tracking-[0.2em] text-black"
                style={{ background: "linear-gradient(135deg,#06B6D4,#0891B2)", boxShadow: "0 0 30px #06B6D444" }}
              >
                🚀 Start Game
              </motion.button>
            ) : (
              <motion.div
                key={countdown}
                initial={{ scale: 1.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 350, damping: 22 }}
              >
                <Syne className="text-7xl" style={{ color: "#06B6D4" }}>
                  {countdown > 0 ? countdown : "GO!"}
                </Syne>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── GAME OVER ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === "gameover" && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
          >
            <motion.div
              initial={{ scale: 0.7, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-full max-w-xs rounded-3xl border p-6 text-center"
              style={{
                borderColor: TEAM_COLORS[winner.i % TEAM_COLORS.length].border,
                background: "rgba(11,14,20,0.97)",
                boxShadow: `0 0 60px ${TEAM_COLORS[winner.i % TEAM_COLORS.length].accent}33`,
              }}
            >
              <p className="text-5xl mb-3">🏆</p>
              <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Winner</p>
              <Syne className="text-3xl" style={{ color: TEAM_COLORS[winner.i % TEAM_COLORS.length].accent }}>
                {winner.name}
              </Syne>
              <p className="mt-0.5 text-lg font-black text-white/60">{winner.score} pts</p>

              <div className="mt-4 space-y-2">
                {leaderboard.map(({ name, score, i: ti }, rank) => {
                  const col = TEAM_COLORS[ti % TEAM_COLORS.length];
                  return (
                    <div key={name}
                      className="flex items-center justify-between rounded-xl px-3 py-2"
                      style={{ background: rank === 0 ? col.bg : "rgba(255,255,255,0.03)", borderLeft: `3px solid ${col.accent}` }}
                    >
                      <span className="text-xs text-white/60">{rank === 0 ? "🥇" : rank === 1 ? "🥈" : "🥉"} {name}</span>
                      <span className="text-sm font-black" style={{ color: col.accent }}>{score}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex gap-3">
                <Link href="/headrush" className="flex-1">
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="rounded-xl border border-white/10 bg-white/[0.04] py-3 text-xs font-bold uppercase tracking-widest text-white/60 text-center cursor-pointer hover:bg-white/[0.08] transition-colors"
                  >
                    New Game
                  </motion.div>
                </Link>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setRematchCount((c) => c + 1);
                    setScores(new Array(teams.length).fill(0));
                    setImgIndex(0);
                    setRevealed(false);
                    setLastWinner(null);
                    setPhase("lobby");
                  }}
                  className="flex-1 rounded-xl py-3 text-xs font-black uppercase tracking-widest text-black"
                  style={{ background: "linear-gradient(135deg,#06B6D4,#0891B2)" }}
                >
                  Rematch
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="relative z-10 flex shrink-0 items-center justify-between px-4 py-2.5">
        <Link href="/"
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 hover:text-white/60 transition-colors">
          ← Arena
        </Link>
        <Syne className="text-[10px] text-white/40" style={{ letterSpacing: "0.3em" }}>
          Snap Quiz · {imgIndex + 1}/{totalImages}
        </Syne>
        <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
      </header>

      {/* ── SCORE STRIP ────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex shrink-0 items-center justify-center gap-2 px-4 pb-1.5">
        {teams.map((name, i) => {
          const col = TEAM_COLORS[i % TEAM_COLORS.length];
          const isWinner = lastWinner === i && phase === "answered";
          return (
            <motion.div
              key={i}
              animate={{
                scale: isWinner ? 1.12 : 1,
                opacity: 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5"
              style={{
                borderColor: isWinner ? col.border : "rgba(255,255,255,0.07)",
                background: isWinner ? col.bg : "transparent",
              }}
            >
              <span className="text-[10px] font-semibold text-white/50">{name}</span>
              <motion.span
                key={scores[i]}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="text-sm font-black"
                style={{ color: col.accent, fontFamily: "var(--font-syne),var(--font-display)" }}
              >
                {scores[i]}
              </motion.span>
            </motion.div>
          );
        })}
      </div>

      {/* ── IMAGE AREA ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 overflow-hidden rounded-t-2xl mx-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={imgIndex}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-full w-full"
          >
            <BlurImage
              image={currentImage}
              blurPx={diffCfg.blurPx}
              revealMs={diffCfg.revealMs}
              revealed={revealed}
              onRevealComplete={handleRevealComplete}
            />

            {/* Dark vignette at bottom for readability */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
              style={{ background: "linear-gradient(to top, rgba(11,14,20,0.85) 0%, transparent 100%)" }} />

            {/* Difficulty badge */}
            <div className="absolute top-3 left-3 rounded-full border border-white/15 bg-black/40 px-3 py-1 backdrop-blur-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                {diffCfg.emoji} {diffCfg.label}
              </span>
            </div>

            {/* Reveal progress bar */}
            {phase === "revealing" && !revealed && (
              <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10">
                <motion.div
                  className="h-full origin-left rounded-full"
                  style={{ background: "linear-gradient(90deg,#06B6D4,#0891B2)" }}
                  initial={{ scaleX: 0 }}
                  animate={barControls}
                />
              </div>
            )}

            {/* Answer reveal overlay */}
            <AnimatePresence>
              {revealed && phase === "answered" && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  className="absolute bottom-4 inset-x-4 flex flex-col items-center gap-1"
                >
                  <div className="rounded-2xl border border-white/20 bg-black/70 px-5 py-3 text-center backdrop-blur-md">
                    <p className="text-[10px] uppercase tracking-widest text-white/40 mb-0.5">Answer</p>
                    <Syne className="text-xl text-white">{currentImage.answer}</Syne>
                    {showHint && (
                      <p className="mt-0.5 text-xs text-white/40">{currentImage.hint}</p>
                    )}
                  </div>
                  {lastWinner !== null && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.1 }}
                      className="rounded-2xl border px-4 py-1.5"
                      style={{
                        borderColor: TEAM_COLORS[lastWinner % TEAM_COLORS.length].border,
                        background: TEAM_COLORS[lastWinner % TEAM_COLORS.length].bg,
                      }}
                    >
                      <span className="text-xs font-black" style={{ color: TEAM_COLORS[lastWinner % TEAM_COLORS.length].accent }}>
                        +{POINTS_PER_CORRECT} → {teams[lastWinner]}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── BOTTOM CONTROLS ────────────────────────────────────────────────── */}
      <div className="relative z-10 shrink-0 px-3 pt-2 pb-4 space-y-2">
        {(phase === "revealing" || phase === "answered") && (
          <>
            {/* Team award buttons */}
            {phase !== "answered" && (
              <div className="flex gap-2">
                {teams.map((name, i) => {
                  const col = TEAM_COLORS[i % TEAM_COLORS.length];
                  return (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.93 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      onClick={() => handleAward(i)}
                      className="flex-1 rounded-2xl py-3.5 text-xs font-black uppercase tracking-widest text-black"
                      style={{ backgroundImage: col.gradient, boxShadow: `0 0 18px ${col.accent}33` }}
                    >
                      ✓ {name}
                    </motion.button>
                  );
                })}
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  onClick={handlePass}
                  className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-white/40"
                >
                  Pass
                </motion.button>
              </div>
            )}

            {/* Hint toggle (only while revealing) */}
            {phase === "revealing" && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowHint((h) => !h)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2 text-xs font-semibold uppercase tracking-widest text-white/30"
              >
                {showHint ? "Hide Hint" : "💡 Hint"}
              </motion.button>
            )}

            {/* Hint text inline while revealing */}
            <AnimatePresence>
              {showHint && phase === "revealing" && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-center text-xs text-white/40 px-2"
                >
                  💡 {currentImage.hint}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Next button — only after answered */}
            {phase === "answered" && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="w-full rounded-2xl py-4 text-sm font-black uppercase tracking-[0.2em] text-black"
                style={{ background: "linear-gradient(135deg,#06B6D4,#0891B2)", boxShadow: "0 0 24px #06B6D444" }}
              >
                {imgIndex + 1 >= totalImages ? "🏆 Final Results" : "Next Image →"}
              </motion.button>
            )}
          </>
        )}
      </div>
    </main>
  );
}
