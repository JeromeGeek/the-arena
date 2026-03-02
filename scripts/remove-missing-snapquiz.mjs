/**
 * Removes all snapquiz.ts entries whose images are missing from Cloudinary.
 * Reads the crosscheck output IDs and strips matching lines.
 */
import { readFileSync, writeFileSync } from "fs";
import { v2 as cloudinary } from "cloudinary";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
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

// Fetch ALL snap-lens images from Cloudinary
async function fetchAll(prefix) {
  let all = new Set();
  let next_cursor = null;
  do {
    const opts = { type: "upload", prefix, max_results: 500 };
    if (next_cursor) opts.next_cursor = next_cursor;
    const r = await cloudinary.api.resources(opts);
    r.resources.forEach((x) => all.add(x.public_id));
    next_cursor = r.next_cursor;
  } while (next_cursor);
  return all;
}

const existing = await fetchAll("snap-lens/");
console.log(`✅ Total on Cloudinary: ${existing.size}`);

// Parse snapquiz.ts to find which entry IDs are missing
const srcPath = "src/lib/snapquiz.ts";
const src = readFileSync(srcPath, "utf8");

// Match the full object entry — one per line, e.g.:
//   { id:"lme001", ... url:c("easy","landmarks","acropolis") },
const regex = /\{\s*id:"([^"]+)"[^}]+url:c\("([^"]+)","([^"]+)","([^"]+)"\)/g;

const missingIds = new Set();
let match;
while ((match = regex.exec(src)) !== null) {
  const [, id, diff, cat, file] = match;
  const publicId = `snap-lens/${diff}/${cat}/${file}`;
  if (!existing.has(publicId)) {
    missingIds.add(id);
  }
}

console.log(`\n🗑  Removing ${missingIds.size} entries from snapquiz.ts...\n`);

// Remove each line that contains one of the missing IDs
// Each entry is a single line like:  c("easy","celebrities","gandhi"),
// We match the whole line if it contains id:"<missingId>"
const lines = src.split("\n");
const kept = [];
let removed = 0;

for (const line of lines) {
  // Check if this line has id:"<oneOfTheMissingIds>"
  const idMatch = line.match(/id:"([^"]+)"/);
  if (idMatch && missingIds.has(idMatch[1])) {
    console.log(`  - removed: ${idMatch[1]}`);
    removed++;
  } else {
    kept.push(line);
  }
}

const cleaned = kept.join("\n");
writeFileSync(srcPath, cleaned, "utf8");

console.log(`\n✅ Done. Removed ${removed} lines. snapquiz.ts now has ${cleaned.split("\n").length} lines.`);
