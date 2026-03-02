/**
 * Searches Wikimedia Commons for real image filenames matching a query.
 * Use: node scripts/check-urls.mjs "mount fuji"
 */
import https from "https";

const query = process.argv[2] || "mount fuji";

function apiGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { "User-Agent": "SnapQuizFinder/1.0" } }, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
  });
}

const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srsearch=${encodeURIComponent(query)}&srlimit=5&format=json&formatversion=2`;
const result = await apiGet(searchUrl);
const hits = result?.query?.search || [];

for (const hit of hits) {
  const title = hit.title.replace("File:", "");
  const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|size&format=json&formatversion=2`;
  const info = await apiGet(infoUrl);
  const pages = info?.query?.pages || [];
  const page = Array.isArray(pages) ? pages[0] : Object.values(pages)[0];
  const imgInfo = page?.imageinfo?.[0];
  if (imgInfo?.url) {
    const kb = Math.round((imgInfo.size || 0) / 1024);
    console.log(`✅ ${title} (${kb}KB)\n   ${imgInfo.url.slice(0, 100)}\n`);
  }
  await new Promise((r) => setTimeout(r, 300));
}
