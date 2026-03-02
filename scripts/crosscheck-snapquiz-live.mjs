/**
 * Cross-checks snapquiz.ts entries against live Cloudinary inventory.
 * Prints all entries in snapquiz.ts whose image does NOT exist on Cloudinary.
 */
import { readFileSync } from "fs";
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
console.log(`\n✅ Total on Cloudinary: ${existing.size}\n`);

// Parse all cldSnap calls from snapquiz.ts
const src = readFileSync("src/lib/snapquiz.ts", "utf8");
const regex = /\{\s*id:"([^"]+)"[^}]+url:c\("([^"]+)","([^"]+)","([^"]+)"\)/g;

const missing = [];
let match;
while ((match = regex.exec(src)) !== null) {
  const [, id, diff, cat, file] = match;
  const publicId = `snap-lens/${diff}/${cat}/${file}`;
  if (!existing.has(publicId)) {
    missing.push({ id, publicId });
  }
}

if (missing.length === 0) {
  console.log("🎉 All snapquiz.ts entries exist on Cloudinary!");
} else {
  console.log(`❌ ${missing.length} entries in snapquiz.ts are MISSING from Cloudinary:\n`);
  missing.forEach((m) => console.log(`  ${m.id.padEnd(12)} → ${m.publicId}`));
}
