// Codenames word pools
export const wordPools = {
  easy: [
    "DOG", "CAT", "TREE", "HOUSE", "BOOK", "FISH", "CAKE", "MOON", "STAR", "FIRE",
    "WATER", "SUN", "BALL", "BABY", "BIRD", "BOAT", "CHAIR", "CLOUD", "DOOR", "EGG",
    "FLOWER", "GRASS", "HAT", "ICE", "KEY", "LAMP", "MILK", "NOSE", "PEN", "RAIN",
    "SHOE", "TABLE", "WALL", "APPLE", "BED", "CUP", "DRUM", "EYE", "FROG", "GOLD",
  ],
  medium: [
    "AGENT", "SHADOW", "CIPHER", "NEEDLE", "BRIDGE", "PHANTOM", "WHISPER", "TORCH", "GLACIER", "RAVEN",
    "CASTLE", "VIPER", "STORM", "ANCHOR", "FORGE", "SIREN", "CROWN", "DAGGER", "ECHO", "FLAME",
    "HARBOR", "IRON", "JUNGLE", "KNIGHT", "LION", "MIRROR", "ORACLE", "PILOT", "REBEL", "SCALE",
    "THRONE", "VAULT", "WOLF", "ARCTIC", "BLADE", "COMET", "DRIFT", "EMBER", "FLINT", "GHOST",
  ],
  hard: [
    "PARADIGM", "ENTROPY", "CATALYST", "NEXUS", "PARADOX", "SOVEREIGN", "ALGORITHM", "SYNTHESIS", "SPECTRUM", "OBLIVION",
    "RESONANCE", "ZENITH", "LABYRINTH", "MONOLITH", "CHRONICLE", "DOMINION", "ETHEREAL", "FRACTURE", "GENESIS", "HORIZON",
    "INFLUX", "JUXTAPOSE", "KINETIC", "LEVERAGE", "MANIFOLD", "NOMAD", "OMNISCIENT", "PRECIPICE", "QUANTUM", "RHETORIC",
    "SUBLIMINAL", "TESTAMENT", "UMBRA", "VISCERAL", "WARDEN", "XENITH", "BINARY", "CORTEX", "DYNAMO", "ENIGMA",
  ],
};

export type CardType = "red" | "blue" | "bystander" | "assassin";
export type Difficulty = "easy" | "medium" | "hard";

export interface GameCard {
  word: string;
  type: CardType;
  revealed: boolean;
}

function shuffle<T>(array: T[], random: () => number = Math.random): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateBoard(
  difficulty: Difficulty,
  random: () => number = Math.random
): { cards: GameCard[]; startingTeam: "red" | "blue" } {
  const pool = wordPools[difficulty];
  const selectedWords = shuffle(pool, random).slice(0, 20);

  // Randomly pick starting team
  const startingTeam = random() > 0.5 ? "red" : "blue";

  // Starting team gets 8 agents, other gets 7, 1 assassin, 4 bystanders = 20
  const types: CardType[] = [];
  if (startingTeam === "red") {
    types.push(...Array(8).fill("red"), ...Array(7).fill("blue"));
  } else {
    types.push(...Array(7).fill("red"), ...Array(8).fill("blue"));
  }
  types.push("assassin");
  types.push(...Array(4).fill("bystander"));

  const shuffledTypes = shuffle(types, random);

  const cards: GameCard[] = selectedWords.map((word, i) => ({
    word,
    type: shuffledTypes[i],
    revealed: false,
  }));

  return { cards, startingTeam };
}
