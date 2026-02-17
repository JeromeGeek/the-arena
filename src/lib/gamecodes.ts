// Game code system — each slug is a unique funny word with a baked-in difficulty + seed
// Sharing a slug shares the exact game state deterministically

export type SlugDifficulty = "easy" | "medium" | "hard";

interface SlugEntry {
  difficulty: SlugDifficulty;
  seed: number;
}

// Each slug is pre-assigned a difficulty and unique seed
const slugRegistry: Record<string, SlugEntry> = {};
const slugsByDifficulty: Record<SlugDifficulty, string[]> = {
  easy: [],
  medium: [],
  hard: [],
};

// ── Easy slugs ──
const easySlugs = [
  "iamgay", "shutup", "lmao", "bruh", "noob", "oops", "mybad", "chill",
  "vibes", "cozy", "sleepy", "zzz", "blessed", "goofed", "fumbled",
  "flopped", "yolo", "sorry", "noway", "oof", "halp", "plsno",
  "gonzo", "dipped", "poof", "vanish", "ghost", "ded", "rip",
  "flung", "punted", "booted", "muted", "ayoo", "nahhh", "sheesh",
  "frfr", "lolno", "nocap", "ripme", "sendit", "panik", "wompwomp",
  "afk", "lagged", "bugged", "toastd", "burnt", "dried", "washed",
];

// ── Medium slugs ──
const mediumSlugs = [
  "wth", "ggez", "ligma", "rekt", "yikes", "cope", "salty", "ratio",
  "cringe", "lowiq", "clown", "bozo", "deez", "sus", "cooked",
  "trolled", "baited", "rolled", "owned", "smoked", "dusted", "bodied",
  "griefed", "jebaited", "kekw", "monkas", "based", "mid", "nerfed",
  "buffed", "choked", "threw", "tanked", "rigged", "scammed", "jinxed",
  "glitchd", "nuked", "yeeted", "banned", "silenced", "exposed", "busted",
  "ripbozo", "savage", "toxic", "tilted", "hacked", "capped", "farmed",
];

// ── Hard slugs ──
const hardSlugs = [
  "gitgud", "tryhard", "sadge", "malding", "pepega", "inting", "noskill",
  "freewin", "ggwp", "umad", "gotcha", "deadaf", "sofake", "caught",
  "snitch", "goated", "whatif", "ulose", "unhinged", "chaotic", "feral",
  "gremlin", "menace", "villain", "devious", "sneaky", "sketch", "shady",
  "sussy", "sike", "finesse", "clutch", "diff", "gapped", "ratiod",
  "packed", "folded", "humbled", "cursed", "demoted", "benched", "lost",
  "doomed", "clueless", "faded", "zoinks", "phantom", "dced", "siren",
];

// Register all slugs
function registerSlugs(slugs: string[], difficulty: SlugDifficulty) {
  slugs.forEach((slug, i) => {
    slugRegistry[slug] = { difficulty, seed: i };
    slugsByDifficulty[difficulty].push(slug);
  });
}

registerSlugs(easySlugs, "easy");
registerSlugs(mediumSlugs, "medium");
registerSlugs(hardSlugs, "hard");

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
 * Encode a numeric seed into a slug (for imposter — generic use)
 */
const allSlugs = [...easySlugs, ...mediumSlugs, ...hardSlugs];

export function seedToSlug(seed: number): string {
  return allSlugs[seed % allSlugs.length];
}

export function slugToSeed(slug: string): number | null {
  const index = allSlugs.indexOf(slug);
  if (index === -1) return null;
  return index;
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
