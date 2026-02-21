"use client";

import { motion } from "framer-motion";

interface SoundToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

/**
 * Compact sound toggle button for game headers.
 * Shows 🔊 when on, 🔇 when off.
 */
export default function SoundToggle({ enabled, onToggle }: SoundToggleProps) {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="rounded-lg border border-white/8 bg-white/[0.02] px-2 py-1.5 text-[10px] font-bold text-white/40 transition-colors hover:border-white/15 hover:text-white/60 sm:rounded-xl sm:px-3 sm:py-2 sm:text-xs"
      aria-label={enabled ? "Mute sounds" : "Unmute sounds"}
      title={enabled ? "Sound On" : "Sound Off"}
    >
      {enabled ? "🔊" : "🔇"}
    </motion.button>
  );
}
