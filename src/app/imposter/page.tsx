"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { generateSeed, seedToSlug } from "@/lib/gamecodes";
import { categories } from "@/lib/imposter";
import GameSetupShell, {
  SetupLabel,
  SetupPlayerRow,
  SetupAddRow,
  SetupOptionPill,
  SetupStartButton,
} from "@/components/GameSetupShell";

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
    <GameSetupShell
      title="IMPOSTER"
      emoji="🎭"
      subtitle="Social Deception Engine"
      flavour="Assemble your crew · Someone among you is a fraud"
      accentFrom="#00B4DB"
      accentTo="#0083B0"
      emojiAnimate={{ rotateY: [0, 360] } as never}
      emojiTransition={{ duration: 2, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
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
                canRemove={playerNames.length > 3}
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

      {/* Imposter Count */}
      <div className="mb-6">
        <SetupLabel>Imposters</SetupLabel>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: maxImposters }, (_, i) => i + 1).map((count) => (
            <motion.button
              key={count}
              onClick={() => setImposterCount(count)}
              whileTap={{ scale: 0.93 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
              className="min-w-[64px] flex-1 rounded-xl px-3 py-3 text-center transition-all"
              style={{
                background: imposterCount === count ? "rgba(0,180,219,0.14)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${imposterCount === count ? "rgba(0,180,219,0.4)" : "rgba(255,255,255,0.07)"}`,
                color: imposterCount === count ? "#00B4DB" : "rgba(255,255,255,0.35)",
                boxShadow: imposterCount === count ? "0 0 20px rgba(0,180,219,0.18)" : "none",
              }}
            >
              <span className="block text-2xl font-black" style={{ fontFamily: "var(--font-syne)" }}>{count}</span>
              <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-widest text-white/30">
                {count === 1 ? "Imposter" : "Imposters"}
              </span>
            </motion.button>
          ))}
        </div>
        <p className="mt-2 text-center text-[10px] text-white/20">
          Max {maxImposters} for {playerNames.length} players
        </p>
      </div>

      {/* Category */}
      <div className="mb-7">
        <SetupLabel>Category</SetupLabel>
        <div className="flex flex-wrap justify-center gap-2">
          {categoryOptions.map((cat) => (
            <motion.button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              whileTap={{ scale: 0.93 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
              className="w-[calc(33.333%-0.375rem)] rounded-xl px-2 py-3 text-center transition-all sm:w-[calc(20%-0.5rem)]"
              style={{
                background: selectedCategory === cat.value ? "rgba(0,180,219,0.12)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${selectedCategory === cat.value ? "rgba(0,180,219,0.38)" : "rgba(255,255,255,0.07)"}`,
                color: selectedCategory === cat.value ? "#00B4DB" : "rgba(255,255,255,0.35)",
                boxShadow: selectedCategory === cat.value ? "0 0 14px rgba(0,180,219,0.14)" : "none",
              }}
            >
              <span className="block text-xl">{cat.emoji}</span>
              <span className="mt-1 block text-[9px] font-semibold uppercase tracking-wider">{cat.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Start */}
      <SetupStartButton
        onClick={handleGenerate}
        disabled={playerNames.length < 3}
        accentFrom="#00B4DB"
        accentTo="#0083B0"
      >
        Start Game · {playerNames.length} Players · {imposterCount} Imposter{imposterCount > 1 ? "s" : ""}
      </SetupStartButton>
    </GameSetupShell>
  );
}
