/**
 * Lists all images in a given prefix on Cloudinary
 * Usage: node scripts/list-cloudinary.mjs snap-lens/easy/logos
 */
import { readFileSync } from "fs";
import { v2 as cloudinary } from "cloudinary";

const prefix = process.argv[2] || "snap-lens/easy/logos";

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

let all = [];
let next_cursor = null;
do {
  const opts = { type: "upload", prefix: prefix + "/", max_results: 500 };
  if (next_cursor) opts.next_cursor = next_cursor;
  const r = await cloudinary.api.resources(opts);
  all.push(...r.resources.map((x) => x.public_id.split("/").pop()));
  next_cursor = r.next_cursor;
} while (next_cursor);

all.sort();
console.log(`\n📦 ${prefix} — ${all.length} images:\n`);
all.forEach((n) => console.log(" ", n));
