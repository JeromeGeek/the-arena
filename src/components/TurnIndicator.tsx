"use client";

import { motion } from "framer-motion";

interface TurnIndicatorProps {
  team: "red" | "blue";
  redRemaining: number;
  blueRemaining: number;
}

export default function TurnIndicator({ team, redRemaining, blueRemaining }: TurnIndicatorProps) {
  const isRed = team === "red";

  return (
    <motion.div
      layout
      className="relative z-20 mx-auto mb-6 flex items-center gap-6 overflow-hidden rounded-2xl px-8 py-4"
      style={{
        background: isRed
          ? "linear-gradient(135deg, rgba(255,65,108,0.15), rgba(255,75,43,0.08))"
          : "linear-gradient(135deg, rgba(0,180,219,0.15), rgba(0,131,176,0.08))",
        border: `1px solid ${isRed ? "rgba(255,65,108,0.25)" : "rgba(0,180,219,0.25)"}`,
        boxShadow: isRed
          ? "0 0 40px rgba(255,65,108,0.15), 0 0 80px rgba(255,65,108,0.05)"
          : "0 0 40px rgba(0,180,219,0.15), 0 0 80px rgba(0,180,219,0.05)",
      }}
      animate={{
        boxShadow: isRed
          ? [
              "0 0 30px rgba(255,65,108,0.1), 0 0 60px rgba(255,65,108,0.03)",
              "0 0 50px rgba(255,65,108,0.2), 0 0 100px rgba(255,65,108,0.06)",
              "0 0 30px rgba(255,65,108,0.1), 0 0 60px rgba(255,65,108,0.03)",
            ]
          : [
              "0 0 30px rgba(0,180,219,0.1), 0 0 60px rgba(0,180,219,0.03)",
              "0 0 50px rgba(0,180,219,0.2), 0 0 100px rgba(0,180,219,0.06)",
              "0 0 30px rgba(0,180,219,0.1), 0 0 60px rgba(0,180,219,0.03)",
            ],
      }}
      transition={{
        boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        layout: { type: "spring", stiffness: 300, damping: 25 },
      }}
    >
      {/* Pulse Dot */}
      <motion.div
        className="h-3 w-3 rounded-full"
        style={{
          background: isRed
            ? "linear-gradient(135deg, #FF416C, #FF4B2B)"
            : "linear-gradient(135deg, #00B4DB, #0083B0)",
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Team Label */}
      <motion.span
        key={team}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-sm font-bold uppercase tracking-[0.3em]"
        style={{
          fontFamily: "var(--font-syne), var(--font-display)",
          color: isRed ? "#FF416C" : "#00B4DB",
        }}
      >
        {isRed ? "Red" : "Blue"} Team Turn
      </motion.span>

      {/* Divider */}
      <div className="h-6 w-px bg-white/10" />

      {/* Score Counters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-[#FF416C] to-[#FF4B2B]" />
          <span className="text-sm font-bold text-[#FF416C]">{redRemaining}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-[#00B4DB] to-[#0083B0]" />
          <span className="text-sm font-bold text-[#00B4DB]">{blueRemaining}</span>
        </div>
      </div>
    </motion.div>
  );
}
