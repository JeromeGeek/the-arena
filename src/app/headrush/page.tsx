"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { generateSeed, seedToSlug } from "@/lib/gamecodes";
import { snapCategories, IMAGES_PER_ROUND } from "@/lib/snapquiz";
import GameSetupShell, {
  SetupLabel,
  SetupAddRow,
  SetupOptionPill,
  SetupStartButton,
} from "@/components/GameSetupShell";

const difficultyOptions = [
  { value: "easy",    label: "Easy",    emoji: "🟢", desc: "Light blur · 2s reveal" },
  { value: "medium",  label: "Medium",  emoji: "🟡", desc: "Medium blur · 4s reveal" },
  { value: "extreme", label: "Extreme", emoji: "🔴", desc: "Heavy blur · 8s reveal" },
];

const roundOptions = [
  { value: 1, label: "1", desc: "10 images" },
  { value: 2, label: "2", desc: "20 images" },
  { value: 3, label: "3", desc: "30 images" },
];

const categoryOptions = snapCategories.map((c) => ({
  value: c.id,
  label: c.label,
  emoji: c.emoji,
}));

const TEAM_COLORS = [
  { bg: "rgba(255,65,108,0.12)", border: "rgba(255,65,108,0.4)", text: "#FF416C" },
  { bg: "rgba(0,180,219,0.12)",  border: "rgba(0,180,219,0.4)",  text: "#00B4DB" },
  { bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.4)", text: "#A855F7" },
  { bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.4)",  text: "#22C55E" },
];

export default function SnapQuizSetupPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<string[]>(["Team 1", "Team 2"]);
  const [inputTeam, setInputTeam] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "extreme">("medium");
  const [rounds, setRounds] = useState(2); // 2 rounds × 10 = 20 images
  const [category, setCategory] = useState("random");

  function handleAddTeam() {
    if (teams.length < 4) {
      const name = inputTeam.trim() || `Team ${teams.length + 1}`;
      setTeams((prev) => [...prev, name]);
      setInputTeam("");
    }
  }

  function handleRemoveTeam(i: number) {
    if (teams.length > 2) setTeams((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleStart() {
    if (teams.length < 2) return;
    const seed = generateSeed();
    const slug = seedToSlug(seed);
    const code = `${teams.length}-${difficulty}-${rounds}-${category}-${slug}`;
    const teamsParam = encodeURIComponent(teams.join(","));
    router.push(`/hr/${code}?teams=${teamsParam}`);
  }

  return (
    <GameSetupShell
      title="SNAP QUIZ"
      emoji="🖼️"
      subtitle="See It · Shout It · Score"
      flavour="Image appears blurred · Reveals slowly · First to shout wins"
      accentFrom="#06B6D4"
      accentTo="#0891B2"
      emojiAnimate={{ scale: [1, 1.12, 1], rotate: [0, -6, 6, 0] }}
      emojiTransition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }}
    >
      {/* Teams */}
      <div className="mb-6">
        <SetupLabel>Teams ({teams.length}/4)</SetupLabel>
        <div className="space-y-2">
          <AnimatePresence>
            {teams.map((name, i) => {
              const col = TEAM_COLORS[i % TEAM_COLORS.length];
              return (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between rounded-xl border px-3 py-2.5"
                  style={{ borderColor: col.border, background: col.bg }}
                >
                  <span className="text-sm font-bold" style={{ color: col.text }}>{name}</span>
                  {teams.length > 2 && (
                    <motion.button
                      onClick={() => handleRemoveTeam(i)}
                      whileTap={{ scale: 0.85 }}
                      className="text-[10px] text-white/20 transition-colors hover:text-white/50"
                    >
                      ✕
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        {teams.length < 4 && (
          <div className="mt-2">
            <SetupAddRow
              value={inputTeam}
              onChange={setInputTeam}
              onAdd={handleAddTeam}
              placeholder="Add a team…"
            />
          </div>
        )}
      </div>

      {/* Difficulty */}
      <div className="mb-5">
        <SetupLabel>Difficulty</SetupLabel>
        <div className="flex gap-2">
          {difficultyOptions.map((opt) => (
            <SetupOptionPill
              key={opt.value}
              selected={difficulty === opt.value}
              onClick={() => setDifficulty(opt.value as "easy" | "medium" | "extreme")}
              accentColor="#06B6D4"
            >
              {opt.emoji} {opt.label}
            </SetupOptionPill>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-white/35">
          {difficultyOptions.find((o) => o.value === difficulty)?.desc}
        </p>
      </div>

      {/* Rounds */}
      <div className="mb-5">
        <SetupLabel>Rounds ({IMAGES_PER_ROUND} images each)</SetupLabel>
        <div className="flex flex-wrap gap-2">
          {roundOptions.map((opt) => (
            <SetupOptionPill
              key={opt.value}
              selected={rounds === opt.value}
              onClick={() => setRounds(opt.value)}
              accentColor="#06B6D4"
            >
              {opt.label}
            </SetupOptionPill>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-white/35">
          {roundOptions.find((o) => o.value === rounds)?.desc} total
        </p>
      </div>

      {/* Category */}
      <div className="mb-7">
        <SetupLabel>Image Category</SetupLabel>
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map((opt) => (
            <SetupOptionPill
              key={opt.value}
              selected={category === opt.value}
              onClick={() => setCategory(opt.value)}
              accentColor="#06B6D4"
            >
              {opt.emoji} {opt.label}
            </SetupOptionPill>
          ))}
        </div>
      </div>

      {/* Start */}
      <SetupStartButton
        onClick={handleStart}
        disabled={teams.length < 2}
        accentFrom="#06B6D4"
        accentTo="#0891B2"
      >
        🖼️ Start · {rounds} Round{rounds > 1 ? "s" : ""} · {rounds * IMAGES_PER_ROUND} Images
      </SetupStartButton>
    </GameSetupShell>
  );
}
