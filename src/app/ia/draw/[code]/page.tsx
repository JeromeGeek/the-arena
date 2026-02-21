"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type PointerEvent,
} from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { createInkSocket, sendMessage } from "@/lib/partykit";
import type PartySocket from "partysocket";
import type { DrawStroke } from "@/lib/inkarena";

// Essential colours only
const COLORS = ["#000000", "#FFFFFF", "#FF416C", "#00B4DB", "#22C55E", "#F97316"];
const BRUSH_SIZES = [4, 10, 20];

export default function DrawerPage() {
  const params = useParams();
  const code = params.code as string;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<PartySocket | null>(null);
  const lastSendRef = useRef(0);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const isDrawingRef = useRef(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(10);
  const [isEraser, setIsEraser] = useState(false);
  const [currentWord, setCurrentWord] = useState<string | null>(null);
  const [drawingTeam, setDrawingTeam] = useState<"red" | "blue" | null>(null);
  const [roundNumber, setRoundNumber] = useState(0);
  const [sabotageEffect, setSabotageEffect] = useState<"shrink" | "shake" | "flip" | null>(null);
  const [waitingForRound, setWaitingForRound] = useState(true);
  const [playerName] = useState(() => `Drawer-${Math.floor(Math.random() * 1000)}`);

  const activeColor = isEraser ? "#FFFFFF" : color;
  const activeBrush = isEraser ? 24 : brushSize;

  // Connect to PartyKit — always connect, host resolved at runtime in browser
  useEffect(() => {
    const socket = createInkSocket(code, (data) => {
      const msg = data as Record<string, unknown>;

      const handleRoundBegin = (payload: { word: string; drawingTeam: "red" | "blue"; roundNumber: number }) => {
        setCurrentWord(payload.word);
        setDrawingTeam(payload.drawingTeam);
        setRoundNumber(payload.roundNumber);
        setWaitingForRound(false);
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
      };

      if (msg.type === "round_start") {
        handleRoundBegin(msg as { word: string; drawingTeam: "red" | "blue"; roundNumber: number });
      }

      // Late-joiner catchup from server
      if (msg.type === "round_catchup") {
        handleRoundBegin(msg as { word: string; drawingTeam: "red" | "blue"; roundNumber: number });
      }

      if (msg.type === "correct_guess" || msg.type === "time_up" || msg.type === "round_over") {
        setWaitingForRound(true);
        setCurrentWord(null);
        isDrawingRef.current = false;
        lastPointRef.current = null;
      }

      if (msg.type === "lobby_reset") {
        setWaitingForRound(true);
        setCurrentWord(null);
        setRoundNumber(0);
        isDrawingRef.current = false;
        lastPointRef.current = null;
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
      }

      if (msg.type === "sabotage") {
        setSabotageEffect(msg.effect as "shrink" | "shake" | "flip");
        setTimeout(() => setSabotageEffect(null), 1500);
      }
    });
    socketRef.current = socket;
    sendMessage(socket, { type: "player_join", name: playerName, team: "drawer", role: "drawer" });
    return () => { socket.close(); };
  }, [code, playerName]);

  // Get canvas coords from pointer event
  const getCoords = useCallback((e: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const broadcastStroke = useCallback((stroke: DrawStroke) => {
    if (Date.now() - lastSendRef.current < 30) return;
    lastSendRef.current = Date.now();
    sendMessage(socketRef.current, { type: "stroke", stroke });
  }, []);

  const drawLocally = useCallback((stroke: DrawStroke) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (stroke.isStart || stroke.px === undefined || stroke.py === undefined) {
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
  }, []);

  const handlePointerDown = useCallback((e: PointerEvent<HTMLCanvasElement>) => {
    if (waitingForRound) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const { x, y } = getCoords(e);
    lastPointRef.current = { x, y };
    const stroke: DrawStroke = {
      type: "stroke",
      x, y,
      color: activeColor,
      brushSize: activeBrush,
      isStart: true,
    };
    drawLocally(stroke);
    broadcastStroke(stroke);
  }, [waitingForRound, getCoords, activeColor, activeBrush, drawLocally, broadcastStroke]);

  const handlePointerMove = useCallback((e: PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !lastPointRef.current) return;
    const { x, y } = getCoords(e);
    const stroke: DrawStroke = {
      type: "stroke",
      x, y,
      px: lastPointRef.current.x,
      py: lastPointRef.current.y,
      color: activeColor,
      brushSize: activeBrush,
      isStart: false,
    };
    drawLocally(stroke);
    broadcastStroke(stroke);
    lastPointRef.current = { x, y };
  }, [getCoords, activeColor, activeBrush, drawLocally, broadcastStroke]);

  const handlePointerUp = useCallback(() => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  }, []);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    const stroke: DrawStroke = { type: "clear", color: "#000000", brushSize: 1 };
    broadcastStroke(stroke);
  }, [broadcastStroke]);

  const teamColor = drawingTeam === "red" ? "#FF416C" : "#00B4DB";
  const teamGradient =
    drawingTeam === "red"
      ? "linear-gradient(135deg, #FF416C, #FF4B2B)"
      : "linear-gradient(135deg, #00B4DB, #0083B0)";

  return (
    <main
      className="flex h-[100dvh] flex-col bg-[#0B0E14] select-none overflow-hidden"
      style={{ touchAction: "none", userSelect: "none" }}
    >
      {/* Header — compact single line */}
      <div
        className="flex shrink-0 items-center justify-between px-4 py-2"
        style={{ borderBottom: `1px solid ${teamColor}22` }}
      >
        <div className="flex items-center gap-3">
          {currentWord && !waitingForRound ? (
            <>
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">Draw:</span>
              <span
                className="text-base font-black uppercase tracking-wider"
                style={{ color: teamColor, fontFamily: "var(--font-syne), var(--font-display)" }}
              >
                {currentWord}
              </span>
            </>
          ) : (
            <span className="text-sm text-white/40">Waiting for your turn…</span>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          onClick={handleClear}
          className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/50"
        >
          Clear
        </motion.button>
      </div>

      {/* Canvas — fills all remaining space */}
      <div className="relative flex-1 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          animate={
            sabotageEffect === "shake"
              ? { x: [0, -8, 8, -6, 6, 0] }
              : sabotageEffect === "flip"
              ? { scaleX: -1 }
              : sabotageEffect === "shrink"
              ? { scale: 0.85 }
              : { x: 0, scaleX: 1, scale: 1 }
          }
          transition={{ duration: 0.3 }}
        >
          {waitingForRound && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[rgba(11,14,20,0.92)]">
              <p className="text-4xl">✏️</p>
              <p className="mt-3 text-sm text-white/50">Waiting for your turn…</p>
            </div>
          )}
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="h-full w-full bg-white cursor-crosshair"
            style={{
              touchAction: "none",
              boxShadow: waitingForRound ? "none" : `0 0 40px ${teamColor}44`,
              display: "block",
            }}
          />
        </motion.div>
      </div>

      {/* Toolbar — compact, always visible at bottom */}
      <div className="shrink-0 border-t border-white/8 bg-[#0B0E14] px-4 py-2.5 space-y-2">
        {/* Colours + eraser */}
        <div className="flex items-center justify-center gap-2.5">
          {COLORS.map((c) => (
            <motion.button
              key={c}
              whileTap={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              onClick={() => { setColor(c); setIsEraser(false); }}
              className="rounded-full border-2 transition-all"
              style={{
                width: "34px", height: "34px",
                background: c,
                borderColor: !isEraser && color === c ? "white" : c === "#FFFFFF" ? "rgba(255,255,255,0.3)" : "transparent",
                boxShadow: !isEraser && color === c ? `0 0 10px ${c}88` : "none",
              }}
            />
          ))}
          <motion.button
            whileTap={{ scale: 0.85 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            onClick={() => setIsEraser((e) => !e)}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 text-base transition-all"
            style={{
              background: "rgba(255,255,255,0.06)",
              borderColor: isEraser ? "white" : "rgba(255,255,255,0.15)",
              boxShadow: isEraser ? "0 0 10px rgba(255,255,255,0.4)" : "none",
            }}
          >
            🧹
          </motion.button>
        </div>

        {/* Brush sizes */}
        <div className="flex items-center justify-center gap-6">
          {BRUSH_SIZES.map((size) => (
            <motion.button
              key={size}
              whileTap={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              onClick={() => { setBrushSize(size); setIsEraser(false); }}
              className="flex h-9 w-9 items-center justify-center"
            >
              <div
                className="rounded-full transition-all"
                style={{
                  width: `${size + 4}px`, height: `${size + 4}px`,
                  background: !isEraser && brushSize === size ? activeColor : "rgba(255,255,255,0.25)",
                  boxShadow: !isEraser && brushSize === size ? `0 0 8px ${activeColor}` : "none",
                }}
              />
            </motion.button>
          ))}
        </div>
      </div>
    </main>
  );
}
