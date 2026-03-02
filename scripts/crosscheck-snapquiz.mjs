// Cross-checks all filenames referenced in snapquiz.ts against actual Cloudinary IDs.
// Outputs: broken links, missing entries, and unclaimed Cloudinary assets.
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
// Build set of all public_ids (just the last filename part keyed by diff/cat/name)
const cldSet = new Set(all.map(r => r.public_id)); // full path e.g. snap-lens/easy/landmarks/eiffel-tower

// Parse snapquiz.ts for all c("diff","cat","name") calls
const src = readFileSync(join(__dir, "../src/lib/snapquiz.ts"), "utf8");
const re = /c\(\s*"(easy|medium|extreme)"\s*,\s*"(\w+)"\s*,\s*"([\w-]+)"\s*\)/g;
let m;
const referenced = []; // { diff, cat, name, publicId, line }
const lines = src.split("\n");
while ((m = re.exec(src)) !== null) {
  const [, diff, cat, name] = m;
  const publicId = `snap-lens/${diff}/${cat}/${name}`;
  // Find approximate line number
  const pos = m.index;
  const lineNo = src.slice(0, pos).split("\n").length;
  referenced.push({ diff, cat, name, publicId, lineNo });
}

// Deduplicate referenced set
const refSet = new Set(referenced.map(r => r.publicId));

// --- BROKEN: referenced in code but NOT in Cloudinary ---
const broken = referenced.filter(r => !cldSet.has(r.publicId));
// --- UNCLAIMED: in Cloudinary but NOT referenced in code ---
const unclaimed = [...cldSet].filter(id => !refSet.has(id));

// Duplicate IDs check in source
const idRe = /id:"([^"]+)"/g;
const ids = [];
while ((m = idRe.exec(src)) !== null) ids.push(m[1]);
const idCounts = {};
for (const id of ids) idCounts[id] = (idCounts[id] || 0) + 1;
const dupIds = Object.entries(idCounts).filter(([, v]) => v > 1);

// Duplicate URL check
const urlRe = /url:c\([^)]+\)/g;
const urls = [];
while ((m = urlRe.exec(src)) !== null) urls.push(m[0]);
const urlCounts = {};
for (const u of urls) urlCounts[u] = (urlCounts[u] || 0) + 1;
const dupUrls = Object.entries(urlCounts).filter(([, v]) => v > 1);

console.log(`\n${"═".repeat(64)}`);
console.log(`  SNAPQUIZ ↔ CLOUDINARY CROSS-CHECK`);
console.log(`  Referenced in code : ${referenced.length} (${refSet.size} unique)`);
console.log(`  In Cloudinary      : ${cldSet.size}`);
console.log(`${"═".repeat(64)}\n`);

console.log(`── 🔴 BROKEN LINKS (in code, missing from Cloudinary): ${broken.length} ──`);
if (broken.length === 0) console.log("  ✅ None");
else for (const b of broken)
  console.log(`  Line ${String(b.lineNo).padStart(3)}: ${b.publicId}`);

console.log(`\n── 🟡 UNCLAIMED (in Cloudinary, not in snapquiz.ts): ${unclaimed.length} ──`);
if (unclaimed.length === 0) console.log("  ✅ None");
else for (const u of unclaimed.sort()) console.log(`  ${u}`);

console.log(`\n── 🔁 DUPLICATE IDs in snapquiz.ts: ${dupIds.length} ──`);
if (dupIds.length === 0) console.log("  ✅ None");
else for (const [id, n] of dupIds) console.log(`  ⚠️  id:"${id}" appears ${n}×`);

console.log(`\n── 🔁 DUPLICATE URLs in snapquiz.ts: ${dupUrls.length} ──`);
if (dupUrls.length === 0) console.log("  ✅ None");
else for (const [u, n] of dupUrls) console.log(`  ⚠️  ${u.replace("url:", "")} appears ${n}×`);
