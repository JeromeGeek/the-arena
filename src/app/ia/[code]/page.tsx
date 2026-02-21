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
  POINTS_TO_WIN,
  POINTS_STEAL_PENALTY,
  getRandomWord,
  type DrawStroke,
} from "@/lib/inkarena";
import {
  createInkSocket,
  sendMessage,
  isPartyKitConfigured,
} from "@/lib/partykit";
import type PartySocket from "partysocket";

interface TeamConfig {
  redName: string;
  blueName: string;
  scores: { red: number; blue: number };
}

type Phase = "lobby" | "team_reveal" | "drawing" | "round_over" | "game_over";

function renderStroke(ctx: CanvasRenderingContext2D, stroke: DrawStroke) {
  if (stroke.type === "clear") {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    return;
  }
  if (stroke.type !== "stroke") return;
  if (stroke.isStart || stroke.px == null || stroke.py == null) {
    ctx.beginPath();
    ctx.arc(stroke.x!, stroke.y!, stroke.brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = stroke.color;
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(stroke.px, stroke.py);
    ctx.lineTo(stroke.x!, stroke.y!);
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }
}

export default function InkArenaTVPage() {
  const params = useParams();
  const code = params.code as string;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<PartySocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const strokeHistoryRef = useRef<DrawStroke[]>([]);

  const [config, setConfig] = useState<TeamConfig | null>(null);
  const [scores, setScores] = useState({ red: 0, blue: 0 });
  const [round, setRound] = useState(0);
  const [drawingTeam, setDrawingTeam] = useState<"red" | "blue">("red");
  const [phase, setPhase] = useState<Phase>("lobby");
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [currentWord, setCurrentWord] = useState("");
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [lastGuess, setLastGuess] = useState<{ team: "red" | "blue"; name: string; text: string } | null>(null);
  const [winner, setWinner] = useState<"red" | "blue" | null>(null);
  const [roundResult, setRoundResult] = useState<{
    correct: boolean;
    guessingTeam: "red" | "blue";
    word: string;
    pointsAwarded: number;
    stolen: boolean;
  } | null>(null);
  const [sabotageEffect, setSabotageEffect] = useState<"shake" | "flip" | "shrink" | null>(null);
  const [connectedCount, setConnectedCount] = useState(0);
  const [origin, setOrigin] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const scoresRef = useRef(scores);
  useEffect(() => { scoresRef.current = scores; }, [scores]);
  const drawingTeamRef = useRef(drawingTeam);
  useEffect(() => { drawingTeamRef.current = drawingTeam; }, [drawingTeam]);
  const currentWordRef = useRef(currentWord);
  useEffect(() => { currentWordRef.current = currentWord; }, [currentWord]);
  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => { setOrigin(window.location.origin); }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem(`ink-arena:${code}`);
    if (raw) {
      const parsed = JSON.parse(raw) as TeamConfig;
      setConfig(parsed);
    }
  }, [code]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => {
    // Always connect — host resolved at runtime in browser
    const socket = createInkSocket(code, (data) => {
      const msg = data as Record<string, unknown>;

      if (msg.type === "connection_count") {
        setConnectedCount((msg.count as number) ?? 0);
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
        setLastGuess({ team: msg.team as "red" | "blue", name: msg.playerName as string, text: msg.guess as string });
        setTimeout(() => setLastGuess(null), 2500);
        return;
      }
      if (msg.type === "correct_guess") {
        if (phaseRef.current !== "drawing") return;
        clearTimer();
        const guessingTeam = msg.guessingTeam as "red" | "blue";
        const drawTeam = msg.drawingTeam as "red" | "blue";
        const tLeft = msg.timeLeft as number;
        const stolen = msg.stolen as boolean;
        const word = (msg.word as string) || currentWordRef.current;
        let pts = POINTS_CORRECT_GUESS;
        if (tLeft > ROUND_SECONDS - BONUS_SECONDS_THRESHOLD) pts += POINTS_FAST_BONUS;
        setScores((prev) => {
          const next = { ...prev };
          if (stolen) {
            const steal = Math.round(prev[drawTeam] * 0.5);
            next[guessingTeam] = prev[guessingTeam] + steal;
            next[drawTeam] = Math.max(0, prev[drawTeam] - POINTS_STEAL_PENALTY);
            setRoundResult({ correct: true, guessingTeam, word, pointsAwarded: steal, stolen: true });
          } else {
            next[guessingTeam] = prev[guessingTeam] + pts;
            setRoundResult({ correct: true, guessingTeam, word, pointsAwarded: pts, stolen: false });
          }
          return next;
        });
        setPhase("round_over");
        phaseRef.current = "round_over";
        return;
      }
      if (msg.type === "sabotage") {
        setSabotageEffect(msg.effect as "shake" | "flip" | "shrink");
        setTimeout(() => setSabotageEffect(null), 1500);
        return;
      }
      // player_join is informational only — count is authoritative from connection_count
    });
    socketRef.current = socket;
    return () => { socket.close(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const startTimer = useCallback((word: string, team: "red" | "blue") => {
    clearTimer();
    setTimeLeft(ROUND_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearTimer();
          setRoundResult({ correct: false, guessingTeam: team === "red" ? "blue" : "red", word, pointsAwarded: 0, stolen: false });
          setPhase("round_over");
          phaseRef.current = "round_over";
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [clearTimer]);

  const startRound = useCallback((team: "red" | "blue", roundNum: number) => {
    const word = getRandomWord(usedWords);
    setUsedWords((prev) => [...prev, word]);
    setCurrentWord(word);
    currentWordRef.current = word;
    setDrawingTeam(team);
    drawingTeamRef.current = team;
    setRound(roundNum);
    strokeHistoryRef.current = [];
    const canvas = canvasRef.current;
    if (canvas) { const ctx = canvas.getContext("2d"); ctx?.clearRect(0, 0, canvas.width, canvas.height); }
    setPhase("team_reveal");
    phaseRef.current = "team_reveal";
    setTimeout(() => {
      setPhase("drawing");
      phaseRef.current = "drawing";
      startTimer(word, team);
      // Include timeLeft so server can track elapsed for late joiners
      sendMessage(socketRef.current, { type: "round_start", word, drawingTeam: team, roundNumber: roundNum, timeLeft: ROUND_SECONDS });
    }, 2800);
  }, [usedWords, startTimer]);

  const handleNextRound = useCallback(() => {
    const nextTeam = drawingTeamRef.current === "red" ? "blue" : "red";
    const nextRound = round + 1;
    const s = scoresRef.current;
    if (s.red >= POINTS_TO_WIN || s.blue >= POINTS_TO_WIN) {
      setWinner(s.red >= s.blue ? "red" : "blue");
      setPhase("game_over");
    } else {
      startRound(nextTeam, nextRound);
    }
  }, [round, startRound]);

  const teamName = (t: "red" | "blue") => t === "red" ? (config?.redName ?? "Red Team") : (config?.blueName ?? "Blue Team");
  const teamGradient = (t: "red" | "blue") => t === "red" ? "linear-gradient(135deg,#FF416C,#FF4B2B)" : "linear-gradient(135deg,#00B4DB,#0083B0)";
  const teamColor = (t: "red" | "blue") => t === "red" ? "#FF416C" : "#00B4DB";
  const timerPct = timeLeft / ROUND_SECONDS;
  const drawUrl = origin ? `${origin}/ia/draw/${code}` : "";
  const joinUrl = origin ? `${origin}/ia/join/${code}` : "";

  return (
    <main className="relative flex h-[100dvh] flex-col overflow-hidden bg-[#0B0E14]">

      {/* LOBBY */}
      <AnimatePresence>
        {phase === "lobby" && (
          <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6">
            {/* Title */}
            <div className="text-center">
              <p className="mb-1 text-[11px] uppercase tracking-[0.4em] text-white/30">Room · {code}</p>
              <h1 className="text-5xl font-black uppercase tracking-[0.12em] sm:text-6xl lg:text-7xl"
                style={{ fontFamily: "var(--font-syne),var(--font-display)" }}>
                <span style={{ backgroundImage: "linear-gradient(135deg,#FF416C,#00B4DB)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Pictionary
                </span>
              </h1>
              <p className="mt-1 text-sm text-white/40">
                {connectedCount > 0 ? `${connectedCount} player${connectedCount !== 1 ? "s" : ""} connected` : "Waiting for players…"}
              </p>
            </div>
            {/* QR codes — compact side by side */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">✏️ Drawer</p>
                {drawUrl && <div className="rounded-lg bg-white p-1.5"><QRCodeSVG value={drawUrl} size={100} /></div>}
                <p className="break-all text-center text-[9px] text-white/25 leading-tight">{drawUrl || "Loading…"}</p>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">🎯 Guesser</p>
                {joinUrl && <div className="rounded-lg bg-white p-1.5"><QRCodeSVG value={joinUrl} size={100} /></div>}
                <p className="break-all text-center text-[9px] text-white/25 leading-tight">{joinUrl || "Loading…"}</p>
              </div>
            </div>
            {/* Start button */}
            <motion.button whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => startRound("red", 1)}
              disabled={connectedCount < 1}
              className="rounded-2xl px-12 py-4 text-base font-black uppercase tracking-[0.2em] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              style={{ background: "linear-gradient(135deg,#FF416C,#FF4B2B)", boxShadow: connectedCount >= 1 ? "0 0 40px rgba(255,65,108,0.4)" : "none" }}>
              {connectedCount < 1 ? "⏳ Waiting for players…" : "🎨 Start Game"}
            </motion.button>
            <Link href="/" className="text-xs text-white/20 transition-colors hover:text-white/40">← Back to Arena</Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TEAM REVEAL */}
      <AnimatePresence>
        {phase === "team_reveal" && (
          <motion.div key="reveal" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }} className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }} className="text-center">
              <p className="mb-2 text-sm uppercase tracking-[0.4em] text-white/40">Round {round}</p>
              <h2 className="text-6xl font-black uppercase tracking-[0.1em] sm:text-8xl lg:text-9xl"
                style={{ fontFamily: "var(--font-syne),var(--font-display)", backgroundImage: teamGradient(drawingTeam), WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {teamName(drawingTeam)}
              </h2>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                className="mt-3 text-2xl uppercase tracking-[0.3em] text-white/60">
                Enters the Arena
              </motion.p>
            </motion.div>
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.4, duration: 0.6 }}
              className="h-1 w-64 rounded-full sm:w-96" style={{ backgroundImage: teamGradient(drawingTeam) }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* DRAWING + ROUND OVER — fills entire screen, no scroll */}
      <AnimatePresence>
        {(phase === "drawing" || phase === "round_over") && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col">
            {/* Scoreboard — compact single row */}
            <div className="shrink-0 flex items-center justify-between border-b border-white/8 px-4 py-2 sm:px-8">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ background: teamGradient("red"), boxShadow: "0 0 8px rgba(255,65,108,0.6)" }} />
                <span className="text-xs uppercase tracking-widest text-white/40">Red</span>
                <motion.span key={scores.red} initial={{ scale: 1.4 }} animate={{ scale: 1 }}
                  className="text-2xl font-black sm:text-3xl"
                  style={{ fontFamily: "var(--font-syne),var(--font-display)", color: "#FF416C" }}>
                  {scores.red}
                </motion.span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] uppercase tracking-[0.3em] text-white/20">Round {round}</span>
                <div className="rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-white"
                  style={{ backgroundImage: teamGradient(drawingTeam) }}>
                  {teamName(drawingTeam)} draws
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.span key={scores.blue} initial={{ scale: 1.4 }} animate={{ scale: 1 }}
                  className="text-2xl font-black sm:text-3xl"
                  style={{ fontFamily: "var(--font-syne),var(--font-display)", color: "#00B4DB" }}>
                  {scores.blue}
                </motion.span>
                <span className="text-xs uppercase tracking-widest text-white/40">Blue</span>
                <div className="h-2 w-2 rounded-full" style={{ background: teamGradient("blue"), boxShadow: "0 0 8px rgba(0,180,219,0.6)" }} />
              </div>
            </div>

            {/* Canvas — fills remaining space */}
            <div className="relative flex-1 overflow-hidden">
              <motion.div className="absolute inset-0 flex items-center justify-center p-2 sm:p-3"
                animate={sabotageEffect === "shake" ? { x: [0, -8, 8, -6, 6, 0] } : sabotageEffect === "flip" ? { scaleX: -1 } : sabotageEffect === "shrink" ? { scale: 0.7 } : { x: 0, scaleX: 1, scale: 1 }}
                transition={{ duration: 0.3 }}>
                <div className="relative h-full w-full" style={{ maxWidth: "min(100%, calc((100dvh - 140px) * 1.46))" }}>
                  <canvas ref={canvasRef} width={700} height={480}
                    className="h-full w-full rounded-xl border border-white/10 bg-white"
                    style={{ boxShadow: `0 0 60px ${teamColor(drawingTeam)}22` }} />
                  {/* Word hint bar — overlaid at bottom of canvas */}
                  {phase === "drawing" && (
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1 rounded-b-xl bg-black/40 py-1.5 backdrop-blur-sm">
                      {currentWord.split("").map((char, i) =>
                        char === " " ? <span key={i} className="w-3" /> : (
                          <span key={i} className="flex h-6 w-6 items-center justify-center rounded border border-white/15 text-xs font-bold text-white/40"
                            style={{ background: "rgba(255,255,255,0.05)" }}>
                            {i === 0 ? char.toUpperCase() : ""}
                          </span>
                        )
                      )}
                      <span className="ml-1 text-[10px] text-white/25">({currentWord.length})</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Live guess toast */}
            <AnimatePresence>
              {lastGuess && (
                <motion.div initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 60, opacity: 0 }}
                  className="absolute right-4 top-16 sm:right-8">
                  <div className="rounded-xl border px-4 py-2 text-sm font-semibold"
                    style={{ borderColor: `${teamColor(lastGuess.team)}44`, backgroundColor: `${teamColor(lastGuess.team)}11`, color: teamColor(lastGuess.team) }}>
                    <span className="text-white/50">{lastGuess.name}: </span>{lastGuess.text}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Timer — compact bottom bar */}
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
                      style={{ backgroundImage: timeLeft <= 10 ? "linear-gradient(90deg,#FF416C,#FF4B2B)" : teamGradient(drawingTeam), boxShadow: timeLeft <= 10 ? "0 0 12px rgba(255,65,108,0.6)" : "0 0 8px rgba(0,180,219,0.4)" }} />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ROUND OVER OVERLAY */}
      <AnimatePresence>
        {phase === "round_over" && roundResult && (
          <motion.div key="round_over" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[rgba(11,14,20,0.88)] backdrop-blur-sm">
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }} className="text-center">
              <p className="mb-1 text-5xl">{roundResult.correct ? (roundResult.stolen ? "⚡" : "✅") : "⏱"}</p>
              <h2 className="text-4xl font-black uppercase tracking-[0.1em] sm:text-6xl"
                style={{
                  fontFamily: "var(--font-syne),var(--font-display)",
                  ...(roundResult.correct
                    ? { backgroundImage: teamGradient(roundResult.guessingTeam), WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }
                    : { color: "rgba(255,255,255,0.7)" }),
                }}>
                {roundResult.correct ? (roundResult.stolen ? "STOLEN!" : "CORRECT!") : "TIME'S UP!"}
              </h2>
              <p className="mt-2 text-lg text-white/60">
                {roundResult.correct ? `${teamName(roundResult.guessingTeam)} ${roundResult.stolen ? "stole" : "guessed"} ` : "The word was "}
                <strong className="text-white">&ldquo;{roundResult.word}&rdquo;</strong>
              </p>
              {roundResult.correct && (
                <p className="mt-1 text-2xl font-black sm:text-3xl" style={{ color: teamColor(roundResult.guessingTeam) }}>
                  +{roundResult.pointsAwarded} pts
                </p>
              )}
            </motion.div>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-white/30">Red</p>
                <p className="text-3xl font-black" style={{ color: "#FF416C" }}>{scores.red}</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-white/30">Blue</p>
                <p className="text-3xl font-black" style={{ color: "#00B4DB" }}>{scores.blue}</p>
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={handleNextRound}
              className="rounded-2xl px-10 py-3 text-sm font-black uppercase tracking-[0.2em] text-white"
              style={{ backgroundImage: teamGradient(drawingTeam === "red" ? "blue" : "red"), boxShadow: `0 0 30px ${teamColor(drawingTeam === "red" ? "blue" : "red")}44` }}>
              Next Round →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GAME OVER */}
      <AnimatePresence>
        {phase === "game_over" && winner && (
          <motion.div key="gameover" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-7 px-6">
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 160, damping: 20 }} className="text-center">
              <p className="mb-3 text-3xl">🏆</p>
              <h2 className="text-5xl font-black uppercase tracking-[0.1em] sm:text-7xl lg:text-8xl"
                style={{ fontFamily: "var(--font-syne),var(--font-display)", backgroundImage: teamGradient(winner), WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {teamName(winner)}
              </h2>
              <p className="mt-2 text-xl uppercase tracking-[0.3em] text-white/50">Wins!</p>
            </motion.div>
            <div className="flex items-center gap-10">
              <div className="text-center">
                <p className="text-sm uppercase tracking-widest text-white/30">Red</p>
                <p className="text-5xl font-black" style={{ color: "#FF416C" }}>{scores.red}</p>
              </div>
              <div className="h-12 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-sm uppercase tracking-widest text-white/30">Blue</p>
                <p className="text-5xl font-black" style={{ color: "#00B4DB" }}>{scores.blue}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <motion.button whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onClick={() => { setPhase("lobby"); setScores({ red: 0, blue: 0 }); setRound(0); setUsedWords([]); setWinner(null); sendMessage(socketRef.current, { type: "lobby_reset" }); }}
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
    </main>
  );
}
