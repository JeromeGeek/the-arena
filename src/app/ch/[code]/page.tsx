"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { slugToSeed, seededRandom } from "@/lib/gamecodes";
import { setupCharadesGame } from "@/lib/charades";
import SoundToggle from "@/components/SoundToggle";
import { useSoundEnabled } from "@/hooks/useSoundEnabled";
import {
  playTimerTick,
  playTimerCritical,
  playCorrectAnswer,
  playSkip,
  playTimesUp,
  playStartTurn,
  playGameOverFanfare,
} from "@/lib/sounds";

type GamePhase = "ready" | "acting" | "scored" | "gameover";

const TEAM_COLORS = [
  { accent: "#F97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.4)", gradient: "from-[#F97316] to-[#EA580C]" },
  { accent: "#3B82F6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.4)", gradient: "from-[#3B82F6] to-[#2563EB]" },
  { accent: "#A855F7", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.4)", gradient: "from-[#A855F7] to-[#7C3AED]" },
  { accent: "#22C55E", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.4)", gradient: "from-[#22C55E] to-[#16A34A]" },
  { accent: "#EC4899", bg: "rgba(236,72,153,0.12)", border: "rgba(236,72,153,0.4)", gradient: "from-[#EC4899] to-[#DB2777]" },
  { accent: "#EAB308", bg: "rgba(234,179,8,0.12)", border: "rgba(234,179,8,0.4)", gradient: "from-[#EAB308] to-[#CA8A04]" },
];

const TEAM_EMOJIS = ["🔥", "⚡", "💎", "🌊", "🦊", "🐉"];

function parseCode(code: string, teamsList?: string[]) {
  const parts = code.split("-");
  if (parts.length < 5) return null;

  const teamCount = parseInt(parts[0], 10);
  const timer = parseInt(parts[1], 10);
  const totalRounds = parseInt(parts[2], 10);
  const slug = parts[parts.length - 1];
  const category = parts.slice(3, -1).join("-");

  if (isNaN(teamCount) || teamCount < 2 || teamCount > 6) return null;
  if (isNaN(timer) || ![30, 60, 90].includes(timer)) return null;
  if (isNaN(totalRounds) || totalRounds < 1 || totalRounds > 5) return null;

  const seed = slugToSeed(slug);
  if (seed === null) return null;

  const randomFn = seededRandom(seed);
  const teamNames = teamsList && teamsList.length === teamCount
    ? teamsList
    : Array.from({ length: teamCount }, (_, i) => `Team ${i + 1}`);

  const categoryName = category === "random" ? undefined : category;
  // Request enough words for all teams × all rounds × ~15 words per turn
  const neededWords = teamCount * totalRounds * 15;
  const game = setupCharadesGame(teamNames, categoryName, randomFn, neededWords);

  return { teamNames, timer, totalRounds, ...game, seed };
}

export default function CharadesGamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const code = params.code as string;

  const teamsList = useMemo(() => {
    const raw = searchParams.get("teams");
    return raw ? decodeURIComponent(raw).split(",") : undefined;
  }, [searchParams]);

  const parsed = useMemo(() => parseCode(code, teamsList), [code, teamsList]);

  const teams = useMemo(() => parsed?.teamNames ?? [], [parsed]);
  const words = useMemo(() => parsed?.words ?? [], [parsed]);
  const timerDuration = parsed?.timer ?? 60;
  const totalRounds = parsed?.totalRounds ?? 3;
  const { soundEnabled, toggleSound } = useSoundEnabled();

  const [phase, setPhase] = useState<GamePhase>("ready");
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const s: Record<string, number> = {};
    teams.forEach((t) => { s[t] = 0; });
    return s;
  });
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [turnScore, setTurnScore] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Track whether this turn ended via timer (true) or words exhausted (false)
  const timerExpiredRef = useRef(false);

  const currentColor = TEAM_COLORS[currentTeamIndex % TEAM_COLORS.length];

  // Timer logic — clear on phase change or unmount
  useEffect(() => {
    if (phase !== "acting") {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    if (timeLeft <= 0) {
      // Timer ran out naturally
      timerExpiredRef.current = true;
      if (soundEnabled) playTimesUp();
      setPhase("scored");
      return;
    }

    // Play tick sounds
    if (soundEnabled) {
      if (timeLeft <= 3) playTimerCritical();
      else if (timeLeft <= 5) playTimerTick();
    }

    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase, timeLeft, soundEnabled]);

  const handleStartTurn = useCallback(() => {
    timerExpiredRef.current = false;
    setTimeLeft(timerDuration);
    setTurnScore(0);
    setPhase("acting");
    if (soundEnabled) playStartTurn();
  }, [timerDuration, soundEnabled]);

  const handleCorrect = useCallback(() => {
    if (soundEnabled) playCorrectAnswer();
    setTurnScore((s) => s + 1);
    setScores((prev) => ({
      ...prev,
      [teams[currentTeamIndex]]: (prev[teams[currentTeamIndex]] ?? 0) + 1,
    }));
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((i) => i + 1);
    } else {
      // No more words — stop timer and end turn
      if (timerRef.current) clearTimeout(timerRef.current);
      timerExpiredRef.current = false;
      setPhase("scored");
    }
  }, [currentTeamIndex, currentWordIndex, teams, words.length, soundEnabled]);

  const handleSkip = useCallback(() => {
    if (soundEnabled) playSkip();
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((i) => i + 1);
    } else {
      // Last word skipped — end the turn
      if (timerRef.current) clearTimeout(timerRef.current);
      timerExpiredRef.current = false;
      setPhase("scored");
    }
  }, [currentWordIndex, words.length, soundEnabled]);

  const handleNextTeam = useCallback(() => {
    const nextTeamIndex = (currentTeamIndex + 1) % teams.length;
    const completedFullRound = nextTeamIndex === 0;
    const nextRound = completedFullRound ? round + 1 : round;

    // If the timer expired, the current word was shown but NOT guessed — skip it.
    // If words were exhausted (Correct/Skip on last word), currentWordIndex is already
    // on the last-used word, so we also need to advance by 1 for the next team.
    const nextWordIndex = currentWordIndex + 1;

    // Game over if: all rounds done, or truly no words left after advancing
    if (nextRound > totalRounds || nextWordIndex >= words.length) {
      setPhase("gameover");
      if (soundEnabled) setTimeout(() => playGameOverFanfare(), 300);
    } else {
      setCurrentTeamIndex(nextTeamIndex);
      setRound(nextRound);
      // Always advance past the word that ended the previous turn
      // (whether it was the un-guessed timer-expire word, or the last guessed word)
      setCurrentWordIndex(nextWordIndex);
      setPhase("ready");
    }
  }, [currentTeamIndex, currentWordIndex, teams.length, words.length, round, totalRounds, soundEnabled]);

  const handleEndGame = useCallback(() => {
    setPhase("gameover");
    if (soundEnabled) setTimeout(() => playGameOverFanfare(), 300);
  }, [soundEnabled]);

  // Sort leaderboard
  const leaderboard = useMemo(() =>
    [...teams].sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0)),
    [teams, scores]
  );

  if (!parsed) {
    return (
      <main className="flex h-[100dvh] flex-col items-center justify-center gap-4 px-4 sm:gap-6">
        <h1
          className="text-2xl font-black uppercase tracking-[0.2em] text-white/80 sm:text-3xl sm:tracking-[0.3em]"
          style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
        >
          Invalid Game Code
        </h1>
        <p className="text-xs text-white/40 sm:text-sm">This game code doesn&apos;t exist or has expired.</p>
        <Link
          href="/charades"
          className="rounded-xl border border-white/15 bg-white/[0.05] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white/70 transition-colors hover:bg-white/[0.1] sm:px-6 sm:py-3 sm:text-sm"
        >
          Create New Game
        </Link>
      </main>
    );
  }

  const timerPercentage = (timeLeft / timerDuration) * 100;
  const timerColor = timeLeft <= 5 ? "#EF4444" : timeLeft <= 15 ? "#FBBF24" : currentColor.accent;

  return (
    <main className="relative flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden" style={{ overscrollBehavior: "none" }}>
      {/* Ambient Background — colored by current team */}
      <div className="pointer-events-none fixed inset-0">
        <motion.div
          className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px]"
          animate={{ backgroundColor: `${currentColor.accent}0A` }}
          transition={{ duration: 0.5 }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/3 h-[300px] w-[300px] rounded-full blur-[60px]"
          animate={{ backgroundColor: `${currentColor.accent}08` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex shrink-0 items-center justify-between px-4 py-3 sm:px-6 sm:py-5">
        <Link
          href="/"
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 transition-colors hover:text-white/60 sm:text-xs sm:tracking-[0.3em]"
        >
          ← The Arena
        </Link>
        <div className="flex flex-col items-center">
          <h1
            className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/50 sm:text-sm sm:tracking-[0.35em]"
            style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
          >
            Charades
          </h1>
          <p className="mt-0.5 font-mono text-[10px] tracking-wider text-white/20">
            {parsed.category} • Round {round} of {totalRounds}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEndGame}
            className="rounded-lg border border-white/8 bg-white/[0.02] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40 transition-colors hover:border-white/15 hover:text-white/60 sm:rounded-xl sm:px-4 sm:py-2 sm:text-xs"
          >
            End
          </button>
          <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
        </div>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 items-center justify-center px-4 pb-6 sm:px-6 sm:pb-12">
        <AnimatePresence mode="wait">
          {/* ── READY PHASE ── */}
          {phase === "ready" && (
            <motion.div
              key={`ready-${currentTeamIndex}-${round}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex w-full flex-col items-center"
            >
              <div className="glass-panel w-full max-w-md rounded-2xl p-3 text-center sm:rounded-3xl sm:p-8">
                <motion.div
                  className="mb-3 text-4xl sm:mb-4 sm:text-5xl"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  {TEAM_EMOJIS[currentTeamIndex % TEAM_EMOJIS.length]}
                </motion.div>
                <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/30 sm:text-xs sm:tracking-[0.3em]">
                  Round {round} of {totalRounds} • Up Next
                </p>
                <h2
                  className="mb-3 text-xl font-bold uppercase tracking-[0.1em] sm:mb-4 sm:text-3xl sm:tracking-[0.2em]"
                  style={{
                    fontFamily: "var(--font-syne), var(--font-display)",
                    color: currentColor.accent,
                  }}
                >
                  {teams[currentTeamIndex]}
                </h2>

                <p className="mb-2 text-xs text-white/40 sm:text-sm">
                  Your team has <span className="font-bold" style={{ color: currentColor.accent }}>{timerDuration}s</span> to act out as many words as possible
                </p>
                <p className="mb-5 text-[10px] text-white/25 sm:mb-8 sm:text-xs">
                  One person acts • Team guesses • No talking or pointing
                </p>

                {/* Team Scoreboard */}
                <div className="mb-4 flex flex-wrap justify-center gap-1.5 sm:mb-6 sm:gap-2">
                  {teams.map((t, i) => {
                    const tc = TEAM_COLORS[i % TEAM_COLORS.length];
                    const isActive = i === currentTeamIndex;
                    return (
                      <div
                        key={t}
                        className="rounded-md px-2 py-1 text-[10px] font-bold sm:rounded-lg sm:px-3 sm:py-1.5 sm:text-xs"
                        style={{
                          background: isActive ? tc.bg : "rgba(255,255,255,0.02)",
                          border: `1px solid ${isActive ? tc.border : "rgba(255,255,255,0.08)"}`,
                          color: isActive ? tc.accent : "rgba(255,255,255,0.4)",
                        }}
                      >
                        {TEAM_EMOJIS[i % TEAM_EMOJIS.length]} {t}: {scores[t] ?? 0}
                      </div>
                    );
                  })}
                </div>

                <motion.button
                  onClick={handleStartTurn}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-xl bg-gradient-to-r ${currentColor.gradient} px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white shadow-lg sm:px-8 sm:py-4 sm:text-sm sm:tracking-[0.2em]`}
                >
                  Start Turn
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── ACTING PHASE ── */}
          {phase === "acting" && (
            <motion.div
              key="acting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex w-full flex-col items-center"
            >
              <div className="glass-panel w-full max-w-md rounded-2xl p-3 text-center sm:rounded-3xl sm:p-8">
                {/* Team indicator */}
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] sm:mb-3 sm:text-xs sm:tracking-[0.2em]" style={{ color: currentColor.accent }}>
                  {TEAM_EMOJIS[currentTeamIndex % TEAM_EMOJIS.length]} {teams[currentTeamIndex]}
                </p>

                {/* Timer */}
                <div className="relative mx-auto mb-4 h-20 w-20 sm:mb-6 sm:h-28 sm:w-28">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50" cy="50" r="44"
                      fill="none"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="6"
                    />
                    <motion.circle
                      cx="50" cy="50" r="44"
                      fill="none"
                      stroke={timerColor}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={276.46}
                      strokeDashoffset={276.46 * (1 - timerPercentage / 100)}
                      transition={{ duration: 0.3 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span
                      className="text-2xl font-black sm:text-3xl"
                      style={{
                        fontFamily: "var(--font-syne), var(--font-display)",
                        color: timerColor,
                      }}
                      animate={timeLeft <= 5 ? { scale: [1, 1.15, 1] } : {}}
                      transition={timeLeft <= 5 ? { duration: 0.5, repeat: Infinity } : {}}
                    >
                      {timeLeft}
                    </motion.span>
                  </div>
                </div>

                {/* Current Word */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentWordIndex}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="mb-5 sm:mb-8"
                  >
                    <p className="mb-1.5 text-[10px] uppercase tracking-widest text-white/25 sm:mb-2 sm:text-xs">Act this out</p>
                    <h2
                      className="break-words text-xl font-black uppercase tracking-[0.08em] text-white/90 sm:text-4xl sm:tracking-[0.15em]"
                      style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
                    >
                      {words[currentWordIndex]}
                    </h2>
                  </motion.div>
                </AnimatePresence>

                {/* Actions */}
                <div className="flex gap-2 sm:gap-3">
                  <motion.button
                    onClick={handleSkip}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] py-3 text-xs font-bold uppercase tracking-widest text-white/40 transition-colors hover:border-white/20 hover:text-white/60 sm:rounded-xl sm:py-4 sm:text-sm"
                  >
                    Skip ✕
                  </motion.button>
                  <motion.button
                    onClick={handleCorrect}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-1 rounded-lg bg-gradient-to-r ${currentColor.gradient} py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg sm:rounded-xl sm:py-4 sm:text-sm`}
                  >
                    Correct ✓
                  </motion.button>
                </div>

                <p className="mt-3 text-[10px] text-white/20 sm:mt-4 sm:text-xs">
                  This turn: {turnScore} point{turnScore !== 1 ? "s" : ""}
                </p>
              </div>
            </motion.div>
          )}

          {/* ── SCORED PHASE ── */}
          {phase === "scored" && (
            <motion.div
              key="scored"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex w-full flex-col items-center"
            >
              <div className="glass-panel w-full max-w-md rounded-2xl p-3 text-center sm:rounded-3xl sm:p-8">
                <motion.span
                  className="mb-3 block text-4xl sm:mb-4 sm:text-5xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  {turnScore > 3 ? "🔥" : turnScore > 0 ? "👏" : "😅"}
                </motion.span>
                <h2
                  className="mb-2 text-lg font-bold uppercase tracking-[0.1em] text-white/90 sm:text-2xl sm:tracking-[0.2em]"
                  style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
                >
                  Time&apos;s Up!
                </h2>
                <p className="mb-2 text-sm text-white/50">
                  <span className="font-bold" style={{ color: currentColor.accent }}>
                    {TEAM_EMOJIS[currentTeamIndex % TEAM_EMOJIS.length]} {teams[currentTeamIndex]}
                  </span>{" "}
                  scored
                </p>
                <p
                  className="mb-4 text-4xl font-black sm:mb-6 sm:text-5xl"
                  style={{ fontFamily: "var(--font-syne), var(--font-display)", color: currentColor.accent }}
                >
                  {turnScore}
                </p>

                {/* Updated Scoreboard */}
                <div className="mb-4 space-y-1.5 sm:mb-6 sm:space-y-2">
                  {teams.map((t, i) => {
                    const tc = TEAM_COLORS[i % TEAM_COLORS.length];
                    return (
                      <div
                        key={t}
                        className="flex items-center justify-between rounded-lg px-3 py-2 sm:rounded-xl sm:px-4 sm:py-2.5"
                        style={{
                          background: tc.bg,
                          border: `1px solid ${tc.border}`,
                        }}
                      >
                        <span className="text-xs font-semibold sm:text-sm" style={{ color: tc.accent }}>
                          {TEAM_EMOJIS[i % TEAM_EMOJIS.length]} {t}
                        </span>
                        <span className="text-base font-black sm:text-lg" style={{ color: tc.accent }}>
                          {scores[t] ?? 0}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <motion.button
                  onClick={handleNextTeam}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`rounded-xl bg-gradient-to-r ${currentColor.gradient} px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg sm:px-8 sm:py-3 sm:text-sm`}
                >
                  Next Team →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── GAME OVER ── */}
          {phase === "gameover" && (
            <motion.div
              key="gameover"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full text-center"
            >
              <div className="glass-panel rounded-2xl p-3 sm:rounded-3xl sm:p-8">
                <span className="mb-3 block text-4xl sm:mb-4 sm:text-5xl">🏆</span>
                <h2
                  className="mb-2 text-xl font-black uppercase tracking-[0.1em] sm:text-3xl sm:tracking-[0.25em]"
                  style={{
                    fontFamily: "var(--font-syne), var(--font-display)",
                    color: TEAM_COLORS[teams.indexOf(leaderboard[0]) % TEAM_COLORS.length].accent,
                  }}
                >
                  {leaderboard[0]} Wins!
                </h2>
                <p className="mb-6 text-xs text-white/40 sm:mb-8 sm:text-sm">
                  with {scores[leaderboard[0]]} points! 🎉
                </p>

                <div className="mx-auto max-w-sm space-y-2 sm:space-y-3">
                  {leaderboard.map((team, i) => {
                    const origIndex = teams.indexOf(team);
                    const tc = TEAM_COLORS[origIndex % TEAM_COLORS.length];
                    return (
                      <motion.div
                        key={team}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between rounded-lg px-3 py-2.5 sm:rounded-xl sm:px-4 sm:py-3"
                        style={{
                          background: tc.bg,
                          border: `1px solid ${tc.border}`,
                        }}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-base font-bold sm:text-lg">
                            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                          </span>
                          <span className="text-xs font-semibold sm:text-sm" style={{ color: tc.accent }}>
                            {TEAM_EMOJIS[origIndex % TEAM_EMOJIS.length]} {team}
                          </span>
                        </div>
                        <span className="text-base font-black sm:text-lg" style={{ color: tc.accent }}>
                          {scores[team] ?? 0}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>

                <Link
                  href="/charades"
                  className="mt-6 inline-block rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white shadow-lg sm:mt-8 sm:px-8 sm:py-4 sm:text-sm sm:tracking-[0.2em]"
                >
                  Play Again
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
