"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generateSeed, seedToSlug } from "@/lib/gamecodes";

const playerEmojis = [
  "🎭", "🕵️", "👻", "🤡", "🦊", "🐺", "🦅", "🐙",
  "🎪", "🃏", "🧛", "🧟", "🥷", "🦹", "🧙",
];

export default function MafiaSetupPage() {
  const router = useRouter();
  const [playerNames, setPlayerNames] = useState<string[]>([
    "Player 1",
    "Player 2",
    "Player 3",
    "Player 4",
    "Player 5",
    "Player 6",
  ]);
  const [inputName, setInputName] = useState("");
  const [mafiaCount, setMafiaCount] = useState(1);
  const [hasDoctor, setHasDoctor] = useState(true);
  const [hasDetective, setHasDetective] = useState(true);

  const maxMafia = Math.max(1, Math.floor(playerNames.length / 3));

  function handleAddPlayer() {
    if (inputName.trim() && playerNames.length < 15) {
      setPlayerNames((prev) => [...prev, inputName.trim()]);
      setInputName("");
    }
  }

  function handleRemovePlayer(index: number) {
    setPlayerNames((prev) => {
      const next = prev.filter((_, i) => i !== index);
      const newMax = Math.max(1, Math.floor(next.length / 3));
      if (mafiaCount > newMax) setMafiaCount(newMax);
      return next;
    });
  }

  function handleGenerate() {
    if (playerNames.length < 5) return;
    const seed = generateSeed();
    const slug = seedToSlug(seed);
    const code = `${playerNames.length}-${mafiaCount}-${hasDoctor ? 1 : 0}-${hasDetective ? 1 : 0}-${slug}`;
    const names = encodeURIComponent(playerNames.join(","));
    router.push(`/mf/${code}?names=${names}`);
  }

  return (
    <main className="relative min-h-[100dvh] overflow-hidden pb-12">
      {/* Ambient Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(220,38,38,0.04)] blur-[80px]" />
        <div className="absolute right-1/4 top-2/3 h-[300px] w-[300px] rounded-full bg-[rgba(220,38,38,0.02)] blur-[60px]" />
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
          Mafia
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
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
              >
                🔪
              </motion.div>
              <h2
                className="mb-2 text-xl font-bold uppercase tracking-[0.15em] text-white/90 sm:text-2xl sm:tracking-[0.25em]"
                style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
              >
                Town Assembly
              </h2>
              <p className="text-sm text-white/30">
                The town sleeps • Someone among you is deadly
              </p>
            </div>

            {/* Player Grid */}
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                  Players ({playerNames.length}/15)
                </label>
                {playerNames.length < 5 && (
                  <span className="text-[10px] text-red-400/60">Minimum 5 players</span>
                )}
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
                    {playerNames.length > 5 && (
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

            {/* Game Settings */}
            <div className="mb-6 space-y-5 sm:mb-8">
              {/* Mafia Count */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                  🔪 Mafia Members ({mafiaCount})
                </label>
                <div className="flex gap-2">
                  {Array.from({ length: maxMafia }, (_, i) => i + 1).map((n) => (
                    <motion.button
                      key={n}
                      onClick={() => setMafiaCount(n)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="rounded-lg border px-4 py-2 text-sm font-bold transition-all"
                      style={{
                        borderColor: mafiaCount === n ? "rgba(220,38,38,0.5)" : "rgba(255,255,255,0.08)",
                        background: mafiaCount === n ? "rgba(220,38,38,0.15)" : "rgba(255,255,255,0.02)",
                        color: mafiaCount === n ? "#EF4444" : "rgba(255,255,255,0.4)",
                      }}
                    >
                      {n}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Special Roles */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                  Special Roles
                </label>
                <div className="flex flex-wrap gap-2">
                  <motion.button
                    onClick={() => setHasDoctor((d) => !d)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-lg border px-4 py-2 text-sm font-bold transition-all"
                    style={{
                      borderColor: hasDoctor ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.08)",
                      background: hasDoctor ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.02)",
                      color: hasDoctor ? "#22C55E" : "rgba(255,255,255,0.4)",
                    }}
                  >
                    💉 Doctor
                  </motion.button>
                  <motion.button
                    onClick={() => setHasDetective((d) => !d)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-lg border px-4 py-2 text-sm font-bold transition-all"
                    style={{
                      borderColor: hasDetective ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.08)",
                      background: hasDetective ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.02)",
                      color: hasDetective ? "#3B82F6" : "rgba(255,255,255,0.4)",
                    }}
                  >
                    🔍 Detective
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Role Summary */}
            <div className="mb-6 rounded-xl border border-white/8 bg-white/[0.02] p-4 sm:mb-8">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">Role Breakdown</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
                <span>🔪 Mafia × {mafiaCount}</span>
                {hasDoctor && <span>💉 Doctor × 1</span>}
                {hasDetective && <span>🔍 Detective × 1</span>}
                <span>🏘️ Villagers × {playerNames.length - mafiaCount - (hasDoctor ? 1 : 0) - (hasDetective ? 1 : 0)}</span>
              </div>
            </div>

            {/* Start Button */}
            <motion.button
              onClick={handleGenerate}
              disabled={playerNames.length < 5}
              whileHover={playerNames.length >= 5 ? { scale: 1.02 } : undefined}
              whileTap={playerNames.length >= 5 ? { scale: 0.98 } : undefined}
              className="w-full rounded-xl py-3.5 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-lg transition-all disabled:opacity-30 sm:rounded-2xl sm:py-4 sm:text-sm sm:tracking-[0.25em]"
              style={{
                background: playerNames.length >= 5
                  ? "linear-gradient(135deg, #E11D48, #9F1239)"
                  : "rgba(255,255,255,0.05)",
                boxShadow: playerNames.length >= 5
                  ? "0 0 40px rgba(225,29,72,0.3)"
                  : "none",
              }}
            >
              {playerNames.length >= 5 ? "Night Falls... 🌙" : `Need ${5 - playerNames.length} More Players`}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
