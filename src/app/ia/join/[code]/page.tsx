"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { createInkSocket, sendMessage, isPartyKitConfigured } from "@/lib/partykit";
import type PartySocket from "partysocket";

export default function GuesserPage() {
  const params = useParams();
  const code = params.code as string;
  const socketRef = useRef<PartySocket | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [team, setTeam] = useState<"red" | "blue" | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [joined, setJoined] = useState(false);

  const [guess, setGuess] = useState("");
  const [lastResult, setLastResult] = useState<"correct" | "wrong" | "stolen" | null>(null);
  const [roundActive, setRoundActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [drawingTeam, setDrawingTeam] = useState<"red" | "blue" | null>(null);
  const [wordLength, setWordLength] = useState(0);
  const [wordFirstLetter, setWordFirstLetter] = useState("");
  const [guessCount, setGuessCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const teamColor = team === "red" ? "#FF416C" : "#00B4DB";
  const teamGradient =
    team === "red"
      ? "linear-gradient(135deg, #FF416C, #FF4B2B)"
      : "linear-gradient(135deg, #00B4DB, #0083B0)";

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // Join channel — always connect, host resolved at runtime
  useEffect(() => {
    if (!joined) return;
    const socket = createInkSocket(code, (data) => {
      const msg = data as Record<string, unknown>;
      if (msg.type === "round_start") {
        const payload = msg as { word: string; drawingTeam: "red" | "blue"; roundNumber: number };
        setRoundActive(true);
        setGuess("");
        setLastResult(null);
        setGuessCount(0);
        setDrawingTeam(payload.drawingTeam);
        setWordLength(payload.word.length);
        setWordFirstLetter(payload.word[0]);
        setTimeLeft(45);
        clearTimer();
        timerRef.current = setInterval(() => {
          setTimeLeft((t) => {
            if (t <= 1) { clearTimer(); setRoundActive(false); return 0; }
            return t - 1;
          });
        }, 1000);
      }
      if (msg.type === "correct_guess") {
        clearTimer();
        setRoundActive(false);
      }
    });
    socketRef.current = socket;
    sendMessage(socket, { type: "player_join", name: playerName, team: team ?? "red", role: "guesser" });
    return () => { socket.close(); clearTimer(); };
  }, [joined, code, playerName, team, clearTimer]);

  const handleJoin = useCallback(() => {
    if (!nameInput.trim() || !team) return;
    setPlayerName(nameInput.trim());
    setJoined(true);
  }, [nameInput, team]);

  const handleGuess = useCallback(() => {
    if (!guess.trim() || !roundActive) return;
    setGuessCount((n) => n + 1);

    // Broadcast guess to TV + drawer
    const isSteal = drawingTeam === team; // player's team is the same as drawing team — no that's wrong
    // A "steal" occurs when the OPPOSING team guesses correctly during the drawing team's turn
    const isOpposingTeam = drawingTeam !== team;

    sendMessage(socketRef.current, {
      type: "guess",
      team,
      guess: guess.trim(),
      playerName,
      steal: isOpposingTeam,
    });

    // Optimistically show result — TV validates and broadcasts correct_guess
    // Here we just show the guess was sent
    setGuess("");
    inputRef.current?.focus();
  }, [guess, roundActive, drawingTeam, team, playerName]);

  const handleCorrect = useCallback(() => {
    if (!roundActive) return;
    const isOpposingTeam = drawingTeam !== team;

    sendMessage(socketRef.current, {
      type: "correct_guess",
      guessingTeam: team,
      drawingTeam,
      timeLeft,
      stolen: isOpposingTeam,
      word: "",
    });

    setLastResult(isOpposingTeam ? "stolen" : "correct");
    setRoundActive(false);
    clearTimer();
  }, [roundActive, drawingTeam, team, timeLeft, clearTimer]);

  // ── Join screen ──
  if (!joined) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 px-6 bg-[#0B0E14]">
        <div className="text-center">
          <p className="mb-2 text-[11px] uppercase tracking-[0.4em] text-white/30">Join Game · {code}</p>
          <h1
            className="text-3xl font-black uppercase tracking-[0.12em]"
            style={{
              fontFamily: "var(--font-syne), var(--font-display)",
              backgroundImage: "linear-gradient(135deg, #FF416C, #00B4DB)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            INK ARENA
          </h1>
        </div>

        {mounted && !isPartyKitConfigured && (
          <div className="w-full max-w-sm rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-xs text-yellow-400/80">
            ⚠️ PartyKit not configured — guesses won&apos;t sync. Run <code className="rounded bg-white/10 px-1">npx partykit dev</code>.
          </div>
        )}

        {/* Name input */}
        <div className="w-full max-w-sm space-y-3">
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            placeholder="Your name"
            maxLength={20}
            className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-white/20 focus:border-white/30 transition-colors"
          />

          {/* Team Select */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              onClick={() => setTeam("red")}
              className="rounded-xl border py-3 text-sm font-bold uppercase tracking-widest transition-all"
              style={{
                borderColor: team === "red" ? "#FF416C" : "rgba(255,65,108,0.2)",
                background: team === "red" ? "rgba(255,65,108,0.15)" : "transparent",
                color: team === "red" ? "#FF416C" : "rgba(255,65,108,0.5)",
                boxShadow: team === "red" ? "0 0 20px rgba(255,65,108,0.2)" : "none",
              }}
            >
              🔴 Red
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              onClick={() => setTeam("blue")}
              className="rounded-xl border py-3 text-sm font-bold uppercase tracking-widest transition-all"
              style={{
                borderColor: team === "blue" ? "#00B4DB" : "rgba(0,180,219,0.2)",
                background: team === "blue" ? "rgba(0,180,219,0.15)" : "transparent",
                color: team === "blue" ? "#00B4DB" : "rgba(0,180,219,0.5)",
                boxShadow: team === "blue" ? "0 0 20px rgba(0,180,219,0.2)" : "none",
              }}
            >
              🔵 Blue
            </motion.button>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={handleJoin}
            disabled={!nameInput.trim() || !team}
            className="w-full rounded-xl py-3 text-sm font-black uppercase tracking-[0.2em] text-white disabled:opacity-40 transition-opacity"
            style={{
              background: team ? (team === "red" ? "linear-gradient(135deg, #FF416C, #FF4B2B)" : "linear-gradient(135deg, #00B4DB, #0083B0)") : "rgba(255,255,255,0.1)",
            }}
          >
            Join Arena
          </motion.button>
        </div>
      </main>
    );
  }

  // ── Guessing screen ──
  return (
    <main className="flex min-h-[100dvh] flex-col bg-[#0B0E14]">
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: `${teamColor}22` }}
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/30">
            {playerName}
          </p>
          <p className="text-sm font-bold" style={{ color: teamColor }}>
            {team === "red" ? "🔴 Red Team" : "🔵 Blue Team"}
          </p>
        </div>
        {roundActive && (
          <div
            className="rounded-lg px-3 py-1.5 text-lg font-black tabular-nums"
            style={{
              fontFamily: "var(--font-syne), var(--font-display)",
              color: timeLeft <= 10 ? "#FF416C" : timeLeft <= 20 ? "#F97316" : "white",
              background: "rgba(255,255,255,0.05)",
            }}
          >
            {timeLeft}s
          </div>
        )}
      </div>

      {/* Round status */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-8">
        <AnimatePresence mode="wait">
          {!roundActive && lastResult === null && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <p className="text-4xl mb-3">👀</p>
              <p className="text-lg font-semibold text-white/60">Waiting for round…</p>
              <p className="mt-1 text-xs text-white/30">Watch the TV screen</p>
            </motion.div>
          )}

          {!roundActive && lastResult !== null && (
            <motion.div
              key="result"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="text-center"
            >
              <p className="text-5xl mb-3">
                {lastResult === "correct" ? "✅" : lastResult === "stolen" ? "⚡" : "❌"}
              </p>
              <p
                className="text-2xl font-black uppercase tracking-wider"
                style={{
                  color: lastResult === "correct" || lastResult === "stolen" ? teamColor : "rgba(255,255,255,0.4)",
                  fontFamily: "var(--font-syne), var(--font-display)",
                }}
              >
                {lastResult === "correct" ? "Correct!" : lastResult === "stolen" ? "Stolen!" : "Next round"}
              </p>
            </motion.div>
          )}

          {roundActive && (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-sm space-y-4"
            >
              {/* Word clue */}
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-white/30 mb-2">
                  {drawingTeam === team ? "Your team is drawing" : "⚡ Steal mode active"}
                </p>
                <div className="flex justify-center gap-1.5 flex-wrap">
                  {Array.from({ length: wordLength }).map((_, i) => (
                    <div
                      key={i}
                      className="flex h-9 w-8 items-center justify-center rounded border text-sm font-bold"
                      style={{
                        borderColor: `${teamColor}44`,
                        backgroundColor: `${teamColor}11`,
                        color: i === 0 ? teamColor : "transparent",
                      }}
                    >
                      {i === 0 ? wordFirstLetter.toUpperCase() : ""}
                    </div>
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] text-white/30">{wordLength} letters</p>
              </div>

              {/* Guess count */}
              {guessCount > 0 && (
                <p className="text-center text-xs text-white/30">
                  {guessCount} guess{guessCount !== 1 ? "es" : ""} sent
                </p>
              )}

              {/* Guess input */}
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGuess()}
                  placeholder="Type your guess…"
                  autoFocus
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-white/20 focus:border-white/30 transition-colors"
                  style={{ borderColor: `${teamColor}33` }}
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  onClick={handleGuess}
                  disabled={!guess.trim()}
                  className="rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider text-white disabled:opacity-40"
                  style={{ backgroundImage: teamGradient }}
                >
                  Go
                </motion.button>
              </div>

              {/* Mark correct button (host-assist) */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onClick={handleCorrect}
                className="w-full rounded-xl border py-3 text-sm font-bold uppercase tracking-widest"
                style={{
                  borderColor: `${teamColor}33`,
                  color: teamColor,
                  backgroundColor: `${teamColor}0a`,
                }}
              >
                ✅ We got it!
              </motion.button>

              {/* Sabotage */}
              {drawingTeam !== team && (
                <div className="border-t border-white/8 pt-3">
                  <p className="text-center text-[10px] uppercase tracking-widest text-white/20 mb-2">⚡ Sabotage their drawer</p>
                  <div className="flex gap-2 justify-center">
                    {(["shrink", "shake", "flip"] as const).map((effect) => (
                      <motion.button
                        key={effect}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        onClick={() => {
                          sendMessage(socketRef.current, { type: "sabotage", effect, fromTeam: team });
                        }}
                        className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/40 hover:border-white/20 hover:text-white/60 transition-colors"
                      >
                        {effect === "shrink" ? "🔬" : effect === "shake" ? "💥" : "🔄"} {effect}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Timer bar */}
      {roundActive && (
        <div className="border-t border-white/8 px-4 py-3">
          <div className="overflow-hidden rounded-full bg-white/[0.06]" style={{ height: "6px" }}>
            <motion.div
              className="h-full rounded-full"
              animate={{ width: `${(timeLeft / 45) * 100}%` }}
              transition={{ duration: 0.9, ease: "linear" }}
              style={{ backgroundImage: timeLeft <= 10 ? "linear-gradient(90deg,#FF416C,#FF4B2B)" : teamGradient }}
            />
          </div>
        </div>
      )}
    </main>
  );
}
