// ── Ink Arena: PartyKit real-time transport ──
// Replaces Supabase Realtime — unlimited rooms, unlimited messages, free forever.
//
// Usage:
//   const socket = createInkSocket("ROOM123", (msg) => { ... });
//   socket.send(JSON.stringify({ type: "stroke", ... }));
//   socket.close();
//
// In dev:  connects to localhost:1999
// In prod: connects to NEXT_PUBLIC_PARTYKIT_HOST (e.g. the-arena-ink.yourname.partykit.dev)

import PartySocket from "partysocket";

export const PARTYKIT_HOST =
  process.env.NEXT_PUBLIC_PARTYKIT_HOST ??
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "localhost:1999"
    : "");

export const isPartyKitConfigured = Boolean(PARTYKIT_HOST);

export type MessageHandler = (data: unknown) => void;

/**
 * Creates a PartySocket connection to an Ink Arena room.
 * @param roomCode  6-char game room code
 * @param onMessage callback fired for every inbound message
 */
export function createInkSocket(
  roomCode: string,
  onMessage: MessageHandler,
): PartySocket {
  const socket = new PartySocket({
    host: PARTYKIT_HOST,
    room: `ink-arena-${roomCode.toUpperCase()}`,
    party: "default",
  });

  socket.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data as string);
      onMessage(data);
    } catch {
      // ignore malformed messages
    }
  });

  return socket;
}

/**
 * Send a typed message over an existing socket.
 */
export function sendMessage(socket: PartySocket | null, payload: unknown) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify(payload));
}
