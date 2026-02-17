"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { GameCard as GameCardType, CardType } from "@/lib/codenames";

interface AgentCardProps {
  card: GameCardType;
  index: number;
  isSpymaster: boolean;
  onReveal: (index: number) => void;
  disabled: boolean;
}

const typeStyles: Record<CardType, { bg: string; glow: string; text: string }> = {
  red: {
    bg: "linear-gradient(135deg, #FF416C, #FF4B2B)",
    glow: "0 0 30px rgba(255,65,108,0.5), 0 0 60px rgba(255,65,108,0.15)",
    text: "#fff",
  },
  blue: {
    bg: "linear-gradient(135deg, #00B4DB, #0083B0)",
    glow: "0 0 30px rgba(0,180,219,0.5), 0 0 60px rgba(0,180,219,0.15)",
    text: "#fff",
  },
  bystander: {
    bg: "linear-gradient(135deg, #374151, #4B5563)",
    glow: "0 0 15px rgba(107,114,128,0.2)",
    text: "#d1d5db",
  },
  assassin: {
    bg: "linear-gradient(135deg, #7C3AED, #4C1D95)",
    glow: "0 0 40px rgba(124,58,237,0.6), 0 0 80px rgba(124,58,237,0.2)",
    text: "#E9D5FF",
  },
};

const spymasterOverlay: Record<CardType, string> = {
  red: "rgba(255,65,108,0.2)",
  blue: "rgba(0,180,219,0.2)",
  bystander: "rgba(107,114,128,0.12)",
  assassin: "rgba(124,58,237,0.25)",
};

const spymasterBorder: Record<CardType, string> = {
  red: "rgba(255,65,108,0.35)",
  blue: "rgba(0,180,219,0.35)",
  bystander: "rgba(107,114,128,0.2)",
  assassin: "rgba(124,58,237,0.45)",
};

export default function AgentCard({
  card,
  index,
  isSpymaster,
  onReveal,
  disabled,
}: AgentCardProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const style = typeStyles[card.type];

  function handleClick() {
    if (disabled || card.revealed || isSpymaster || isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => {
      onReveal(index);
      setIsFlipping(false);
    }, 450);
  }

  const isRevealed = card.revealed;
  const canInteract = !disabled && !isRevealed && !isSpymaster;

  return (
    <motion.div
      className="perspective-1000 w-full"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.015, duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
    >
      <motion.div
        className="preserve-3d relative h-full w-full cursor-pointer"
        style={{ willChange: isRevealed || isFlipping ? "transform" : "auto" }}
        animate={{ rotateY: isRevealed || isFlipping ? 180 : 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        onClick={handleClick}
        whileHover={canInteract ? { y: -6, scale: 1.03 } : undefined}
        whileTap={canInteract ? { scale: 0.95 } : undefined}
      >
        {/* Front Face — Unrevealed */}
        <div
          className="backface-hidden absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg border transition-all duration-300 sm:rounded-2xl"
          style={{
            background: isSpymaster
              ? spymasterOverlay[card.type]
              : "linear-gradient(145deg, rgba(30,35,50,0.9), rgba(20,24,36,0.95))",
            borderColor: isSpymaster
              ? spymasterBorder[card.type]
              : canInteract
              ? "rgba(255,255,255,0.12)"
              : "rgba(255,255,255,0.08)",
            boxShadow: isSpymaster
              ? `inset 0 0 20px ${spymasterOverlay[card.type]}`
              : "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          {/* Metal Sheen */}
          {!isSpymaster && (
            <div className="sheen-sweep pointer-events-none absolute inset-0" />
          )}

          {/* Spymaster Type Indicator */}
          {isSpymaster && (
            <div
              className="absolute right-2 top-2 h-2 w-2 rounded-full"
              style={{
                background: typeStyles[card.type].bg,
                boxShadow: `0 0 8px ${spymasterOverlay[card.type]}`,
              }}
            />
          )}

          {/* Word */}
          <span
            className="select-none px-1 text-center text-[10px] font-semibold uppercase tracking-[0.1em] sm:px-2 sm:text-sm sm:tracking-[0.15em] md:text-base lg:text-lg"
            style={{
              color: isSpymaster ? spymasterBorder[card.type] : "rgba(255,255,255,0.85)",
              fontFamily: "var(--font-sans)",
              textShadow: isSpymaster ? "none" : "0 1px 3px rgba(0,0,0,0.3)",
            }}
          >
            {card.word}
          </span>
        </div>

        {/* Back Face — Revealed */}
        <div
          className="backface-hidden rotate-y-180 absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg border border-white/10 sm:rounded-2xl"
          style={{
            background: style.bg,
            boxShadow: style.glow,
          }}
        >
          {/* Assassin Skull */}
          {card.type === "assassin" && (
            <div className="absolute inset-0 flex items-center justify-center text-3xl opacity-10 sm:text-6xl">
              ☠
            </div>
          )}

          <span
            className="select-none px-1 text-center text-[10px] font-bold uppercase tracking-[0.1em] sm:px-2 sm:text-sm sm:tracking-[0.15em] md:text-base lg:text-lg"
            style={{ color: style.text, textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
          >
            {card.word}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
