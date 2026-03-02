/**
 * check-snapquiz-urls.mjs
 * Extracts every cldSnap(...) call from snapquiz.ts, builds the full URL,
 * and fires HTTP HEAD requests to verify each one returns 200.
 *
 * Usage: node scripts/check-snapquiz-urls.mjs
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLOUD_NAME = "dwwm038r2";
const CONCURRENCY = 20;

// ── Parse snapquiz.ts ────────────────────────────────────────────────────────
const src = readFileSync(resolve(__dirname, "../src/lib/snapquiz.ts"), "utf8");

// Match c("difficulty","category","filename") — the alias for cldSnap
const RE = /c\(\s*"(easy|medium|extreme)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\)/g;

const entries = [];
let m;
while ((m = RE.exec(src)) !== null) {
  const [, difficulty, category, filename] = m;
  const publicId = `snap-lens/${difficulty}/${category}/${filename}`;
  const url = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,w_1280/${publicId}`;
  entries.push({ difficulty, category, filename, url });
}

console.log(`Found ${entries.length} URLs in snapquiz.ts\n`);

// ── Deduplicate ──────────────────────────────────────────────────────────────
const uniqueUrls = [...new Map(entries.map((e) => [e.url, e])).values()];
if (uniqueUrls.length !== entries.length) {
  console.warn(`⚠️  ${entries.length - uniqueUrls.length} duplicate URL(s) detected — checking unique set only.\n`);
}

// ── Check URLs with concurrency control ─────────────────────────────────────
async function checkUrl(entry) {
  try {
    const res = await fetch(entry.url, { method: "HEAD" });
    return { ...entry, status: res.status, ok: res.status === 200 };
  } catch (err) {
    return { ...entry, status: 0, ok: false, err: err.message };
  }
}

async function checkAll(list) {
  const results = [];
  for (let i = 0; i < list.length; i += CONCURRENCY) {
    const batch = list.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(checkUrl));
    results.push(...batchResults);
    process.stdout.write(`\r  Checked ${Math.min(i + CONCURRENCY, list.length)} / ${list.length}…`);
  }
  process.stdout.write("\n");
  return results;
}

const results = await checkAll(uniqueUrls);

// ── Report ───────────────────────────────────────────────────────────────────
const broken = results.filter((r) => !r.ok);
const ok     = results.filter((r) => r.ok);

console.log(`\n✅  Working : ${ok.length}`);
console.log(`🔴  Broken  : ${broken.length}`);

if (broken.length > 0) {
  console.log("\n── Broken URLs ──────────────────────────────────────────────");
  for (const r of broken) {
    console.log(`  [${r.status}] ${r.difficulty}/${r.category}/${r.filename}`);
    if (r.err) console.log(`         ${r.err}`);
  }
}

if (broken.length === 0) {
  console.log("\nAll URLs are reachable! 🎉");
}
