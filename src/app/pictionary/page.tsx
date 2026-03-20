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
  const [difficulty, setDifficulty] = useState<DrawDifficulty>("medium");
  const [rounds, setRounds] = useState(3);

  function handleLaunch() {
    const code = generateRoomCode();
    sessionStorage.setItem(
      `ink-arena:${code}`,
      JSON.stringify({
        teamNames: DEFAULT_TEAM_NAMES.slice(0, teamCount),
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
      flavour="One phone draws to TV · Shout the answer · Score"
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

        {/* Team colour badges */}
        <div className="mt-3 flex justify-center gap-2">
          {Array.from({ length: teamCount }, (_, i) => {
            const col = TEAM_COLORS[i];
            return (
              <div key={i} className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1"
                style={{ borderColor: col.border, background: col.bg }}>
                <div className="h-2 w-2 rounded-full" style={{ background: col.gradient }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: col.accent }}>
                  {DEFAULT_TEAM_NAMES[i]}
                </span>
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
            <li><span className="mr-2">🖥️</span><strong className="text-white/70">TV</strong> — shows the canvas, scores & "We Got It!" button</li>
            <li><span className="mr-2">📱</span><strong className="text-white/70">One phone</strong> — scan the QR to draw live on the TV</li>
            <li><span className="mr-2">🗣️</span><strong className="text-white/70">Guessers</strong> — shout the answer! Press "We Got It!" on the TV</li>
            <li><span className="mr-2">🔄</span><strong className="text-white/70">Turns</strong> — Red Team goes first, then Blue, etc.</li>
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
