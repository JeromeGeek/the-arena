"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface InfoModalProps {
  game: "codenames" | "imposter";
  size?: "sm" | "md";
}

const instructions = {
  codenames: {
    title: "How to Play",
    steps: [
      "Split into 2 teams — Red & Blue",
      "One person per team is the Spymaster",
      "Spymasters see all card colors",
      "Give a one-word clue + a number",
      "Your team guesses that many cards",
      "Hit the Assassin? Instant lose",
      "First team to find all agents wins!",
    ],
  },
  imposter: {
    title: "How to Play",
    steps: [
      "Pass the phone — each player sees their word",
      "The Imposter sees nothing — they fake it",
      "Everyone describes the word without saying it",
      "Listen carefully for sus answers",
      "Vote out who you think is faking",
      "Crew wins if the Imposter is caught!",
    ],
  },
};

export default function InfoModal({ game, size = "md" }: InfoModalProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const info = instructions[game];
  const accent = game === "codenames" ? "#FF416C" : "#00B4DB";
  const isSmall = size === "sm";

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpen = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  }, []);

  const handleClose = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
  }, []);

  const modal = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — renders at body level via portal */}
          <motion.div
            key="info-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{ position: "fixed", inset: 0, zIndex: 9999 }}
            className="bg-black/70 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            key="info-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl sm:p-8"
              style={{ background: "rgba(11, 14, 20, 0.97)", backdropFilter: "blur(24px)" }}
            >
              {/* Close X button */}
              <div className="mb-4 flex items-center justify-between">
                <h3
                  className="text-lg font-bold uppercase tracking-[0.25em]"
                  style={{
                    fontFamily: "var(--font-syne), var(--font-display)",
                    color: accent,
                  }}
                >
                  {info.title}
                </h3>
                <button
                  onClick={handleClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-white/30 transition-colors hover:bg-white/10 hover:text-white/70"
                >
                  ✕
                </button>
              </div>

              <ol className="space-y-3.5">
                {info.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                      style={{ background: `${accent}20`, color: accent }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-[15px] leading-snug text-white/60" style={{ textWrap: "balance" }}>{step}</span>
                  </li>
                ))}
              </ol>

              <motion.button
                onClick={handleClose}
                whileTap={{ scale: 0.95 }}
                className="mt-6 w-full rounded-xl py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-all"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}99)` }}
              >
                Got It
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Info Button — styled as ? icon */}
      <motion.button
        onClick={handleOpen}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`flex items-center justify-center rounded-full border border-white/15 bg-white/[0.05] text-white/50 transition-colors hover:border-white/25 hover:bg-white/[0.1] hover:text-white/80 ${
          isSmall ? "h-6 w-6" : "h-9 w-9"
        }`}
        style={{ fontWeight: 800, fontSize: isSmall ? "11px" : "15px" }}
        aria-label="Game instructions"
      >
        ?
      </motion.button>

      {/* Portal the modal to document.body so z-index works globally */}
      {mounted && createPortal(modal, document.body)}
    </>
  );
}
