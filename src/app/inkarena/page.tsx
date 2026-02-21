"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generateRoomCode } from "@/lib/inkarena";
import { isSupabaseConfigured } from "@/lib/supabase";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function InkArenaPage() {
  const router = useRouter();
  const [redName, setRedName] = useState("Red Team");
  const [blueName, setBlueName] = useState("Blue Team");
  const [redCount, setRedCount] = useState(3);
  const [blueCount, setBlueCount] = useState(3);

  function handleLaunch() {
    const code = generateRoomCode();
    // Store team config in sessionStorage so TV page can read it
    sessionStorage.setItem(
      `ink-arena:${code}`,
      JSON.stringify({
        redName,
        blueName,
        redCount,
        blueCount,
        scores: { red: 0, blue: 0 },
        round: 0,
        history: [],
      })
    );
    router.push(`/ia/${code}`);
  }

  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-center px-4 py-8">
      {/* Ambient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/3 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(255,65,108,0.06)] blur-[80px]" />
        <div className="absolute bottom-1/3 right-1/4 h-80 w-80 translate-x-1/2 translate-y-1/2 rounded-full bg-[rgba(0,180,219,0.06)] blur-[80px]" />
        <div className="absolute left-1/2 top-1/2 h-60 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(236,72,153,0.04)] blur-[60px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Back */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <Link
            href="/"
            className="mb-8 flex w-fit items-center gap-2 text-xs uppercase tracking-widest text-white/30 transition-colors hover:text-white/60"
          >
            ← Back to Arena
          </Link>
        </motion.div>

        {/* Title */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="mb-8 text-center">
          <p className="mb-2 text-[11px] uppercase tracking-[0.4em] text-white/30">Party Drawing Game</p>
          <h1
            className="text-4xl font-black uppercase tracking-[0.12em] sm:text-5xl md:text-6xl"
            style={{ fontFamily: "var(--font-syne), var(--font-display)" }}
          >
            <span
              style={{
                backgroundImage: "linear-gradient(135deg, #FF416C, #00B4DB)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              INK ARENA
            </span>
          </h1>
          <p className="mt-2 text-sm text-white/40">Team Clash · Draw · Steal · Dominate</p>
        </motion.div>

        {/* Supabase warning */}
        {!isSupabaseConfigured && (
          <motion.div
            custom={1.5}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3"
          >
            <p className="text-xs text-yellow-400/80">
              ⚠️ <strong>Real-time drawing requires Supabase.</strong> Add{" "}
              <code className="rounded bg-white/10 px-1 text-yellow-300">NEXT_PUBLIC_SUPABASE_URL</code> &amp;{" "}
              <code className="rounded bg-white/10 px-1 text-yellow-300">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
              <code className="rounded bg-white/10 px-1 text-yellow-300">.env.local</code>.{" "}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-yellow-300"
              >
                Get a free project →
              </a>
            </p>
          </motion.div>
        )}

        {/* Team Config */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Red Team */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="relative rounded-2xl border border-[rgba(255,65,108,0.25)] bg-white/[0.03] p-5"
            style={{ boxShadow: "0 0 30px rgba(255,65,108,0.06)" }}
          >
            <div className="mb-3 h-0.5 w-10 rounded-full bg-gradient-to-r from-[#FF416C] to-[#FF4B2B]" />
            <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">
              Team Name
            </label>
            <input
              value={redName}
              onChange={(e) => setRedName(e.target.value)}
              maxLength={20}
              className="mb-4 w-full rounded-lg border border-[rgba(255,65,108,0.2)] bg-transparent px-3 py-2 text-sm font-semibold text-white outline-none placeholder:text-white/20 focus:border-[rgba(255,65,108,0.5)] transition-colors"
              placeholder="Red Team"
            />
            <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">
              Players
            </label>
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                onClick={() => setRedCount((n) => Math.max(2, n - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(255,65,108,0.2)] text-sm text-white/60 transition-colors hover:border-[rgba(255,65,108,0.4)] hover:text-white"
              >
                −
              </motion.button>
              <span className="w-4 text-center text-sm font-bold text-white">{redCount}</span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                onClick={() => setRedCount((n) => Math.min(6, n + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(255,65,108,0.2)] text-sm text-white/60 transition-colors hover:border-[rgba(255,65,108,0.4)] hover:text-white"
              >
                +
              </motion.button>
            </div>
          </motion.div>

          {/* Blue Team */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="relative rounded-2xl border border-[rgba(0,180,219,0.25)] bg-white/[0.03] p-5"
            style={{ boxShadow: "0 0 30px rgba(0,180,219,0.06)" }}
          >
            <div className="mb-3 h-0.5 w-10 rounded-full bg-gradient-to-r from-[#00B4DB] to-[#0083B0]" />
            <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">
              Team Name
            </label>
            <input
              value={blueName}
              onChange={(e) => setBlueName(e.target.value)}
              maxLength={20}
              className="mb-4 w-full rounded-lg border border-[rgba(0,180,219,0.2)] bg-transparent px-3 py-2 text-sm font-semibold text-white outline-none placeholder:text-white/20 focus:border-[rgba(0,180,219,0.5)] transition-colors"
              placeholder="Blue Team"
            />
            <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">
              Players
            </label>
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                onClick={() => setBlueCount((n) => Math.max(2, n - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(0,180,219,0.2)] text-sm text-white/60 transition-colors hover:border-[rgba(0,180,219,0.4)] hover:text-white"
              >
                −
              </motion.button>
              <span className="w-4 text-center text-sm font-bold text-white">{blueCount}</span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                onClick={() => setBlueCount((n) => Math.min(6, n + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(0,180,219,0.2)] text-sm text-white/60 transition-colors hover:border-[rgba(0,180,219,0.4)] hover:text-white"
              >
                +
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* How to play */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-5 rounded-2xl border border-white/8 bg-white/[0.02] px-5 py-4"
        >
          <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-white/30">How to play</p>
          <ul className="space-y-1.5 text-xs text-white/50 leading-relaxed">
            <li>🖥️ <strong className="text-white/70">TV</strong> shows the canvas + scoreboard. Open on your TV/big screen.</li>
            <li>📱 <strong className="text-white/70">Drawer</strong> opens the draw link on their phone and sketches live.</li>
            <li>👥 <strong className="text-white/70">Guessers</strong> join and type their guesses — first correct = points!</li>
            <li>⚡ <strong className="text-white/70">Steal Mode:</strong> Opposing team can steal 50 pts if they guess correctly.</li>
            <li>🏆 First team to <strong className="text-white/70">1000 points</strong> wins!</li>
          </ul>
        </motion.div>

        {/* Launch */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="mt-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={handleLaunch}
            className="relative w-full overflow-hidden rounded-2xl px-8 py-4 text-sm font-black uppercase tracking-[0.2em] text-white"
            style={{
              background: "linear-gradient(135deg, #FF416C 0%, #a855f7 50%, #00B4DB 100%)",
              boxShadow: "0 0 40px rgba(255,65,108,0.3), 0 0 80px rgba(0,180,219,0.15)",
            }}
          >
            <span className="relative z-10">🎨 Launch Ink Arena</span>
            {/* Sheen */}
            <motion.div
              className="absolute inset-0 -skew-x-12 opacity-0"
              style={{ background: "linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.15) 50%, transparent 80%)" }}
              whileHover={{ opacity: 1, x: ["-100%", "200%"] }}
              transition={{ duration: 0.6 }}
            />
          </motion.button>
        </motion.div>
      </div>
    </main>
  );
}
