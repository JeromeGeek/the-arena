"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { generateSeed, seedToSlug } from "@/lib/gamecodes";
import type { NHIEIntensity } from "@/lib/neverhaveiever";
import GameSetupShell, {
  SetupLabel,
  SetupPlayerRow,
  SetupAddRow,
  SetupOptionPill,
  SetupStartButton,
} from "@/components/GameSetupShell";

const intensityOptions: { value: NHIEIntensity; label: string; emoji: string; color: string; glow: string }[] = [
  { value: "wild", label: "WILD", emoji: "🐺", color: "#10B981", glow: "rgba(16,185,129,0.3)" },
  { value: "spicy", label: "SPICY", emoji: "🌶️", color: "#F59E0B", glow: "rgba(245,158,11,0.3)" },
  { value: "chaos", label: "CHAOS", emoji: "☠️", color: "#EF4444", glow: "rgba(239,68,68,0.3)" },
];

const roundOptions = [
  { value: 5,  label: "5",  emoji: "🎯" },
  { value: 10, label: "10", emoji: "🔥" },
  { value: 15, label: "15", emoji: "💀" },
  { value: 20, label: "20", emoji: "☠️" },
];

const playerEmojis = [
  "🍻", "🥂", "🍷", "🍸", "🍹", "🧃", "☕", "🍺", "🥤", "🧋",
  "🫧", "💧", "🍾", "🥛", "🫗",
];

export default function NeverHaveIEverPage() {
  const router = useRouter();
  const [playerNames, setPlayerNames] = useState<string[]>([
    "Player 1",
    "Player 2",
    "Player 3",
  ]);
  const [inputName, setInputName] = useState("");
  const [intensity, setIntensity] = useState<NHIEIntensity>("wild");
  const [rounds, setRounds] = useState(10);

  function handleAddPlayer() {
    const nextNum = playerNames.length + 1;
    setPlayerNames((prev) => [...prev, `Player ${nextNum}`]);
  }

  function handleRemovePlayer(index: number) {
    setPlayerNames((prev) => prev.filter((_, i) => i !== index));
  }

  function handleGenerate() {
    if (playerNames.length < 2) return;
    const seed = generateSeed();
    const slug = seedToSlug(seed);
    const code = `${playerNames.length}-${intensity}-${rounds}-${slug}`;
    const names = encodeURIComponent(playerNames.join(","));
    router.push(`/nhie/${code}?names=${names}`);
  }

  return (
    <GameSetupShell
      title="NEVER HAVE I EVER"
      emoji="🍺"
      subtitle="Secrets & Confessions"
      flavour="Put a finger down · Spill the tea"
      accentFrom="#22C55E"
      accentTo="#16A34A"
      emojiAnimate={{ rotate: [0, -10, 10, -10, 0] }}
      emojiTransition={{ duration: 1.5, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
    >
      {/* Players */}
      <div className="mb-6">
        <SetupLabel>Players ({playerNames.length}/15)</SetupLabel>
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
                canRemove={playerNames.length > 2}
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

      {/* Rounds */}
      <div className="mb-6">
        <SetupLabel>Rounds</SetupLabel>
        <div className="flex flex-wrap gap-2">
          {roundOptions.map((opt) => (
            <SetupOptionPill
              key={opt.value}
              selected={rounds === opt.value}
              onClick={() => setRounds(opt.value)}
              accentColor="#22C55E"
            >
              {opt.emoji} {opt.label}
            </SetupOptionPill>
          ))}
        </div>
      </div>

      {/* Intensity */}
      <div className="mb-7">
        <SetupLabel>Intensity</SetupLabel>
        <div className="flex gap-2 sm:gap-3">
          {intensityOptions.map((opt) => (
            <motion.button
              key={opt.value}
              onClick={() => setIntensity(opt.value)}
              whileTap={{ scale: 0.93 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
              className="relative flex-1 rounded-xl px-2 py-3 text-center transition-all"
              style={{
                background: intensity === opt.value ? `${opt.color}1c` : "rgba(255,255,255,0.03)",
                border: `1px solid ${intensity === opt.value ? opt.color + "44" : "rgba(255,255,255,0.07)"}`,
                color: intensity === opt.value ? opt.color : "rgba(255,255,255,0.35)",
                boxShadow: intensity === opt.value ? `0 0 18px ${opt.glow}` : "none",
              }}
            >
              <span className="block text-2xl">{opt.emoji}</span>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-widest">{opt.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Start */}
      <SetupStartButton
        onClick={handleGenerate}
        disabled={playerNames.length < 2}
        accentFrom="#22C55E"
        accentTo="#16A34A"
      >
        Start · {playerNames.length} Players · {rounds} Rounds
      </SetupStartButton>
    </GameSetupShell>
  );
}
