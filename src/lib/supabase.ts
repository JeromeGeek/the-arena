// Supabase Realtime client for Ink Arena
// Uses environment variables — set in .env.local

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function getInkArenaChannel(roomCode: string) {
  if (!supabase) return null;
  return supabase.channel(`ink-arena:${roomCode}`, {
    config: { broadcast: { self: false } },
  });
}
