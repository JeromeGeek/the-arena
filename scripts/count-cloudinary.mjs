import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { v2 as cloudinary } from "cloudinary";

const __dir = dirname(fileURLToPath(import.meta.url));
const env = {};
for (const line of readFileSync(join(__dir, "../.env.local"), "utf8").split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i < 0) continue;
  env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}
cloudinary.config({
  cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function fetchAll(prefix) {
  let resources = [], next_cursor;
  do {
    const r = await cloudinary.api.resources({
      type: "upload", prefix, max_results: 500, next_cursor,
    });
    resources.push(...r.resources);
    next_cursor = r.next_cursor;
  } while (next_cursor);
  return resources;
}

const all = await fetchAll("snap-lens");

const byDiffCat = {};
const publicIds = [];

for (const r of all) {
  const parts = r.public_id.split("/"); // snap-lens/difficulty/category/name
  const diff = parts[1] || "unknown";
  const cat  = parts[2] || "unknown";
  const key  = `${diff}/${cat}`;
  byDiffCat[key] = (byDiffCat[key] || 0) + 1;
  publicIds.push(r.public_id);
}

// Totals per difficulty and category
const diffs = {}, cats = {};
for (const [k, v] of Object.entries(byDiffCat)) {
  const [d, c] = k.split("/");
  diffs[d] = (diffs[d] || 0) + v;
  cats[c]  = (cats[c]  || 0) + v;
}

const TARGET_PER_CELL = 50;
const DIFFICULTIES    = ["easy", "medium", "extreme"];
const CATEGORIES      = ["landmarks", "flags", "logos", "celebrities"];

console.log(`\n${"═".repeat(56)}`);
console.log(`  CLOUDINARY  snap-lens/  INVENTORY`);
console.log(`  Total images: ${all.length} / 600 target`);
console.log(`${"═".repeat(56)}\n`);

console.log("── By Difficulty ──────────────────────");
for (const d of DIFFICULTIES)
  console.log(`  ${d.padEnd(10)} : ${diffs[d] ?? 0}`);

console.log("\n── By Category ────────────────────────");
for (const c of CATEGORIES)
  console.log(`  ${c.padEnd(12)} : ${cats[c] ?? 0}`);

console.log("\n── Grid (difficulty × category) ───────");
const header = "             " + CATEGORIES.map(c => c.padStart(12)).join("");
console.log(header);
for (const d of DIFFICULTIES) {
  const row = CATEGORIES.map(c => {
    const v = byDiffCat[`${d}/${c}`] ?? 0;
    const flag = v < TARGET_PER_CELL ? ` ⚠️ (${TARGET_PER_CELL - v} missing)` : " ✅";
    return `${String(v).padStart(4)}${flag}`;
  });
  console.log(`  ${d.padEnd(10)}  ${row.join("   ")}`);
}

// Duplicates
const seen = {};
for (const id of publicIds) seen[id] = (seen[id] || 0) + 1;
const dupes = Object.entries(seen).filter(([, v]) => v > 1);
console.log(`\n── Duplicates ─────────────────────────`);
console.log(`  Count: ${dupes.length}`);
if (dupes.length) dupes.forEach(([id, n]) => console.log(`  ⚠️  ${id}  ×${n}`));
else console.log("  ✅ None found");

console.log(`\n── Missing (not yet uploaded) ──────────`);
let totalMissing = 0;
for (const d of DIFFICULTIES) {
  for (const c of CATEGORIES) {
    const have = byDiffCat[`${d}/${c}`] ?? 0;
    const missing = TARGET_PER_CELL - have;
    if (missing > 0) {
      console.log(`  ${d}/${c}: ${have}/50 (${missing} missing)`);
      totalMissing += missing;
    }
  }
}
if (totalMissing === 0) console.log("  ✅ All 600 slots filled!");
else console.log(`\n  Total missing: ${totalMissing}`);
