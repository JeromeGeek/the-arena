import type * as Party from "partykit/server";

// ── Ink Arena PartyKit Server ──
// One room = one game session (keyed by room code)
// Broadcasts all messages to every connection except the sender

export default class InkArenaServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onMessage(message: string, sender: Party.Connection) {
    // Broadcast to all OTHER connections in the room
    this.room.broadcast(message, [sender.id]);
  }

  onConnect(conn: Party.Connection) {
    // Send current connection count so TV can show player count
    const count = [...this.room.getConnections()].length;
    this.room.broadcast(
      JSON.stringify({ type: "connection_count", count }),
    );
  }

  onClose(conn: Party.Connection) {
    const count = [...this.room.getConnections()].length;
    this.room.broadcast(
      JSON.stringify({ type: "connection_count", count }),
    );
  }
}

InkArenaServer satisfies Party.Worker;
