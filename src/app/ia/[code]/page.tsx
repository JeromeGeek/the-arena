"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
  ROUND_SECONDS,
  BONUS_SECONDS_THRESHOLD,
  POINTS_CORRECT_GUESS,
  POINTS_FAST_BONUS,
  TEAM_COLORS,
  DEFAULT_TEAM_NAMES,
  getRandomWord,
  type DrawDifficulty,
  type DrawStroke,
  type TeamConfig,
} from "@/lib/inkarena";
import { createInkSocket, sendMessage } from "@/lib/partykit";
import type PartySocket from "partysocket";

type Phase = "lobby" | "team_reveal" | "drawing" | "round_over" | "game_over";

function renderStroke(ctx: CanvasRenderingContext2D, stroke: DrawStroke) {
  if (stroke.type === "clear") {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    return;
  }
  if (stroke.type !== "stroke") return;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (!stroke.isStart && stroke.px != null && stroke.py != null) {
    ctx.beginPath();
    ctx.moveTo(stroke.px, stroke.py);
    ctx.lineTo(stroke.x!, stroke.y!);
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.brushSize;
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(stroke.x!, stroke.y!, stroke.brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = stroke.color;
    ctx.fill();
  }
}

export default function InkArenaTVPage() {
  const params = useParams();
  const code = params.code as string;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<PartySocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const strokeHistoryRef = useRef<DrawStroke[]>([]);

  // Config loaded from sessionStorage
  const [config, setConfig] = useState<TeamConfig | null>(null);
  // scores[i] = score for team i
  const [scores, setScores] = useState<number[]>([]);
  // Which team index is currently drawing (0-based)
  const [drawingTeamIdx, setDrawingTeamIdx] = useState(0);
  // Which round we're in (1-based)
  const [round, setRound] = useState(1);
  // How many turns have been played within the current round
  const [turnInRound, setTurnInRound] = useState(0);

  const [phase, setPhase] = useState<Phase>("lobby");
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [currentWord, setCurrentWord] = useState("");
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [lastGuess, setLastGuess] = useState<{ teamIdx: number; name: string; text: string } | null>(null);
  const [winner, setWinner] = useState<number | null>(null);
  const [winners, setWinners] = useState<number[]>([]);
  const [roundResult, setRoundResult] = useState<{
    correct: boolean;
    guessingTeamIdx: number;
    word: string;
    pointsAwarded: number;
  } | null>(null);
  const [paused, setPaused] = useState(false);
  const [connectedCount, setConnectedCount] = useState(0);
  const [drawerCount, setDrawerCount] = useState(0);
  const [guesserCount, setGuesserCount] = useState(0);
  const [origin, setOrigin] = useState("");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [revealCountdown, setRevealCountdown] = useState(0);

  const pausedRef = useRef(false);
  const timeLeftRef = useRef(ROUND_SECONDS);
  const startTimerFromRef = useRef<(seconds: number) => void>(() => {});
  const drawingTeamIdxRef = useRef(0);
  const currentWordRef = useRef("");
  const phaseRef = useRef<Phase>("lobby");
  const scoresRef = useRef<number[]>([]);
  const configRef = useRef<TeamConfig | null>(null);

  useEffect(() => { drawingTeamIdxRef.current = drawingTeamIdx; }, [drawingTeamIdx]);
  useEffect(() => { currentWordRef.current = currentWord; }, [currentWord]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { scoresRef.current = scores; }, [scores]);
  useEffect(() => { configRef.current = config; }, [config]);
  useEffect(() => { setOrigin(window.location.origin); }, []);

  // Load config from sessionStorage
  useEffect(() => {
    const raw = sessionStorage.getItem(`ink-arena:${code}`);
    if (raw) {
      const parsed = JSON.parse(raw) as TeamConfig;
      setConfig(parsed);
      setScores(new Array(parsed.teamCount).fill(0));
    }
  }, [code]);

  const teamName = (idx: number) =>
    config?.teamNames[idx] ?? DEFAULT_TEAM_NAMES[idx] ?? `Team ${idx + 1}`;
  const teamColor = (idx: number) => TEAM_COLORS[idx % TEAM_COLORS.length];

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  // Socket
  useEffect(() => {
    const socket = createInkSocket(code, (data) => {
      const msg = data as Record<string, unknown>;

      if (msg.type === "connection_count") {
        setConnectedCount((msg.count as number) ?? 0);
        setDrawerCount((msg.drawerCount as number) ?? 0);
        setGuesserCount((msg.guesserCount as number) ?? 0);
        return;
      }
      if (msg.type === "stroke") {
        const stroke = msg.stroke as DrawStroke;
        if (stroke.type === "clear") {
          strokeHistoryRef.current = [];
          const canvas = canvasRef.current;
          if (canvas) { const ctx = canvas.getContext("2d"); ctx?.clearRect(0, 0, canvas.width, canvas.height); }
          return;
        }
        strokeHistoryRef.current.push(stroke);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (ctx) renderStroke(ctx, stroke);
        return;
      }
      if (msg.type === "guess") {
        const teamIdx = msg.teamIdx as number ?? 0;
        setLastGuess({ teamIdx, name: msg.playerName as string, text: msg.guess as string });
        setTimeout(() => setLastGuess(null), 2500);
        return;
      }
      if (msg.type === "correct_guess") {
        if (phaseRef.current !== "drawing") return;
        clearTimer();
        const guessingTeamIdx = msg.guessingTeamIdx as number;
        const tLeft = msg.timeLeft as number;
        const word = (msg.word as string) || currentWordRef.current;
        let pts = POINTS_CORRECT_GUESS;
        if (tLeft > ROUND_SECONDS - BONUS_SECONDS_THRESHOLD) pts += POINTS_FAST_BONUS;
        setScores((prev) => {
          const next = [...prev];
          next[guessingTeamIdx] = (next[guessingTeamIdx] ?? 0) + pts;
          // Broadcast updated scores to all devices
          setTimeout(() => sendMessage(socketRef.current, { type: "scores_update", scores: next }), 50);
          return next;
        });
        setRoundResult({ correct: true, guessingTeamIdx, word, pointsAwarded: pts });
        setPhase("round_over");
        phaseRef.current = "round_over";
        return;
      }
      if (msg.type === "drawer_disconnected") {
        // Drawer closed browser mid-turn — auto-skip to round_over (time's up, no points)
        if (phaseRef.current !== "drawing") return;
        clearTimer();
        setRoundResult({
          correct: false,
          guessingTeamIdx: drawingTeamIdxRef.current,
          word: currentWordRef.current,
          pointsAwarded: 0,
        });
        setPhase("round_over");
        phaseRef.current = "round_over";
        return;
      }
      if (msg.type === "game_paused") {
        setPaused(true); pausedRef.current = true; clearTimer(); return;
      }
      if (msg.type === "game_resumed") {
        if (!pausedRef.current) return;
        setPaused(false); pausedRef.current = false;
        if (phaseRef.current === "drawing") startTimerFromRef.current(timeLeftRef.current);
        return;
      }
    });
    socketRef.current = socket;
    // Register this connection as the TV
    sendMessage(socket, { type: "register_role", role: "tv" });
    return () => { socket.close(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const startTimerFrom = useCallback((seconds: number) => {
    clearTimer();
    setTimeLeft(seconds);
    timeLeftRef.current = seconds;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        timeLeftRef.current = t - 1;
        if (t <= 1) {
          clearTimer();
          setRoundResult({
            correct: false,
            guessingTeamIdx: drawingTeamIdxRef.current,
            word: currentWordRef.current,
            pointsAwarded: 0,
          });
          setPhase("round_over");
          phaseRef.current = "round_over";
          // Broadcast time_up + current scores so all devices sync
          sendMessage(socketRef.current, { type: "time_up" });
          sendMessage(socketRef.current, { type: "scores_update", scores: scoresRef.current });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [clearTimer]);
  useEffect(() => { startTimerFromRef.current = startTimerFrom; }, [startTimerFrom]);

  const startTurn = useCallback((teamIdx: number, roundNum: number, turnNum: number) => {
    const cfg = configRef.current;
    const difficulty: DrawDifficulty = cfg?.difficulty ?? "medium";
    const word = getRandomWord(usedWords, difficulty);
    setUsedWords((prev) => [...prev, word]);
    setCurrentWord(word);
    currentWordRef.current = word;
    setDrawingTeamIdx(teamIdx);
    drawingTeamIdxRef.current = teamIdx;
    setRound(roundNum);
    setTurnInRound(turnNum);
    strokeHistoryRef.current = [];
    const canvas = canvasRef.current;
    if (canvas) { const ctx = canvas.getContext("2d"); ctx?.clearRect(0, 0, canvas.width, canvas.height); }
    setRoundResult(null);
    setPhase("team_reveal");
    phaseRef.current = "team_reveal";
    // Start a 5-second countdown for passing the phone
    setRevealCountdown(5);
    const cdInterval = setInterval(() => {
      setRevealCountdown((c) => {
        if (c <= 1) { clearInterval(cdInterval); return 0; }
        return c - 1;
      });
    }, 1000);
    // Send round_start immediately so drawer phone sees the team + countdown
    sendMessage(socketRef.current, {
      type: "round_start",
      word,
      drawingTeamIdx: teamIdx,
      teamNames: cfg?.teamNames ?? DEFAULT_TEAM_NAMES.slice(0, cfg?.teamCount ?? 2),
      teamCount: cfg?.teamCount ?? 2,
      roundNumber: roundNum,
      timeLeft: ROUND_SECONDS,
      scores: scoresRef.current,
      countdown: 5, // 5 seconds to pass the phone
    });
    sendMessage(socketRef.current, { type: "scores_update", scores: scoresRef.current });
    // After 5 seconds, start drawing
    setTimeout(() => {
      setPhase("drawing");
      phaseRef.current = "drawing";
      startTimerFrom(ROUND_SECONDS);
      sendMessage(socketRef.current, { type: "drawing_start" });
    }, 5000);
  }, [usedWords, startTimerFrom]);

  const handleNextTurn = useCallback(() => {
    const cfg = configRef.current;
    if (!cfg) return;
    const tc = cfg.teamCount;
    const totalRounds = cfg.totalRounds;

    // Turn order: all turns for team 0, then all for team 1, etc.
    // Each team gets `totalRounds` turns. Total turns = tc × totalRounds.
    // turnInRound tracks overall turn count (0-indexed).
    const currentTurn = turnInRound;
    const nextTurn = currentTurn + 1;
    const totalTurns = tc * totalRounds;

    if (nextTurn >= totalTurns) {
      // Game over — find winner
      const finalScores = scoresRef.current;
      const maxScore = Math.max(...finalScores);
      const winnerList = finalScores.reduce<number[]>((acc, s, i) => s === maxScore ? [...acc, i] : acc, []);
      setWinner(winnerList[0]);
      setWinners(winnerList);
      setPhase("game_over");
      sendMessage(socketRef.current, { type: "game_over", winners: winnerList, scores: finalScores });
    } else {
      // Each team gets `totalRounds` consecutive turns.
      // Team index = floor(nextTurn / totalRounds)
      // Round within that team's block = (nextTurn % totalRounds) + 1
      const nextTeamIdx = Math.floor(nextTurn / totalRounds);
      const nextRoundNum = (nextTurn % totalRounds) + 1;
      startTurn(nextTeamIdx, nextRoundNum, nextTurn);
    }
  }, [turnInRound, startTurn]);

  const timerPct = timeLeft / ROUND_SECONDS;
  const drawUrl = origin ? `${origin}/ia/draw/${code}` : "";

  /** TV-side "We Got It!" — awards points to guessing team, same logic as guesser phone */
  const handleTVCorrectGuess = useCallback((guessingTeamIdx: number) => {
    if (phaseRef.current !== "drawing") return;
    clearTimer();
    const tLeft = timeLeftRef.current;
    const word = currentWordRef.current;
    let pts = POINTS_CORRECT_GUESS;
    if (tLeft > ROUND_SECONDS - BONUS_SECONDS_THRESHOLD) pts += POINTS_FAST_BONUS;
    setScores((prev) => {
      const next = [...prev];
      next[guessingTeamIdx] = (next[guessingTeamIdx] ?? 0) + pts;
      setTimeout(() => sendMessage(socketRef.current, { type: "scores_update", scores: next }), 50);
      return next;
    });
    setRoundResult({ correct: true, guessingTeamIdx, word, pointsAwarded: pts });
    setPhase("round_over");
    phaseRef.current = "round_over";
    // Tell drawer the round ended
    sendMessage(socketRef.current, { type: "correct_guess", guessingTeamIdx, timeLeft: tLeft, word });
  }, [clearTimer]);

  const handleForceEnd = useCallback(() => {
    clearTimer();
    const finalScores = scoresRef.current;
    const maxScore = finalScores.length > 0 ? Math.max(...finalScores) : 0;
    const winnerList = finalScores.reduce<number[]>((acc, s, i) => s === maxScore ? [...acc, i] : acc, []);
    setWinner(winnerList[0] ?? 0);
    setWinners(winnerList);
    setPhase("game_over");
    setShowExitConfirm(false);
    sendMessage(socketRef.current, { type: "game_ended", winners: winnerList, scores: finalScores });
    sendMessage(socketRef.current, { type: "game_over", winners: winnerList, scores: finalScores });
  }, [clearTimer]);
  return (
    <main className="relative flex h-[100dvh] flex-col overflow-hidden bg-[#0B0E14]" style={{ overscrollBehavior: "none" }}>

      {/* LOBBY */}
      <AnimatePresence mode="wait">
        {phase === "lobby" && (
          <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6">
            <div className="text-center">
              <p className="mb-1 text-[11px] uppercase tracking-[0.4em] text-white/30">Room · {code}</p>
              <h1 className="text-5xl font-black uppercase tracking-[0.12em] sm:text-6xl lg:text-7xl"
                style={{ fontFamily: "var(--font-syne),var(--font-display)" }}>
                <span style={{ backgroundImage: "linear-gradient(135deg,#FF416C,#00B4DB)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Pictionary
                </span>
              </h1>
              {config && (
                <p className="mt-1 text-sm text-white/40">
                  {config.teamCount} Teams · {config.totalRounds} Round{config.totalRounds !== 1 ? "s" : ""} · {config.difficulty}
                </p>
              )}
              <p className="mt-1 text-sm text-white/30">
                {drawerCount > 0
                  ? "✅ Drawer connected · Ready to start!"
                  : "⏳ Scan the QR code with one phone to draw"}
              </p>
            </div>

            {/* Teams preview */}
            {config && (
              <div className="flex flex-wrap justify-center gap-2">
                {config.teamNames.slice(0, config.teamCount).map((name, i) => {
                  const col = teamColor(i);
                  return (
                    <div key={i} className="rounded-xl border px-3 py-1.5 text-xs font-bold uppercase tracking-widest"
                      style={{ borderColor: col.border, background: col.bg, color: col.accent }}>
                      {name}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Single QR code — drawer only */}
            <div className="flex flex-col items-center gap-3 w-full max-w-xs">
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 w-full">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">📱 Scan to Draw</p>
                {drawUrl && <div className="rounded-lg bg-white p-2"><QRCodeSVG value={drawUrl} size={140} /></div>}
                <p className="break-all text-center text-[9px] text-white/25 leading-tight">{drawUrl || "Loading…"}</p>
              </div>
            </div>

            <motion.button whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => startTurn(0, 1, 0)}
              disabled={drawerCount < 1}
              className="rounded-2xl px-12 py-4 text-base font-black uppercase tracking-[0.2em] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              style={{ background: "linear-gradient(135deg,#FF416C,#FF4B2B)", boxShadow: drawerCount >= 1 ? "0 0 40px rgba(255,65,108,0.4)" : "none" }}>
              {drawerCount < 1 ? "⏳ Waiting for drawer…" : "🎨 Start Game"}
            </motion.button>
            <Link href="/" className="text-xs text-white/20 transition-colors hover:text-white/40">← Back to Arena</Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TEAM REVEAL */}
      <AnimatePresence mode="wait">
        {phase === "team_reveal" && (
          <motion.div key="reveal" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }} className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }} className="text-center">
              <p className="mb-2 text-sm uppercase tracking-[0.4em] text-white/40">
                {teamName(drawingTeamIdx)} · Turn {round} of {config?.totalRounds ?? 1}
              </p>
              <h2 className="text-6xl font-black uppercase tracking-[0.1em] sm:text-8xl lg:text-9xl"
                style={{ fontFamily: "var(--font-syne),var(--font-display)", backgroundImage: teamColor(drawingTeamIdx).gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {teamName(drawingTeamIdx)}
              </h2>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                className="mt-3 text-xl uppercase tracking-[0.3em] text-white/50">
                Pass the phone to the drawer
              </motion.p>
              {revealCountdown > 0 && (
                <motion.p
                  key={revealCountdown}
                  initial={{ scale: 1.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mt-4 text-5xl font-black tabular-nums sm:text-7xl"
                  style={{ color: teamColor(drawingTeamIdx).accent }}>
                  {revealCountdown}
                </motion.p>
              )}
            </motion.div>
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.4, duration: 0.6 }}
              className="h-1 w-64 rounded-full sm:w-96" style={{ backgroundImage: teamColor(drawingTeamIdx).gradient }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* DRAWING + ROUND OVER */}
      <AnimatePresence mode="wait">
        {(phase === "drawing" || phase === "round_over") && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-col">

            {/* Scoreboard */}
            <div className="shrink-0 flex items-center justify-between border-b border-white/8 px-3 py-2 sm:px-6 gap-2 overflow-x-auto">
              {scores.map((score, i) => {
                const col = teamColor(i);
                const isDrawing = i === drawingTeamIdx && phase === "drawing";
                return (
                  <div key={i} className="flex items-center gap-1.5 shrink-0">
                    <div className="h-2 w-2 rounded-full" style={{ background: col.gradient, boxShadow: `0 0 6px ${col.accent}88` }} />
                    <span className="text-[10px] uppercase tracking-widest" style={{ color: isDrawing ? col.accent : "rgba(255,255,255,0.4)" }}>
                      {teamName(i)}
                    </span>
                    <motion.span key={score} initial={{ scale: 1.3, color: "#FFFFFF" }} animate={{ scale: 1, color: col.accent }}
                      transition={{ type: "spring", stiffness: 400, damping: 18 }}
                      className="text-xl font-black sm:text-2xl"
                      style={{ fontFamily: "var(--font-syne),var(--font-display)" }}>
                      {score}
                    </motion.span>
                    {isDrawing && (
                      <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white"
                        style={{ backgroundImage: col.gradient }}>draws</span>
                    )}
                  </div>
                );
              })}
              <div className="ml-auto flex items-center gap-3 shrink-0">
                <span className="text-[9px] uppercase tracking-[0.25em] text-white/20">
                  R{round}/{config?.totalRounds ?? 1}
                </span>
                <motion.button whileTap={{ scale: 0.9 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  onClick={() => setShowExitConfirm(true)}
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/30 transition-colors hover:border-red-500/30 hover:text-red-400">
                  End
                </motion.button>
              </div>
            </div>

            {/* Canvas */}
            <div className="relative flex-1 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-3">
                <div className="relative h-full w-full" style={{ maxWidth: "min(100%, calc((100dvh - 140px) * 1.333))" }}>
                  <canvas ref={canvasRef} width={800} height={600}
                    className="h-full w-full rounded-xl border border-white/10 bg-white"
                    style={{ boxShadow: `0 0 60px ${teamColor(drawingTeamIdx).accent}22` }} />
                  {phase === "drawing" && (
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1.5 rounded-b-xl py-2.5 px-3"
                      style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.95) 100%)" }}>
                      {currentWord.split("").map((char, i) =>
                        char === " " ? <span key={i} className="w-4" /> : (
                          <span key={i} className="flex h-7 w-7 items-center justify-center rounded border border-white/25 text-sm font-bold text-white/60"
                            style={{ background: "rgba(255,255,255,0.1)" }}>
                            {i === 0 ? char.toUpperCase() : ""}
                          </span>
                        )
                      )}
                      <span className="ml-2 text-xs font-semibold text-white/40">({currentWord.length} letters)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Live guess toast */}
            <AnimatePresence>
              {lastGuess && (
                <motion.div initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 60, opacity: 0 }}
                  className="absolute right-4 top-16 sm:right-8">
                  <div className="rounded-xl border px-4 py-2 text-sm font-semibold"
                    style={{ borderColor: `${teamColor(lastGuess.teamIdx).accent}44`, backgroundColor: `${teamColor(lastGuess.teamIdx).accent}11`, color: teamColor(lastGuess.teamIdx).accent }}>
                    <span className="text-white/50">{lastGuess.name}: </span>{lastGuess.text}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Timer + "We Got It!" buttons */}
            {phase === "drawing" && (
              <div className="shrink-0 border-t border-white/8 px-4 py-2 sm:px-8">
                <div className="flex items-center gap-3">
                  <span className="w-10 text-center text-xl font-black tabular-nums"
                    style={{ fontFamily: "var(--font-syne),var(--font-display)", color: timeLeft <= 10 ? "#FF416C" : timeLeft <= 20 ? "#F97316" : "white" }}>
                    {timeLeft}
                  </span>
                  <div className="relative flex-1 overflow-hidden rounded-full bg-white/[0.06]" style={{ height: "6px" }}>
                    <motion.div className="absolute inset-y-0 left-0 rounded-full"
                      animate={{ width: `${timerPct * 100}%` }} transition={{ duration: 0.9, ease: "linear" }}
                      style={{ backgroundImage: timeLeft <= 10 ? "linear-gradient(90deg,#FF416C,#FF4B2B)" : teamColor(drawingTeamIdx).gradient }} />
                  </div>
                </div>

                {/* "Correct!" button — awards points to the DRAWING team (their teammates guessed it) */}
                <div className="mt-2">
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    onClick={() => handleTVCorrectGuess(drawingTeamIdx)}
                    className="w-full rounded-xl py-3.5 text-base font-black uppercase tracking-widest text-white"
                    style={{
                      backgroundImage: teamColor(drawingTeamIdx).gradient,
                      boxShadow: `0 0 30px ${teamColor(drawingTeamIdx).accent}55`,
                    }}
                  >
                    ✅ {teamName(drawingTeamIdx)} Got It!
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ROUND OVER OVERLAY */}
      <AnimatePresence mode="wait">
        {phase === "round_over" && roundResult && (
          <motion.div key="round_over" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[rgba(11,14,20,0.88)] backdrop-blur-sm">
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }} className="text-center">
              <p className="mb-1 text-5xl">{roundResult.correct ? "✅" : "⏱"}</p>
              <h2 className="text-4xl font-black uppercase tracking-[0.1em] sm:text-6xl"
                style={{
                  fontFamily: "var(--font-syne),var(--font-display)",
                  ...(roundResult.correct
                    ? { backgroundImage: teamColor(roundResult.guessingTeamIdx).gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }
                    : { color: "rgba(255,255,255,0.7)" }),
                }}>
                {roundResult.correct ? "CORRECT!" : "TIME'S UP!"}
              </h2>
              <p className="mt-2 text-lg text-white/60">
                {roundResult.correct
                  ? <>{teamName(roundResult.guessingTeamIdx)} guessed <strong className="text-white">&ldquo;{roundResult.word}&rdquo;</strong></>
                  : <>The word was <strong className="text-white">&ldquo;{roundResult.word}&rdquo;</strong></>}
              </p>
              {roundResult.correct && (
                <p className="mt-1 text-2xl font-black sm:text-3xl" style={{ color: teamColor(roundResult.guessingTeamIdx).accent }}>
                  +{roundResult.pointsAwarded} pts
                </p>
              )}
            </motion.div>

            {/* Scores */}
            <div className="flex items-center gap-4 flex-wrap justify-center">
              {scores.map((score, i) => {
                const col = teamColor(i);
                return (
                  <div key={i} className="text-center">
                    <p className="text-xs uppercase tracking-widest" style={{ color: col.accent }}>{teamName(i)}</p>
                    <p className="text-3xl font-black" style={{ color: col.accent }}>{score}</p>
                  </div>
                );
              })}
            </div>

            <motion.button whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={handleNextTurn}
              className="rounded-2xl px-10 py-3 text-sm font-black uppercase tracking-[0.2em] text-white"
              style={{
                backgroundImage: teamColor((drawingTeamIdx + 1) % (config?.teamCount ?? 2)).gradient,
                boxShadow: `0 0 30px ${teamColor((drawingTeamIdx + 1) % (config?.teamCount ?? 2)).accent}44`,
              }}>
              Next Turn →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GAME OVER */}
      <AnimatePresence>
        {phase === "game_over" && winner !== null && (
          <motion.div key="gameover" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-7 px-6">
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 160, damping: 20 }} className="text-center">
              <p className="mb-3 text-3xl">🏆</p>
              {winners.length > 1 ? (
                <>
                  <h2 className="text-4xl font-black uppercase tracking-[0.1em] sm:text-6xl text-white/90"
                    style={{ fontFamily: "var(--font-syne),var(--font-display)" }}>
                    It&apos;s a Tie!
                  </h2>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {winners.map((wi) => (
                      <span key={wi} className="rounded-xl px-3 py-1 text-sm font-black uppercase tracking-widest text-white"
                        style={{ backgroundImage: teamColor(wi).gradient }}>
                        {teamName(wi)}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-5xl font-black uppercase tracking-[0.1em] sm:text-7xl lg:text-8xl"
                    style={{ fontFamily: "var(--font-syne),var(--font-display)", backgroundImage: teamColor(winner).gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    {teamName(winner)}
                  </h2>
                  <p className="mt-2 text-xl uppercase tracking-[0.3em] text-white/50">Wins!</p>
                </>
              )}
            </motion.div>
            <div className="flex items-center gap-6 flex-wrap justify-center">
              {scores.map((score, i) => {
                const col = teamColor(i);
                const isWinner = winners.includes(i);
                return (
                  <div key={i} className="text-center">
                    <p className="text-sm uppercase tracking-widest" style={{ color: col.accent }}>{teamName(i)}</p>
                    <p className="text-5xl font-black" style={{ color: col.accent }}>
                      {score}{isWinner && winners.length > 0 && <span className="ml-1 text-2xl">🏆</span>}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4">
              <motion.button whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onClick={() => {
                  const cfg = configRef.current;
                  setPhase("lobby");
                  setScores(new Array(cfg?.teamCount ?? 2).fill(0));
                  setRound(1);
                  setTurnInRound(0);
                  setUsedWords([]);
                  setWinner(null);
                  setWinners([]);
                  sendMessage(socketRef.current, { type: "lobby_reset" });
                }}
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-8 py-3 text-sm font-bold uppercase tracking-widest text-white/70 transition-colors hover:bg-white/[0.08]">
                Play Again
              </motion.button>
              <Link href="/">
                <motion.div whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="cursor-pointer rounded-2xl border border-white/10 bg-white/[0.05] px-8 py-3 text-sm font-bold uppercase tracking-widest text-white/70 transition-colors hover:bg-white/[0.08]">
                  Exit
                </motion.div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAUSE OVERLAY */}
      <AnimatePresence>
        {paused && (
          <motion.div key="paused" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[rgba(11,14,20,0.92)] backdrop-blur-sm">
            <p className="text-6xl">⏸</p>
            <h2 className="text-5xl font-black uppercase tracking-[0.12em] sm:text-7xl"
              style={{ fontFamily: "var(--font-syne),var(--font-display)", color: "rgba(255,255,255,0.85)" }}>
              Game Paused
            </h2>
            <p className="mt-3 text-lg text-white/40">TV disconnected — reconnecting…</p>
            <motion.button whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => { setPaused(false); pausedRef.current = false; if (phaseRef.current === "drawing") startTimerFromRef.current(timeLeftRef.current); }}
              className="mt-2 rounded-xl border border-white/10 bg-white/[0.06] px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white/50 hover:bg-white/[0.1]">
              Resume Manually
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EXIT CONFIRMATION MODAL */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div key="exitconfirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-[60] flex items-center justify-center bg-[rgba(11,14,20,0.94)] backdrop-blur-sm px-6">
            <motion.div initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.88, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className="flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
              <p className="text-4xl">🛑</p>
              <h3 className="text-2xl font-black uppercase tracking-[0.1em] text-white"
                style={{ fontFamily: "var(--font-syne),var(--font-display)" }}>
                End Game?
              </h3>
              <p className="text-sm text-white/40">
                Current scores will be counted. This will end the game for everyone.
              </p>
              <div className="flex w-full gap-3">
                <motion.button whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/[0.05] py-3 text-sm font-bold uppercase tracking-widest text-white/60 hover:bg-white/[0.08]">
                  Cancel
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  onClick={handleForceEnd}
                  className="flex-1 rounded-2xl py-3 text-sm font-black uppercase tracking-widest text-white"
                  style={{ background: "linear-gradient(135deg,#FF416C,#FF4B2B)", boxShadow: "0 0 30px rgba(255,65,108,0.35)" }}>
                  End It
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
