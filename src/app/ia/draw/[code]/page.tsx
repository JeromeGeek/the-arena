"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type PointerEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { createInkSocket, sendMessage, isPartyKitConfigured } from "@/lib/partykit";
import type PartySocket from "partysocket";
import type { DrawStroke } from "@/lib/inkarena";

const COLORS = [
  "#000000", "#FFFFFF", "#FF416C", "#FF4B2B",
  "#00B4DB", "#0083B0", "#A855F7", "#22C55E",
  "#F97316", "#EAB308", "#EC4899", "#06B6D4",
];
const BRUSH_SIZES = [3, 6, 12, 20];

export default function DrawerPage() {
  const params = useParams();
  const code = params.code as string;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<PartySocket | null>(null);
  const lastSendRef = useRef(0);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const isDrawingRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(6);
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
      if (msg.type === "round_start") {
        const payload = msg as { word: string; drawingTeam: "red" | "blue"; roundNumber: number };
        setCurrentWord(payload.word);
        setDrawingTeam(payload.drawingTeam);
        setRoundNumber(payload.roundNumber);
        setWaitingForRound(false);
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
      className="flex min-h-[100dvh] flex-col bg-[#0B0E14] select-none"
      style={{ touchAction: "none", userSelect: "none" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b border-white/8 px-4 py-2.5"
        style={{ borderBottom: `1px solid ${teamColor}22` }}
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/30">
            Round {roundNumber} · Drawing
          </p>
          {currentWord && !waitingForRound ? (
            <p
              className="text-lg font-black uppercase tracking-wider"
              style={{ color: teamColor, fontFamily: "var(--font-syne), var(--font-display)" }}
            >
              {currentWord}
            </p>
          ) : (
            <p className="text-sm text-white/40">Waiting for round…</p>
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

      {mounted && !isPartyKitConfigured && (
        <div className="border-b border-yellow-500/20 bg-yellow-500/5 px-4 py-2 text-center text-xs text-yellow-400/80">
          ⚠️ PartyKit not configured — drawing won&apos;t sync to TV. Run <code className="rounded bg-white/10 px-1">npx partykit dev</code>.
        </div>
      )}

      {/* Canvas */}
      <div className="relative flex-1 flex items-center justify-center p-2">
        <motion.div
          className="relative w-full"
          style={{ maxWidth: "480px" }}
          animate={
            sabotageEffect === "shake"
              ? { x: [0, -8, 8, -6, 6, 0] }
              : sabotageEffect === "flip"
              ? { scaleX: -1 }
              : sabotageEffect === "shrink"
              ? { scale: 0.5 }
              : { x: 0, scaleX: 1, scale: 1 }
          }
          transition={{ duration: 0.3 }}
        >
          {waitingForRound && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-[rgba(11,14,20,0.9)]">
              <p className="text-2xl">✏️</p>
              <p className="mt-2 text-sm text-white/50">Waiting for your turn…</p>
            </div>
          )}
          <canvas
            ref={canvasRef}
            width={480}
            height={360}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="w-full rounded-2xl border border-white/10 bg-white cursor-crosshair"
            style={{
              aspectRatio: "4/3",
              touchAction: "none",
              boxShadow: waitingForRound ? "none" : `0 0 30px ${teamColor}33`,
            }}
          />
        </motion.div>
      </div>

      {/* Toolbar */}
      <div className="space-y-3 border-t border-white/8 px-4 py-3">
        {/* Color Palette */}
        <div className="flex flex-wrap gap-2 justify-center">
          {COLORS.map((c) => (
            <motion.button
              key={c}
              whileTap={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              onClick={() => { setColor(c); setIsEraser(false); }}
              className="rounded-full border-2 transition-all"
              style={{
                width: "28px",
                height: "28px",
                background: c,
                borderColor: !isEraser && color === c ? "white" : "transparent",
                boxShadow: !isEraser && color === c ? `0 0 8px ${c}` : "none",
              }}
            />
          ))}
          {/* Eraser */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            onClick={() => setIsEraser((e) => !e)}
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm transition-all"
            style={{
              background: "rgba(255,255,255,0.08)",
              borderColor: isEraser ? "white" : "rgba(255,255,255,0.15)",
              boxShadow: isEraser ? "0 0 8px rgba(255,255,255,0.4)" : "none",
            }}
          >
            🧹
          </motion.button>
        </div>

        {/* Brush Sizes */}
        <div className="flex items-center justify-center gap-3">
          {BRUSH_SIZES.map((size) => (
            <motion.button
              key={size}
              whileTap={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              onClick={() => { setBrushSize(size); setIsEraser(false); }}
              className="flex items-center justify-center"
              style={{ width: "36px", height: "36px" }}
            >
              <div
                className="rounded-full transition-all"
                style={{
                  width: `${Math.min(size * 1.5, 28)}px`,
                  height: `${Math.min(size * 1.5, 28)}px`,
                  background: !isEraser && brushSize === size ? color : "rgba(255,255,255,0.3)",
                  boxShadow: !isEraser && brushSize === size ? `0 0 6px ${color}` : "none",
                }}
              />
            </motion.button>
          ))}
        </div>

        {/* Sabotage buttons */}
        <div className="flex justify-center gap-2 pt-1">
          <p className="self-center text-[10px] uppercase tracking-widest text-white/20 mr-1">⚡ Sabotage</p>
          {(["shrink", "shake", "flip"] as const).map((effect) => (
            <motion.button
              key={effect}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              onClick={() => {
                sendMessage(socketRef.current, { type: "sabotage", effect });
              }}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/40 hover:border-white/20 hover:text-white/60 transition-colors"
            >
              {effect === "shrink" ? "🔬" : effect === "shake" ? "💥" : "🔄"} {effect}
            </motion.button>
          ))}
        </div>
      </div>
    </main>
  );
}
