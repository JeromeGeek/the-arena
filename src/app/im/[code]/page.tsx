"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { setupImposterGame, type ImposterPlayer } from "@/lib/imposter";
import { slugToSeed, seededRandom } from "@/lib/gamecodes";

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

  const [phase, setPhase] = useState<GamePhase>("reveal");
  const [players, setPlayers] = useState<ImposterPlayer[]>(() => parsed?.players ?? []);
  const [category] = useState(() => parsed?.category ?? "");
  const [secretWord] = useState(() => parsed?.secretWord ?? "");
  const [revealIndex, setRevealIndex] = useState(0);
  const [showWord, setShowWord] = useState(false);

  const invalidCode = !parsed;

  function handleShowWord() {
    setShowWord(true);
  }

  function handleNextPlayer() {
    setShowWord(false);
    if (revealIndex < players.length - 1) {
      setRevealIndex((i) => i + 1);
    } else {
      setPhase("discussion");
    }
  }

  function handleVote(playerId: number) {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, eliminated: true } : p))
    );
    const target = players.find((p) => p.id === playerId);
    if (target?.isImposter) {
      setPhase("result");
    } else {
      const remaining = players.filter((p) => !p.eliminated && p.id !== playerId && !p.isImposter);
      if (remaining.length <= 1) {
        setPhase("result");
      } else {
        setPhase("discussion");
      }
    }
  }

  const impostersEliminated = players.filter((p) => p.isImposter && p.eliminated).length;
  const totalImposters = players.filter((p) => p.isImposter).length;
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
      <main className="flex h-screen flex-col items-center justify-center gap-6">
        <h1
          className="text-3xl font-black uppercase tracking-[0.3em] text-white/80"
          style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
        >
          Invalid Game Code
        </h1>
        <p className="text-sm text-white/40">This game code doesn&apos;t exist or has expired.</p>
        <Link
          href="/imposter"
          className="rounded-xl border border-white/15 bg-white/[0.05] px-6 py-3 text-sm font-bold uppercase tracking-widest text-white/70 transition-colors hover:bg-white/[0.1]"
        >
          Create New Game
        </Link>
      </main>
    );
  }

  return (
    <main className="relative flex h-screen flex-col overflow-hidden">
      {/* Ambient Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(0,180,219,0.03)] blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex shrink-0 items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="text-xs font-bold uppercase tracking-[0.3em] text-white/30 transition-colors hover:text-white/60"
        >
          ← The Arena
        </Link>
        <div className="flex flex-col items-center">
          <h1
            className="text-sm font-bold uppercase tracking-[0.35em] text-white/50"
            style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
          >
            Imposter
          </h1>
          <p className="mt-0.5 font-mono text-[10px] tracking-wider text-white/20">
            /im/{code}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/imposter"
            className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/40 transition-colors hover:border-white/15 hover:text-white/60"
          >
            New Game
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 items-center justify-center px-6 pb-12">
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
              <div className="glass-panel w-full max-w-md rounded-3xl p-8 text-center">
                <p className="mb-2 text-xs uppercase tracking-[0.3em] text-white/30">
                  Player {revealIndex + 1} of {players.length}
                </p>
                <h2
                  className="mb-6 text-3xl font-bold uppercase tracking-[0.2em] text-white/90"
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
                        className="mb-6 rounded-2xl border p-6"
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
                          className="text-3xl font-black uppercase tracking-[0.2em]"
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
              <div className="glass-panel rounded-3xl p-8">
                <h2
                  className="mb-4 text-3xl font-bold uppercase tracking-[0.25em] text-white/90"
                  style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
                >
                  Discussion
                </h2>
                <p className="mb-2 text-sm text-white/40">
                  Who&apos;s the Imposter?
                </p>
                {discussionStarter && (
                  <p className="mb-8 text-sm font-semibold text-[#00B4DB]/70">
                    {discussionStarter.name} starts the round
                  </p>
                )}

                <motion.button
                  onClick={() => setPhase("voting")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-xl bg-gradient-to-r from-[#FF416C] to-[#FF4B2B] px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-lg"
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
              <div className="glass-panel rounded-3xl p-8">
                <h2
                  className="mb-2 text-2xl font-bold uppercase tracking-[0.25em] text-white/90"
                  style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
                >
                  Vote to Eliminate
                </h2>
                <p className="mb-8 text-sm text-white/30">Select who you think the imposter is</p>

                <div className="grid grid-cols-2 gap-3">
                  {players
                    .filter((p) => !p.eliminated)
                    .map((player) => (
                      <motion.button
                        key={player.id}
                        onClick={() => handleVote(player.id)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.95 }}
                        className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm font-semibold text-white/70 transition-all hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-400"
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
              <div className="glass-panel rounded-3xl p-8">
                <span className="mb-4 block text-6xl">{crewWins ? "🎉" : "🕵️"}</span>
                <h2
                  className="mb-4 text-3xl font-black uppercase tracking-[0.25em]"
                  style={{
                    fontFamily: "var(--font-syne), var(--font-display)",
                    color: crewWins ? "#00B4DB" : "#ef4444",
                  }}
                >
                  {crewWins ? "Crew Wins!" : "Imposter Wins!"}
                </h2>
                <p className="mb-2 text-sm text-white/40">
                  The word was: <span className="font-bold text-white/70">{secretWord}</span>
                </p>
                <p className="mb-8 text-sm text-white/30">
                  Imposter{totalImposters > 1 ? "s" : ""}:{" "}
                  {players
                    .filter((p) => p.isImposter)
                    .map((p) => p.name)
                    .join(", ")}
                </p>

                <Link
                  href="/imposter"
                  className="inline-block rounded-xl bg-gradient-to-r from-[#00B4DB] to-[#0083B0] px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-lg"
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
