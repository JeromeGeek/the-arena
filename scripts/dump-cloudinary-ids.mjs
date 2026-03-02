// Dumps all snap-lens public_ids to stdout, one per line
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
// Print just the filename part (last segment) grouped by diff/cat
const out = {};
for (const r of all) {
  const parts = r.public_id.split("/"); // snap-lens/diff/cat/name
  const key = `${parts[1]}/${parts[2]}`;
  if (!out[key]) out[key] = [];
  out[key].push(parts[3]);
}
for (const [key, names] of Object.entries(out).sort()) {
  console.log(`\n=== ${key} (${names.length}) ===`);
  for (const n of names.sort()) console.log(n);
}
