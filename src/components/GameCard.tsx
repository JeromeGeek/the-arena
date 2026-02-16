"use client";

import { motion } from "framer-motion";

interface GameCardDisplayProps {
  title: string;
  subtitle: string;
  accentFrom: string;
  accentTo: string;
  glowColor: string;
}

export default function GameCardDisplay({
  title,
  subtitle,
  accentFrom,
  accentTo,
  glowColor,
}: GameCardDisplayProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
      <div
        className="mb-4 h-1 w-12 rounded-full"
        style={{ background: `linear-gradient(90deg, ${accentFrom}, ${accentTo})` }}
      />
      <h3
        className="text-lg font-bold uppercase tracking-[0.2em]"
        style={{
          background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {title}
      </h3>
      <p className="mt-1 text-xs uppercase tracking-widest text-white/30">{subtitle}</p>

      {/* Ambient glow */}
      <motion.div
        className="pointer-events-none absolute -inset-4 rounded-3xl opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(ellipse at center, ${glowColor}, transparent 70%)` }}
      />
    </div>
  );
}
