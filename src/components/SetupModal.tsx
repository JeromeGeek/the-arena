"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Difficulty } from "@/lib/codenames";
import { getRandomSlug, type SlugDifficulty } from "@/lib/gamecodes";
import { QRCodeSVG } from "qrcode.react";

const VERCEL_URL = "https://the-arena-mu.vercel.app";

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const difficulties: { value: Difficulty; label: string; color: string; glow: string }[] = [
  { value: "easy", label: "EASY", color: "#22c55e", glow: "rgba(34,197,94,0.4)" },
  { value: "medium", label: "MEDIUM", color: "#f59e0b", glow: "rgba(245,158,11,0.4)" },
  { value: "hard", label: "HARD", color: "#ef4444", glow: "rgba(239,68,68,0.4)" },
];

export default function SetupModal({ isOpen, onClose }: SetupModalProps) {
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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="relative w-full max-w-md rounded-3xl p-5 shadow-2xl sm:p-8"
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.02) 50%, rgba(0,0,0,0.12) 100%)",
                border: "1px solid rgba(255,255,255,0.09)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2), 0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,65,108,0.08)",
                backdropFilter: "blur(24px) saturate(160%)",
              }}
            >
              {/* Red accent top bar */}
              <div className="absolute left-0 right-0 top-0 h-[2px] rounded-t-3xl"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,65,108,0.6), rgba(255,75,43,0.4), transparent)" }}
              />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-white/30 transition-all hover:bg-white/10 hover:text-white/70"
              >
                ✕
              </button>

              {/* Title */}
              <div className="mb-5 sm:mb-7">
                <div className="mb-3 h-0.5 w-8 rounded-full" style={{ background: "linear-gradient(90deg, #FF416C, #FF4B2B)" }} />
                <h2
                  className="mb-1.5 text-xl font-semibold uppercase tracking-[0.15em] text-white/90 sm:text-2xl"
                  style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
                >
                  CODENAMES
                </h2>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
                  Tactical Word Espionage
                </p>
              </div>

              {/* Difficulty Selection */}
              <div className="mb-6 sm:mb-10">
                <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                  Difficulty
                </label>
                <div className="flex gap-2 sm:gap-3">
                  {difficulties.map((d) => (
                    <motion.button
                      key={d.value}
                      onClick={() => {
                        setDifficulty(d.value);
                        setGameSlug(null);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative flex-1 rounded-xl px-2 py-3 text-xs font-bold uppercase tracking-wider transition-all sm:px-4 sm:text-sm"
                      style={{
                        background:
                          difficulty === d.value
                            ? `linear-gradient(135deg, ${d.color}22, ${d.color}11)`
                            : "rgba(255,255,255,0.03)",
                        border: `1px solid ${difficulty === d.value ? d.color + "44" : "rgba(255,255,255,0.08)"}`,
                        color: difficulty === d.value ? d.color : "rgba(255,255,255,0.35)",
                        boxShadow: difficulty === d.value ? `0 0 20px ${d.glow}` : "none",
                      }}
                    >
                      {d.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Game Code Section */}
              {!gameSlug ? (
                <motion.button
                  onClick={handleGenerate}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full rounded-xl px-4 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-white shadow-lg sm:px-6 sm:text-sm"
                  style={{
                    background: "linear-gradient(135deg, #FF416C, #FF4B2B)",
                    boxShadow: "0 0 30px rgba(255,65,108,0.25), 0 4px 16px rgba(0,0,0,0.3)",
                  }}
                >
                  Generate Game Code
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {/* QR Code + URL Display */}
                  <div className="rounded-xl p-4 text-center"
                    style={{
                      background: "rgba(255,255,255,0.025)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                      📱 Open on your phone
                    </p>

                    {/* QR Code */}
                    <div className="mx-auto mb-3 flex w-fit items-center justify-center rounded-xl bg-white p-2.5 shadow-lg sm:p-3">
                      <QRCodeSVG
                        value={gameUrl!}
                        size={140}
                        bgColor="#ffffff"
                        fgColor="#080B11"
                        level="M"
                        className="h-[120px] w-[120px] sm:h-[140px] sm:w-[140px]"
                      />
                    </div>

                    {/* Full URL */}
                    <p className="overflow-x-auto whitespace-nowrap font-mono text-[10px] font-bold tracking-wider sm:text-xs"
                      style={{ color: "#FF416C" }}
                    >
                      {gameUrl}
                    </p>
                  </div>

                  <div className="flex gap-2 sm:gap-3">
                    <motion.button
                      onClick={handleRegenerate}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-xs font-semibold uppercase tracking-widest text-white/40 transition-colors hover:border-white/20 hover:text-white/60 sm:px-4 sm:text-sm"
                    >
                      Regenerate
                    </motion.button>
                    <motion.button
                      onClick={handleLaunch}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 rounded-xl px-3 py-3 text-xs font-semibold uppercase tracking-widest text-white shadow-lg sm:px-4 sm:text-sm"
                      style={{
                        background: "linear-gradient(135deg, #FF416C, #FF4B2B)",
                        boxShadow: "0 0 20px rgba(255,65,108,0.2)",
                      }}
                    >
                      Launch →
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
