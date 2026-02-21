// Mafia — game logic, roles, and phases

export type MafiaRole = "mafia" | "doctor" | "detective" | "villager";

export interface MafiaPlayer {
  id: number;
  name: string;
  role: MafiaRole;
  alive: boolean;
  protected: boolean; // doctor-protected this round
  investigated: boolean; // investigated by detective this round
}

export interface MafiaGame {
  players: MafiaPlayer[];
  mafiaCount: number;
  hasDoctor: boolean;
  hasDetective: boolean;
}

const roleEmojis: Record<MafiaRole, string> = {
  mafia: "🔪",
  doctor: "💉",
  detective: "🔍",
  villager: "🏘️",
};

const roleDescriptions: Record<MafiaRole, string> = {
  mafia: "You are the Mafia. Eliminate villagers at night without getting caught.",
  doctor: "You are the Doctor. Choose someone to protect each night.",
  detective: "You are the Detective. Investigate one player each night to learn their role.",
  villager: "You are a Villager. Find and vote out the Mafia during the day.",
};

export { roleEmojis, roleDescriptions };

export function setupMafiaGame(
  playerNames: string[],
  mafiaCount: number = 1,
  hasDoctor: boolean = true,
  hasDetective: boolean = true,
  random: () => number = Math.random
): MafiaGame {
  const count = playerNames.length;

  // Clamp mafia count
  const maxMafia = Math.max(1, Math.floor(count / 3));
  const safeMafiaCount = Math.min(mafiaCount, maxMafia);

  // Build role list
  const roles: MafiaRole[] = [];

  // Add mafia
  for (let i = 0; i < safeMafiaCount; i++) {
    roles.push("mafia");
  }

  // Add special roles (only if enough players)
  const remaining = count - safeMafiaCount;
  if (hasDoctor && remaining > 1) {
    roles.push("doctor");
  }
  if (hasDetective && remaining > (hasDoctor ? 2 : 1)) {
    roles.push("detective");
  }

  // Fill rest with villagers
  while (roles.length < count) {
    roles.push("villager");
  }

  // Shuffle roles
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }

  const players: MafiaPlayer[] = playerNames.map((name, i) => ({
    id: i,
    name,
    role: roles[i],
    alive: true,
    protected: false,
    investigated: false,
  }));

  return {
    players,
    mafiaCount: safeMafiaCount,
    hasDoctor: roles.includes("doctor"),
    hasDetective: roles.includes("detective"),
  };
}

/**
 * Check win conditions:
 * - Mafia wins if mafia count >= remaining non-mafia
 * - Village wins if all mafia are eliminated
 * - null = game continues
 */
export function checkWinner(players: MafiaPlayer[]): "mafia" | "village" | null {
  const alive = players.filter((p) => p.alive);
  const mafiaAlive = alive.filter((p) => p.role === "mafia").length;
  const villageAlive = alive.filter((p) => p.role !== "mafia").length;

  if (mafiaAlive === 0) return "village";
  if (mafiaAlive >= villageAlive) return "mafia";
  return null;
}
