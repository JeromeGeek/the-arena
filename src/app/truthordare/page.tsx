"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generateSeed, seedToSlug } from "@/lib/gamecodes";
import type { Intensity } from "@/lib/truthordare";

const intensityOptions: { value: Intensity; label: string; emoji: string; color: string; glow: string }[] = [
  { value: "mild", label: "MILD", emoji: "😇", color: "#A855F7", glow: "rgba(168,85,247,0.3)" },
  { value: "spicy", label: "SPICY", emoji: "🌶️", color: "#D946EF", glow: "rgba(217,70,239,0.3)" },
  { value: "extreme", label: "EXTREME", emoji: "💀", color: "#7C3AED", glow: "rgba(124,58,237,0.3)" },
];

const playerEmojis = [
  "😈", "👹", "🤡", "🎃", "💀", "👻", "🧛", "🧟", "🦹", "🧙",
  "🤖", "👽", "🫣", "🫠", "🤪",
];

export default function TruthOrDarePage() {
  const router = useRouter();
  const [playerNames, setPlayerNames] = useState<string[]>([
    "Player 1",
    "Player 2",
    "Player 3",
  ]);
  const [inputName, setInputName] = useState("");
  const [intensity, setIntensity] = useState<Intensity>("spicy");

  function handleAddPlayer() {
    if (inputName.trim() && playerNames.length < 15) {
      setPlayerNames((prev) => [...prev, inputName.trim()]);
      setInputName("");
    }
  }

  function handleRemovePlayer(index: number) {
    setPlayerNames((prev) => prev.filter((_, i) => i !== index));
  }

  function handleGenerate() {
    if (playerNames.length < 2) return;
    const seed = generateSeed();
    const slug = seedToSlug(seed);
    const code = `${playerNames.length}-${intensity}-${slug}`;
    const names = encodeURIComponent(playerNames.join(","));
    router.push(`/td/${code}?names=${names}`);
  }

  return (
    <main className="relative min-h-[100dvh] overflow-hidden pb-12">
      {/* Ambient Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(168,85,247,0.04)] blur-[80px]" />
        <div className="absolute right-1/4 top-2/3 h-[300px] w-[300px] rounded-full bg-[rgba(124,58,237,0.03)] blur-[60px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-5">
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
          Truth or Dare
        </h1>
        <div className="w-9" />
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="glass-panel rounded-2xl p-3 sm:rounded-3xl sm:p-8">
            {/* Title */}
            <div className="mb-4 text-center sm:mb-8">
              <motion.div
                className="mb-2 text-3xl sm:mb-3 sm:text-4xl"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
              >
                🔥
              </motion.div>
              <h2
                className="mb-2 text-xl font-bold uppercase tracking-[0.15em] text-white/90 sm:text-2xl sm:tracking-[0.25em]"
                style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
              >
                Confessional
              </h2>
              <p className="text-sm text-white/30">
                Choose your intensity • Confess or face the dare
              </p>
            </div>

            {/* Player Grid */}
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                  Players ({playerNames.length}/15)
                </label>
              </div>

              <div className="space-y-2">
                {playerNames.map((name, i) => (
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.03 }}
                    className="group flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5 transition-colors hover:border-white/15 hover:bg-white/[0.04] sm:gap-3 sm:rounded-xl sm:px-4 sm:py-3"
                  >
                    <span className="text-lg">{playerEmojis[i % playerEmojis.length]}</span>
                    <span className="min-w-[20px] text-xs font-bold text-white/20">
                      #{i + 1}
                    </span>
                    <input
                      value={name}
                      onChange={(e) => {
                        const updated = [...playerNames];
                        updated[i] = e.target.value;
                        setPlayerNames(updated);
                      }}
                      className="flex-1 bg-transparent text-sm text-white/80 outline-none placeholder:text-white/20"
                      placeholder="Enter name..."
                    />
                    {playerNames.length > 2 && (
                      <motion.button
                        onClick={() => handleRemovePlayer(i)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs text-white/15 transition-colors hover:bg-white/[0.05] hover:text-red-400"
                      >
                        ✕
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Add Player */}
            {playerNames.length < 15 && (
              <motion.div layout className="mb-6 flex gap-2 sm:mb-8">
                <input
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}
                  placeholder={`Add player ${playerNames.length + 1}...`}
                  className="flex-1 rounded-xl border border-dashed border-white/10 bg-white/[0.01] px-4 py-3 text-sm text-white/80 outline-none placeholder:text-white/20 focus:border-white/25 focus:bg-white/[0.03]"
                />
                <motion.button
                  onClick={handleAddPlayer}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-lg font-bold text-white/60 transition-colors hover:bg-white/[0.08]"
                >
                  +
                </motion.button>
              </motion.div>
            )}

            {/* Intensity Selection */}
            <div className="mb-6 sm:mb-8">
              <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Intensity
              </label>
              <div className="flex gap-2 sm:gap-3">
                {intensityOptions.map((opt) => (
                  <motion.button
                    key={opt.value}
                    onClick={() => setIntensity(opt.value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative flex-1 rounded-lg px-2 py-3 text-center transition-all sm:rounded-xl sm:px-4 sm:py-4"
                    style={{
                      background:
                        intensity === opt.value
                          ? `linear-gradient(135deg, ${opt.color}22, ${opt.color}11)`
                          : "rgba(255,255,255,0.03)",
                      border: `1px solid ${intensity === opt.value ? opt.color + "44" : "rgba(255,255,255,0.08)"}`,
                      color: intensity === opt.value ? opt.color : "rgba(255,255,255,0.35)",
                      boxShadow: intensity === opt.value ? `0 0 20px ${opt.glow}` : "none",
                    }}
                  >
                    <span className="block text-2xl">{opt.emoji}</span>
                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-widest">
                      {opt.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <motion.button
              onClick={handleGenerate}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              disabled={playerNames.length < 2}
              className="w-full rounded-lg bg-gradient-to-r from-[#A855F7] to-[#7C3AED] px-3 py-3.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white shadow-lg transition-shadow hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] disabled:cursor-not-allowed disabled:opacity-40 sm:rounded-xl sm:px-6 sm:py-4 sm:text-sm sm:tracking-[0.2em]"
            >
              Start Game • {playerNames.length} Players
            </motion.button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
