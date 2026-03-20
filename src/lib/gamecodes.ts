// Game code system — each slug encodes a difficulty + unique seed
// Sharing a slug shares the exact game state deterministically

export type SlugDifficulty = "easy" | "medium" | "hard";

interface SlugEntry {
  difficulty: SlugDifficulty;
  seed: number;
}

// ── Adjective + Noun combinator for unique slugs ──
// Each difficulty uses different adjective sets → no overlap
const easyAdj = [
  "angry", "bold", "calm", "cozy", "epic", "fast", "fizzy", "goofy",
  "happy", "jolly", "keen", "lazy", "lucky", "mild", "neat", "odd",
  "pink", "quiet", "round", "silly", "tiny", "warm", "witty", "yolo",
  "zany", "bumpy", "curly", "dizzy", "easy", "fuzzy",
];

const medAdj = [
  "brave", "clever", "dark", "fiery", "grim", "hype", "icy", "jumpy",
  "loud", "mad", "nosy", "proud", "quick", "raw", "sly", "tough",
  "ultra", "vast", "wild", "zesty", "chief", "crisp", "dusty", "fancy",
  "grand", "harsh", "mega", "noble", "prime", "rusty",
];

const hardAdj = [
  "bleak", "cold", "cruel", "dire", "dread", "eerie", "fatal", "grit",
  "heavy", "iron", "jade", "lunar", "manic", "neon", "onyx", "pale",
  "rogue", "sharp", "stark", "super", "toxic", "venom", "void", "warp",
  "zero", "ashen", "brute", "chaos", "doom", "frost",
];

const nouns = [
  "ape", "bear", "crow", "duck", "eel", "fox", "goat", "hawk",
  "ibis", "jay", "koala", "lynx", "mole", "newt", "owl", "pug",
  "quail", "ram", "seal", "toad", "urchin", "vole", "wolf", "yak",
  "zebra", "cobra", "drake", "eagle", "finch", "gecko",
];

// Build slug registry — 900 per difficulty = 2700 total, all unique
const slugRegistry: Record<string, SlugEntry> = {};
const slugsByDifficulty: Record<SlugDifficulty, string[]> = {
  easy: [],
  medium: [],
  hard: [],
};

const adjByDiff: Record<SlugDifficulty, string[]> = {
  easy: easyAdj,
  medium: medAdj,
  hard: hardAdj,
};

for (const diff of (["easy", "medium", "hard"] as SlugDifficulty[])) {
  let seed = 0;
  for (const adj of adjByDiff[diff]) {
    for (const noun of nouns) {
      const slug = `${adj}${noun}`;
      slugRegistry[slug] = { difficulty: diff, seed };
      slugsByDifficulty[diff].push(slug);
      seed++;
    }
  }
}

/**
 * Look up a slug → { difficulty, seed } or null if not found
 */
export function lookupSlug(slug: string): SlugEntry | null {
  return slugRegistry[slug] ?? null;
}

/**
 * Get a random slug for the given difficulty
 */
export function getRandomSlug(difficulty: SlugDifficulty): string {
  const pool = slugsByDifficulty[difficulty];
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Encode a numeric seed into a slug (for imposter & other games — generic use)
 */
const allSlugs = [...slugsByDifficulty.easy, ...slugsByDifficulty.medium, ...slugsByDifficulty.hard];

export function seedToSlug(seed: number): string {
  return allSlugs[Math.abs(seed) % allSlugs.length];
}

export function slugToSeed(slug: string): number | null {
  const entry = slugRegistry[slug];
  if (!entry) return null;
  return entry.seed;
}

export function generateSeed(): number {
  return Math.floor(Math.random() * allSlugs.length);
}

/**
 * Seeded PRNG (mulberry32) — produces deterministic random numbers from a seed
 */
export function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
