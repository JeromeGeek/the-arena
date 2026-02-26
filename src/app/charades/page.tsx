"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { generateSeed, seedToSlug } from "@/lib/gamecodes";
import { charadesCategories } from "@/lib/charades";
import GameSetupShell, {
  SetupLabel,
  SetupAddRow,
  SetupOptionPill,
  SetupStartButton,
} from "@/components/GameSetupShell";

const categoryEmojis: Record<string, string> = {
  Movies: "🎬",
  Animals: "🐾",
  Actions: "🏃",
  Celebrities: "⭐",
  Professions: "👨‍⚕️",
  Objects: "📦",
  Sports: "⚽",
  "Food & Drink": "🍕",
  Places: "🗺️",
  "TV Shows": "📺",
};

function categoryToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

const categoryOptions = [
  { value: "random", label: "Random", emoji: "🎲" },
  ...charadesCategories.map((c) => ({
    value: categoryToSlug(c.name),
    label: c.name,
    emoji: categoryEmojis[c.name] ?? "📦",
  })),
];

const timerOptions = [
  { value: 30, label: "30s", emoji: "⚡" },
  { value: 60, label: "60s", emoji: "⏱️" },
  { value: 90, label: "90s", emoji: "🕐" },
];

const roundOptions = [
  { value: 1, label: "1", emoji: "🎯" },
  { value: 2, label: "2", emoji: "✌️" },
  { value: 3, label: "3", emoji: "🔥" },
  { value: 4, label: "4", emoji: "💪" },
  { value: 5, label: "5", emoji: "🏆" },
];

const teamColors = [
  { bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.4)", text: "#F97316" },
  { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.4)", text: "#3B82F6" },
  { bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.4)", text: "#A855F7" },
  { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.4)", text: "#22C55E" },
  { bg: "rgba(236,72,153,0.12)", border: "rgba(236,72,153,0.4)", text: "#EC4899" },
  { bg: "rgba(234,179,8,0.12)", border: "rgba(234,179,8,0.4)", text: "#EAB308" },
];

const teamEmojis = ["�", "⚡", "💎", "�", "�", "�"];

export default function CharadesPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<string[]>(["Team 1", "Team 2"]);
  const [inputTeam, setInputTeam] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("random");
  const [timer, setTimer] = useState(60);
  const [rounds, setRounds] = useState(3);

  function handleAddTeam() {
    if (teams.length < 6) {
      const name = inputTeam.trim() || `Team ${teams.length + 1}`;
      setTeams((prev) => [...prev, name]);
      setInputTeam("");
    }
  }

  function handleRemoveTeam(index: number) {
    setTeams((prev) => prev.filter((_, i) => i !== index));
  }

  function handleGenerate() {
    if (teams.length < 2) return;
    const seed = generateSeed();
    const slug = seedToSlug(seed);
    const cat = selectedCategory === "random" ? "random" : selectedCategory;
    const code = `${teams.length}-${timer}-${rounds}-${cat}-${slug}`;
    const names = encodeURIComponent(teams.join(","));
    router.push(`/ch/${code}?teams=${names}`);
  }

  return (
    <GameSetupShell
      title="CHARADES"
      emoji="🎬"
      subtitle="Act It Out"
      flavour="Create teams · Act it out · No talking allowed"
      accentFrom="#FB923C"
      accentTo="#EA580C"
      emojiAnimate={{ y: [0, -8, 0] }}
      emojiTransition={{ duration: 1.2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
    >
      {/* Teams */}
      <div className="mb-6">
        <SetupLabel>Teams ({teams.length}/6)</SetupLabel>
        <div className="space-y-2">
          <AnimatePresence>
            {teams.map((name, i) => {
              const color = teamColors[i % teamColors.length];
              return (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                  style={{ background: color.bg, border: `1px solid ${color.border}` }}
                >
                  <span className="text-base">{teamEmojis[i % teamEmojis.length]}</span>
                  <input
                    value={name}
                    onChange={(e) => {
                      const updated = [...teams];
                      updated[i] = e.target.value;
                      setTeams(updated);
                    }}
                    className="flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-white/20"
                    style={{ color: color.text }}
                    placeholder="Team name…"
                  />
                  {teams.length > 2 && (
                    <motion.button
                      onClick={() => handleRemoveTeam(i)}
                      whileTap={{ scale: 0.85 }}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] text-white/15 transition-colors hover:text-red-400"
                    >
                      ✕
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Add team */}
      {teams.length < 6 && (
        <motion.div layout className="mb-6">
          <SetupAddRow
            value={inputTeam}
            onChange={setInputTeam}
            onAdd={handleAddTeam}
            placeholder={`Add team ${teams.length + 1}…`}
          />
        </motion.div>
      )}

      {/* Timer */}
      <div className="mb-5">
        <SetupLabel>Timer Per Turn</SetupLabel>
        <div className="flex gap-2">
          {timerOptions.map((opt) => (
            <SetupOptionPill
              key={opt.value}
              selected={timer === opt.value}
              onClick={() => setTimer(opt.value)}
              accentColor="#FB923C"
            >
              <span className="mr-1">{opt.emoji}</span> {opt.label}
            </SetupOptionPill>
          ))}
        </div>
      </div>

      {/* Rounds */}
      <div className="mb-5">
        <SetupLabel>Rounds</SetupLabel>
        <div className="flex flex-wrap gap-2">
          {roundOptions.map((opt) => (
            <SetupOptionPill
              key={opt.value}
              selected={rounds === opt.value}
              onClick={() => setRounds(opt.value)}
              accentColor="#FB923C"
            >
              {opt.emoji} {opt.label}
            </SetupOptionPill>
          ))}
        </div>
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
              className="w-[calc(25%-0.375rem)] rounded-xl px-2 py-3 text-center transition-all"
              style={{
                background: selectedCategory === cat.value ? "rgba(251,146,60,0.14)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${selectedCategory === cat.value ? "rgba(251,146,60,0.38)" : "rgba(255,255,255,0.07)"}`,
                color: selectedCategory === cat.value ? "#FB923C" : "rgba(255,255,255,0.35)",
                boxShadow: selectedCategory === cat.value ? "0 0 14px rgba(251,146,60,0.14)" : "none",
              }}
            >
              <span className="block text-lg">{cat.emoji}</span>
              <span className="mt-1 block text-[9px] font-semibold uppercase tracking-wider">{cat.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Start */}
      <SetupStartButton
        onClick={handleGenerate}
        disabled={teams.length < 2}
        accentFrom="#FB923C"
        accentTo="#EA580C"
      >
        Start · {teams.length} Teams · {timer}s · {rounds} {rounds === 1 ? "Round" : "Rounds"}
      </SetupStartButton>
    </GameSetupShell>
  );
}
