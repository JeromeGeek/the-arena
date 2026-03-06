import type * as Party from "partykit/server";

// ── Ink Arena PartyKit Server ──
// One room = one game session (keyed by room code)
// Stores active-round state so late-joining clients can catch up.

interface RoundState {
  word: string;
  drawingTeamIdx: number;
  teamNames: string[];
  teamCount: number;
  roundNumber: number;
  phase: "lobby" | "drawing" | "round_over" | "game_over";
  timeLeft: number;
  startedAt: number; // Date.now() when round began
}

export default class InkArenaServer implements Party.Server {
  private round: RoundState | null = null;
  // Map connectionId → role: "tv" | "drawer" | "guesser"
  private roles = new Map<string, "tv" | "drawer" | "guesser">();

  constructor(readonly room: Party.Room) {}

  onMessage(message: string, sender: Party.Connection) {
    try {
      const msg = JSON.parse(message) as Record<string, unknown>;

      // Register role so we know who is who on disconnect
      if (msg.type === "register_role") {
        const role = msg.role as "tv" | "drawer" | "guesser";
        this.roles.set(sender.id, role);
        // Don't broadcast role registration
        return;
      }

      // Track server-side round state so late joiners can sync
      if (msg.type === "round_start") {
        this.round = {
          word: msg.word as string,
          drawingTeamIdx: msg.drawingTeamIdx as number ?? 0,
          teamNames: (msg.teamNames as string[]) ?? [],
          teamCount: (msg.teamCount as number) ?? 2,
          roundNumber: msg.roundNumber as number,
          phase: "drawing",
          timeLeft: msg.timeLeft as number ?? 60,
          startedAt: Date.now(),
        };
      }
      if (msg.type === "correct_guess" || msg.type === "time_up") {
        if (this.round) this.round.phase = "round_over";
      }
      if (msg.type === "game_over") {
        if (this.round) this.round.phase = "game_over";
      }
      if (msg.type === "game_ended") {
        // TV force-ended the game mid-session
        this.round = null;
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

    // If a round was active and TV/drawer reconnects, resume
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
          drawingTeamIdx: this.round.drawingTeamIdx,
          teamNames: this.round.teamNames,
          teamCount: this.round.teamCount,
          roundNumber: this.round.roundNumber,
          timeLeft: this.round.timeLeft,
        }),
      );
    }

    // If game was ended by TV, tell new connection
    if (this.round && this.round.phase === "game_over") {
      conn.send(JSON.stringify({ type: "game_over" }));
    }
  }

  onClose(conn: Party.Connection) {
    const role = this.roles.get(conn.id) ?? "guesser";
    this.roles.delete(conn.id);

    const count = [...this.room.getConnections()].length;
    this.room.broadcast(JSON.stringify({ type: "connection_count", count }));

    if (!this.round || this.round.phase !== "drawing") return;

    if (role === "tv") {
      // TV disconnected — pause everything, phones should wait
      this.round.timeLeft = Math.max(
        0,
        this.round.timeLeft - Math.floor((Date.now() - this.round.startedAt) / 1000),
      );
      this.round.startedAt = Date.now();
      this.room.broadcast(JSON.stringify({ type: "game_paused", reason: "tv" }));
    } else if (role === "drawer") {
      // Drawer closed browser — skip the current turn so guessers don't hang
      if (this.round) this.round.phase = "round_over";
      this.room.broadcast(JSON.stringify({
        type: "drawer_disconnected",
        drawingTeamIdx: this.round.drawingTeamIdx,
      }));
    }
    // Guesser disconnect — do nothing, game continues
  }

  onError(conn: Party.Connection, err: Error) {
    console.error(`Connection error for ${conn.id}:`, err);
  }
}

InkArenaServer satisfies Party.Worker;
