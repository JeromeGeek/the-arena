"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generateSeed, seedToSlug } from "@/lib/gamecodes";
import { headRushCategories } from "@/lib/headrush";

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

function OptionPill({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      onClick={onClick}
      className="rounded-xl border px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-all"
      style={{
        borderColor: selected ? "#FACC15" : "rgba(255,255,255,0.1)",
        background: selected ? "rgba(250,204,21,0.12)" : "rgba(255,255,255,0.03)",
        color: selected ? "#FACC15" : "rgba(255,255,255,0.4)",
        boxShadow: selected ? "0 0 16px rgba(250,204,21,0.15)" : "none",
      }}
    >
      {children}
    </motion.button>
  );
}

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
    <main className="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-10 bg-[#0B0E14]">
      {/* Back */}
      <div className="absolute top-4 left-4">
        <Link
          href="/"
          className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 transition-colors hover:text-white/60"
        >
          ← The Arena
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <p className="mb-1 text-3xl">🎭</p>
          <h1
            className="text-3xl font-black uppercase tracking-[0.15em]"
            style={{
              fontFamily: "var(--font-syne), var(--font-display)",
              backgroundImage: "linear-gradient(135deg, #FACC15, #F97316)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            HeadRush
          </h1>
          <p className="mt-1 text-xs text-white/30 tracking-widest uppercase">
            2 Teams · Tilt to Guess · Race the Clock
          </p>
        </div>

        {/* Teams */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">Teams</p>
          <div className="space-y-2">
            {teams.map((name, i) => {
              const col = TEAM_COLORS[i % TEAM_COLORS.length];
              return (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border px-3 py-2.5"
                  style={{ borderColor: col.border, background: col.bg }}
                >
                  <span className="text-sm font-bold" style={{ color: col.text }}>
                    {name}
                  </span>
                  {teams.length > 2 && (
                    <button
                      onClick={() => handleRemoveTeam(i)}
                      className="text-xs text-white/20 hover:text-white/50 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {teams.length < 4 && (
            <div className="flex gap-2">
              <input
                value={inputTeam}
                onChange={(e) => setInputTeam(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTeam()}
                placeholder="Add a team…"
                maxLength={20}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white placeholder:text-white/20 outline-none focus:border-white/25 transition-colors"
              />
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleAddTeam}
                disabled={!inputTeam.trim()}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-white/50 disabled:opacity-30 transition-all hover:border-white/20"
              >
                + Add
              </motion.button>
            </div>
          )}
        </div>

        {/* Timer */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">Round Time</p>
          <div className="flex gap-2">
            {timerOptions.map((opt) => (
              <OptionPill key={opt.value} selected={timer === opt.value} onClick={() => setTimer(opt.value)}>
                {opt.emoji} {opt.label}
              </OptionPill>
            ))}
          </div>
        </div>

        {/* Rounds */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">Total Rounds</p>
          <div className="flex flex-wrap gap-2">
            {roundOptions.map((opt) => (
              <OptionPill key={opt.value} selected={rounds === opt.value} onClick={() => setRounds(opt.value)}>
                {opt.emoji} {opt.label}
              </OptionPill>
            ))}
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">Word Category</p>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((opt) => (
              <OptionPill key={opt.value} selected={category === opt.value} onClick={() => setCategory(opt.value)}>
                {opt.emoji} {opt.label}
              </OptionPill>
            ))}
          </div>
        </div>

        {/* Start */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={handleStart}
          disabled={teams.length < 2}
          className="w-full rounded-2xl py-4 text-sm font-black uppercase tracking-[0.2em] text-black disabled:opacity-40 transition-opacity"
          style={{
            backgroundImage: "linear-gradient(135deg, #FACC15, #F97316)",
            boxShadow: "0 0 40px rgba(250,204,21,0.25)",
          }}
        >
          🎭 Start Game
        </motion.button>
      </motion.div>
    </main>
  );
}
