"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { generateSeed, seedToSlug } from "@/lib/gamecodes";
import type { Intensity } from "@/lib/truthordare";
import GameSetupShell, {
  SetupLabel,
  SetupPlayerRow,
  SetupAddRow,
  SetupOptionPill,
  SetupStartButton,
} from "@/components/GameSetupShell";

const intensityOptions: { value: Intensity; label: string; emoji: string; color: string; glow: string }[] = [
  { value: "mild",    label: "MILD",    emoji: "😇", color: "#A855F7", glow: "rgba(168,85,247,0.3)" },
  { value: "spicy",   label: "SPICY",   emoji: "🌶️", color: "#D946EF", glow: "rgba(217,70,239,0.3)" },
  { value: "extreme", label: "EXTREME", emoji: "💀", color: "#7C3AED", glow: "rgba(124,58,237,0.3)" },
];

const roundOptions = [
  { value: 5,  label: "5",  emoji: "🎯" },
  { value: 10, label: "10", emoji: "🔥" },
  { value: 15, label: "15", emoji: "💀" },
  { value: 20, label: "20", emoji: "☠️" },
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
  const [rounds, setRounds] = useState(10);

  function handleAddPlayer() {
    if (playerNames.length >= 15) return;
    const nextNum = playerNames.length + 1;
    // Use typed name if present, otherwise default "Player N"
    const name = inputName.trim() || `Player ${nextNum}`;
    setPlayerNames((prev) => [...prev, name]);
    setInputName("");
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
    router.push(`/td/${code}?names=${names}`);
  }

  return (
    <GameSetupShell
      title="TRUTH OR DARE"
      emoji="🔥"
      subtitle="Confess or Face It"
      flavour="Choose your intensity · Confess or face the dare"
      accentFrom="#A855F7"
      accentTo="#7C3AED"
      emojiAnimate={{ scale: [1, 1.15, 1] }}
      emojiTransition={{ duration: 2, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
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
            placeholder={`Player ${playerNames.length + 1} (or type a name)`}
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
              accentColor="#A855F7"
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
        accentFrom="#A855F7"
        accentTo="#7C3AED"
      >
        Start · {playerNames.length} Players · {rounds} Rounds
      </SetupStartButton>
    </GameSetupShell>
  );
}
