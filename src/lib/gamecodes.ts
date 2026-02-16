// Game code system — generates funny, memorable URL slugs that encode a numeric seed
// The seed deterministically generates the game state so sharing the URL shares the game

// Preset slugs — hand-picked funny phrases that map to specific seed values
const presetSlugs = [
  "you-are-gay",
  "shut-up",
  "skill-issue",
  "cope-harder",
  "get-rekt",
  "no-brain",
  "cry-more",
  "touch-grass",
  "stay-mad",
  "huge-L",
  "fat-ratio",
  "down-bad",
  "not-funny",
  "zero-iq",
  "hard-stuck",
  "dog-water",
  "who-asked",
  "no-maidens",
  "its-over",
  "git-gud",
  "send-help",
  "gg-ez",
  "my-bad",
  "lol-what",
  "trust-me",
  "blame-lag",
  "im-cooked",
  "not-sus",
  "oh-no",
  "bruh-moment",
  "so-done",
  "please-stop",
  "why-tho",
  "ur-trash",
  "nice-try",
  "say-less",
  "big-yikes",
  "too-easy",
  "haha-nope",
  "ayo-what",
  "dead-last",
  "no-shot",
  "clown-show",
  "main-character",
  "built-different",
  "ratio-king",
  "just-vibes",
  "hold-this",
  "actual-bot",
  "mega-fail",
];

/**
 * Encode a numeric seed into a funny slug
 */
export function seedToSlug(seed: number): string {
  return presetSlugs[seed % presetSlugs.length];
}

/**
 * Decode a slug back into a numeric seed. Returns null if slug is invalid.
 */
export function slugToSeed(slug: string): number | null {
  const index = presetSlugs.indexOf(slug);
  if (index === -1) return null;
  return index;
}

/**
 * Generate a random seed
 */
export function generateSeed(): number {
  return Math.floor(Math.random() * presetSlugs.length);
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
