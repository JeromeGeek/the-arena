"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { slugToSeed, seededRandom } from "@/lib/gamecodes";
import { getHeadRushWords } from "@/lib/headrush";
import SoundToggle from "@/components/SoundToggle";
import { useSoundEnabled } from "@/hooks/useSoundEnabled";
import {
  playCorrectAnswer,
  playSkip,
  playTimerTick,
  playTimerCritical,
  playTimesUp,
  playStartTurn,
  playGameOverFanfare,
} from "@/lib/sounds";

// ── Constants ──────────────────────────────────────────────────────────────
const WORDS_PER_GAME = 300; // generous pool
const TILT_CORRECT_THRESHOLD = 25;  // degrees down  → correct
const TILT_SKIP_THRESHOLD   = -25;  // degrees up    → skip
const TILT_LOCKOUT_MS       = 800;  // ms before next tilt accepted

const TEAM_COLORS = [
  { accent: "#FF416C", bg: "rgba(255,65,108,0.12)", border: "rgba(255,65,108,0.35)", gradient: "linear-gradient(135deg,#FF416C,#FF4B2B)" },
  { accent: "#00B4DB", bg: "rgba(0,180,219,0.12)",  border: "rgba(0,180,219,0.35)",  gradient: "linear-gradient(135deg,#00B4DB,#0083B0)" },
  { accent: "#A855F7", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.35)", gradient: "linear-gradient(135deg,#A855F7,#7C3AED)" },
  { accent: "#22C55E", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.35)",  gradient: "linear-gradient(135deg,#22C55E,#16A34A)" },
];

type Phase = "ready" | "holding" | "playing" | "scored" | "gameover";

// ── Code parser ─────────────────────────────────────────────────────────────
function parseCode(code: string, teamsList?: string[]) {
  const parts = code.split("-");
  if (parts.length < 5) return null;

  const teamCount  = parseInt(parts[0], 10);
  const timer      = parseInt(parts[1], 10);
  const rounds     = parseInt(parts[2], 10);
  const slug       = parts[parts.length - 1];
  const category   = parts.slice(3, -1).join("-");

  if (isNaN(teamCount) || teamCount < 2 || teamCount > 4) return null;
  if (isNaN(timer) || ![45, 60].includes(timer)) return null;
  if (isNaN(rounds) || rounds < 1) return null;

  const seed = slugToSeed(slug);
  if (seed === null) return null;

  const random = seededRandom(seed);
  const teamNames =
    teamsList && teamsList.length === teamCount
      ? teamsList
      : Array.from({ length: teamCount }, (_, i) => `Team ${i + 1}`);

  const words = getHeadRushWords(category, WORDS_PER_GAME, random);

  return { teamNames, timer, totalRounds: rounds, words };
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function Syne({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <span className={`font-black uppercase tracking-[0.15em] ${className}`}
      style={{ fontFamily: "var(--font-syne),var(--font-display)", ...style }}>
      {children}
    </span>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function HeadRushGamePage() {
  const params      = useParams();
  const searchParams = useSearchParams();
  const code        = params.code as string;

  const teamsList = useMemo(() => {
    const raw = searchParams.get("teams");
    return raw ? decodeURIComponent(raw).split(",") : undefined;
  }, [searchParams]);

  const parsed = useMemo(() => parseCode(code, teamsList), [code, teamsList]);
  const { soundEnabled, toggleSound } = useSoundEnabled();

  // ── Game state ──────────────────────────────────────────────────────────
  const [phase, setPhase]                   = useState<Phase>("ready");
  const [teamIndex, setTeamIndex]           = useState(0);
  const [round, setRound]                   = useState(1);
  const [wordIndex, setWordIndex]           = useState(0);
  const [scores, setScores]                 = useState<number[]>(() => new Array(parsed?.teamNames.length ?? 2).fill(0));
  const [timeLeft, setTimeLeft]             = useState(parsed?.timer ?? 60);
  const [turnScore, setTurnScore]           = useState(0);
  const [lastAction, setLastAction]         = useState<"correct" | "skip" | null>(null);
  const [tiltEnabled, setTiltEnabled]       = useState(false);
  const [holdingCountdown, setHoldingCountdown] = useState(3);

  const timerRef    = useRef<NodeJS.Timeout | null>(null);
  const tiltLockRef = useRef(false);
  const phaseRef    = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const timerDuration = parsed?.timer ?? 60;
  const teams         = parsed?.teamNames ?? [];
  const words         = parsed?.words ?? [];
  const totalRounds   = parsed?.totalRounds ?? 4;

  const teamColor = TEAM_COLORS[teamIndex % TEAM_COLORS.length];
  const currentWord = words[wordIndex] ?? "";

  // ── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft <= 0) {
      if (soundEnabled) playTimesUp();
      setPhase("scored");
      return;
    }
    if (soundEnabled && timeLeft <= 5 && timeLeft > 3) playTimerTick();
    if (soundEnabled && timeLeft <= 3) playTimerCritical();

    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase, timeLeft, soundEnabled]);

  // ── Holding countdown (3s before playing) ────────────────────────────────
  useEffect(() => {
    if (phase !== "holding") return;
    if (holdingCountdown <= 0) {
      setPhase("playing");
      setTimeLeft(timerDuration);
      if (soundEnabled) playStartTurn();
      return;
    }
    const t = setTimeout(() => setHoldingCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, holdingCountdown, timerDuration, soundEnabled]);

  // ── Tilt detection ───────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof DeviceMotionEvent !== "undefined" &&
        typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === "function") {
      // iOS 13+ — permission must be requested; we request on "Start Turn" tap instead
      return;
    }
    setTiltEnabled(true);
  }, []);

  const handleTilt = useCallback((beta: number) => {
    if (phaseRef.current !== "playing") return;
    if (tiltLockRef.current) return;

    if (beta >= TILT_CORRECT_THRESHOLD) {
      tiltLockRef.current = true;
      handleCorrect();
      setTimeout(() => { tiltLockRef.current = false; }, TILT_LOCKOUT_MS);
    } else if (beta <= TILT_SKIP_THRESHOLD) {
      tiltLockRef.current = true;
      handleSkip();
      setTimeout(() => { tiltLockRef.current = false; }, TILT_LOCKOUT_MS);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!tiltEnabled) return;
    const listener = (e: DeviceOrientationEvent) => {
      if (e.beta !== null) handleTilt(e.beta);
    };
    window.addEventListener("deviceorientation", listener);
    return () => window.removeEventListener("deviceorientation", listener);
  }, [tiltEnabled, handleTilt]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleCorrect = useCallback(() => {
    if (soundEnabled) playCorrectAnswer();
    setLastAction("correct");
    setTurnScore((s) => s + 1);
    setScores((prev) => {
      const next = [...prev];
      next[teamIndex] = (next[teamIndex] ?? 0) + 1;
      return next;
    });
    setWordIndex((i) => i + 1);
    setTimeout(() => setLastAction(null), 500);
  }, [soundEnabled, teamIndex]);

  const handleSkip = useCallback(() => {
    if (soundEnabled) playSkip();
    setLastAction("skip");
    setWordIndex((i) => i + 1);
    setTimeout(() => setLastAction(null), 500);
  }, [soundEnabled]);

  const requestTiltPermission = useCallback(async () => {
    const DME = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof DME.requestPermission === "function") {
      const result = await DME.requestPermission();
      if (result === "granted") setTiltEnabled(true);
    } else {
      setTiltEnabled(true);
    }
  }, []);

  const handleStartTurn = useCallback(async () => {
    await requestTiltPermission();
    setTurnScore(0);
    setHoldingCountdown(3);
    setPhase("holding");
  }, [requestTiltPermission]);

  const handleNextTurn = useCallback(() => {
    const nextTeam  = (teamIndex + 1) % teams.length;
    const nextRound = nextTeam === 0 ? round + 1 : round;

    if (nextRound > totalRounds) {
      setPhase("gameover");
      if (soundEnabled) setTimeout(() => playGameOverFanfare(), 400);
      return;
    }

    setTeamIndex(nextTeam);
    setRound(nextRound);
    setPhase("ready");
  }, [teamIndex, teams.length, round, totalRounds, soundEnabled]);

  // ── Invalid code ──────────────────────────────────────────────────────────
  if (!parsed) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-4">
        <Syne className="text-2xl text-white/80">Invalid Game Code</Syne>
        <Link href="/headrush"
          className="rounded-xl border border-white/15 bg-white/[0.05] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white/70 transition-colors hover:bg-white/[0.1]">
          New Game
        </Link>
      </main>
    );
  }

  // ── Leaderboard ───────────────────────────────────────────────────────────
  const leaderboard = useMemo(() =>
    teams.map((name, i) => ({ name, score: scores[i] ?? 0, i }))
      .sort((a, b) => b.score - a.score),
    [teams, scores]
  );
  const winner = leaderboard[0];

  const timerPct = (timeLeft / timerDuration) * 100;
  const timerColor = timeLeft <= 5 ? "#EF4444" : timeLeft <= 15 ? "#FBBF24" : teamColor.accent;

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#0B0E14]">
      {/* Ambient glow */}
      <motion.div
        className="pointer-events-none fixed inset-0"
        animate={{ background: `radial-gradient(ellipse at 50% 30%, ${teamColor.accent}0D 0%, transparent 70%)` }}
        transition={{ duration: 0.6 }}
      />

      {/* Header */}
      <header className="relative z-10 flex shrink-0 items-center justify-between px-4 py-3">
        <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 hover:text-white/60 transition-colors">
          ← Arena
        </Link>
        <div className="text-center">
          <Syne className="text-[10px] text-white/40" style={{ letterSpacing: "0.3em" }}>
            HeadRush · Round {round}/{totalRounds}
          </Syne>
        </div>
        <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
      </header>

      {/* Score strip */}
      <div className="relative z-10 flex shrink-0 items-center justify-center gap-3 px-4 pb-2">
        {teams.map((name, i) => {
          const col = TEAM_COLORS[i % TEAM_COLORS.length];
          const isActive = i === teamIndex;
          return (
            <motion.div
              key={i}
              animate={{ scale: isActive ? 1.05 : 1, opacity: isActive ? 1 : 0.45 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5"
              style={{ borderColor: isActive ? col.border : "rgba(255,255,255,0.06)", background: isActive ? col.bg : "transparent" }}
            >
              <span className="text-[10px] font-semibold text-white/50">{name}</span>
              <motion.span
                key={scores[i]}
                initial={{ scale: 1.4 }}
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

      {/* Main content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4">
        <AnimatePresence mode="wait">

          {/* ── READY ── */}
          {phase === "ready" && (
            <motion.div key="ready"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex w-full max-w-xs flex-col items-center gap-6 text-center"
            >
              <div
                className="rounded-2xl border px-6 py-4"
                style={{ borderColor: teamColor.border, background: teamColor.bg }}
              >
                <Syne className="text-2xl sm:text-3xl" style={{ color: teamColor.accent }}>
                  {teams[teamIndex]}
                </Syne>
                <p className="mt-1 text-xs text-white/40">It&apos;s your turn!</p>
              </div>

              <div className="space-y-1 text-center">
                <p className="text-xs text-white/30 uppercase tracking-widest">How to play</p>
                <p className="text-sm text-white/50">
                  Hold the phone <strong className="text-white/80">to your forehead</strong>, screen facing your team.
                </p>
                <p className="text-sm text-white/50 mt-1">
                  <span className="text-green-400">↓ Tilt down</span> = Got it!
                  &nbsp;&nbsp;
                  <span className="text-white/30">↑ Tilt up</span> = Skip
                </p>
                <p className="text-[10px] text-white/25 mt-1">Or use the on-screen buttons</p>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onClick={handleStartTurn}
                className="rounded-2xl px-10 py-4 text-sm font-black uppercase tracking-[0.2em] text-black"
                style={{ backgroundImage: teamColor.gradient, boxShadow: `0 0 30px ${teamColor.accent}44` }}
              >
                Start Turn ▶
              </motion.button>
            </motion.div>
          )}

          {/* ── HOLDING COUNTDOWN ── */}
          {phase === "holding" && (
            <motion.div key="holding"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <p className="text-sm text-white/40 uppercase tracking-widest">Hold phone to forehead…</p>
              <motion.div
                key={holdingCountdown}
                initial={{ scale: 1.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
              >
                <Syne className="text-8xl" style={{ color: teamColor.accent }}>
                  {holdingCountdown > 0 ? holdingCountdown : "GO!"}
                </Syne>
              </motion.div>
              <p className="text-xs text-white/20">Screen should face your team</p>
            </motion.div>
          )}

          {/* ── PLAYING ── */}
          {phase === "playing" && (
            <motion.div key="playing"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex w-full flex-col items-center gap-6"
            >
              {/* Word display — big, filling, team-colored */}
              <div className="relative flex w-full items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentWord}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center px-4"
                  >
                    <Syne
                      className="text-4xl sm:text-5xl leading-tight"
                      style={{ color: teamColor.accent }}
                    >
                      {currentWord}
                    </Syne>
                  </motion.div>
                </AnimatePresence>

                {/* Action flash */}
                <AnimatePresence>
                  {lastAction && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.3 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <span className="text-6xl">
                        {lastAction === "correct" ? "✅" : "⏭️"}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Timer */}
              <div className="w-full max-w-xs space-y-1">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] uppercase tracking-widest text-white/25">Time</span>
                  <motion.span
                    key={timeLeft}
                    className="text-2xl font-black tabular-nums"
                    style={{ color: timerColor, fontFamily: "var(--font-syne),var(--font-display)" }}
                    animate={{ scale: timeLeft <= 5 ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {timeLeft}
                  </motion.span>
                </div>
                <div className="overflow-hidden rounded-full bg-white/[0.06]" style={{ height: "6px" }}>
                  <motion.div
                    className="h-full rounded-full"
                    animate={{ width: `${timerPct}%` }}
                    transition={{ duration: 0.9, ease: "linear" }}
                    style={{ backgroundColor: timerColor }}
                  />
                </div>
              </div>

              {/* Manual buttons — fallback if no tilt */}
              <div className="flex w-full max-w-xs gap-3">
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  onClick={handleSkip}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] py-4 text-sm font-bold uppercase tracking-widest text-white/40"
                >
                  ⏭ Skip
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  onClick={handleCorrect}
                  className="flex-[2] rounded-2xl py-4 text-sm font-black uppercase tracking-widest text-black"
                  style={{ backgroundImage: teamColor.gradient, boxShadow: `0 0 20px ${teamColor.accent}44` }}
                >
                  ✓ Got It!
                </motion.button>
              </div>

              <p className="text-[10px] text-white/20">
                {tiltEnabled ? "Tilt enabled ↑↓" : "Tilt not available — use buttons"}
              </p>
            </motion.div>
          )}

          {/* ── SCORED ── */}
          {phase === "scored" && (
            <motion.div key="scored"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="flex w-full max-w-xs flex-col items-center gap-5 text-center"
            >
              <div
                className="w-full rounded-2xl border px-6 py-5"
                style={{ borderColor: teamColor.border, background: teamColor.bg }}
              >
                <p className="text-xs uppercase tracking-widest text-white/40 mb-1">{teams[teamIndex]} scored</p>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                >
                  <Syne className="text-6xl" style={{ color: teamColor.accent }}>
                    +{turnScore}
                  </Syne>
                </motion.div>
                <p className="mt-1 text-xs text-white/30">this round</p>
              </div>

              {/* Scores so far */}
              <div className="w-full space-y-2">
                {leaderboard.map(({ name, score, i }, rank) => {
                  const col = TEAM_COLORS[i % TEAM_COLORS.length];
                  return (
                    <div key={name}
                      className="flex items-center justify-between rounded-xl border px-3 py-2"
                      style={{ borderColor: rank === 0 ? col.border : "rgba(255,255,255,0.06)", background: rank === 0 ? col.bg : "transparent" }}>
                      <span className="text-xs font-semibold text-white/60">{rank === 0 ? "🥇" : rank === 1 ? "🥈" : "🥉"} {name}</span>
                      <span className="text-sm font-black" style={{ color: col.accent }}>{score}</span>
                    </div>
                  );
                })}
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onClick={handleNextTurn}
                className="w-full rounded-2xl py-3.5 text-sm font-black uppercase tracking-[0.2em] text-white/80 border border-white/10 bg-white/[0.05]"
              >
                {round >= totalRounds && teamIndex === teams.length - 1
                  ? "🏆 See Final Results"
                  : `Next: ${teams[(teamIndex + 1) % teams.length]} →`}
              </motion.button>
            </motion.div>
          )}

          {/* ── GAME OVER ── */}
          {phase === "gameover" && (
            <motion.div key="gameover"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            >
              <motion.div
                initial={{ scale: 0.7, y: 30, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-full max-w-xs rounded-3xl border p-6 text-center"
                style={{
                  borderColor: TEAM_COLORS[winner.i % TEAM_COLORS.length].border,
                  background: TEAM_COLORS[winner.i % TEAM_COLORS.length].bg,
                  boxShadow: `0 0 60px ${TEAM_COLORS[winner.i % TEAM_COLORS.length].accent}33`,
                }}
              >
                <p className="text-4xl mb-3">🏆</p>
                <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Winner</p>
                <Syne
                  className="text-3xl"
                  style={{ color: TEAM_COLORS[winner.i % TEAM_COLORS.length].accent }}
                >
                  {winner.name}
                </Syne>
                <p className="mt-1 text-lg font-black text-white/60">{winner.score} points</p>

                <div className="mt-4 space-y-2">
                  {leaderboard.map(({ name, score, i }, rank) => {
                    const col = TEAM_COLORS[i % TEAM_COLORS.length];
                    return (
                      <div key={name} className="flex items-center justify-between rounded-xl px-3 py-2 bg-white/[0.04]">
                        <span className="text-xs text-white/50">{rank === 0 ? "🥇" : rank === 1 ? "🥈" : "🥉"} {name}</span>
                        <span className="text-sm font-black" style={{ color: col.accent }}>{score}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 flex gap-3">
                  <Link href="/headrush" className="flex-1">
                    <motion.div
                      whileTap={{ scale: 0.95 }}
                      className="rounded-xl border border-white/10 bg-white/[0.05] py-3 text-xs font-bold uppercase tracking-widest text-white/60 text-center cursor-pointer hover:bg-white/[0.08] transition-colors"
                    >
                      New Game
                    </motion.div>
                  </Link>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setScores(new Array(teams.length).fill(0));
                      setTeamIndex(0);
                      setRound(1);
                      setWordIndex(0);
                      setTurnScore(0);
                      setPhase("ready");
                    }}
                    className="flex-1 rounded-xl py-3 text-xs font-black uppercase tracking-widest text-black"
                    style={{ backgroundImage: "linear-gradient(135deg,#FACC15,#F97316)" }}
                  >
                    Rematch
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}
