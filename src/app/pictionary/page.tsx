"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { generateRoomCode, DEFAULT_TEAM_NAMES, TEAM_COLORS, type DrawDifficulty } from "@/lib/inkarena";
import GameSetupShell, { SetupStartButton, SetupLabel } from "@/components/GameSetupShell";

const DIFFICULTY_OPTIONS: { value: DrawDifficulty; label: string; desc: string; emoji: string }[] = [
  { value: "easy",   label: "Easy",   desc: "Simple everyday words",      emoji: "🟢" },
  { value: "medium", label: "Medium", desc: "Animals, food, places…",     emoji: "🟡" },
  { value: "hard",   label: "Hard",   desc: "Abstract & tricky concepts",  emoji: "🔴" },
];

export default function PictionaryPage() {
  const router = useRouter();
  const [teamCount, setTeamCount] = useState(2);
  const [teamNames, setTeamNames] = useState<string[]>([...DEFAULT_TEAM_NAMES]);
  const [difficulty, setDifficulty] = useState<DrawDifficulty>("medium");
  const [rounds, setRounds] = useState(3);

  function handleLaunch() {
    const code = generateRoomCode();
    sessionStorage.setItem(
      `ink-arena:${code}`,
      JSON.stringify({
        teamNames: teamNames.slice(0, teamCount).map((n, i) => n.trim() || DEFAULT_TEAM_NAMES[i]),
        teamCount,
        difficulty,
        totalRounds: rounds,
        scores: new Array(teamCount).fill(0),
      })
    );
    router.push(`/ia/${code}`);
  }

  return (
    <GameSetupShell
      title="PICTIONARY"
      emoji="🎨"
      flavour="One phone draws live to TV · Guess fast · Dominate"
      accentFrom="#FF416C"
      accentTo="#FACC15"
      emojiAnimate={{ rotate: [0, -8, 8, -4, 4, 0] }}
      emojiTransition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
    >
      {/* Number of Teams */}
      <div className="mb-6">
        <SetupLabel>Number of Teams</SetupLabel>
        <div className="flex gap-3">
          {[2, 3, 4].map((n) => (
            <motion.button
              key={n}
              whileTap={{ scale: 0.93 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
              onClick={() => setTeamCount(n)}
              className="flex-1 rounded-xl py-3 text-center text-sm font-black uppercase tracking-widest transition-all"
              style={{
                background: teamCount === n ? "rgba(255,65,108,0.14)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${teamCount === n ? "rgba(255,65,108,0.4)" : "rgba(255,255,255,0.07)"}`,
                color: teamCount === n ? "#FF416C" : "rgba(255,255,255,0.35)",
                boxShadow: teamCount === n ? "0 0 20px rgba(255,65,108,0.18)" : "none",
              }}
            >
              {n} Teams
            </motion.button>
          ))}
        </div>
      </div>

      {/* Team Names */}
      <div className="mb-6">
        <SetupLabel>Team Names</SetupLabel>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: teamCount }, (_, i) => {
            const col = TEAM_COLORS[i];
            return (
              <div
                key={i}
                className="rounded-2xl border px-4 py-3"
                style={{ borderColor: col.border, background: col.bg }}
              >
                <div
                  className="mx-auto mb-2 h-2.5 w-2.5 rounded-full"
                  style={{ background: col.gradient, boxShadow: `0 0 10px ${col.accent}88` }}
                />
                <input
                  value={teamNames[i]}
                  onChange={(e) => {
                    const updated = [...teamNames];
                    updated[i] = e.target.value;
                    setTeamNames(updated);
                  }}
                  onFocus={(e) => { e.target.select(); setTimeout(() => e.target.scrollIntoView({ behavior: "smooth", block: "center" }), 350); }}
                  className="w-full bg-transparent text-center text-sm font-black uppercase tracking-widest outline-none placeholder:text-white/20"
                  style={{ color: col.accent }}
                  placeholder={DEFAULT_TEAM_NAMES[i]}
                  maxLength={16}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Difficulty */}
      <div className="mb-6">
        <SetupLabel>Difficulty</SetupLabel>
        <div className="flex flex-col gap-2">
          {DIFFICULTY_OPTIONS.map((opt) => (
            <motion.button
              key={opt.value}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
              onClick={() => setDifficulty(opt.value)}
              className="flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all"
              style={{
                background: difficulty === opt.value ? "rgba(255,65,108,0.1)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${difficulty === opt.value ? "rgba(255,65,108,0.35)" : "rgba(255,255,255,0.07)"}`,
              }}
            >
              <span className="text-base">{opt.emoji}</span>
              <div>
                <p className="text-sm font-black uppercase tracking-widest" style={{ color: difficulty === opt.value ? "#FF416C" : "rgba(255,255,255,0.6)" }}>
                  {opt.label}
                </p>
                <p className="text-[10px] text-white/30">{opt.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Rounds */}
      <div className="mb-7">
        <SetupLabel>Rounds <span className="text-white/30 normal-case font-normal text-[10px]">(1 round = each team draws once)</span></SetupLabel>
        <div className="flex gap-3">
          {[1, 2, 3, 5].map((n) => (
            <motion.button
              key={n}
              whileTap={{ scale: 0.93 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
              onClick={() => setRounds(n)}
              className="flex-1 rounded-xl py-3 text-center text-sm font-black uppercase tracking-widest transition-all"
              style={{
                background: rounds === n ? "rgba(255,65,108,0.14)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${rounds === n ? "rgba(255,65,108,0.4)" : "rgba(255,255,255,0.07)"}`,
                color: rounds === n ? "#FF416C" : "rgba(255,255,255,0.35)",
                boxShadow: rounds === n ? "0 0 20px rgba(255,65,108,0.18)" : "none",
              }}
            >
              {n}
            </motion.button>
          ))}
        </div>
        <p className="mt-2 text-center text-[10px] text-white/25">
          {teamCount * rounds} total turns · ~{teamCount * rounds}min
        </p>
      </div>

      {/* How to play */}
      <div className="mb-7">
        <SetupLabel>How It Works</SetupLabel>
        <div
          className="rounded-2xl border px-5 py-4"
          style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
        >
          <ul className="space-y-2.5 text-xs leading-relaxed text-white/50">
            <li><span className="mr-2">🖥️</span><strong className="text-white/70">TV / big screen</strong> — open this game URL here</li>
            <li><span className="mr-2">✏️</span><strong className="text-white/70">Drawer</strong> — scan the QR code, draw on their phone</li>
            <li><span className="mr-2">🎯</span><strong className="text-white/70">Guessers</strong> — scan the other QR, tap "We got it!" when correct</li>
            <li><span className="mr-2">🔄</span><strong className="text-white/70">Turns</strong> — each team draws once per round, then rotate</li>
          </ul>
        </div>
      </div>

      {/* Launch */}
      <SetupStartButton onClick={handleLaunch} accentFrom="#FF416C" accentTo="#FACC15">
        🎨 Launch · {teamCount} Teams · {rounds} Round{rounds !== 1 ? "s" : ""}
      </SetupStartButton>
    </GameSetupShell>
  );
}
