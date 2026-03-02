"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { slugToSeed, seededRandom } from "@/lib/gamecodes";
import { getSnapImages, IMAGES_PER_ROUND, SnapImage, SnapDifficulty } from "@/lib/snapquiz";
import SoundToggle from "@/components/SoundToggle";
import { useSoundEnabled } from "@/hooks/useSoundEnabled";
import { playGameOverFanfare, playSnapRevealStart, playSnapFullReveal, playSnapBuzzIn, playSnapPass, playSnapCorrect, playSnapWrong, playSnapRoundBreak, playSnapCountdownTick, playSnapCountdownGo } from "@/lib/sounds";

// ── Scoring ───────────────────────────────────────────────────────────────────
const POINTS_BLURRED  = 10; // answered while timer still running
const POINTS_REVEALED = 5;  // answered after full reveal
const POINTS_WRONG    = -5; // wrong answer penalty

// ── Timing (ms) ───────────────────────────────────────────────────────────────
const REVEAL_MS: Record<SnapDifficulty, number> = {
  easy:    3000,
  medium:  4000,
  extreme: 5000,
};

// ── Blur (px) ─────────────────────────────────────────────────────────────────
const BLUR_PX: Record<SnapDifficulty, number> = {
  easy:    14,
  medium:  28,
  extreme: 48,
};

const DIFFICULTY_LABEL: Record<SnapDifficulty, string> = {
  easy:    "🟢 Easy",
  medium:  "🟡 Medium",
  extreme: "🔴 Extreme",
};

// ── Team colours ──────────────────────────────────────────────────────────────
const TEAM_COLORS = [
  { accent: "#FF416C", bg: "rgba(255,65,108,0.12)",  border: "rgba(255,65,108,0.35)",  gradient: "linear-gradient(135deg,#FF416C,#FF4B2B)" },
  { accent: "#00B4DB", bg: "rgba(0,180,219,0.12)",   border: "rgba(0,180,219,0.35)",   gradient: "linear-gradient(135deg,#00B4DB,#0083B0)" },
  { accent: "#A855F7", bg: "rgba(168,85,247,0.12)",  border: "rgba(168,85,247,0.35)",  gradient: "linear-gradient(135deg,#A855F7,#7C3AED)" },
  { accent: "#22C55E", bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.35)",   gradient: "linear-gradient(135deg,#22C55E,#16A34A)" },
];

// ── Phase machine ─────────────────────────────────────────────────────────────
type Phase = "lobby" | "revealing" | "answering" | "verdict" | "answered" | "passed" | "roundbreak" | "gameover";

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

  return { teamNames, difficulty, rounds, totalImages: rounds * IMAGES_PER_ROUND, category, baseSeed: seed };
}

// ── Syne display helper ───────────────────────────────────────────────────────
function Syne({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <span className={`font-black uppercase tracking-[0.12em] ${className}`}
      style={{ fontFamily: "var(--font-syne),var(--font-display)", ...style }}>
      {children}
    </span>
  );
}

// ── Blur-reveal image ─────────────────────────────────────────────────────────
function BlurImage({ image, blurPx, revealMs, revealed }: { image: SnapImage; blurPx: number; revealMs: number; revealed: boolean }) {
  return (
    <div className="relative h-full w-full">
      <motion.img
        key={image.id}
        src={image.url}
        alt="Snap Quiz image"
        initial={{ filter: `blur(${blurPx}px)` }}
        animate={{ filter: revealed ? "blur(0px)" : `blur(${blurPx}px)` }}
        transition={revealed ? { duration: revealMs / 1000, ease: "easeOut" } : { duration: 0 }}
        className="absolute inset-0 h-full w-full object-contain"
      />
    </div>
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

  const [rematchCount, setRematchCount] = useState(0);

  const images = useMemo(() => {
    if (!parsed) return [];
    const allImages: SnapImage[] = [];
    for (let r = 0; r < parsed.rounds; r++) {
      const roundSeed = parsed.baseSeed + (rematchCount * 99991) + (r * 7919);
      const random = seededRandom(roundSeed);
      allImages.push(...getSnapImages(parsed.category, IMAGES_PER_ROUND, random, parsed.difficulty));
    }
    return allImages;
  }, [parsed, rematchCount]);

  const teams       = parsed?.teamNames ?? [];
  const totalImages = parsed?.totalImages ?? IMAGES_PER_ROUND;
  const totalRounds = parsed?.rounds ?? 1;
  const difficulty  = (parsed?.difficulty ?? "medium") as SnapDifficulty;
  const revealMs    = REVEAL_MS[difficulty];
  const blurPx      = BLUR_PX[difficulty];

  // ── Game state ────────────────────────────────────────────────────────────
  const [phase, setPhase]                   = useState<Phase>("lobby");
  const [imgIndex, setImgIndex]             = useState(0);
  const [scores, setScores]                 = useState<number[]>(() => new Array(teams.length || 2).fill(0));
  const [activeTeam, setActiveTeam]         = useState(0);
  const [passedTeams, setPassedTeams]       = useState<number[]>([]);
  const [answeringTeam, setAnsweringTeam]   = useState<number | null>(null);
  const [answeredBlurred, setAnsweredBlurred] = useState(false);
  const [verdictResult, setVerdictResult]   = useState<"correct" | "wrong" | null>(null);
  const [revealed, setRevealed]             = useState(false);
  const [showHint, setShowHint]             = useState(false);
  const [countdown, setCountdown]           = useState(3);
  const [countdownActive, setCountdownActive] = useState(false);
  const [lastScorer, setLastScorer]         = useState<number | null>(null);

  const barControls      = useAnimationControls();
  const revealTimerRef   = useRef<NodeJS.Timeout | null>(null);
  const revealStartRef   = useRef<number>(0);
  const elapsedMsRef     = useRef<number>(0);

  const currentImage = images[imgIndex];
  const currentRound = Math.floor(imgIndex / IMAGES_PER_ROUND) + 1;
  const imgInRound   = (imgIndex % IMAGES_PER_ROUND) + 1;

  const leaderboard = useMemo(() =>
    teams.map((name, i) => ({ name, score: scores[i] ?? 0, i })).sort((a, b) => b.score - a.score),
    [teams, scores]
  );
  const winner = leaderboard[0];

  // ── Helpers ───────────────────────────────────────────────────────────────
  function findNextTeam(current: number, total: number, excluded: number[]): number | null {
    for (let i = 1; i < total; i++) {
      const candidate = (current + i) % total;
      if (!excluded.includes(candidate)) return candidate;
    }
    return null;
  }

  const resetForNewImage = useCallback((idx: number, team: number) => {
    elapsedMsRef.current = 0;
    setImgIndex(idx);
    setActiveTeam(team);
    setPassedTeams([]);
    setAnsweringTeam(null);
    setAnsweredBlurred(false);
    setRevealed(false);
    setShowHint(false);
    setLastScorer(null);
  }, []);

  const endImage = useCallback(() => {
    setRevealed(true);
    setLastScorer(null);
    setPhase("answered");
  }, []);

  // ── Countdown ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!countdownActive) return;
    if (countdown <= 0) {
      setCountdownActive(false);
      if (soundEnabled) playSnapCountdownGo();
      setPhase("revealing");
      return;
    }
    if (soundEnabled) playSnapCountdownTick();
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdownActive, countdown, soundEnabled]);

  // ── Auto-reveal timer ─────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "revealing") return;

    const elapsed   = elapsedMsRef.current;
    const remaining = Math.max(revealMs - elapsed, 0);
    const fromScale = elapsed / revealMs;

    revealStartRef.current = Date.now() - elapsed;

    if (elapsed === 0) {
      setRevealed(false);
      setShowHint(false);
      barControls.set({ scaleX: 0 });
      if (soundEnabled) playSnapRevealStart();
    } else {
      barControls.set({ scaleX: fromScale });
    }

    barControls.start({ scaleX: 1, transition: { duration: remaining / 1000, ease: "linear" } });
    revealTimerRef.current = setTimeout(() => {
      setRevealed(true);
      if (soundEnabled) playSnapFullReveal();
    }, remaining);

    return () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      barControls.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, imgIndex, activeTeam]);

  // ── "Passed" flash — auto-advance to revealing after 1.2s ────────────────
  useEffect(() => {
    if (phase !== "passed") return;
    const t = setTimeout(() => setPhase("revealing"), 1200);
    return () => clearTimeout(t);
  }, [phase, activeTeam]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleAnswer = useCallback(() => {
    if (phase !== "revealing") return;
    if (soundEnabled) playSnapBuzzIn();
    const wasBlurred = !revealed;
    setAnsweredBlurred(wasBlurred);
    setAnsweringTeam(activeTeam);
    elapsedMsRef.current = Date.now() - revealStartRef.current;
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    barControls.stop();
    setRevealed(true);
    setPhase("answering");
  }, [phase, revealed, activeTeam, soundEnabled, barControls]);

  const handlePass = useCallback(() => {
    if (phase !== "revealing") return;
    if (soundEnabled) playSnapPass();
    elapsedMsRef.current = Date.now() - revealStartRef.current;
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    barControls.stop();

    const newPassed = [...passedTeams, activeTeam];
    setPassedTeams(newPassed);
    const nextTeam = findNextTeam(activeTeam, teams.length, newPassed);
    if (nextTeam === null) { endImage(); return; }
    setActiveTeam(nextTeam);
    setPhase("passed");
  }, [phase, activeTeam, passedTeams, teams.length, soundEnabled, barControls, endImage]);

  const handleCorrect = useCallback(() => {
    if (answeringTeam === null) return;
    if (soundEnabled) playSnapCorrect();
    const pts  = answeredBlurred ? POINTS_BLURRED : POINTS_REVEALED;
    const team = answeringTeam;
    setVerdictResult("correct");
    setPhase("verdict");
    setTimeout(() => {
      setScores((prev) => { const n = [...prev]; n[team] = (n[team] ?? 0) + pts; return n; });
      setLastScorer(team);
      setVerdictResult(null);
      setAnsweringTeam(null);
      setPhase("answered");
    }, 1200);
  }, [answeringTeam, answeredBlurred, soundEnabled]);

  const handleWrong = useCallback(() => {
    if (answeringTeam === null) return;
    if (soundEnabled) playSnapWrong();
    const team = answeringTeam;
    setVerdictResult("wrong");
    setPhase("verdict");
    setTimeout(() => {
      setScores((prev) => { const n = [...prev]; n[team] = (n[team] ?? 0) + POINTS_WRONG; return n; });
      setVerdictResult(null);
      setAnsweringTeam(null);
      const newPassed = [...passedTeams, team];
      setPassedTeams(newPassed);
      const nextTeam = findNextTeam(team, teams.length, newPassed);
      if (nextTeam === null) { endImage(); return; }
      setRevealed(false);
      elapsedMsRef.current = 0;
      setActiveTeam(nextTeam);
      setPhase("passed");
    }, 1200);
  }, [answeringTeam, passedTeams, teams.length, soundEnabled, endImage]);

  const handleNext = useCallback(() => {
    const nextIdx = imgIndex + 1;
    if (nextIdx >= totalImages) {
      setPhase("gameover");
      if (soundEnabled) setTimeout(() => playGameOverFanfare(), 400);
      return;
    }
    const isEndOfRound   = nextIdx % IMAGES_PER_ROUND === 0;
    const nextActiveTeam = (activeTeam + 1) % teams.length;
    resetForNewImage(nextIdx, nextActiveTeam);
    if (isEndOfRound && soundEnabled) setTimeout(() => playSnapRoundBreak(), 300);
    setPhase(isEndOfRound ? "roundbreak" : "revealing");
  }, [imgIndex, totalImages, activeTeam, teams.length, soundEnabled, resetForNewImage]);

  // ── Invalid code guard ────────────────────────────────────────────────────
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

  const activeCol = TEAM_COLORS[activeTeam % TEAM_COLORS.length];

  return (
    <main className="relative flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[#0B0E14]" style={{ overscrollBehavior: "none" }}>

      {/* ── LOBBY ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === "lobby" && (
          <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-[#0B0E14] px-8 text-center">
            <div className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(ellipse at 50% 35%,#06B6D41A 0%,transparent 65%)" }} />
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }} className="text-8xl">🖼️</motion.div>
            <div>
              <Syne className="text-5xl text-white">Snap Quiz</Syne>
              <p className="mt-2 text-xl text-white/40">{totalRounds} round{totalRounds > 1 ? "s" : ""} · {totalImages} images · {DIFFICULTY_LABEL[difficulty]} · {teams.length} teams</p>
            </div>
            {/* Teams */}
            <div className="flex flex-col gap-3 w-full max-w-lg">
              {teams.map((name, i) => {
                const col = TEAM_COLORS[i % TEAM_COLORS.length];
                return (
                  <div key={i} className="flex items-center gap-3 rounded-2xl border px-6 py-4"
                    style={{ borderColor: col.border, background: col.bg }}>
                    <span className="text-lg font-black uppercase tracking-widest" style={{ color: col.accent }}>{name}</span>
                  </div>
                );
              })}
            </div>
            {!countdownActive ? (
              <motion.button whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onClick={() => { setCountdown(3); setCountdownActive(true); }}
                className="rounded-2xl px-16 py-6 text-xl font-black uppercase tracking-[0.2em] text-black"
                style={{ background: "linear-gradient(135deg,#06B6D4,#0891B2)", boxShadow: "0 0 40px #06B6D466" }}>
                🚀 Start Game
              </motion.button>
            ) : (
              <motion.div key={countdown} initial={{ scale: 1.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 350, damping: 22 }}>
                <Syne className="text-[10rem] leading-none" style={{ color: "#06B6D4" }}>{countdown > 0 ? countdown : "GO!"}</Syne>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── GAME OVER ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === "gameover" && (
          <motion.div key="gameover" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-6">
            <motion.div initial={{ scale: 0.7, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-full max-w-lg rounded-3xl border p-10 text-center"
              style={{ borderColor: TEAM_COLORS[winner.i % TEAM_COLORS.length].border, background: "rgba(11,14,20,0.97)", boxShadow: `0 0 80px ${TEAM_COLORS[winner.i % TEAM_COLORS.length].accent}44` }}>
              <p className="text-7xl mb-4">🏆</p>
              <p className="text-base uppercase tracking-widest text-white/40 mb-1">Winner</p>
              <Syne className="text-5xl" style={{ color: TEAM_COLORS[winner.i % TEAM_COLORS.length].accent }}>{winner.name}</Syne>
              <p className="mt-1 text-2xl font-black text-white/60">{winner.score} pts</p>
              <div className="mt-6 space-y-3">
                {leaderboard.map(({ name, score, i: ti }, rank) => {
                  const col = TEAM_COLORS[ti % TEAM_COLORS.length];
                  return (
                    <div key={name} className="flex items-center justify-between rounded-2xl px-5 py-3"
                      style={{ background: rank === 0 ? col.bg : "rgba(255,255,255,0.03)", borderLeft: `4px solid ${col.accent}` }}>
                      <span className="text-lg text-white/70">{rank === 0 ? "🥇" : rank === 1 ? "🥈" : "🥉"} {name}</span>
                      <Syne className="text-2xl" style={{ color: col.accent }}>{score}</Syne>
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 flex gap-4">
                <Link href="/headrush" className="flex-1">
                  <motion.div whileTap={{ scale: 0.95 }}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] py-5 text-base font-bold uppercase tracking-widest text-white/60 text-center cursor-pointer hover:bg-white/[0.08] transition-colors">
                    New Game
                  </motion.div>
                </Link>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => { elapsedMsRef.current = 0; setRematchCount((c) => c + 1); setScores(new Array(teams.length).fill(0)); resetForNewImage(0, 0); setPhase("lobby"); }}
                  className="flex-1 rounded-2xl py-5 text-base font-black uppercase tracking-widest text-black"
                  style={{ background: "linear-gradient(135deg,#06B6D4,#0891B2)" }}>
                  Rematch
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── VERDICT FLASH ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === "verdict" && verdictResult !== null && (
          <motion.div key="verdict" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6"
            style={{ background: verdictResult === "correct" ? "linear-gradient(160deg,rgba(22,163,74,0.97),rgba(16,185,129,0.95))" : "linear-gradient(160deg,rgba(220,38,38,0.97),rgba(239,68,68,0.95))" }}>
            <motion.div initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.05 }} className="text-[9rem] leading-none">
              {verdictResult === "correct" ? "✅" : "❌"}
            </motion.div>
            <div className="text-center">
              <Syne className="text-7xl text-white" style={{ textShadow: "0 2px 40px rgba(0,0,0,0.4)" }}>
                {verdictResult === "correct" ? "CORRECT!" : "WRONG!"}
              </Syne>
              {answeringTeam !== null && (
                <p className="mt-3 text-2xl font-bold text-white/90">
                  {verdictResult === "correct"
                    ? `+${answeredBlurred ? POINTS_BLURRED : POINTS_REVEALED} pts → ${teams[answeringTeam]}`
                    : `${POINTS_WRONG} pts · ${teams[answeringTeam]}`}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PASSED-TO FLASH ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === "passed" && (
          <motion.div key="passed" initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4"
            style={{ background: `linear-gradient(160deg,${activeCol.accent}22 0%,rgba(11,14,20,0.97) 60%)`, backdropFilter: "blur(4px)" }}>
            <p className="text-base uppercase tracking-[0.35em] text-white/40">Passed to</p>
            <Syne className="text-8xl" style={{ color: activeCol.accent, textShadow: `0 0 60px ${activeCol.accent}88` }}>{teams[activeTeam]}</Syne>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ROUND BREAK ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === "roundbreak" && (
          <motion.div key="roundbreak" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.96 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-7 bg-[#0B0E14] px-8 text-center">
            <div className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(ellipse at 50% 30%,#06B6D41A 0%,transparent 65%)" }} />
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }} className="text-7xl">🏁</motion.div>
            <div>
              <p className="text-base uppercase tracking-[0.35em] text-white/30 mb-2">Round complete</p>
              <Syne className="text-6xl text-white">Round {currentRound - 1} Done</Syne>
              <p className="mt-2 text-xl text-white/40">Round {currentRound} of {totalRounds} up next</p>
            </div>
            <div className="w-full max-w-lg space-y-3">
              {leaderboard.map(({ name, score, i: ti }, rank) => {
                const col = TEAM_COLORS[ti % TEAM_COLORS.length];
                return (
                  <motion.div key={name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: rank * 0.07, type: "spring", stiffness: 280, damping: 22 }}
                    className="flex items-center justify-between rounded-2xl border px-6 py-4"
                    style={{ borderColor: col.border, background: col.bg }}>
                    <span className="text-xl font-bold" style={{ color: col.accent }}>
                      {rank === 0 ? "🥇" : rank === 1 ? "🥈" : "🥉"} {name}
                    </span>
                    <Syne className="text-3xl" style={{ color: col.accent }}>{score}</Syne>
                  </motion.div>
                );
              })}
            </div>
            <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 280, damping: 22 }}
              whileTap={{ scale: 0.95 }} onClick={() => setPhase("revealing")}
              className="rounded-2xl px-16 py-6 text-xl font-black uppercase tracking-[0.2em] text-black"
              style={{ background: "linear-gradient(135deg,#06B6D4,#0891B2)", boxShadow: "0 0 40px #06B6D466" }}>
              🚀 Start Round {currentRound}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <header className="relative z-10 flex shrink-0 items-center justify-between px-5 py-3">
        <Link href="/" className="text-sm font-bold uppercase tracking-[0.2em] text-white/30 hover:text-white/60 transition-colors">← Arena</Link>
        <Syne className="text-sm text-white/40" style={{ letterSpacing: "0.25em" }}>R{currentRound}/{totalRounds} · {imgInRound}/{IMAGES_PER_ROUND}</Syne>
        <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
      </header>

      {/* ── SCORE STRIP ───────────────────────────────────────────────────── */}
      <div className="relative z-10 flex shrink-0 items-center justify-center gap-3 px-4 pb-2">
        {teams.map((name, i) => {
          const col      = TEAM_COLORS[i % TEAM_COLORS.length];
          const isActive = i === activeTeam && (phase === "revealing" || phase === "passed" || phase === "answering");
          const isScorer = i === lastScorer && phase === "answered";
          return (
            <motion.div key={i} animate={{ scale: isActive || isScorer ? 1.08 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="flex items-center gap-2 rounded-2xl border px-4 py-2"
              style={{ borderColor: isActive || isScorer ? col.border : "rgba(255,255,255,0.08)", background: isActive || isScorer ? col.bg : "rgba(255,255,255,0.03)" }}>
              {isActive && <span className="text-xs text-white/60">▶</span>}
              <span className="text-sm font-semibold text-white/60">{name}</span>
              <motion.span key={scores[i]} initial={{ scale: 1.5 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="text-xl font-black" style={{ color: col.accent, fontFamily: "var(--font-syne),var(--font-display)" }}>
                {scores[i]}
              </motion.span>
            </motion.div>
          );
        })}
      </div>

      {/* ── IMAGE AREA ────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 overflow-hidden rounded-2xl mx-3 min-h-0 bg-black/40">
        <AnimatePresence mode="wait">
          <motion.div key={imgIndex} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="relative h-full w-full">

            <BlurImage image={currentImage} blurPx={blurPx} revealMs={revealMs} revealed={revealed} />

            {/* Vignette */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
              style={{ background: "linear-gradient(to top,rgba(11,14,20,0.9) 0%,transparent 100%)" }} />

            {/* Difficulty + active team badge — top left */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <div className="rounded-full border border-white/15 bg-black/60 px-4 py-1.5 backdrop-blur-sm">
                <span className="text-sm font-bold uppercase tracking-widest text-white/70">{DIFFICULTY_LABEL[difficulty]}</span>
              </div>
              {(phase === "revealing" || phase === "answering" || phase === "passed") && (
                <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  className="rounded-full border px-4 py-1.5 backdrop-blur-sm"
                  style={{ borderColor: activeCol.border, background: activeCol.bg }}>
                  <span className="text-sm font-black uppercase tracking-widest" style={{ color: activeCol.accent }}>
                    {teams[activeTeam]}'s turn
                  </span>
                </motion.div>
              )}
            </div>

            {/* Progress bar */}
            {phase === "revealing" && !revealed && (
              <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/10">
                <motion.div className="h-full origin-left rounded-full"
                  style={{ background: "linear-gradient(90deg,#06B6D4,#0891B2)" }}
                  initial={{ scaleX: 0 }} animate={barControls} />
              </div>
            )}

            {/* Answer card — shown during "answering" phase so host can judge */}
            <AnimatePresence>
              {phase === "answering" && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  className="absolute bottom-5 inset-x-5 rounded-2xl border border-white/20 bg-black/80 px-6 py-4 text-center backdrop-blur-md">
                  <p className="text-sm uppercase tracking-widest text-white/40 mb-1">Answer</p>
                  <Syne className="text-4xl text-white">{currentImage.answer}</Syne>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Answer card — shown after phase "answered" */}
            <AnimatePresence>
              {phase === "answered" && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  className="absolute bottom-5 inset-x-5 flex flex-col items-center gap-2">
                  <div className="w-full rounded-2xl border border-white/20 bg-black/80 px-6 py-4 text-center backdrop-blur-md">
                    <p className="text-sm uppercase tracking-widest text-white/40 mb-1">Answer</p>
                    <Syne className="text-4xl text-white">{currentImage.answer}</Syne>
                  </div>
                  {lastScorer !== null && (
                    <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.1 }}
                      className="rounded-2xl border px-5 py-2"
                      style={{ borderColor: TEAM_COLORS[lastScorer % TEAM_COLORS.length].border, background: TEAM_COLORS[lastScorer % TEAM_COLORS.length].bg }}>
                      <span className="text-base font-black" style={{ color: TEAM_COLORS[lastScorer % TEAM_COLORS.length].accent }}>
                        {teams[lastScorer]} scored!
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── BOTTOM CONTROLS ───────────────────────────────────────────────── */}
      <div className="relative z-10 shrink-0 px-4 pt-3 pb-5 space-y-3">

        {/* REVEALING — active team: Answer or Pass */}
        {phase === "revealing" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 26 }}>
            <div className="flex gap-3">
              <motion.button whileTap={{ scale: 0.93 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}
                onClick={handleAnswer}
                className="flex-1 rounded-2xl py-5 text-lg font-black uppercase tracking-[0.15em]"
                style={{ backgroundImage: activeCol.gradient, boxShadow: `0 0 32px ${activeCol.accent}55`, color: "black" }}>
                ✋ Answer
              </motion.button>
              <motion.button whileTap={{ scale: 0.93 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}
                onClick={handlePass}
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-7 py-5 text-lg font-bold uppercase tracking-widest text-white/40">
                Pass →
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ANSWERING — host judges */}
        {phase === "answering" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 26 }} className="space-y-3">
            <div className="w-full rounded-2xl border px-5 py-3 text-center"
              style={{ borderColor: answeringTeam !== null ? TEAM_COLORS[answeringTeam % TEAM_COLORS.length].border : "rgba(255,255,255,0.1)", background: answeringTeam !== null ? TEAM_COLORS[answeringTeam % TEAM_COLORS.length].bg : "transparent" }}>
              <p className="text-sm uppercase tracking-widest text-white/40">Answering</p>
              <Syne className="text-2xl" style={{ color: answeringTeam !== null ? TEAM_COLORS[answeringTeam % TEAM_COLORS.length].accent : "white" }}>
                {answeringTeam !== null ? teams[answeringTeam] : ""}
              </Syne>
            </div>
            <div className="flex gap-3">
              <motion.button whileTap={{ scale: 0.93 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}
                onClick={handleCorrect}
                className="flex-1 rounded-2xl py-5 text-lg font-black uppercase tracking-[0.15em] text-black"
                style={{ background: "linear-gradient(135deg,#22C55E,#16A34A)", boxShadow: "0 0 28px #22C55E55" }}>
                ✓ Correct
              </motion.button>
              <motion.button whileTap={{ scale: 0.93 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}
                onClick={handleWrong}
                className="flex-1 rounded-2xl py-5 text-lg font-black uppercase tracking-[0.15em] text-white"
                style={{ background: "linear-gradient(135deg,#FF416C,#FF4B2B)", boxShadow: "0 0 28px #FF416C55" }}>
                ✗ Wrong
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ANSWERED — Next button */}
        {phase === "answered" && (
          <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            whileTap={{ scale: 0.95 }} onClick={handleNext}
            className="w-full rounded-2xl py-5 text-lg font-black uppercase tracking-[0.2em] text-black"
            style={{ background: "linear-gradient(135deg,#06B6D4,#0891B2)", boxShadow: "0 0 32px #06B6D455" }}>
            {imgIndex + 1 >= totalImages ? "🏆 Final Results" : imgInRound >= IMAGES_PER_ROUND ? "Next Round →" : "Next Image →"}
          </motion.button>
        )}
      </div>
    </main>
  );
}

