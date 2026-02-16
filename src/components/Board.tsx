"use client";

import { motion } from "framer-motion";
import AgentCard from "./AgentCard";
import type { GameCard } from "@/lib/codenames";

interface BoardProps {
  cards: GameCard[];
  isSpymaster: boolean;
  onReveal: (index: number) => void;
  disabled: boolean;
  shaking: boolean;
}

export default function Board({ cards, isSpymaster, onReveal, disabled, shaking }: BoardProps) {
  return (
    <motion.div
      className={`mx-auto grid h-full w-full max-w-5xl grid-cols-5 grid-rows-4 content-stretch gap-1 px-1 sm:gap-2 sm:px-2 md:gap-3 lg:gap-4 ${
        shaking ? "screen-shake" : ""
      }`}
    >
      {cards.map((card, i) => (
        <AgentCard
          key={`${card.word}-${i}`}
          card={card}
          index={i}
          isSpymaster={isSpymaster}
          onReveal={onReveal}
          disabled={disabled}
        />
      ))}
    </motion.div>
  );
}
