"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import Board from "@/components/Board";
import TurnIndicator from "@/components/TurnIndicator";
import { generateBoard, type GameCard, type Difficulty } from "@/lib/codenames";
import { lookupSlug, seededRandom } from "@/lib/gamecodes";

function parseCode(code: string) {
  const entry = lookupSlug(code);
  if (!entry) return null;

  const random = seededRandom(entry.seed);
  return generateBoard(entry.difficulty as Difficulty, random);
}

export default function CodenamesGamePage() {
  const params = useParams();
  const code = params.code as string;

  const parsed = useMemo(() => parseCode(code), [code]);

  const [cards, setCards] = useState<GameCard[]>(() => parsed?.cards ?? []);
  const [currentTeam, setCurrentTeam] = useState<"red" | "blue">(() => parsed?.startingTeam ?? "red");
  const [isSpymaster, setIsSpymaster] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<"red" | "blue" | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  const invalidCode = !parsed;

  const redRemaining = cards.filter((c) => c.type === "red" && !c.revealed).length;
  const blueRemaining = cards.filter((c) => c.type === "blue" && !c.revealed).length;

  const handleReveal = useCallback(
    (index: number) => {
      if (gameOver) return;

      setCards((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], revealed: true };
        return updated;
      });

      const card = cards[index];

      if (card.type === "assassin") {
        setShaking(true);
        setTimeout(() => setShaking(false), 300);
        setTimeout(() => {
          setGameOver(true);
          setWinner(currentTeam === "red" ? "blue" : "red");
        }, 600);
        return;
      }

      setTimeout(() => {
        setCards((latest) => {
          const redLeft = latest.filter((c) => c.type === "red" && !c.revealed).length;
          const blueLeft = latest.filter((c) => c.type === "blue" && !c.revealed).length;

          if (redLeft === 0) {
            setGameOver(true);
            setWinner("red");
          } else if (blueLeft === 0) {
            setGameOver(true);
            setWinner("blue");
          } else if (card.type !== currentTeam) {
            setCurrentTeam((t) => (t === "red" ? "blue" : "red"));
          }
          return latest;
        });
      }, 500);
    },
    [cards, currentTeam, gameOver]
  );

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
          href="/codenames"
          className="rounded-xl border border-white/15 bg-white/[0.05] px-6 py-3 text-sm font-bold uppercase tracking-widest text-white/70 transition-colors hover:bg-white/[0.1]"
        >
          Create New Game
        </Link>
      </main>
    );
  }

  return (
    <main className="relative flex h-screen max-h-screen flex-col overflow-hidden">
      {/* Ambient Background Tint */}
      <div
        className="pointer-events-none fixed inset-0 transition-all duration-1000"
        style={{
          background:
            currentTeam === "red"
              ? "radial-gradient(ellipse at 50% 30%, rgba(255,65,108,0.04) 0%, transparent 70%)"
              : "radial-gradient(ellipse at 50% 30%, rgba(0,180,219,0.04) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex shrink-0 items-center justify-between px-3 py-2 sm:px-6 sm:py-3">
        <Link
          href="/"
          className="hidden text-xs font-bold uppercase tracking-[0.3em] text-white/30 transition-colors hover:text-white/60 sm:block"
        >
          ← The Arena
        </Link>

        <h1
          className="text-xs font-bold uppercase tracking-[0.35em] text-white/50 sm:text-sm"
          style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
        >
          Codenames
        </h1>

        <div className="flex items-center gap-2 sm:gap-3">
          <motion.button
            onClick={() => setIsSpymaster((s) => !s)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-lg border px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all sm:rounded-xl sm:px-4 sm:py-2 sm:text-xs"
            style={{
              borderColor: isSpymaster ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
              background: isSpymaster ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
              color: isSpymaster ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)",
            }}
          >
            <span className="hidden sm:inline">{isSpymaster ? "🕵️ Spymaster" : "🎯 Guesser"}</span>
            <span className="sm:hidden">{isSpymaster ? "🕵️" : "🎯"}</span>
          </motion.button>

          <Link
            href="/codenames"
            className="rounded-lg border border-white/8 bg-white/[0.02] px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40 transition-colors hover:border-white/15 hover:text-white/60 sm:rounded-xl sm:px-4 sm:py-2 sm:text-xs"
          >
            <span className="hidden sm:inline">New Game</span>
            <span className="sm:hidden">New</span>
          </Link>

          <motion.button
            onClick={toggleFullscreen}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-lg border border-white/8 bg-white/[0.02] px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40 transition-colors hover:border-white/15 hover:text-white/60 sm:rounded-xl sm:px-4 sm:py-2 sm:text-xs"
          >
            <span className="hidden sm:inline">{isFullscreen ? "⛶ Exit" : "⛶ Fullscreen"}</span>
            <span className="sm:hidden">⛶</span>
          </motion.button>
        </div>
      </header>

      {/* Game Content */}
      {cards.length > 0 && (
        <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* Turn Indicator */}
          {!gameOver && (
            <div className="flex shrink-0 justify-center px-4 py-1">
              <TurnIndicator
                team={currentTeam}
                redRemaining={redRemaining}
                blueRemaining={blueRemaining}
              />
            </div>
          )}

          {/* Game Over Banner */}
          <AnimatePresence>
            {gameOver && winner && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="mx-auto mb-4 flex max-w-md flex-col items-center gap-3 rounded-2xl border p-4 text-center backdrop-blur-xl"
                style={{
                  borderColor: winner === "red" ? "rgba(255,65,108,0.3)" : "rgba(0,180,219,0.3)",
                  background: winner === "red" ? "rgba(255,65,108,0.08)" : "rgba(0,180,219,0.08)",
                  boxShadow:
                    winner === "red"
                      ? "0 0 40px rgba(255,65,108,0.15)"
                      : "0 0 40px rgba(0,180,219,0.15)",
                }}
              >
                <span className="text-3xl">{winner === "red" ? "🔴" : "🔵"}</span>
                <h2
                  className="text-xl font-black uppercase tracking-[0.3em]"
                  style={{
                    fontFamily: "var(--font-syne), var(--font-display)",
                    color: winner === "red" ? "#FF416C" : "#00B4DB",
                  }}
                >
                  {winner === "red" ? "Red" : "Blue"} Team Wins
                </h2>
                <Link
                  href="/codenames"
                  className="mt-1 rounded-xl border border-white/15 bg-white/[0.05] px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-white/70 transition-colors hover:bg-white/[0.1]"
                >
                  Play Again
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Board — fills remaining space */}
          <div className="flex min-h-0 flex-1 items-stretch justify-center px-1 pb-1 sm:px-4 sm:pb-2">
            <Board
              cards={cards}
              isSpymaster={isSpymaster}
              onReveal={handleReveal}
              disabled={gameOver}
              shaking={shaking}
            />
          </div>

          {/* End Turn Button */}
          {!gameOver && !isSpymaster && (
            <div className="flex shrink-0 justify-center pb-2 sm:pb-4">
              <motion.button
                onClick={() => setCurrentTeam((t) => (t === "red" ? "blue" : "red"))}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/50 backdrop-blur-xl transition-all hover:border-white/20 hover:text-white/70 sm:rounded-xl sm:px-8 sm:py-2.5 sm:text-sm"
              >
                End Turn
              </motion.button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
