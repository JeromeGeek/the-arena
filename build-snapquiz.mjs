// Generates the new snapquiz.ts keeping only entries that exist in Cloudinary
import fs from 'fs';

const actual = JSON.parse(fs.readFileSync('/tmp/cloudinary-actual.json', 'utf8'));
const existingSet = new Set();
for (const [key, names] of Object.entries(actual)) {
  for (const name of names) {
    existingSet.add(key + '/' + name);
  }
}

function has(diff, cat, name) {
  return existingSet.has(`${diff}/${cat}/${name}`);
}

// ── Check counts
for (const [bucket, names] of Object.entries(actual)) {
  console.log(`${bucket}: ${names.length}`);
}
