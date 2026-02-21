"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { slugToSeed, seededRandom } from "@/lib/gamecodes";
import { getPromptsByIntensity, shufflePrompts, type NHIEIntensity } from "@/lib/neverhaveiever";
import SoundToggle from "@/components/SoundToggle";
import { useSoundEnabled } from "@/hooks/useSoundEnabled";
import {
  playConfession,
  playNextPrompt,
  playResultsReveal,
} from "@/lib/sounds";

function parseCode(code: string, namesList?: string[]) {
  const parts = code.split("-");
  if (parts.length < 3) return null;

  const playerCount = parseInt(parts[0], 10);
  const intensity = parts[1] as NHIEIntensity;
  const slug = parts[parts.length - 1];

  if (isNaN(playerCount) || playerCount < 2 || playerCount > 15) return null;
  if (!["wild", "spicy", "chaos"].includes(intensity)) return null;

  const seed = slugToSeed(slug);
  if (seed === null) return null;

  const playerNames = namesList && namesList.length === playerCount
    ? namesList
    : Array.from({ length: playerCount }, (_, i) => `Player ${i + 1}`);

  return { playerNames, intensity, seed };
}

export default function NHIEGamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const code = params.code as string;

  const namesList = useMemo(() => {
    const raw = searchParams.get("names");
    return raw ? decodeURIComponent(raw).split(",") : undefined;
  }, [searchParams]);

  const parsed = useMemo(() => parseCode(code, namesList), [code, namesList]);

  const shuffledPrompts = useMemo(() => {
    if (!parsed) return [];
    const pool = getPromptsByIntensity(parsed.intensity);
    const rng = seededRandom(parsed.seed);
    return shufflePrompts(pool, rng);
  }, [parsed]);

  const players = useMemo(() => parsed?.playerNames ?? [], [parsed]);
  const intensity = parsed?.intensity ?? "wild";
  const { soundEnabled, toggleSound } = useSoundEnabled();

  const [promptIndex, setPromptIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const s: Record<string, number> = {};
    players.forEach((p) => { s[p] = 0; });
    return s;
  });
  const [showResults, setShowResults] = useState(false);
  const [direction, setDirection] = useState(1);

  const currentPrompt = shuffledPrompts[promptIndex] ?? null;
  const isLastPrompt = promptIndex >= shuffledPrompts.length - 1;

  const handleNext = useCallback(() => {
    setDirection(1);
    if (isLastPrompt) {
      setShowResults(true);
      if (soundEnabled) playResultsReveal();
    } else {
      setPromptIndex((i) => i + 1);
      if (soundEnabled) playNextPrompt();
    }
  }, [isLastPrompt, soundEnabled]);

  const handleIDidIt = useCallback((playerName: string) => {
    setScores((prev) => ({ ...prev, [playerName]: (prev[playerName] ?? 0) + 1 }));
    if (soundEnabled) playConfession();
  }, [soundEnabled]);

  // Sorted leaderboard
  const leaderboard = useMemo(() =>
    [...players].sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0)),
    [players, scores]
  );

  if (!parsed) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-4 sm:gap-6">
        <h1
          className="text-2xl font-black uppercase tracking-[0.2em] text-white/80 sm:text-3xl sm:tracking-[0.3em]"
          style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
        >
          Invalid Game Code
        </h1>
        <p className="text-xs text-white/40 sm:text-sm">This game code doesn&apos;t exist or has expired.</p>
        <Link
          href="/neverhaveiever"
          className="rounded-xl border border-white/15 bg-white/[0.05] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white/70 transition-colors hover:bg-white/[0.1] sm:px-6 sm:py-3 sm:text-sm"
        >
          Create New Game
        </Link>
      </main>
    );
  }

  const intensityEmoji: Record<string, string> = { wild: "🐺", spicy: "🌶️", chaos: "☠️" };

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-x-hidden">
      {/* Ambient Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(34,197,94,0.04)] blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/3 h-[300px] w-[300px] rounded-full bg-[rgba(22,163,74,0.03)] blur-[60px]" />
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
            Never Have I Ever
          </h1>
          <p className="mt-0.5 font-mono text-[10px] tracking-wider text-white/20">
            {promptIndex + 1}/{shuffledPrompts.length} • {intensity.toUpperCase()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/neverhaveiever"
            className="rounded-lg border border-white/8 bg-white/[0.02] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40 transition-colors hover:border-white/15 hover:text-white/60 sm:rounded-xl sm:px-4 sm:py-2 sm:text-xs"
          >
            New
          </Link>
          <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
        </div>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 pb-6 sm:px-6 sm:pb-12">
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key={`prompt-${promptIndex}`}
              initial={{ opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -50 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="flex w-full flex-col items-center"
            >
              {/* Prompt Card */}
              <div className="glass-panel w-full max-w-md rounded-2xl p-3 text-center sm:rounded-3xl sm:p-8">
                {/* Intensity Badge */}
                <div
                  className="mb-3 inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] sm:mb-4 sm:px-4 sm:py-1.5 sm:text-xs"
                  style={{
                    background: "rgba(34,197,94,0.1)",
                    color: "#22C55E",
                    border: "1px solid rgba(34,197,94,0.25)",
                  }}
                >
                  {intensityEmoji[currentPrompt?.intensity ?? "tame"]} {currentPrompt?.intensity}
                </div>

                {/* Prompt Text */}
                <motion.h2
                  className="mb-5 text-lg font-bold leading-relaxed text-white/85 sm:mb-8 sm:text-2xl"
                  style={{ fontFamily: "var(--font-syne), var(--font-display)", textWrap: "balance" }}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {currentPrompt?.text}
                </motion.h2>

                {/* Player Buttons — tap to "confess" */}
                <div className="mb-4 sm:mb-6">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/30 sm:mb-3 sm:text-xs">
                    Tap if you&apos;ve done it 👇
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                    {players.map((player) => (
                      <motion.button
                        key={player}
                        onClick={() => handleIDidIt(player)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.9 }}
                        className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[10px] font-semibold text-white/60 transition-all hover:border-[#22C55E]/40 hover:bg-[#22C55E]/10 hover:text-[#22C55E] sm:rounded-xl sm:px-3 sm:py-2 sm:text-xs"
                      >
                        {player}
                        {(scores[player] ?? 0) > 0 && (
                          <span className="ml-1.5 text-[10px] text-[#22C55E]">
                            ({scores[player]})
                          </span>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-white/5 sm:mb-6">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A]"
                    initial={{ width: 0 }}
                    animate={{ width: `${((promptIndex + 1) / shuffledPrompts.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* Next Button */}
                <motion.button
                  onClick={handleNext}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg sm:px-8 sm:py-3 sm:text-sm"
                >
                  {isLastPrompt ? "See Results" : "Next →"}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            /* ── RESULTS ── */
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full text-center"
            >
              <div className="glass-panel rounded-2xl p-3 sm:rounded-3xl sm:p-8">
                <span className="mb-3 block text-4xl sm:mb-4 sm:text-5xl">🏆</span>
                <h2
                  className="mb-2 text-xl font-black uppercase tracking-[0.15em] text-[#22C55E] sm:text-3xl sm:tracking-[0.25em]"
                  style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
                >
                  Results
                </h2>
                <p className="mb-5 text-xs text-white/40 sm:mb-8 sm:text-sm">
                  Most confessions = Most experienced 😏
                </p>

                <div className="mx-auto max-w-sm space-y-2 sm:space-y-3">
                  {leaderboard.map((player, i) => (
                    <motion.div
                      key={player}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 sm:rounded-xl sm:px-4 sm:py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-white/20">#{i + 1}</span>
                        <span className="text-sm font-semibold text-white/70">{player}</span>
                      </div>
                      <span
                        className="text-lg font-black"
                        style={{
                          color: i === 0 ? "#22C55E" : i === 1 ? "#10B981" : "rgba(255,255,255,0.4)",
                        }}
                      >
                        {scores[player] ?? 0}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <Link
                  href="/neverhaveiever"
                  className="mt-6 inline-block rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white shadow-lg sm:mt-8 sm:px-8 sm:py-4 sm:text-sm sm:tracking-[0.2em]"
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
