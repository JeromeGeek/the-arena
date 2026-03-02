"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateRoomCode } from "@/lib/inkarena";
import GameSetupShell, { SetupStartButton, SetupLabel } from "@/components/GameSetupShell";

export default function PictionaryPage() {
  const router = useRouter();
  const [redName, setRedName] = useState("Red Team");
  const [blueName, setBlueName] = useState("Blue Team");

  function handleLaunch() {
    const code = generateRoomCode();
    sessionStorage.setItem(
      `ink-arena:${code}`,
      JSON.stringify({
        redName: redName.trim() || "Red Team",
        blueName: blueName.trim() || "Blue Team",
        scores: { red: 0, blue: 0 },
        round: 0,
        history: [],
      })
    );
    router.push(`/ia/${code}`);
  }

  return (
    <GameSetupShell
      title="PICTIONARY"
      emoji="🎨"
      subtitle="Draw · Steal · Dominate"
      flavour="One phone draws live to TV · Guess fast · Sabotage harder"
      accentFrom="#FF416C"
      accentTo="#FACC15"
      emojiAnimate={{ rotate: [0, -8, 8, -4, 4, 0] }}
      emojiTransition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
    >
      {/* Teams */}
      <div className="mb-6">
        <SetupLabel>Team Names</SetupLabel>
        <div className="grid grid-cols-2 gap-3">
          {/* Red team */}
          <div
            className="rounded-2xl border px-4 py-3"
            style={{ borderColor: "rgba(255,65,108,0.35)", background: "rgba(255,65,108,0.08)" }}
          >
            <div className="mx-auto mb-2 h-2.5 w-2.5 rounded-full"
              style={{ background: "linear-gradient(135deg,#FF416C,#FF4B2B)", boxShadow: "0 0 10px rgba(255,65,108,0.6)" }} />
            <input
              value={redName}
              onChange={(e) => setRedName(e.target.value)}
              onFocus={(e) => { e.target.select(); setTimeout(() => e.target.scrollIntoView({ behavior: "smooth", block: "center" }), 350); }}
              className="w-full bg-transparent text-center text-sm font-black uppercase tracking-widest outline-none placeholder:text-white/20"
              style={{ color: "#FF416C" }}
              placeholder="Red Team"
            />
          </div>
          {/* Blue team */}
          <div
            className="rounded-2xl border px-4 py-3"
            style={{ borderColor: "rgba(0,180,219,0.35)", background: "rgba(0,180,219,0.08)" }}
          >
            <div className="mx-auto mb-2 h-2.5 w-2.5 rounded-full"
              style={{ background: "linear-gradient(135deg,#00B4DB,#0083B0)", boxShadow: "0 0 10px rgba(0,180,219,0.6)" }} />
            <input
              value={blueName}
              onChange={(e) => setBlueName(e.target.value)}
              onFocus={(e) => { e.target.select(); setTimeout(() => e.target.scrollIntoView({ behavior: "smooth", block: "center" }), 350); }}
              className="w-full bg-transparent text-center text-sm font-black uppercase tracking-widest outline-none placeholder:text-white/20"
              style={{ color: "#00B4DB" }}
              placeholder="Blue Team"
            />
          </div>
        </div>
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
            <li><span className="mr-2">🎯</span><strong className="text-white/70">Guessers</strong> — scan the other QR, type guesses</li>
            <li><span className="mr-2">⚡</span><strong className="text-white/70">Steal</strong> — opposing team can steal points mid-round</li>
            <li><span className="mr-2">🏆</span>First to <strong className="text-white/70">1000 pts</strong> wins</li>
          </ul>
        </div>
      </div>

      {/* Launch */}
      <SetupStartButton onClick={handleLaunch} accentFrom="#FF416C" accentTo="#FACC15">
        🎨 Launch Pictionary
      </SetupStartButton>
    </GameSetupShell>
  );
}
