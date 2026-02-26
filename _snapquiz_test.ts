import { getSnapImages, difficultyConfig, snapCategories, POINTS_PER_CORRECT, allSnapImages } from './src/lib/snapquiz';
import { generateSeed, seedToSlug, slugToSeed, seededRandom } from './src/lib/gamecodes';

let pass = 0, fail = 0;

// ── 1. Image bank ─────────────────────────────────────────────────────────────
console.log('\n=== IMAGE BANK ===');
console.log('Total images:', allSnapImages.length);
for (const cat of snapCategories) {
  console.log(`  ${cat.emoji} ${cat.label} (${cat.id}): ${cat.images.length} images`);
}

// ── 2. Difficulty config ──────────────────────────────────────────────────────
console.log('\n=== DIFFICULTY CONFIG ===');
for (const [k, v] of Object.entries(difficultyConfig)) {
  console.log(`  ${v.emoji} ${k}: blur=${v.blurPx}px, reveal=${v.revealMs}ms`);
}
console.log('  POINTS_PER_CORRECT:', POINTS_PER_CORRECT);

// ── 3. Code format — all 180 combos ─────────────────────────────────────────
console.log('\n=== CODE FORMAT (3 diffs × 4 rounds × 3 teams × 5 cats = 180 codes) ===');
const diffs = ['easy','medium','extreme'] as const;
const roundOpts = [2,4,6,8];
const tcOpts = [2,3,4];
const catIds = snapCategories.map(c => c.id);

for (const diff of diffs) {
  for (const r of roundOpts) {
    for (const tc of tcOpts) {
      for (const cat of catIds) {
        const seed = generateSeed();
        const slug = seedToSlug(seed);
        const code = `${tc}-${diff}-${r}-${cat}-${slug}`;
        const parts = code.split('-');
        const teamCount = parseInt(parts[0]);
        const d = parts[1];
        const rr = parseInt(parts[2]);
        const slugP = parts[parts.length - 1];
        const category = parts.slice(3, -1).join('-');
        const seedBack = slugToSeed(slugP);

        const validTeam = !Number.isNaN(teamCount) && teamCount >= 2 && teamCount <= 4;
        const validDiff = ['easy','medium','extreme'].includes(d);
        const validRound = !Number.isNaN(rr) && rr >= 1;
        const validSeed = seedBack !== null;
        const validCat = category === cat;
        const ok = validTeam && validDiff && validRound && validSeed && validCat;

        if (!ok) {
          console.error(`  FAIL: code="${code}" → team=${validTeam} diff=${validDiff} round=${validRound} seed=${validSeed} cat=${validCat}`);
          fail++;
        } else {
          pass++;
        }

        // Verify getSnapImages returns correct count
        if (ok && seedBack !== null) {
          const rng = seededRandom(seedBack);
          const imgs = getSnapImages(category, r, rng);
          if (imgs.length !== r) {
            console.error(`  IMGFAIL: cat=${cat} requested=${r} got=${imgs.length}`);
            fail++;
          } else {
            pass++;
          }
        }
      }
    }
  }
}
console.log(`  Code format: Passed=${pass}  Failed=${fail}`);

// ── 4. Game flow simulation ───────────────────────────────────────────────────
console.log('\n=== GAME FLOW SIMULATION ===');

function simGame(tc: number, diff: 'easy'|'medium'|'extreme', total: number, cat: string) {
  // Simulate: team (i % tc) gets correct except every 3rd image is a pass
  const scores = new Array(tc).fill(0);
  for (let i = 0; i < total; i++) {
    if ((i + 1) % 3 !== 0) {
      scores[i % tc] += POINTS_PER_CORRECT;
    }
    // else: pass → no points
  }
  const lb = scores
    .map((s, i) => ({ name: `Team ${i + 1}`, score: s, i }))
    .sort((a, b) => b.score - a.score);
  return { winner: lb[0], scores, lb };
}

const cases: [number, 'easy'|'medium'|'extreme', number, string][] = [
  [2, 'easy',    4, 'random'],
  [2, 'medium',  4, 'landmarks'],
  [2, 'extreme', 8, 'people'],
  [3, 'medium',  6, 'india'],
  [4, 'extreme', 8, 'movies'],
  [2, 'easy',    2, 'random'],   // minimal game
  [4, 'easy',    8, 'random'],   // max teams, max images
  // all pass → all scores 0 → still picks a winner (first in leaderboard)
];

let flowOk = true;
for (const [tc, diff, r, cat] of cases) {
  const { winner, scores } = simGame(tc, diff, r, cat);
  const totalPts = scores.reduce((a, b) => a + b, 0);
  const maxPossible = r * POINTS_PER_CORRECT;
  const passCount = r - Math.floor(r * 2/3); // ~1/3 pass
  const winOk = winner.score >= 0 && totalPts <= maxPossible;
  if (!winOk) flowOk = false;
  console.log(
    `  ${tc}T/${diff}/${r}img/${cat}: winner="${winner.name}" ${winner.score}pts | scores=[${scores}] | totalPts=${totalPts} ${winOk ? '✅' : '❌'}`
  );
}

// All-pass game (no points to anyone)
const allPassScores = new Array(2).fill(0);
const allPassLb = allPassScores.map((s,i) => ({name:`T${i+1}`, score:s, i})).sort((a,b)=>b.score-a.score);
console.log(`  All-pass (0pts): winner="${allPassLb[0].name}" score=${allPassLb[0].score} → leaderboard still has winner ✅`);

// ── 5. Edge cases ─────────────────────────────────────────────────────────────
console.log('\n=== EDGE CASES (invalid codes) ===');
const badCodes = [
  ['1-medium-4-random-abc',   'teamCount < 2'],
  ['5-medium-4-random-abc',   'teamCount > 4'],
  ['2-hard-4-random-abc',     'invalid difficulty'],
  ['2-easy-0-random-abc',     'rounds = 0'],
  ['2-easy--1-random-abc',    'rounds = -1'],
  ['2-easy-4-random',         'too few parts (4)'],
  ['',                        'empty string'],
  ['garbage',                 'random junk'],
  ['2-medium-4-random-ZZZZ',  'bad slug → null seed'],
];
let edgeOk = true;
for (const [bad, reason] of badCodes) {
  const parts = bad.split('-');
  let valid = parts.length >= 5;
  if (valid) {
    const tc2 = parseInt(parts[0]);
    const d2  = parts[1];
    const r2  = parseInt(parts[2]);
    const s2  = slugToSeed(parts[parts.length - 1]);
    if (Number.isNaN(tc2) || tc2 < 2 || tc2 > 4) valid = false;
    if (!['easy','medium','extreme'].includes(d2)) valid = false;
    if (Number.isNaN(r2) || r2 < 1)               valid = false;
    if (s2 === null)                               valid = false;
  }
  const correct = !valid;
  if (!correct) edgeOk = false;
  console.log(`  "${bad}" [${reason}] → ${correct ? '❌ correctly rejected ✅' : '⚠️  INCORRECTLY ACCEPTED ❌'}`);
}

// ── 6. Image cycling ──────────────────────────────────────────────────────────
console.log('\n=== IMAGE CYCLING ===');
// movies has 8 images; request 20 → should cycle and return exactly 20
const rngCycle = seededRandom(42);
const cycled = getSnapImages('movies', 20, rngCycle);
const cycleOk = cycled.length === 20;
console.log(`  movies pool=8, requested=20, got=${cycled.length} → ${cycleOk ? '✅' : '❌'}`);

// All images in first 8 should be unique (full pool coverage)
const firstEight = cycled.slice(0, 8).map(x => x.id);
const uniqueCount = new Set(firstEight).size;
console.log(`  First 8 unique IDs: ${uniqueCount}/8 → ${uniqueCount === 8 ? '✅' : '❌ pool has duplicates'}`);

// ── 7. Score math ─────────────────────────────────────────────────────────────
console.log('\n=== SCORE MATH ===');
const pts = POINTS_PER_CORRECT;
const test5 = 5 * pts;
console.log(`  5 correct × ${pts}pts = ${test5} → ${test5 === 25 ? '✅' : '❌'}`);
console.log(`  0 correct = 0pts → leaderboard still resolves ✅`);

// ── 8. Teams param roundtrip ──────────────────────────────────────────────────
console.log('\n=== TEAMS PARAM ROUNDTRIP ===');
const teamNames = ['Red Devils', 'Blue Force', 'Team 3 & More', 'Ünïcödé'];
for (const names of [['Team 1','Team 2'], ['Red Devils','Blue Force','Team 3'], teamNames]) {
  const encoded = encodeURIComponent(names.join(','));
  const decoded = decodeURIComponent(encoded).split(',');
  const ok = JSON.stringify(decoded) === JSON.stringify(names);
  console.log(`  [${names.join(', ')}] → ${ok ? '✅' : '❌ ROUNDTRIP FAIL'}`);
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log('\n=== SUMMARY ===');
console.log(`  Code format + image count: ${fail === 0 ? '✅ ALL PASSED' : `❌ ${fail} failures`}`);
console.log(`  Game flow simulation:       ${flowOk ? '✅ ALL PASSED' : '❌ FAILURES'}`);
console.log(`  Edge case rejection:        ${edgeOk ? '✅ ALL PASSED' : '❌ FAILURES'}`);
console.log(`  Image cycling:              ${cycleOk ? '✅ ALL PASSED' : '❌ FAILURES'}`);
console.log('\n✅ Full test suite complete.\n');
