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

export function getPartyKitHost(): string {
  // Always read at call-time so it works both SSR and client
  if (typeof window === "undefined") return "";
  const envHost = process.env.NEXT_PUBLIC_PARTYKIT_HOST;
  if (envHost) return envHost;
  if (window.location.hostname === "localhost") return "localhost:1999";
  return "";
}

export const isPartyKitConfigured =
  Boolean(process.env.NEXT_PUBLIC_PARTYKIT_HOST) ||
  (typeof window !== "undefined" && window.location.hostname === "localhost");

/** Runtime check — safe to call from useEffect/client code */
export function checkPartyKitConfigured(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(process.env.NEXT_PUBLIC_PARTYKIT_HOST) || window.location.hostname === "localhost";
}

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
  const host = getPartyKitHost();
  const socket = new PartySocket({
    host,
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
 * If the socket is still connecting, queues the message until it opens.
 */
export function sendMessage(socket: PartySocket | null, payload: unknown) {
  if (!socket) return;
  const json = JSON.stringify(payload);
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(json);
  } else if (socket.readyState === WebSocket.CONNECTING) {
    // Queue until open
    const handler = () => {
      socket.send(json);
      socket.removeEventListener("open", handler);
    };
    socket.addEventListener("open", handler);
  }
  // CLOSING / CLOSED — drop silently
}
