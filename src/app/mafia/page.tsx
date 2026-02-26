"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { generateSeed, seedToSlug } from "@/lib/gamecodes";
import GameSetupShell, {
  SetupLabel,
  SetupPlayerRow,
  SetupAddRow,
  SetupStartButton,
} from "@/components/GameSetupShell";

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
    if (playerNames.length < 15) {
      const name = inputName.trim() || `Player ${playerNames.length + 1}`;
      setPlayerNames((prev) => [...prev, name]);
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
    <GameSetupShell
      title="MAFIA"
      emoji="🔪"
      subtitle="Night Falls. Trust No One."
      flavour="The town sleeps · Someone among you is deadly"
      accentFrom="#EC4899"
      accentTo="#BE185D"
      emojiAnimate={{ scale: [1, 1.12, 1] }}
      emojiTransition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
    >
      {/* Players */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <SetupLabel>Players ({playerNames.length}/15)</SetupLabel>
          {playerNames.length < 5 && (
            <span className="text-[10px] text-red-400/60">Minimum 5 players</span>
          )}
        </div>
        <div className="space-y-2">
          <AnimatePresence>
            {playerNames.map((name, i) => (
              <SetupPlayerRow
                key={i}
                emoji={playerEmojis[i % playerEmojis.length]}
                index={i}
                value={name}
                onChange={(v) => {
                  const updated = [...playerNames];
                  updated[i] = v;
                  setPlayerNames(updated);
                }}
                onRemove={() => handleRemovePlayer(i)}
                canRemove={playerNames.length > 5}
                placeholder="Enter name…"
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Add player */}
      {playerNames.length < 15 && (
        <motion.div layout className="mb-6">
          <SetupAddRow
            value={inputName}
            onChange={setInputName}
            onAdd={handleAddPlayer}
            placeholder={`Add player ${playerNames.length + 1}…`}
          />
        </motion.div>
      )}

      {/* Game settings */}
      <div className="mb-6 space-y-5">
        {/* Mafia Count */}
        <div>
          <SetupLabel>🔪 Mafia Members ({mafiaCount})</SetupLabel>
          <div className="flex gap-2">
            {Array.from({ length: maxMafia }, (_, i) => i + 1).map((n) => (
              <motion.button
                key={n}
                onClick={() => setMafiaCount(n)}
                whileTap={{ scale: 0.93 }}
                transition={{ type: "spring", stiffness: 420, damping: 22 }}
                className="rounded-xl border px-5 py-2.5 text-sm font-bold transition-all"
                style={{
                  borderColor: mafiaCount === n ? "rgba(236,72,153,0.45)" : "rgba(255,255,255,0.07)",
                  background: mafiaCount === n ? "rgba(236,72,153,0.14)" : "rgba(255,255,255,0.02)",
                  color: mafiaCount === n ? "#EC4899" : "rgba(255,255,255,0.4)",
                  boxShadow: mafiaCount === n ? "0 0 16px rgba(236,72,153,0.18)" : "none",
                }}
              >
                {n}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Special Roles */}
        <div>
          <SetupLabel>Special Roles</SetupLabel>
          <div className="flex flex-wrap gap-2">
            <motion.button
              onClick={() => setHasDoctor((d) => !d)}
              whileTap={{ scale: 0.93 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
              className="rounded-xl border px-4 py-2.5 text-sm font-bold transition-all"
              style={{
                borderColor: hasDoctor ? "rgba(34,197,94,0.45)" : "rgba(255,255,255,0.07)",
                background: hasDoctor ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.02)",
                color: hasDoctor ? "#22C55E" : "rgba(255,255,255,0.4)",
              }}
            >
              💉 Doctor
            </motion.button>
            <motion.button
              onClick={() => setHasDetective((d) => !d)}
              whileTap={{ scale: 0.93 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
              className="rounded-xl border px-4 py-2.5 text-sm font-bold transition-all"
              style={{
                borderColor: hasDetective ? "rgba(59,130,246,0.45)" : "rgba(255,255,255,0.07)",
                background: hasDetective ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.02)",
                color: hasDetective ? "#3B82F6" : "rgba(255,255,255,0.4)",
              }}
            >
              🔍 Detective
            </motion.button>
          </div>
        </div>
      </div>

      {/* Role breakdown summary */}
      <div className="mb-7 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/25">Role Breakdown</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/45">
          <span>🔪 Mafia × {mafiaCount}</span>
          {hasDoctor && <span>💉 Doctor × 1</span>}
          {hasDetective && <span>🔍 Detective × 1</span>}
          <span>🏘️ Villagers × {playerNames.length - mafiaCount - (hasDoctor ? 1 : 0) - (hasDetective ? 1 : 0)}</span>
        </div>
      </div>

      {/* Start */}
      <SetupStartButton
        onClick={handleGenerate}
        disabled={playerNames.length < 5}
        accentFrom="#EC4899"
        accentTo="#BE185D"
      >
        {playerNames.length >= 5 ? `Night Falls… · ${playerNames.length} Players 🌙` : `Need ${5 - playerNames.length} More Players`}
      </SetupStartButton>
    </GameSetupShell>
  );
}
