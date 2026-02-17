"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generateSeed, seedToSlug } from "@/lib/gamecodes";
import { categories } from "@/lib/imposter";

const categoryEmojis: Record<string, string> = {
  "Objects": "\u{1F4E6}",
  "Celebrities": "\u2B50",
  "Brands": "\u{1F6CD}",
  "Countries & Cities": "\u{1F30D}",
  "Movies & TV Shows": "\u{1F3AC}",
  "Internet Culture": "\u{1F480}",
  "Music & Bands": "\u{1F3B5}",
  "Bollywood": "\u{1F1EE}\u{1F1F3}",
};

// URL-safe slug for category names
function categoryToSlug(name: string): string {
  return name.toLowerCase().replace(/\s*&\s*/g, "-").replace(/\s+/g, "-");
}

const categoryOptions = [
  { value: "random", label: "Random", emoji: "\u{1F3B2}" },
  ...categories.map((c) => ({
    value: categoryToSlug(c.name),
    label: c.name,
    emoji: categoryEmojis[c.name] ?? "\u{1F4E6}",
  })),
];

const playerEmojis = [
  "\u{1F3AD}", "\u{1F575}\uFE0F", "\u{1F47B}", "\u{1F921}", "\u{1F98A}", "\u{1F43A}", "\u{1F985}", "\u{1F419}",
  "\u{1F3AA}", "\u{1F0CF}", "\u{1F9DB}", "\u{1F9DF}", "\u{1F977}", "\u{1F9B9}", "\u{1F9D9}",
];

export default function ImposterPage() {
  const router = useRouter();
  const [playerNames, setPlayerNames] = useState<string[]>([
    "Player 1",
    "Player 2",
    "Player 3",
    "Player 4",
  ]);
  const [inputName, setInputName] = useState("");
  const [imposterCount, setImposterCount] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("random");

  // At least 2 crew members must remain, cap at 5 imposters
  const maxImposters = Math.min(5, Math.max(1, playerNames.length - 2));

  function handleAddPlayer() {
    if (inputName.trim() && playerNames.length < 15) {
      setPlayerNames((prev) => [...prev, inputName.trim()]);
      setInputName("");
    }
  }

  function handleRemovePlayer(index: number) {
    setPlayerNames((prev) => {
      const next = prev.filter((_, i) => i !== index);
      const newMax = Math.min(5, Math.max(1, next.length - 2));
      if (imposterCount > newMax) setImposterCount(newMax);
      return next;
    });
  }

  function handleGenerate() {
    if (playerNames.length < 3) return;
    const seed = generateSeed();
    const slug = seedToSlug(seed);
    const cat = selectedCategory === "random" ? "random" : selectedCategory;
    const code = `${playerNames.length}-${imposterCount}-${cat}-${slug}`;
    const names = encodeURIComponent(playerNames.join(","));
    router.push(`/im/${code}?names=${names}`);
  }

  return (
    <main className="relative min-h-screen overflow-hidden pb-12">
      {/* Ambient Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(0,180,219,0.04)] blur-[80px]" />
        <div className="absolute right-1/4 top-2/3 h-[300px] w-[300px] rounded-full bg-[rgba(255,65,108,0.03)] blur-[60px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="text-xs font-bold uppercase tracking-[0.3em] text-white/30 transition-colors hover:text-white/60"
        >
          ← The Arena
        </Link>
        <h1
          className="text-sm font-bold uppercase tracking-[0.35em] text-white/50"
          style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
        >
          Imposter
        </h1>
        <div className="w-9" />
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="glass-panel rounded-2xl p-5 sm:rounded-3xl sm:p-8">
            {/* Title */}
            <div className="mb-5 text-center sm:mb-8">
              <motion.div
                className="mb-2 text-3xl sm:mb-3 sm:text-4xl"
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
              >
                🎭
              </motion.div>
              <h2
                className="mb-2 text-2xl font-bold uppercase tracking-[0.25em] text-white/90"
                style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
              >
                Crew Assembly
              </h2>
              <p className="text-sm text-white/30">
                Assemble your crew • Someone among you is a fraud
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
                    {playerNames.length > 3 && (
                      <motion.button
                        onClick={() => handleRemovePlayer(i)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-white/15 transition-colors hover:text-red-400"
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

            {/* Imposter Count */}
            <div className="mb-6 sm:mb-8">
              <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Imposters
              </label>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {Array.from({ length: maxImposters }, (_, i) => i + 1).map((count) => (
                  <motion.button
                    key={count}
                    onClick={() => setImposterCount(count)}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative min-w-[60px] flex-1 rounded-lg px-3 py-2.5 text-center text-sm font-bold uppercase tracking-wider transition-all sm:rounded-xl sm:px-4 sm:py-3"
                    style={{
                      background:
                        imposterCount === count
                          ? "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))"
                          : "rgba(255,255,255,0.03)",
                      border: `1px solid ${
                        imposterCount === count
                          ? "rgba(239,68,68,0.4)"
                          : "rgba(255,255,255,0.08)"
                      }`,
                      color:
                        imposterCount === count ? "#ef4444" : "rgba(255,255,255,0.35)",
                      boxShadow:
                        imposterCount === count
                          ? "0 0 20px rgba(239,68,68,0.15)"
                          : "none",
                    }}
                  >
                    <span className="block text-2xl font-black" style={{ fontFamily: "var(--font-syne), var(--font-display)" }}>
                      {count}
                    </span>
                    <span className="mt-1 block text-[10px] tracking-widest text-white/30">
                      {count === 1 ? "Imposter" : "Imposters"}
                    </span>
                  </motion.button>
                ))}
              </div>
              <p className="mt-2 text-center text-[10px] text-white/20">
                Max {maxImposters} imposter{maxImposters > 1 ? "s" : ""} for {playerNames.length} players
              </p>
            </div>

            {/* Category Selection */}
            <div className="mb-6 sm:mb-8">
              <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Category
              </label>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {categoryOptions.map((cat) => (
                  <motion.button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-[calc(33.333%-0.375rem)] rounded-lg px-2 py-2.5 text-center transition-all sm:w-[calc(20%-0.6rem)] sm:rounded-xl sm:px-3 sm:py-3"
                    style={{
                      background:
                        selectedCategory === cat.value
                          ? "linear-gradient(135deg, rgba(0,180,219,0.15), rgba(0,180,219,0.05))"
                          : "rgba(255,255,255,0.03)",
                      border: `1px solid ${
                        selectedCategory === cat.value
                          ? "rgba(0,180,219,0.4)"
                          : "rgba(255,255,255,0.08)"
                      }`,
                      color:
                        selectedCategory === cat.value ? "#00B4DB" : "rgba(255,255,255,0.35)",
                      boxShadow:
                        selectedCategory === cat.value
                          ? "0 0 15px rgba(0,180,219,0.1)"
                          : "none",
                    }}
                  >
                    <span className="block text-lg">{cat.emoji}</span>
                    <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-wider">
                      {cat.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Game Code Section */}
            <motion.button
              onClick={handleGenerate}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              disabled={playerNames.length < 3}
              className="w-full rounded-lg bg-gradient-to-r from-[#00B4DB] to-[#0083B0] px-4 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-white shadow-lg transition-shadow hover:shadow-[0_0_30px_rgba(0,180,219,0.3)] disabled:cursor-not-allowed disabled:opacity-40 sm:rounded-xl sm:px-6 sm:py-4 sm:text-sm sm:tracking-[0.2em]"
            >
              Start Game • {playerNames.length} Players • {imposterCount} Imposter{imposterCount > 1 ? "s" : ""}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
