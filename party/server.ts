import type * as Party from "partykit/server";

// ── Ink Arena PartyKit Server ──
// One room = one game session (keyed by room code)
// Stores active-round state so late-joining clients can catch up.

interface RoundState {
  word: string;
  drawingTeam: "red" | "blue";
  roundNumber: number;
  phase: "lobby" | "drawing" | "round_over" | "game_over";
  timeLeft: number;
  startedAt: number; // Date.now() when round began
}

export default class InkArenaServer implements Party.Server {
  private round: RoundState | null = null;

  constructor(readonly room: Party.Room) {}

  onMessage(message: string, sender: Party.Connection) {
    try {
      const msg = JSON.parse(message) as Record<string, unknown>;

      // Track server-side round state so late joiners can sync
      if (msg.type === "round_start") {
        this.round = {
          word: msg.word as string,
          drawingTeam: msg.drawingTeam as "red" | "blue",
          roundNumber: msg.roundNumber as number,
          phase: "drawing",
          timeLeft: msg.timeLeft as number ?? 45,
          startedAt: Date.now(),
        };
      }
      if (msg.type === "correct_guess" || msg.type === "time_up") {
        if (this.round) this.round.phase = "round_over";
      }
      if (msg.type === "game_over") {
        if (this.round) this.round.phase = "game_over";
      }
      if (msg.type === "lobby_reset") {
        this.round = null;
      }
    } catch {
      // ignore parse errors
    }

    // Broadcast to all OTHER connections in the room
    this.room.broadcast(message, [sender.id]);
  }

  onConnect(conn: Party.Connection) {
    const allConns = [...this.room.getConnections()];
    const count = allConns.length;
    const countMsg = JSON.stringify({ type: "connection_count", count });

    // Tell everyone the new connection count (including the new connection itself)
    this.room.broadcast(countMsg);
    conn.send(countMsg);

    // If a round was paused, resume it now that someone reconnected
    if (this.round && this.round.phase === "drawing") {
      this.round.startedAt = Date.now(); // reset elapsed clock
      this.room.broadcast(JSON.stringify({ type: "game_resumed" }));
    }

    // Send late-joiner the current round state so they don't miss anything
    if (this.round && this.round.phase === "drawing") {
      conn.send(
        JSON.stringify({
          type: "round_catchup",
          word: this.round.word,
          drawingTeam: this.round.drawingTeam,
          roundNumber: this.round.roundNumber,
          timeLeft: this.round.timeLeft,
        }),
      );
    }
  }

  onClose(conn: Party.Connection) {
    const count = [...this.room.getConnections()].length;
    this.room.broadcast(
      JSON.stringify({ type: "connection_count", count }),
    );
    // Pause the game if someone disconnects while a round is active
    if (this.round && this.round.phase === "drawing") {
      this.round.timeLeft = Math.max(
        0,
        this.round.timeLeft - Math.floor((Date.now() - this.round.startedAt) / 1000),
      );
      this.round.startedAt = Date.now();
      this.room.broadcast(JSON.stringify({ type: "game_paused" }));
    }
  }

  onError(conn: Party.Connection, err: Error) {
    console.error(`Connection error for ${conn.id}:`, err);
  }
}

InkArenaServer satisfies Party.Worker;
