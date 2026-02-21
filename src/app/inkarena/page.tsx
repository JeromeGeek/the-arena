"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generateRoomCode } from "@/lib/inkarena";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function PictionaryPage() {
  const router = useRouter();

  function handleLaunch() {
    const code = generateRoomCode();
    sessionStorage.setItem(
      `ink-arena:${code}`,
      JSON.stringify({
        redName: "Red Team",
        blueName: "Blue Team",
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
      </div>

      <div className="relative z-10 w-full max-w-md">
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
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="mb-10 text-center">
          <p className="mb-2 text-[11px] uppercase tracking-[0.4em] text-white/30">Team Drawing Game</p>
          <h1
            className="text-5xl font-black uppercase tracking-[0.12em] sm:text-6xl"
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
              Pictionary
            </span>
          </h1>
          <p className="mt-2 text-sm text-white/40">Draw · Guess · Steal · Dominate</p>
        </motion.div>

        {/* Teams */}
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="mb-6 grid grid-cols-2 gap-3">
          <div
            className="rounded-2xl border border-[rgba(255,65,108,0.25)] bg-white/[0.03] px-5 py-4 text-center"
            style={{ boxShadow: "0 0 30px rgba(255,65,108,0.06)" }}
          >
            <div className="mx-auto mb-2 h-3 w-3 rounded-full" style={{ background: "linear-gradient(135deg,#FF416C,#FF4B2B)", boxShadow: "0 0 10px rgba(255,65,108,0.6)" }} />
            <p className="text-sm font-black uppercase tracking-widest" style={{ color: "#FF416C" }}>Red Team</p>
          </div>
          <div
            className="rounded-2xl border border-[rgba(0,180,219,0.25)] bg-white/[0.03] px-5 py-4 text-center"
            style={{ boxShadow: "0 0 30px rgba(0,180,219,0.06)" }}
          >
            <div className="mx-auto mb-2 h-3 w-3 rounded-full" style={{ background: "linear-gradient(135deg,#00B4DB,#0083B0)", boxShadow: "0 0 10px rgba(0,180,219,0.6)" }} />
            <p className="text-sm font-black uppercase tracking-widest" style={{ color: "#00B4DB" }}>Blue Team</p>
          </div>
        </motion.div>

        {/* How to play */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-6 rounded-2xl border border-white/8 bg-white/[0.02] px-5 py-4"
        >
          <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-white/30">How to play</p>
          <ul className="space-y-2 text-xs text-white/50 leading-relaxed">
            <li>🖥️ <strong className="text-white/70">TV / big screen</strong> — open the game URL here</li>
            <li>✏️ <strong className="text-white/70">Drawer</strong> — scan the QR code, draw on their phone</li>
            <li>🎯 <strong className="text-white/70">Guessers</strong> — scan the other QR, type guesses</li>
            <li>⚡ <strong className="text-white/70">Steal</strong> — opposing team can steal points mid-round</li>
            <li>🏆 First to <strong className="text-white/70">1000 pts</strong> wins</li>
          </ul>
        </motion.div>

        {/* Launch */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
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
            🎨 Launch Pictionary
          </motion.button>
        </motion.div>
      </div>
    </main>
  );
}