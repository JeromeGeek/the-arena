"use client";

import { useCallback, useState } from "react";

const STORAGE_KEY = "the-arena-sound-enabled";

/**
 * Hook that provides a mute/unmute toggle for sound effects.
 * State persists to localStorage.
 */
export function useSoundEnabled() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== null ? stored === "true" : true;
  });

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return { soundEnabled: enabled, toggleSound: toggle };
}

/**
 * Returns a wrapped version of any sound function that
 * respects the enabled flag.
 */
export function useSound<T extends (...args: never[]) => void>(
  soundFn: T,
  enabled: boolean,
): T {
  const wrapped = useCallback(
    (...args: Parameters<T>) => { if (enabled) soundFn(...args); },
    [soundFn, enabled],
  );
  return wrapped as unknown as T;
}
