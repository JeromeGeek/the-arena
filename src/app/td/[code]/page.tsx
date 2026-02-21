"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { slugToSeed, seededRandom } from "@/lib/gamecodes";
import { getRandomPrompt, type Intensity, type TruthOrDarePrompt } from "@/lib/truthordare";
import SoundToggle from "@/components/SoundToggle";
import { useSoundEnabled } from "@/hooks/useSoundEnabled";
import {
  playTruthPick,
  playDarePick,
  playPromptReveal,
  playNextPlayer,
} from "@/lib/sounds";

function parseCode(code: string, namesList?: string[]) {
  const parts = code.split("-");
  if (parts.length < 3) return null;

  const playerCount = parseInt(parts[0], 10);
  const intensity = parts[1] as Intensity;
  const slug = parts[parts.length - 1];

  if (isNaN(playerCount) || playerCount < 2 || playerCount > 15) return null;
  if (!["mild", "spicy", "extreme"].includes(intensity)) return null;

  const seed = slugToSeed(slug);
  if (seed === null) return null;

  const playerNames = namesList && namesList.length === playerCount
    ? namesList
    : Array.from({ length: playerCount }, (_, i) => `Player ${i + 1}`);

  return { playerNames, intensity, seed };
}

export default function TruthOrDareGamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const code = params.code as string;

  const namesList = useMemo(() => {
    const raw = searchParams.get("names");
    return raw ? decodeURIComponent(raw).split(",") : undefined;
  }, [searchParams]);

  const parsed = useMemo(() => parseCode(code, namesList), [code, namesList]);
  const randomFn = useMemo(() => parsed ? seededRandom(parsed.seed) : () => Math.random(), [parsed]);
  const { soundEnabled, toggleSound } = useSoundEnabled();

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState<TruthOrDarePrompt | null>(null);
  const [choice, setChoice] = useState<"truth" | "dare" | null>(null);
  const [round, setRound] = useState(1);
  const [usedTruths] = useState<Set<number>>(() => new Set());
  const [usedDares] = useState<Set<number>>(() => new Set());
  const [showPrompt, setShowPrompt] = useState(false);

  const players = useMemo(() => parsed?.playerNames ?? [], [parsed]);
  const intensity = parsed?.intensity ?? "spicy";

  const handleChoice = useCallback((type: "truth" | "dare") => {
    if (soundEnabled) {
      if (type === "truth") playTruthPick();
      else playDarePick();
    }
    setChoice(type);
    const used = type === "truth" ? usedTruths : usedDares;
    const result = getRandomPrompt(type, intensity, used, randomFn);
    if (result) {
      used.add(result.index);
      setCurrentPrompt(result.prompt);
    } else {
      // All used — reset and try again
      used.clear();
      const retry = getRandomPrompt(type, intensity, used, randomFn);
      if (retry) {
        used.add(retry.index);
        setCurrentPrompt(retry.prompt);
      }
    }
    setShowPrompt(true);
    if (soundEnabled) setTimeout(() => playPromptReveal(), 200);
  }, [intensity, randomFn, usedTruths, usedDares, soundEnabled]);

  const handleNext = useCallback(() => {
    if (soundEnabled) playNextPlayer();
    setShowPrompt(false);
    setChoice(null);
    setCurrentPrompt(null);
    const nextIndex = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextIndex);
    if (nextIndex === 0) setRound((r) => r + 1);
  }, [currentPlayerIndex, players.length, soundEnabled]);

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
          href="/truthordare"
          className="rounded-xl border border-white/15 bg-white/[0.05] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white/70 transition-colors hover:bg-white/[0.1] sm:px-6 sm:py-3 sm:text-sm"
        >
          Create New Game
        </Link>
      </main>
    );
  }

  const intensityColors: Record<string, string> = {
    mild: "#A855F7",
    spicy: "#D946EF",
    extreme: "#7C3AED",
  };

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-x-hidden">
      {/* Ambient Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(168,85,247,0.04)] blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/3 h-[300px] w-[300px] rounded-full bg-[rgba(124,58,237,0.03)] blur-[60px]" />
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
            Truth or Dare
          </h1>
          <p className="mt-0.5 font-mono text-[10px] tracking-wider text-white/20">
            Round {round} • {intensity.toUpperCase()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/truthordare"
            className="rounded-lg border border-white/8 bg-white/[0.02] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40 transition-colors hover:border-white/15 hover:text-white/60 sm:rounded-xl sm:px-4 sm:py-2 sm:text-xs"
          >
            New
          </Link>
          <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
        </div>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 items-center justify-center px-4 pb-6 sm:px-6 sm:pb-12">
        <AnimatePresence mode="wait">
          {!showPrompt ? (
            /* ── CHOICE PHASE ── */
            <motion.div
              key="choice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex w-full flex-col items-center"
            >
              <div className="glass-panel w-full max-w-md rounded-2xl p-3 text-center sm:rounded-3xl sm:p-8">
                {/* Player Name */}
                <motion.p
                  className="mb-2 text-[10px] uppercase tracking-[0.3em] text-white/30 sm:text-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Player {currentPlayerIndex + 1} of {players.length}
                </motion.p>
                <motion.h2
                  className="mb-5 text-xl font-bold uppercase tracking-[0.1em] sm:mb-8 sm:text-3xl sm:tracking-[0.2em]"
                  style={{
                    fontFamily: "var(--font-syne), var(--font-display)",
                    background: "linear-gradient(135deg, #A855F7, #7C3AED)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {players[currentPlayerIndex]}
                </motion.h2>

                <p className="mb-5 text-sm text-white/40 sm:mb-8">Choose your fate...</p>

                <div className="flex gap-3 sm:gap-4">
                  <motion.button
                    onClick={() => handleChoice("truth")}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 rounded-xl border border-[#A855F7]/30 bg-[#A855F7]/10 px-4 py-4 transition-all hover:border-[#A855F7]/50 hover:bg-[#A855F7]/15 sm:rounded-2xl sm:px-6 sm:py-6"
                  >
                    <span className="block text-3xl sm:text-4xl">🤫</span>
                    <span
                      className="mt-1.5 block text-base font-bold uppercase tracking-[0.15em] text-[#A855F7] sm:mt-2 sm:text-lg sm:tracking-[0.2em]"
                      style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
                    >
                      Truth
                    </span>
                  </motion.button>

                  <motion.button
                    onClick={() => handleChoice("dare")}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 rounded-xl border border-[#D946EF]/30 bg-[#D946EF]/10 px-4 py-4 transition-all hover:border-[#D946EF]/50 hover:bg-[#D946EF]/15 sm:rounded-2xl sm:px-6 sm:py-6"
                  >
                    <span className="block text-3xl sm:text-4xl">🔥</span>
                    <span
                      className="mt-1.5 block text-base font-bold uppercase tracking-[0.15em] text-[#D946EF] sm:mt-2 sm:text-lg sm:tracking-[0.2em]"
                      style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
                    >
                      Dare
                    </span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ── PROMPT PHASE ── */
            <motion.div
              key="prompt"
              initial={{ opacity: 0, scale: 0.9, rotateX: -10 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="flex w-full flex-col items-center"
            >
              <div className="glass-panel w-full max-w-md rounded-2xl p-3 text-center sm:rounded-3xl sm:p-8">
                {/* Type Badge */}
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="mb-3 inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] sm:mb-4 sm:px-4 sm:py-1.5 sm:text-xs"
                  style={{
                    background: choice === "truth" ? "rgba(168,85,247,0.15)" : "rgba(217,70,239,0.15)",
                    color: choice === "truth" ? "#A855F7" : "#D946EF",
                    border: `1px solid ${choice === "truth" ? "rgba(168,85,247,0.3)" : "rgba(217,70,239,0.3)"}`,
                  }}
                >
                  {choice === "truth" ? "🤫 Truth" : "🔥 Dare"}
                </motion.div>

                {/* Player */}
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-white/40 sm:mb-6 sm:tracking-[0.2em]">
                  {players[currentPlayerIndex]}
                </p>

                {/* Prompt Card */}
                <motion.div
                  className="mb-5 rounded-xl border p-4 sm:mb-8 sm:rounded-2xl sm:p-6"
                  style={{
                    borderColor: `${intensityColors[currentPrompt?.intensity ?? "mild"]}33`,
                    background: `${intensityColors[currentPrompt?.intensity ?? "mild"]}0D`,
                  }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <p
                    className="text-base font-semibold leading-relaxed text-white/80 sm:text-xl"
                    style={{ textWrap: "balance" }}
                  >
                    {currentPrompt?.text}
                  </p>
                  <p
                    className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] sm:mt-3"
                    style={{ color: intensityColors[currentPrompt?.intensity ?? "mild"] }}
                  >
                    {currentPrompt?.intensity}
                  </p>
                </motion.div>

                {/* Next Button */}
                <motion.button
                  onClick={handleNext}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-xl bg-gradient-to-r from-[#A855F7] to-[#7C3AED] px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg sm:px-8 sm:py-3 sm:text-sm"
                >
                  Next Player →
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
