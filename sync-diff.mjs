import fs from 'fs';
import { execSync } from 'child_process';

// Read actual Cloudinary state
const actual = JSON.parse(fs.readFileSync('/tmp/cloudinary-actual.json', 'utf8'));
const existingSet = new Set();
for (const [key, names] of Object.entries(actual)) {
  for (const name of names) {
    existingSet.add(key + '/' + name); // e.g. easy/celebrities/einstein
  }
}

// Parse snapquiz.ts
const code = fs.readFileSync('./src/lib/snapquiz.ts', 'utf8');
const pattern = /url:c\("(easy|medium|extreme)","(landmarks|celebrities|flags|logos)","([^"]+)"\)/g;
let match;
const missing = [];
const found = [];
while ((match = pattern.exec(code)) !== null) {
  const [, diff, cat, name] = match;
  const key = diff + '/' + cat + '/' + name;
  if (!existingSet.has(key)) {
    missing.push({ diff, cat, name, key });
  } else {
    found.push(key);
  }
}

console.log('✅ In code AND Cloudinary:', found.length);
console.log('❌ In code but NOT in Cloudinary (' + missing.length + '):');
for (const m of missing) {
  console.log('  ' + m.key);
}
