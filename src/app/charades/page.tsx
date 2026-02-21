"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generateSeed, seedToSlug } from "@/lib/gamecodes";
import { charadesCategories } from "@/lib/charades";

const categoryEmojis: Record<string, string> = {
  Movies: "🎬",
  Animals: "🐾",
  Actions: "🏃",
  Celebrities: "⭐",
  Professions: "👨‍⚕️",
  Objects: "📦",
  Sports: "⚽",
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
    if (inputTeam.trim() && teams.length < 6) {
      setTeams((prev) => [...prev, inputTeam.trim()]);
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
    <main className="relative min-h-[100dvh] overflow-hidden pb-12">
      {/* Ambient Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(249,115,22,0.04)] blur-[80px]" />
        <div className="absolute right-1/4 top-2/3 h-[300px] w-[300px] rounded-full bg-[rgba(234,88,12,0.03)] blur-[60px]" />
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
          Charades
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
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
              >
                🎭
              </motion.div>
              <h2
                className="mb-2 text-xl font-bold uppercase tracking-[0.15em] text-white/90 sm:text-2xl sm:tracking-[0.25em]"
                style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
              >
                Stage Setup
              </h2>
              <p className="text-sm text-white/30">
                Create teams • Act it out • No talking allowed
              </p>
            </div>

            {/* Team Grid */}
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                  Teams ({teams.length}/6)
                </label>
              </div>

              <div className="space-y-2">
                {teams.map((name, i) => {
                  const color = teamColors[i % teamColors.length];
                  return (
                    <motion.div
                      key={i}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.03 }}
                      className="group flex items-center gap-2 rounded-lg px-3 py-2.5 transition-colors sm:gap-3 sm:rounded-xl sm:px-4 sm:py-3"
                      style={{
                        background: color.bg,
                        border: `1px solid ${color.border}`,
                      }}
                    >
                      <span className="text-lg">{teamEmojis[i % teamEmojis.length]}</span>
                      <input
                        value={name}
                        onChange={(e) => {
                          const updated = [...teams];
                          updated[i] = e.target.value;
                          setTeams(updated);
                        }}
                        className="flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-white/20"
                        style={{ color: color.text }}
                        placeholder="Team name..."
                      />
                      {teams.length > 2 && (
                        <motion.button
                          onClick={() => handleRemoveTeam(i)}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs text-white/15 transition-colors hover:bg-white/[0.05] hover:text-red-400"
                        >
                          ✕
                        </motion.button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Add Team */}
            {teams.length < 6 && (
              <motion.div layout className="mb-6 flex gap-2 sm:mb-8">
                <input
                  value={inputTeam}
                  onChange={(e) => setInputTeam(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTeam()}
                  placeholder={`Add team ${teams.length + 1}...`}
                  className="flex-1 rounded-xl border border-dashed border-white/10 bg-white/[0.01] px-4 py-3 text-sm text-white/80 outline-none placeholder:text-white/20 focus:border-white/25 focus:bg-white/[0.03]"
                />
                <motion.button
                  onClick={handleAddTeam}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-lg font-bold text-white/60 transition-colors hover:bg-white/[0.08]"
                >
                  +
                </motion.button>
              </motion.div>
            )}

            {/* Timer Selection */}
            <div className="mb-6 sm:mb-8">
              <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Timer Per Turn
              </label>
              <div className="flex gap-2 sm:gap-3">
                {timerOptions.map((opt) => (
                  <motion.button
                    key={opt.value}
                    onClick={() => setTimer(opt.value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative flex-1 rounded-lg px-2 py-3 text-center transition-all sm:rounded-xl sm:px-4 sm:py-4"
                    style={{
                      background:
                        timer === opt.value
                          ? "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.05))"
                          : "rgba(255,255,255,0.03)",
                      border: `1px solid ${timer === opt.value ? "rgba(249,115,22,0.4)" : "rgba(255,255,255,0.08)"}`,
                      color: timer === opt.value ? "#F97316" : "rgba(255,255,255,0.35)",
                      boxShadow: timer === opt.value ? "0 0 20px rgba(249,115,22,0.15)" : "none",
                    }}
                  >
                    <span className="block text-2xl">{opt.emoji}</span>
                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-widest">
                      {opt.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Rounds Selection */}
            <div className="mb-6 sm:mb-8">
              <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Number of Rounds
              </label>
              <div className="flex gap-2 sm:gap-3">
                {roundOptions.map((opt) => (
                  <motion.button
                    key={opt.value}
                    onClick={() => setRounds(opt.value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative flex-1 rounded-lg px-2 py-3 text-center transition-all sm:rounded-xl sm:px-4 sm:py-4"
                    style={{
                      background:
                        rounds === opt.value
                          ? "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.05))"
                          : "rgba(255,255,255,0.03)",
                      border: `1px solid ${rounds === opt.value ? "rgba(249,115,22,0.4)" : "rgba(255,255,255,0.08)"}`,
                      color: rounds === opt.value ? "#F97316" : "rgba(255,255,255,0.35)",
                      boxShadow: rounds === opt.value ? "0 0 20px rgba(249,115,22,0.15)" : "none",
                    }}
                  >
                    <span className="block text-2xl">{opt.emoji}</span>
                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-widest">
                      {opt.label} {opt.value === 1 ? "Round" : "Rounds"}
                    </span>
                  </motion.button>
                ))}
              </div>
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
                    className="w-[calc(25%-0.375rem)] rounded-lg px-2 py-2.5 text-center transition-all sm:w-[calc(25%-0.5rem)] sm:rounded-xl sm:px-3 sm:py-3"
                    style={{
                      background:
                        selectedCategory === cat.value
                          ? "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.05))"
                          : "rgba(255,255,255,0.03)",
                      border: `1px solid ${
                        selectedCategory === cat.value
                          ? "rgba(249,115,22,0.4)"
                          : "rgba(255,255,255,0.08)"
                      }`,
                      color:
                        selectedCategory === cat.value ? "#F97316" : "rgba(255,255,255,0.35)",
                      boxShadow:
                        selectedCategory === cat.value
                          ? "0 0 15px rgba(249,115,22,0.1)"
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

            {/* Start Button */}
            <motion.button
              onClick={handleGenerate}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              disabled={teams.length < 2}
              className="w-full rounded-lg bg-gradient-to-r from-[#F97316] to-[#EA580C] px-3 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white shadow-lg transition-shadow hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] disabled:cursor-not-allowed disabled:opacity-40 sm:rounded-xl sm:px-6 sm:py-4 sm:text-sm sm:tracking-[0.2em]"
            >
              Start Game • {teams.length} Teams • {timer}s • {rounds} {rounds === 1 ? "Round" : "Rounds"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
