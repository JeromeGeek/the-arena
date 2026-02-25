"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { setupImposterGame, type ImposterPlayer } from "@/lib/imposter";
import { slugToSeed, seededRandom } from "@/lib/gamecodes";
import SoundToggle from "@/components/SoundToggle";
import { useSoundEnabled } from "@/hooks/useSoundEnabled";
import {
  playRevealWord,
  playVoteCast,
  playDiscussionStart,
  playCrewWins,
  playImposterWins,
} from "@/lib/sounds";

type GamePhase = "reveal" | "discussion" | "voting" | "result";

function parseCode(code: string, namesList?: string[]) {
  const parts = code.split("-");
  if (parts.length < 4) return null;

  const playerCount = parseInt(parts[0], 10);
  const imposterCount = parseInt(parts[1], 10);

  // Game slug is always the last part
  const slug = parts[parts.length - 1];
  // Category is everything between imposterCount and game slug
  const category = parts.slice(2, -1).join("-");

  if (isNaN(playerCount) || playerCount < 3 || playerCount > 15) return null;
  if (isNaN(imposterCount) || imposterCount < 1 || imposterCount > Math.min(5, playerCount - 2)) return null;

  const seed = slugToSeed(slug);
  if (seed === null) return null;

  const random = seededRandom(seed);
  const playerNames = namesList && namesList.length === playerCount
    ? namesList
    : Array.from({ length: playerCount }, (_, i) => `Player ${i + 1}`);
  const categoryName = category === "random" ? undefined : category;
  return setupImposterGame(playerNames, imposterCount, random, categoryName);
}

export default function ImposterGamePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const code = params.code as string;

  const namesList = useMemo(() => {
    const raw = searchParams.get("names");
    return raw ? decodeURIComponent(raw).split(",") : undefined;
  }, [searchParams]);

  const parsed = useMemo(() => parseCode(code, namesList), [code, namesList]);
  const { soundEnabled, toggleSound } = useSoundEnabled();

  const [phase, setPhase] = useState<GamePhase>("reveal");
  const [players, setPlayers] = useState<ImposterPlayer[]>(() => parsed?.players ?? []);
  const [category] = useState(() => parsed?.category ?? "");
  const [secretWord] = useState(() => parsed?.secretWord ?? "");
  const [revealIndex, setRevealIndex] = useState(0);
  const [showWord, setShowWord] = useState(false);

  const invalidCode = !parsed;

  function handleShowWord() {
    setShowWord(true);
    // Play the same neutral reveal sound for everyone — imposter/crew-specific
    // sounds would let other players hear who is the imposter
    if (soundEnabled) {
      playRevealWord();
    }
  }

  function handleNextPlayer() {
    if (soundEnabled) playRevealWord();
    setShowWord(false);
    if (revealIndex < players.length - 1) {
      setRevealIndex((i) => i + 1);
    } else {
      setPhase("discussion");
      if (soundEnabled) playDiscussionStart();
    }
  }

  function handleVote(playerId: number) {
    if (soundEnabled) playVoteCast();

    // Apply elimination to a local copy to make accurate win checks
    const updatedPlayers = players.map((p) =>
      p.id === playerId ? { ...p, eliminated: true } : p
    );
    setPlayers(updatedPlayers);

    const target = updatedPlayers.find((p) => p.id === playerId);
    const remainingImposters = updatedPlayers.filter((p) => p.isImposter && !p.eliminated).length;
    const remainingCrew = updatedPlayers.filter((p) => !p.isImposter && !p.eliminated).length;

    if (remainingImposters === 0) {
      // All imposters caught — crew wins
      setPhase("result");
      if (soundEnabled) setTimeout(() => playCrewWins(), 300);
    } else if (remainingImposters >= remainingCrew) {
      // Imposters outnumber or equal crew — imposter wins
      setPhase("result");
      if (soundEnabled) setTimeout(() => playImposterWins(), 300);
    } else if (target?.isImposter && remainingImposters > 0) {
      // Caught one but more remain — go back to discussion
      setPhase("discussion");
    } else {
      // Wrong vote — check if game still winnable for crew
      if (remainingCrew <= 1) {
        setPhase("result");
        if (soundEnabled) setTimeout(() => playImposterWins(), 300);
      } else {
        setPhase("discussion");
      }
    }
  }

  const totalImposters = players.filter((p) => p.isImposter).length;
  const impostersEliminated = players.filter((p) => p.isImposter && p.eliminated).length;
  const crewWins = impostersEliminated === totalImposters && totalImposters > 0;

  const discussionStarter = useMemo(() => {
    const nonImposters = players.filter((p) => !p.isImposter && !p.eliminated);
    if (nonImposters.length === 0) return null;
    const seed = slugToSeed(code.split("-").slice(-1)[0]);
    const pick = seed !== null ? (seed % nonImposters.length) : 0;
    return nonImposters[pick];
  }, [players, code]);

  if (invalidCode) {
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
          href="/imposter"
          className="rounded-xl border border-white/15 bg-white/[0.05] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white/70 transition-colors hover:bg-white/[0.1] sm:px-6 sm:py-3 sm:text-sm"
        >
          Create New Game
        </Link>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-x-hidden">
      {/* Ambient Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(0,180,219,0.04)] blur-[80px]" />
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
            Imposter
          </h1>
          <p className="mt-0.5 font-mono text-[10px] tracking-wider text-white/20">
            {players.length} Players • {category}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/imposter"
            className="rounded-lg border border-white/8 bg-white/[0.02] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40 transition-colors hover:border-white/15 hover:text-white/60 sm:rounded-xl sm:px-4 sm:py-2 sm:text-xs"
          >
            New
          </Link>
          <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
        </div>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 items-center justify-center px-4 pb-6 sm:px-6 sm:pb-12">
        <AnimatePresence mode="wait">
          {/* ── REVEAL PHASE ── */}
          {phase === "reveal" && players.length > 0 && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex w-full flex-col items-center"
            >
              <div className="glass-panel w-full max-w-md rounded-2xl p-3 text-center sm:rounded-3xl sm:p-8">
                <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-white/30 sm:text-xs">
                  Player {revealIndex + 1} of {players.length}
                </p>
                <h2
                  className="mb-4 text-xl font-bold uppercase tracking-[0.1em] text-white/90 sm:mb-6 sm:text-3xl sm:tracking-[0.2em]"
                  style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
                >
                  {players[revealIndex].name}
                </h2>

                <p className="mb-2 text-xs uppercase tracking-widest text-white/30">
                  Category: {category}
                </p>

                <AnimatePresence mode="wait">
                  {!showWord ? (
                    <motion.button
                      key="show"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={handleShowWord}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="mx-auto mt-6 rounded-xl border border-white/15 bg-white/[0.05] px-8 py-4 text-sm font-bold uppercase tracking-widest text-white/70"
                    >
                      Tap to Reveal
                    </motion.button>
                  ) : (
                    <motion.div
                      key="word"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="mt-6"
                    >
                      <div
                        className="mb-4 rounded-xl border p-4 sm:mb-6 sm:rounded-2xl sm:p-6"
                        style={{
                          borderColor: players[revealIndex].isImposter
                            ? "rgba(239,68,68,0.3)"
                            : "rgba(0,180,219,0.2)",
                          background: players[revealIndex].isImposter
                            ? "rgba(239,68,68,0.08)"
                            : "rgba(0,180,219,0.05)",
                        }}
                      >
                        <p
                          className="text-lg font-black uppercase tracking-[0.08em] sm:text-3xl sm:tracking-[0.2em]"
                          style={{
                            fontFamily: "var(--font-syne), var(--font-display)",
                            color: players[revealIndex].isImposter ? "#ef4444" : "#00B4DB",
                          }}
                        >
                          {players[revealIndex].isImposter
                            ? "You are the IMPOSTER"
                            : players[revealIndex].word}
                        </p>
                        {players[revealIndex].isImposter && (
                          <p className="mt-2 text-sm text-red-400/60">Blend in. Don&apos;t get caught.</p>
                        )}
                      </div>

                      <motion.button
                        onClick={handleNextPlayer}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="rounded-xl bg-gradient-to-r from-[#00B4DB] to-[#0083B0] px-8 py-3 text-sm font-bold uppercase tracking-widest text-white"
                      >
                        {revealIndex < players.length - 1 ? "Next Player" : "Start Discussion"}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ── DISCUSSION PHASE ── */}
          {phase === "discussion" && (
            <motion.div
              key="discussion"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full text-center"
            >
              <div className="glass-panel rounded-2xl p-3 sm:rounded-3xl sm:p-8">
                <h2
                  className="mb-3 text-xl font-bold uppercase tracking-[0.15em] text-white/90 sm:mb-4 sm:text-3xl sm:tracking-[0.25em]"
                  style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
                >
                  Discussion
                </h2>
                <p className="mb-2 text-xs text-white/40 sm:text-sm">
                  Who&apos;s the Imposter?
                </p>
                {discussionStarter && (
                  <p className="mb-5 text-xs font-semibold text-[#00B4DB]/70 sm:mb-8 sm:text-sm">
                    {discussionStarter.name} starts the round
                  </p>
                )}

                <motion.button
                  onClick={() => setPhase("voting")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-xl bg-gradient-to-r from-[#FF416C] to-[#FF4B2B] px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white shadow-lg sm:px-8 sm:py-4 sm:text-sm sm:tracking-[0.2em]"
                >
                  Proceed to Vote
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── VOTING PHASE ── */}
          {phase === "voting" && (
            <motion.div
              key="voting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <div className="glass-panel rounded-2xl p-3 sm:rounded-3xl sm:p-8">
                <h2
                  className="mb-2 text-lg font-bold uppercase tracking-[0.15em] text-white/90 sm:text-2xl sm:tracking-[0.25em]"
                  style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
                >
                  Vote to Eliminate
                </h2>
                <p className="mb-5 text-xs text-white/30 sm:mb-8 sm:text-sm">Select who you think the imposter is</p>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {players
                    .filter((p) => !p.eliminated)
                    .map((player) => (
                      <motion.button
                        key={player.id}
                        onClick={() => handleVote(player.id)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.95 }}
                        className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 text-xs font-semibold text-white/70 transition-all hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-400 sm:rounded-xl sm:px-4 sm:py-4 sm:text-sm"
                      >
                        {player.name}
                      </motion.button>
                    ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── RESULT PHASE ── */}
          {phase === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full text-center"
            >
              <div className="glass-panel rounded-2xl p-3 sm:rounded-3xl sm:p-8">
                <span className="mb-3 block text-4xl sm:mb-4 sm:text-6xl">{crewWins ? "🎉" : "🕵️"}</span>
                <h2
                  className="mb-3 text-xl font-black uppercase tracking-[0.15em] sm:mb-4 sm:text-3xl sm:tracking-[0.25em]"
                  style={{
                    fontFamily: "var(--font-syne), var(--font-display)",
                    color: crewWins ? "#00B4DB" : "#ef4444",
                  }}
                >
                  {crewWins ? "Crew Wins!" : "Imposter Wins!"}
                </h2>
                <p className="mb-2 text-xs text-white/40 sm:text-sm">
                  The word was: <span className="font-bold text-white/70">{secretWord}</span>
                </p>
                <p className="mb-5 text-xs text-white/30 sm:mb-8 sm:text-sm">
                  Imposter{totalImposters > 1 ? "s" : ""}:{" "}
                  {players
                    .filter((p) => p.isImposter)
                    .map((p) => p.name)
                    .join(", ")}
                </p>

                <Link
                  href="/imposter"
                  className="inline-block rounded-xl bg-gradient-to-r from-[#00B4DB] to-[#0083B0] px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white shadow-lg sm:px-8 sm:py-4 sm:text-sm sm:tracking-[0.2em]"
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
