"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import Board from "@/components/Board";
import TurnIndicator from "@/components/TurnIndicator";
import SoundToggle from "@/components/SoundToggle";
import { generateBoard, type GameCard, type Difficulty } from "@/lib/codenames";
import { lookupSlug, seededRandom } from "@/lib/gamecodes";
import { useSoundEnabled } from "@/hooks/useSoundEnabled";
import {
  playCardFlip,
  playCorrectCard,
  playWrongCard,
  playNeutralCard,
  playAssassin,
  playEndTurn,
  playTeamWins,
} from "@/lib/sounds";

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
  const { soundEnabled, toggleSound } = useSoundEnabled();

  const [cards, setCards] = useState<GameCard[]>(() => parsed?.cards ?? []);
  const [currentTeam, setCurrentTeam] = useState<"red" | "blue">(() => parsed?.startingTeam ?? "red");
  const [isSpymaster, setIsSpymaster] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<"red" | "blue" | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const turnLockedRef = useRef(false);
  const [turnLocked, setTurnLocked] = useState(false);

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
      if (turnLockedRef.current) {
        console.log(`[Codenames] BLOCKED — turn is locked`);
        return;
      }

      const card = cards[index];
      if (card.revealed) return;

      // Lock immediately for wrong guesses
      const isWrong = card.type !== currentTeam;
      if (isWrong) {
        turnLockedRef.current = true;
        setTurnLocked(true);
      }

      console.log(`[Codenames] Team: ${currentTeam} | Clicked: "${card.word}" (${card.type}) | Match: ${!isWrong}`);

      if (soundEnabled) playCardFlip();

      setCards((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], revealed: true };
        return updated;
      });

      // Assassin — game over
      if (card.type === "assassin") {
        if (soundEnabled) setTimeout(() => playAssassin(), 150);
        setShaking(true);
        setTimeout(() => setShaking(false), 300);
        setTimeout(() => {
          setGameOver(true);
          setWinner(currentTeam === "red" ? "blue" : "red");
          if (soundEnabled) playTeamWins();
        }, 600);
        return;
      }

      // Wrong guess — switch turn immediately
      if (isWrong) {
        console.log(`[Codenames] WRONG GUESS — switching turn now`);

        setTimeout(() => {
          if (soundEnabled) {
            if (card.type === "bystander") playNeutralCard();
            else playWrongCard();
          }
        }, 150);

        // Check for win first, then switch
        const redLeft = cards.filter((c, i) => c.type === "red" && !c.revealed && i !== index).length;
        const blueLeft = cards.filter((c, i) => c.type === "blue" && !c.revealed && i !== index).length;

        if (redLeft === 0) {
          setGameOver(true);
          setWinner("red");
          if (soundEnabled) setTimeout(() => playTeamWins(), 200);
        } else if (blueLeft === 0) {
          setGameOver(true);
          setWinner("blue");
          if (soundEnabled) setTimeout(() => playTeamWins(), 200);
        } else {
          // Switch team after a brief delay for visual feedback
          setTimeout(() => {
            if (soundEnabled) playEndTurn();
            setCurrentTeam((t) => {
              const next = t === "red" ? "blue" : "red";
              console.log(`[Codenames] TURN SWITCHED: ${t} → ${next}`);
              return next;
            });
            turnLockedRef.current = false;
            setTurnLocked(false);
          }, 800);
        }
        return;
      }

      // Correct guess — team keeps going, check for win
      setTimeout(() => {
        if (soundEnabled) playCorrectCard();
      }, 150);

      const redLeft = cards.filter((c, i) => c.type === "red" && !c.revealed && i !== index).length;
      const blueLeft = cards.filter((c, i) => c.type === "blue" && !c.revealed && i !== index).length;

      if (redLeft === 0) {
        setGameOver(true);
        setWinner("red");
        if (soundEnabled) setTimeout(() => playTeamWins(), 200);
      } else if (blueLeft === 0) {
        setGameOver(true);
        setWinner("blue");
        if (soundEnabled) setTimeout(() => playTeamWins(), 200);
      }
    },
    [cards, currentTeam, gameOver, soundEnabled]
  );

  if (invalidCode) {
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
          href="/codenames"
          className="rounded-xl border border-white/15 bg-white/[0.05] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white/70 transition-colors hover:bg-white/[0.1] sm:px-6 sm:py-3 sm:text-sm"
        >
          Create New Game
        </Link>
      </main>
    );
  }

  return (
    <main className="relative flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
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
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 transition-colors hover:text-white/60 sm:text-xs sm:tracking-[0.3em]"
        >
          ← The Arena
        </Link>

        <h1
          className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/50 sm:text-sm sm:tracking-[0.35em]"
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

          <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />

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

          {/* Board — fills remaining space */}
          <div className="flex min-h-0 flex-1 items-stretch justify-center px-1 pb-1 sm:px-4 sm:pb-2">
            <Board
              cards={cards}
              isSpymaster={isSpymaster}
              onReveal={handleReveal}
              disabled={gameOver || turnLocked}
              shaking={shaking}
            />
          </div>

          {/* Game Over Overlay */}
          <AnimatePresence>
            {gameOver && winner && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.7, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="mx-4 flex max-w-xs flex-col items-center gap-2 rounded-2xl border p-3 text-center backdrop-blur-xl sm:max-w-sm sm:gap-3 sm:rounded-3xl sm:p-8"
                  style={{
                    borderColor: winner === "red" ? "rgba(255,65,108,0.4)" : "rgba(0,180,219,0.4)",
                    background: winner === "red" ? "rgba(255,65,108,0.12)" : "rgba(0,180,219,0.12)",
                    boxShadow:
                      winner === "red"
                        ? "0 0 40px rgba(255,65,108,0.2), 0 0 80px rgba(255,65,108,0.08)"
                        : "0 0 40px rgba(0,180,219,0.2), 0 0 80px rgba(0,180,219,0.08)",
                  }}
                >
                  <span className="text-3xl sm:text-4xl">{winner === "red" ? "🔴" : "🔵"}</span>
                  <h2
                    className="text-base font-black uppercase tracking-[0.2em] sm:text-xl sm:tracking-[0.3em]"
                    style={{
                      fontFamily: "var(--font-syne), var(--font-display)",
                      color: winner === "red" ? "#FF416C" : "#00B4DB",
                    }}
                  >
                    {winner === "red" ? "Red" : "Blue"} Team Wins!
                  </h2>
                  <p className="text-[10px] text-white/40 sm:text-xs">
                    {redRemaining === 0 || blueRemaining === 0 ? "All words uncovered!" : "Assassin revealed!"}
                  </p>
                  <Link
                    href="/codenames"
                    className="mt-1 rounded-lg border border-white/20 bg-white/[0.08] px-5 py-2 text-xs font-bold uppercase tracking-widest text-white/80 transition-all hover:bg-white/[0.15] hover:text-white sm:mt-2 sm:rounded-xl sm:px-8 sm:py-2.5 sm:text-sm"
                  >
                    Play Again
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* End Turn Button */}
          {!gameOver && !isSpymaster && (
            <div className="flex shrink-0 justify-center pb-2 sm:pb-4">
              <motion.button
                onClick={() => {
                  if (soundEnabled) playEndTurn();
                  setCurrentTeam((t) => (t === "red" ? "blue" : "red"));
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/50 backdrop-blur-sm transition-all hover:border-white/20 hover:text-white/70 sm:rounded-xl sm:px-8 sm:py-2.5 sm:text-sm"
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
