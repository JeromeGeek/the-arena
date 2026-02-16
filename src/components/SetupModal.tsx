"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { Difficulty } from "@/lib/codenames";
import { generateSeed, seedToSlug } from "@/lib/gamecodes";

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart?: (difficulty: Difficulty) => void;
}

const difficulties: { value: Difficulty; label: string; color: string; glow: string }[] = [
  { value: "easy", label: "EASY", color: "#22c55e", glow: "rgba(34,197,94,0.4)" },
  { value: "medium", label: "MEDIUM", color: "#f59e0b", glow: "rgba(245,158,11,0.4)" },
  { value: "hard", label: "HARD", color: "#ef4444", glow: "rgba(239,68,68,0.4)" },
];

export default function SetupModal({ isOpen, onClose, onStart }: SetupModalProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [gameCode, setGameCode] = useState<string | null>(null);
  const router = useRouter();

  function handleGenerate() {
    const seed = generateSeed();
    const slug = seedToSlug(seed);
    const code = `${difficulty}-en-${slug}`;
    setGameCode(code);
  }

  function handleLaunch() {
    if (gameCode) {
      router.push(`/codenames/${gameCode}`);
    } else if (onStart) {
      onStart(difficulty);
    }
  }

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
            <div className="glass-panel relative w-full max-w-md rounded-3xl p-8 shadow-2xl">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-white/30 transition-colors hover:bg-white/10 hover:text-white/60"
              >
                ✕
              </button>

              {/* Title */}
              <h2
                className="mb-2 text-2xl font-bold uppercase tracking-[0.25em] text-white/90"
                style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
              >
                Mission Config
              </h2>
              <p className="mb-8 text-sm text-white/30">
                Configure your operation parameters
              </p>

              {/* Difficulty Selection */}
              <div className="mb-10">
                <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                  Difficulty
                </label>
                <div className="flex gap-3">
                  {difficulties.map((d) => (
                    <motion.button
                      key={d.value}
                      onClick={() => setDifficulty(d.value)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative flex-1 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all"
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
              {!gameCode ? (
                <motion.button
                  onClick={handleGenerate}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full rounded-xl bg-gradient-to-r from-[#FF416C] to-[#FF4B2B] px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-lg transition-shadow hover:shadow-[0_0_30px_rgba(255,65,108,0.3)]"
                >
                  Generate Game Code
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Display game code */}
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                      Share this URL on the TV
                    </p>
                    <p className="font-mono text-lg font-bold tracking-wider text-white/80">
                      /codenames/{gameCode}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => setGameCode(null)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold uppercase tracking-widest text-white/40 transition-colors hover:border-white/20 hover:text-white/60"
                    >
                      Regenerate
                    </motion.button>
                    <motion.button
                      onClick={handleLaunch}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 rounded-xl bg-gradient-to-r from-[#FF416C] to-[#FF4B2B] px-4 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-lg"
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
