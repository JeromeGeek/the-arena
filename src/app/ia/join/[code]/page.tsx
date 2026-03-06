"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { TEAM_COLORS, ROUND_SECONDS, DEFAULT_TEAM_NAMES } from "@/lib/inkarena";
import { createInkSocket, sendMessage } from "@/lib/partykit";
import type PartySocket from "partysocket";

type GuesserPhase = "name_entry" | "team_select" | "waiting" | "guessing" | "round_over" | "game_over";

export default function InkArenaJoinPage() {
  const params = useParams();
  const code = params.code as string;
  const socketRef = useRef<PartySocket | null>(null);

  const [phase, setPhase] = useState<GuesserPhase>("name_entry");
  const [playerName, setPlayerName] = useState("");
  const [teamIdx, setTeamIdx] = useState<number | null>(null);
  const [teamCount, setTeamCount] = useState(2);

  // Round state
  const [drawingTeamIdx, setDrawingTeamIdx] = useState<number>(0);
  const [drawingTeamName, setDrawingTeamName] = useState<string>("");
  const [teamNames, setTeamNames] = useState<string[]>(DEFAULT_TEAM_NAMES);
  const [roundNumber, setRoundNumber] = useState(1);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [isCorrect, setIsCorrect] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeLeftRef = useRef(ROUND_SECONDS);
  const phaseRef = useRef<GuesserPhase>("name_entry");
  const teamIdxRef = useRef<number | null>(null);
  const playerNameRef = useRef("");

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { teamIdxRef.current = teamIdx; }, [teamIdx]);
  useEffect(() => { playerNameRef.current = playerName; }, [playerName]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const startTimer = useCallback((seconds: number) => {
    clearTimer();
    setTimeLeft(seconds);
    timeLeftRef.current = seconds;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        timeLeftRef.current = t - 1;
        if (t <= 1) { clearTimer(); return 0; }
        return t - 1;
      });
    }, 1000);
  }, [clearTimer]);

  useEffect(() => {
    const socket = createInkSocket(code, (data) => {
      const msg = data as Record<string, unknown>;

      if (msg.type === "round_start") {
        const idx = msg.drawingTeamIdx as number ?? 0;
        const names = (msg.teamNames as string[]) ?? DEFAULT_TEAM_NAMES;
        const tc = (msg.teamCount as number) ?? 2;
        setDrawingTeamIdx(idx);
        setDrawingTeamName(names[idx] ?? DEFAULT_TEAM_NAMES[idx] ?? `Team ${idx + 1}`);
        setTeamNames(names);
        setTeamCount(tc);
        setRoundNumber((msg.roundNumber as number) ?? 1);
        setIsCorrect(false);
        clearTimer();
        startTimer((msg.timeLeft as number) ?? ROUND_SECONDS);
        if (phaseRef.current !== "name_entry" && phaseRef.current !== "team_select") {
          setPhase("guessing");
          phaseRef.current = "guessing";
        }
        return;
      }

      if (msg.type === "round_over" || msg.type === "time_up") {
        clearTimer();
        if (phaseRef.current === "guessing" || phaseRef.current === "round_over") {
          setPhase("round_over");
          phaseRef.current = "round_over";
        }
        return;
      }

      if (msg.type === "correct_guess") {
        clearTimer();
        setIsCorrect(true);
        if (phaseRef.current === "guessing") {
          setPhase("round_over");
          phaseRef.current = "round_over";
        }
        return;
      }

      if (msg.type === "drawer_disconnected") {
        // Drawer left — treat as time's up for guessers
        clearTimer();
        if (phaseRef.current === "guessing") {
          setPhase("round_over");
          phaseRef.current = "round_over";
        }
        return;
      }

      if (msg.type === "lobby_reset") {
        clearTimer();
        setIsCorrect(false);
        setRoundNumber(1);
        if (phaseRef.current !== "name_entry" && phaseRef.current !== "team_select") {
          setPhase("waiting");
          phaseRef.current = "waiting";
        }
        return;
      }

      if (msg.type === "game_over" || msg.type === "game_ended") {
        clearTimer();
        setPhase("game_over");
        phaseRef.current = "game_over";
        return;
      }
    });
    socketRef.current = socket;
    // Register as guesser role
    sendMessage(socket, { type: "register_role", role: "guesser" });
    return () => { socket.close(); clearTimer(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const handleJoin = (selectedTeamIdx: number) => {
    setTeamIdx(selectedTeamIdx);
    teamIdxRef.current = selectedTeamIdx;
    setPhase("waiting");
    phaseRef.current = "waiting";
    sendMessage(socketRef.current, {
      type: "player_join",
      playerName: playerNameRef.current,
      teamIdx: selectedTeamIdx,
    });
  };

  const handleCorrect = () => {
    if (phaseRef.current !== "guessing" || teamIdxRef.current === null) return;
    sendMessage(socketRef.current, {
      type: "correct_guess",
      guessingTeamIdx: teamIdxRef.current,
      playerName: playerNameRef.current,
      timeLeft: timeLeftRef.current,
    });
    setIsCorrect(true);
    setPhase("round_over");
    phaseRef.current = "round_over";
    clearTimer();
  };

  const myTeamColor = teamIdx !== null ? TEAM_COLORS[teamIdx % TEAM_COLORS.length] : null;
  const drawingTeamColor = TEAM_COLORS[drawingTeamIdx % TEAM_COLORS.length];
  const isMyTeamDrawing = teamIdx !== null && teamIdx === drawingTeamIdx;
  const timerPct = timeLeft / ROUND_SECONDS;

  return (
    <main
      className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-[#0B0E14] px-5 py-8"
      style={{ overscrollBehavior: "none" }}>

      {/* NAME ENTRY */}
      <AnimatePresence mode="wait">
        {phase === "name_entry" && (
          <motion.div key="name" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="flex w-full max-w-xs flex-col items-center gap-6">
            <div className="text-center">
              <p className="mb-1 text-[11px] uppercase tracking-[0.4em] text-white/30">Room · {code}</p>
              <h1 className="text-3xl font-black uppercase tracking-[0.1em]"
                style={{ fontFamily: "var(--font-syne),var(--font-display)", backgroundImage: "linear-gradient(135deg,#FF416C,#00B4DB)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Pictionary
              </h1>
            </div>
            <div className="w-full">
              <label className="mb-2 block text-[11px] uppercase tracking-[0.25em] text-white/40">Your Name</label>
              <input
                autoFocus
                className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-center text-lg font-bold text-white placeholder-white/20 outline-none ring-0 transition-all focus:border-white/25 focus:bg-white/[0.09]"
                placeholder="Enter your name…"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && playerName.trim()) { setPlayerName(playerName.trim()); setPhase("team_select"); } }}
                maxLength={20}
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => { if (playerName.trim()) { setPlayerName(playerName.trim()); setPhase("team_select"); } }}
              disabled={!playerName.trim()}
              className="w-full rounded-2xl py-3 text-sm font-black uppercase tracking-[0.2em] text-white disabled:opacity-30"
              style={{ background: "linear-gradient(135deg,#FF416C,#FF4B2B)" }}>
              Continue →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TEAM SELECT */}
      <AnimatePresence mode="wait">
        {phase === "team_select" && (
          <motion.div key="teams" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="flex w-full max-w-xs flex-col items-center gap-5">
            <div className="text-center">
              <p className="text-white/50 text-sm">Hey <strong className="text-white">{playerName}</strong>, pick your team!</p>
            </div>
            <div className="grid w-full gap-3" style={{ gridTemplateColumns: teamCount === 1 ? "1fr" : "1fr 1fr" }}>
              {Array.from({ length: teamCount }, (_, i) => {
                const col = TEAM_COLORS[i % TEAM_COLORS.length];
                const name = teamNames[i] ?? DEFAULT_TEAM_NAMES[i] ?? `Team ${i + 1}`;
                return (
                  <motion.button key={i}
                    whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onClick={() => handleJoin(i)}
                    className="flex flex-col items-center justify-center rounded-2xl border py-5 font-black uppercase tracking-widest text-sm"
                    style={{ borderColor: col.border, background: col.bg, color: col.accent }}>
                    {name}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WAITING */}
      <AnimatePresence mode="wait">
        {phase === "waiting" && (
          <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-4 text-center">
            {myTeamColor && (
              <div className="h-3 w-3 rounded-full" style={{ background: myTeamColor.gradient }} />
            )}
            <p className="text-lg font-bold text-white/70">
              {myTeamColor ? (teamNames[teamIdx!] ?? DEFAULT_TEAM_NAMES[teamIdx!]) : ""}
            </p>
            <motion.div
              animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
              className="h-8 w-8 rounded-full border-2 border-white/10 border-t-white/50" />
            <p className="text-sm text-white/30">Waiting for the game to start…</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GUESSING */}
      <AnimatePresence mode="wait">
        {phase === "guessing" && (
          <motion.div key="guessing" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="flex w-full max-w-xs flex-col items-center gap-5">

            {/* Header */}
            <div className="w-full text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">Round {roundNumber}</p>
              <p className="mt-0.5 text-sm font-semibold" style={{ color: drawingTeamColor.accent }}>
                {isMyTeamDrawing ? "🎨 Your team is drawing!" : `${drawingTeamName} is drawing`}
              </p>
            </div>

            {/* Timer bar */}
            <div className="w-full">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">Time Left</span>
                <span className="text-lg font-black tabular-nums"
                  style={{ color: timeLeft <= 10 ? "#FF416C" : timeLeft <= 20 ? "#F97316" : "white" }}>
                  {timeLeft}s
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div className="absolute inset-y-0 left-0 rounded-full"
                  animate={{ width: `${timerPct * 100}%` }}
                  transition={{ duration: 0.9, ease: "linear" }}
                  style={{ backgroundImage: timeLeft <= 10 ? "linear-gradient(90deg,#FF416C,#FF4B2B)" : drawingTeamColor.gradient }} />
              </div>
            </div>

            {/* My team badge */}
            {myTeamColor && teamIdx !== null && (
              <div className="rounded-xl border px-3 py-1.5 text-xs font-bold uppercase tracking-widest"
                style={{ borderColor: myTeamColor.border, background: myTeamColor.bg, color: myTeamColor.accent }}>
                {teamNames[teamIdx] ?? DEFAULT_TEAM_NAMES[teamIdx]}
              </div>
            )}

            {/* Correct button */}
            {!isMyTeamDrawing && (
              <motion.button
                whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 280, damping: 18 }}
                onClick={handleCorrect}
                className="w-full rounded-3xl py-6 text-xl font-black uppercase tracking-[0.15em] text-white"
                style={{
                  background: myTeamColor ? myTeamColor.gradient : "linear-gradient(135deg,#00B4DB,#0083B0)",
                  boxShadow: `0 0 50px ${myTeamColor?.accent ?? "#00B4DB"}55`,
                }}>
                ✅ We Got It!
              </motion.button>
            )}

            {isMyTeamDrawing && (
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-5 py-4 text-center text-sm text-white/40">
                Your team is drawing — shh, no spoilers!
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ROUND OVER */}
      <AnimatePresence mode="wait">
        {phase === "round_over" && (
          <motion.div key="roundover" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex flex-col items-center gap-4 text-center">
            <p className="text-5xl">{isCorrect ? "🎉" : "⏱"}</p>
            <h2 className="text-3xl font-black uppercase tracking-[0.1em]"
              style={{ fontFamily: "var(--font-syne),var(--font-display)", color: "white" }}>
              {isCorrect ? "Correct!" : "Time's Up"}
            </h2>
            <p className="text-sm text-white/40">Waiting for next turn…</p>
            <motion.div
              animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
              className="h-6 w-6 rounded-full border-2 border-white/10 border-t-white/50" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* GAME OVER */}
      <AnimatePresence mode="wait">
        {phase === "game_over" && (
          <motion.div key="gameover" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="flex flex-col items-center gap-4 text-center">
            <p className="text-5xl">��</p>
            <h2 className="text-3xl font-black uppercase tracking-[0.1em] text-white"
              style={{ fontFamily: "var(--font-syne),var(--font-display)" }}>
              Game Over!
            </h2>
            <p className="text-sm text-white/40">Check the TV for results</p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
