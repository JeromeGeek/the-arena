"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Difficulty } from "@/lib/codenames";
import { getRandomSlug, type SlugDifficulty } from "@/lib/gamecodes";
import { QRCodeSVG } from "qrcode.react";
import GameSetupShell, {
  SetupLabel,
  SetupOptionPill,
  SetupStartButton,
} from "@/components/GameSetupShell";

const VERCEL_URL = "https://the-arena-mu.vercel.app";

const difficulties: { value: Difficulty; label: string; emoji: string; color: string }[] = [
  { value: "easy",   label: "EASY",   emoji: "😌", color: "#22C55E" },
  { value: "medium", label: "MEDIUM", emoji: "🎯", color: "#F59E0B" },
  { value: "hard",   label: "HARD",   emoji: "💀", color: "#EF4444" },
];

export default function CodenamesPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [gameSlug, setGameSlug] = useState<string | null>(null);

  const handleGenerate = useCallback(() => {
    const slug = getRandomSlug(difficulty as SlugDifficulty);
    setGameSlug(slug);
  }, [difficulty]);

  const handleRegenerate = useCallback(() => {
    const slug = getRandomSlug(difficulty as SlugDifficulty);
    setGameSlug(slug);
  }, [difficulty]);

  function handleLaunch() {
    if (gameSlug) {
      window.location.href = `/cn/${gameSlug}`;
    }
  }

  const gameUrl = gameSlug ? `${VERCEL_URL}/cn/${gameSlug}` : null;

  return (
    <GameSetupShell
      title="CODENAMES"
      emoji="🕵️"
      subtitle="Tactical Word Espionage"
      flavour="2 Teams · 20 Cards · 1 Assassin · Give one-word clues"
      accentFrom="#FF416C"
      accentTo="#FF4B2B"
      emojiAnimate={{ x: [0, -3, 3, -2, 2, 0] }}
      emojiTransition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
    >
      {/* Difficulty */}
      <div className="mb-6">
        <SetupLabel>Difficulty</SetupLabel>
        <div className="flex gap-2">
          {difficulties.map((d) => (
            <SetupOptionPill
              key={d.value}
              selected={difficulty === d.value}
              onClick={() => { setDifficulty(d.value); setGameSlug(null); }}
              accentColor={d.color}
            >
              {d.emoji} {d.label}
            </SetupOptionPill>
          ))}
        </div>
      </div>

      {/* How to play */}
      <div className="mb-7">
        <SetupLabel>How to play</SetupLabel>
        <div className="space-y-2">
          {[
            { step: "1", text: "Generate a game code below" },
            { step: "2", text: "Open the link on the TV — that's the board" },
            { step: "3", text: "Players scan the QR code on their phones" },
            { step: "4", text: "Spymasters give one-word clues. Teams guess. Avoid the assassin." },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-black"
                style={{
                  background: "rgba(255,65,108,0.15)",
                  border: "1px solid rgba(255,65,108,0.25)",
                  color: "#FF416C",
                }}
              >
                {step}
              </span>
              <p className="text-[11px] leading-snug text-white/40">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Game code / QR section */}
      <AnimatePresence mode="wait">
        {!gameSlug ? (
          <motion.div key="generate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SetupStartButton
              onClick={handleGenerate}
              accentFrom="#FF416C"
              accentTo="#FF4B2B"
            >
              🔑 Generate Game Code
            </SetupStartButton>
          </motion.div>
        ) : (
          <motion.div
            key="slug"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* QR + URL */}
            <div
              className="rounded-xl p-4 text-center"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                📱 Scan on each player's phone
              </p>
              <div className="mx-auto mb-3 flex w-fit items-center justify-center rounded-xl bg-white p-2.5 shadow-lg">
                <QRCodeSVG
                  value={gameUrl!}
                  size={140}
                  bgColor="#ffffff"
                  fgColor="#080B11"
                  level="M"
                  className="h-[120px] w-[120px] sm:h-[140px] sm:w-[140px]"
                />
              </div>
              <p
                className="overflow-x-auto whitespace-nowrap font-mono text-[10px] font-bold tracking-wider sm:text-xs"
                style={{ color: "#FF416C" }}
              >
                {gameUrl}
              </p>
            </div>

            {/* Regenerate + Launch */}
            <div className="flex gap-2">
              <motion.button
                onClick={handleRegenerate}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-xs font-bold uppercase tracking-widest text-white/40 transition-colors hover:border-white/20 hover:text-white/60"
              >
                ↺ Regenerate
              </motion.button>
              <motion.button
                onClick={handleLaunch}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="flex-1 rounded-xl px-3 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #FF416C, #FF4B2B)",
                  boxShadow: "0 8px 24px rgba(255,65,108,0.3)",
                }}
              >
                Launch →
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GameSetupShell>
  );
}