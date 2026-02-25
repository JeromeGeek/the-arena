"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { generateSeed, seedToSlug } from "@/lib/gamecodes";
import { headRushCategories } from "@/lib/headrush";
import GameSetupShell, {
  SetupLabel,
  SetupAddRow,
  SetupOptionPill,
  SetupStartButton,
} from "@/components/GameSetupShell";

const timerOptions = [
  { value: 45, label: "45s", emoji: "⚡" },
  { value: 60, label: "60s", emoji: "⏱️" },
];

const roundOptions = [
  { value: 2, label: "2", emoji: "✌️" },
  { value: 4, label: "4", emoji: "🔥" },
  { value: 6, label: "6", emoji: "💪" },
  { value: 8, label: "8", emoji: "🏆" },
];

const categoryOptions = [
  { value: "random", label: "Random Mix", emoji: "🎲" },
  ...headRushCategories
    .filter((c) => c.name !== "Random")
    .map((c) => ({ value: c.name.toLowerCase().replace(/\s+/g, "-"), label: c.name, emoji: c.emoji })),
  { value: "random-all", label: "Everything", emoji: "🌀" },
];

const TEAM_COLORS = [
  { bg: "rgba(255,65,108,0.12)", border: "rgba(255,65,108,0.4)", text: "#FF416C" },
  { bg: "rgba(0,180,219,0.12)", border: "rgba(0,180,219,0.4)", text: "#00B4DB" },
  { bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.4)", text: "#A855F7" },
  { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.4)", text: "#22C55E" },
];

export default function HeadRushSetupPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<string[]>(["Team 1", "Team 2"]);
  const [inputTeam, setInputTeam] = useState("");
  const [timer, setTimer] = useState(60);
  const [rounds, setRounds] = useState(4);
  const [category, setCategory] = useState("random");

  function handleAddTeam() {
    if (inputTeam.trim() && teams.length < 4) {
      setTeams((prev) => [...prev, inputTeam.trim()]);
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
    // code: teamCount-timer-rounds-category-slug
    const code = `${teams.length}-${timer}-${rounds}-${category}-${slug}`;
    const teamsParam = encodeURIComponent(teams.join(","));
    router.push(`/hr/${code}?teams=${teamsParam}`);
  }

  return (
    <GameSetupShell
      title="HEADRUSH"
      emoji="🎯"
      subtitle="Tilt · Guess · Dominate"
      flavour="Hold phone to forehead · Teammates shout clues · Tilt to score"
      accentFrom="#FACC15"
      accentTo="#CA8A04"
      emojiAnimate={{ y: [0, -6, 1, 0], rotate: [0, -8, 8, 0] }}
      emojiTransition={{ duration: 1.8, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
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

      {/* Timer */}
      <div className="mb-5">
        <SetupLabel>Round Time</SetupLabel>
        <div className="flex gap-2">
          {timerOptions.map((opt) => (
            <SetupOptionPill
              key={opt.value}
              selected={timer === opt.value}
              onClick={() => setTimer(opt.value)}
              accentColor="#FACC15"
            >
              {opt.emoji} {opt.label}
            </SetupOptionPill>
          ))}
        </div>
      </div>

      {/* Rounds */}
      <div className="mb-5">
        <SetupLabel>Total Rounds</SetupLabel>
        <div className="flex flex-wrap gap-2">
          {roundOptions.map((opt) => (
            <SetupOptionPill
              key={opt.value}
              selected={rounds === opt.value}
              onClick={() => setRounds(opt.value)}
              accentColor="#FACC15"
            >
              {opt.emoji} {opt.label}
            </SetupOptionPill>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="mb-7">
        <SetupLabel>Word Category</SetupLabel>
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map((opt) => (
            <SetupOptionPill
              key={opt.value}
              selected={category === opt.value}
              onClick={() => setCategory(opt.value)}
              accentColor="#FACC15"
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
        accentFrom="#FACC15"
        accentTo="#CA8A04"
      >
        � Start HeadRush · {teams.length} Teams
      </SetupStartButton>
    </GameSetupShell>
  );
}
