/**
 * upload-approved.mjs
 *
 * Uploads ONLY the explicitly approved images listed below.
 * Uses Wikimedia Commons search to find real photo URLs.
 * Skips anything already on Cloudinary.
 * NOTHING outside this list will ever be uploaded.
 *
 * Run: node scripts/upload-approved.mjs
 */

import { readFileSync, mkdirSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import https from "https";
import { v2 as cloudinary } from "cloudinary";

const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dir, "../.env.local");
const CACHE_DIR = join(__dir, "../.wiki-cache");
const URL_CACHE_FILE = join(CACHE_DIR, "url-cache-approved.json");
mkdirSync(CACHE_DIR, { recursive: true });

// ── Parse .env.local ──────────────────────────────────────
const env = {};
for (const line of readFileSync(envPath, "utf8").split("\n")) {
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
console.log(`\n🔑 Cloud: ${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`);

// ── Persistent URL cache ───────────────────────────────────
const urlCache = existsSync(URL_CACHE_FILE)
  ? JSON.parse(readFileSync(URL_CACHE_FILE, "utf8"))
  : {};
function saveCache() {
  writeFileSync(URL_CACHE_FILE, JSON.stringify(urlCache, null, 2));
}

// ── HTTP helper ───────────────────────────────────────────
function apiGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { "User-Agent": "SnapQuizUploader/3.0 (approved-only)" },
    }, (res) => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch (e) { reject(e); }
      });
    }).on("error", reject).setTimeout(15000, function() { this.destroy(); });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Wikimedia Commons search ──────────────────────────────
async function findImage(searchQuery) {
  if (urlCache[searchQuery] !== undefined) return urlCache[searchQuery];
  try {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srsearch=${encodeURIComponent(searchQuery)}&srlimit=10&format=json&formatversion=2`;
    const result = await apiGet(searchUrl);
    const hits = result?.query?.search || [];
    for (const hit of hits) {
      const title = hit.title.replace("File:", "");
      if (/\.(svg|gif|webp)$/i.test(title)) continue;
      try {
        const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|size|thumburl&iiurlwidth=1600&format=json&formatversion=2`;
        const info = await apiGet(infoUrl);
        const pages = info?.query?.pages || [];
        const page = Array.isArray(pages) ? pages[0] : Object.values(pages)[0];
        const imgInfo = page?.imageinfo?.[0];
        if (!imgInfo?.url) continue;
        if ((imgInfo.size || 0) < 80_000) continue;
        const useUrl = imgInfo.thumburl || imgInfo.url;
        urlCache[searchQuery] = useUrl;
        saveCache();
        return useUrl;
      } catch { /* try next */ }
      await sleep(150);
    }
  } catch (e) {
    console.error(`    Search error: ${e.message}`);
  }
  urlCache[searchQuery] = null;
  saveCache();
  return null;
}

// ── Fetch existing Cloudinary public_ids ─────────────────
async function fetchExisting(prefix) {
  const ids = new Set();
  let next_cursor;
  do {
    const r = await cloudinary.api.resources({ type: "upload", prefix, max_results: 500, next_cursor });
    r.resources.forEach(x => ids.add(x.public_id));
    next_cursor = r.next_cursor;
  } while (next_cursor);
  return ids;
}

// ═══════════════════════════════════════════════════════════
//  APPROVED IMAGE LIST — DO NOT MODIFY without permission
//  Format: { publicId, search }
//  publicId = exact Cloudinary path
//  search   = Wikimedia Commons search query
// ═══════════════════════════════════════════════════════════
const APPROVED = [

  // ── BATCH 5 — Easy logos (11) + Musicians/DJs (8) ────────

  // easy/logos (11) — icon only, no text
  { publicId: "snap-lens/easy/logos/amazon",    search: "Amazon smile arrow logo icon" },
  { publicId: "snap-lens/easy/logos/pepsi",     search: "Pepsi globe logo icon" },
  { publicId: "snap-lens/easy/logos/microsoft", search: "Microsoft Windows logo colourful grid" },
  { publicId: "snap-lens/easy/logos/linkedin",  search: "LinkedIn in square logo icon" },
  { publicId: "snap-lens/easy/logos/twitch",    search: "Twitch purple logo icon" },
  { publicId: "snap-lens/easy/logos/telegram",  search: "Telegram paper plane logo icon" },
  { publicId: "snap-lens/easy/logos/signal",    search: "Signal messenger logo icon" },
  { publicId: "snap-lens/easy/logos/tesla",     search: "Tesla T logo icon emblem" },
  { publicId: "snap-lens/easy/logos/dropbox",   search: "Dropbox open box logo icon" },
  { publicId: "snap-lens/easy/logos/figma",     search: "Figma logo icon design tool" },
  { publicId: "snap-lens/easy/logos/coca-cola", search: "Coca-Cola red ribbon logo icon" },

  // medium/celebrities (4) — musicians
  { publicId: "snap-lens/medium/celebrities/beyonce",     search: "Beyonce singer USA" },
  { publicId: "snap-lens/medium/celebrities/ed-sheeran",  search: "Ed Sheeran singer UK" },
  { publicId: "snap-lens/medium/celebrities/eminem",      search: "Eminem rapper Detroit" },
  { publicId: "snap-lens/medium/celebrities/rihanna",     search: "Rihanna singer Barbados" },

  // extreme/celebrities (4) — DJs
  { publicId: "snap-lens/extreme/celebrities/david-guetta",  search: "David Guetta DJ France" },
  { publicId: "snap-lens/extreme/celebrities/calvin-harris", search: "Calvin Harris DJ Scotland" },
  { publicId: "snap-lens/extreme/celebrities/tiesto",        search: "Tiesto DJ Netherlands" },
  { publicId: "snap-lens/extreme/celebrities/daft-punk",     search: "Daft Punk duo France electronic" },

  // ── previous batches below (already uploaded, will be skipped) ──

  // easy/celebrities (3)
  { publicId: "snap-lens/easy/celebrities/rajinikanth",         search: "Rajinikanth Tamil actor superstar" },
  { publicId: "snap-lens/easy/celebrities/kamal-haasan",        search: "Kamal Haasan Tamil actor director" },
  { publicId: "snap-lens/easy/celebrities/ar-rahman",           search: "AR Rahman composer India" },

  // medium/celebrities (14)
  { publicId: "snap-lens/medium/celebrities/vijay-thalapathy",  search: "Vijay Thalapathy Tamil actor" },
  { publicId: "snap-lens/medium/celebrities/allu-arjun",        search: "Allu Arjun Telugu actor Pushpa" },
  { publicId: "snap-lens/medium/celebrities/prabhas",           search: "Prabhas Telugu actor Baahubali" },
  { publicId: "snap-lens/medium/celebrities/samantha",          search: "Samantha Ruth Prabhu Telugu actress" },
  { publicId: "snap-lens/medium/celebrities/nayanthara",        search: "Nayanthara Tamil actress" },
  { publicId: "snap-lens/medium/celebrities/mohanlal",          search: "Mohanlal Malayalam actor" },
  { publicId: "snap-lens/medium/celebrities/mammootty",         search: "Mammootty Malayalam actor" },
  { publicId: "snap-lens/medium/celebrities/yash-kgf",          search: "Yash KGF Kannada actor" },
  { publicId: "snap-lens/medium/celebrities/rashmika-mandanna", search: "Rashmika Mandanna Telugu actress" },
  { publicId: "snap-lens/medium/celebrities/dhanush",           search: "Dhanush Tamil actor singer" },
  { publicId: "snap-lens/medium/celebrities/mgr",               search: "MG Ramachandran Tamil Nadu Chief Minister actor" },
  { publicId: "snap-lens/medium/celebrities/jayalalithaa",      search: "Jayalalithaa Tamil Nadu Chief Minister" },
  { publicId: "snap-lens/medium/celebrities/ilaiyaraaja",       search: "Ilaiyaraaja Tamil music composer" },
  { publicId: "snap-lens/medium/celebrities/spb",               search: "SP Balasubrahmanyam singer India" },

  // extreme/celebrities (8)
  { publicId: "snap-lens/extreme/celebrities/fahadh-faasil",    search: "Fahadh Faasil Malayalam actor" },
  { publicId: "snap-lens/extreme/celebrities/trisha-krishnan",  search: "Trisha Krishnan Tamil actress" },
  { publicId: "snap-lens/extreme/celebrities/karunanidhi",      search: "M Karunanidhi Tamil Nadu Chief Minister DMK" },
  { publicId: "snap-lens/extreme/celebrities/chandrababu-naidu",search: "Chandrababu Naidu Andhra Pradesh Chief Minister" },
  { publicId: "snap-lens/extreme/celebrities/kcr",              search: "K Chandrashekar Rao Telangana Chief Minister" },
  { publicId: "snap-lens/extreme/celebrities/pullela-gopichand",search: "Pullela Gopichand badminton India" },
  { publicId: "snap-lens/extreme/celebrities/sudha-chandran",   search: "Sudha Chandran dancer actress India" },
  { publicId: "snap-lens/extreme/celebrities/sivaji-ganesan",   search: "Sivaji Ganesan Tamil actor" },

  // ── previous batches below (already uploaded, will be skipped) ──

  // medium/celebrities (3)
  { publicId: "snap-lens/medium/celebrities/virender-sehwag",    search: "Virender Sehwag cricketer India" },
  { publicId: "snap-lens/medium/celebrities/suresh-raina",       search: "Suresh Raina cricketer IPL India" },
  { publicId: "snap-lens/medium/celebrities/madhuri-dixit",      search: "Madhuri Dixit Bollywood actress" },

  // extreme/celebrities (8)
  { publicId: "snap-lens/extreme/celebrities/zaheer-khan",       search: "Zaheer Khan cricket India fast bowler" },
  { publicId: "snap-lens/extreme/celebrities/rahul-dravid",      search: "Rahul Dravid cricketer The Wall India" },
  { publicId: "snap-lens/extreme/celebrities/vvs-laxman",        search: "VVS Laxman cricketer India" },
  { publicId: "snap-lens/extreme/celebrities/aishwarya-rai",     search: "Aishwarya Rai Bachchan actress India" },
  { publicId: "snap-lens/extreme/celebrities/shabana-azmi",      search: "Shabana Azmi actress India" },
  { publicId: "snap-lens/extreme/celebrities/gulzar",            search: "Gulzar lyricist poet India" },
  { publicId: "snap-lens/extreme/celebrities/rk-laxman",         search: "R K Laxman cartoonist India" },
  { publicId: "snap-lens/extreme/celebrities/kiran-bedi",        search: "Kiran Bedi IPS officer India" },

  // ── previous batches below (already uploaded, will be skipped) ──

  // 429 rate limit retries (landmarks)
  { publicId: "snap-lens/easy/landmarks/mount-rushmore-wide",    search: "Mount Rushmore presidents sculpture" },
  { publicId: "snap-lens/easy/landmarks/central-park",           search: "Central Park Manhattan skyline" },
  { publicId: "snap-lens/extreme/landmarks/slot-canyon",         search: "Antelope Canyon narrow slot Arizona" },
  { publicId: "snap-lens/extreme/landmarks/bioluminescent-bay",  search: "Mosquito Bay Vieques bioluminescence" },

  // 429 rate limit retries (celebrities)
  { publicId: "snap-lens/medium/celebrities/neeraj-chopra",      search: "Neeraj Chopra javelin throw athlete" },
  { publicId: "snap-lens/medium/celebrities/carry-minati",       search: "CarryMinati Ajey Nagar Indian YouTuber" },
  { publicId: "snap-lens/extreme/celebrities/yuvraj-singh",      search: "Yuvraj Singh batsman cricket" },
  { publicId: "snap-lens/extreme/celebrities/kenny-sebastian",   search: "Kenny Sebastian comedian performer" },

  // No Wikimedia image — use alternate searches
  { publicId: "snap-lens/easy/celebrities/priyanka-chopra",      search: "Priyanka Chopra Jonas actress India" },
  { publicId: "snap-lens/medium/celebrities/bhuvan-bam",         search: "Bhuvan Bam actor Indian web series" },
  { publicId: "snap-lens/medium/celebrities/kunal-kamra",        search: "Kunal Kamra Indian comedian" },
  { publicId: "snap-lens/medium/celebrities/ranveer-allahbadia", search: "Ranveer Allahbadia podcaster India" },
  { publicId: "snap-lens/medium/celebrities/ankur-warikoo",      search: "Ankur Warikoo author India" },
  { publicId: "snap-lens/medium/celebrities/niharika-nm",        search: "Niharika NM Indian content creator" },
  { publicId: "snap-lens/extreme/celebrities/kl-rahul",          search: "Lokesh Rahul batsman cricket India" },
  { publicId: "snap-lens/extreme/celebrities/nora-fatehi",       search: "Nora Fatehi Bollywood dancer" },
  { publicId: "snap-lens/extreme/celebrities/deepti-sharma",     search: "Deepti Sharma Indian women cricketer" },
  { publicId: "snap-lens/extreme/celebrities/dhruv-rathee",      search: "Dhruv Rathee German Indian commentator" },
  { publicId: "snap-lens/extreme/celebrities/nikhil-kamath",     search: "Nikhil Kamath Zerodha investor India" },
  { publicId: "snap-lens/extreme/celebrities/sumukhi-suresh",    search: "Sumukhi Suresh actress comedian Bangalore" },
  { publicId: "snap-lens/extreme/celebrities/masoom-minawala",   search: "Masoom Minawala Mehta influencer India" },

  // ── (original list below — already uploaded, will be skipped) ──
  { publicId: "snap-lens/easy/landmarks/grand-canyon",           search: "Grand Canyon South Rim panorama" },
  { publicId: "snap-lens/easy/landmarks/old-faithful",           search: "Old Faithful geyser Yellowstone eruption" },
  { publicId: "snap-lens/easy/landmarks/mount-rushmore-wide",    search: "Mount Rushmore National Memorial wide" },
  { publicId: "snap-lens/easy/landmarks/times-square",           search: "Times Square New York night" },
  { publicId: "snap-lens/easy/landmarks/hollywood-sign",         search: "Hollywood Sign Los Angeles hills" },
  { publicId: "snap-lens/easy/landmarks/white-house",            search: "White House Washington DC front" },
  { publicId: "snap-lens/easy/landmarks/niagara-falls-usa",      search: "Niagara Falls American side" },
  { publicId: "snap-lens/easy/landmarks/space-needle",           search: "Space Needle Seattle" },
  { publicId: "snap-lens/easy/landmarks/las-vegas-strip",        search: "Las Vegas Strip night lights" },
  { publicId: "snap-lens/easy/landmarks/hoover-dam",             search: "Hoover Dam aerial" },
  { publicId: "snap-lens/easy/landmarks/lincoln-memorial",       search: "Lincoln Memorial Washington DC" },
  { publicId: "snap-lens/easy/landmarks/central-park",           search: "Central Park New York aerial" },
  { publicId: "snap-lens/easy/landmarks/statue-of-liberty-full", search: "Statue of Liberty full view New York" },

  // ── medium/landmarks (23 new USA locations) ──────────────
  { publicId: "snap-lens/medium/landmarks/antelope-canyon-beam", search: "Antelope Canyon light beam" },
  { publicId: "snap-lens/medium/landmarks/zion-narrows",         search: "Zion Narrows canyon Utah" },
  { publicId: "snap-lens/medium/landmarks/arches",               search: "Arches National Park Delicate Arch Utah" },
  { publicId: "snap-lens/medium/landmarks/bryce-hoodoos",        search: "Bryce Canyon hoodoos Utah" },
  { publicId: "snap-lens/medium/landmarks/monument-valley",      search: "Monument Valley Arizona buttes" },
  { publicId: "snap-lens/medium/landmarks/yosemite-valley",      search: "Yosemite Valley California" },
  { publicId: "snap-lens/medium/landmarks/half-dome",            search: "Half Dome Yosemite" },
  { publicId: "snap-lens/medium/landmarks/glacier-np",           search: "Glacier National Park Montana" },
  { publicId: "snap-lens/medium/landmarks/redwood",              search: "Redwood National Park tall trees" },
  { publicId: "snap-lens/medium/landmarks/crater-lake",          search: "Crater Lake Oregon blue water" },
  { publicId: "snap-lens/medium/landmarks/smoky-mountains",      search: "Great Smoky Mountains sunrise" },
  { publicId: "snap-lens/medium/landmarks/acadia",               search: "Acadia National Park Maine coast" },
  { publicId: "snap-lens/medium/landmarks/death-valley",         search: "Death Valley salt flats California" },
  { publicId: "snap-lens/medium/landmarks/joshua-tree",          search: "Joshua Tree National Park California" },
  { publicId: "snap-lens/medium/landmarks/us-capitol",           search: "United States Capitol Building Washington" },
  { publicId: "snap-lens/medium/landmarks/brooklyn-bridge",      search: "Brooklyn Bridge New York" },
  { publicId: "snap-lens/medium/landmarks/chrysler-building",    search: "Chrysler Building New York" },
  { publicId: "snap-lens/medium/landmarks/disney-castle",        search: "Cinderella Castle Walt Disney World" },
  { publicId: "snap-lens/medium/landmarks/french-quarter",       search: "French Quarter New Orleans Louisiana" },
  { publicId: "snap-lens/medium/landmarks/alamo",                search: "The Alamo San Antonio Texas" },
  { publicId: "snap-lens/medium/landmarks/gateway-arch",         search: "Gateway Arch St Louis Missouri" },
  { publicId: "snap-lens/medium/landmarks/mount-st-helens",      search: "Mount St Helens volcano Washington" },
  { publicId: "snap-lens/medium/landmarks/multnomah-falls",      search: "Multnomah Falls Oregon waterfall" },

  // ── extreme/landmarks (29 new USA locations) ─────────────
  { publicId: "snap-lens/extreme/landmarks/the-wave",            search: "The Wave Coyote Buttes Arizona" },
  { publicId: "snap-lens/extreme/landmarks/horseshoe-bend",      search: "Horseshoe Bend Arizona Colorado River" },
  { publicId: "snap-lens/extreme/landmarks/slot-canyon",         search: "slot canyon Arizona light rays" },
  { publicId: "snap-lens/extreme/landmarks/white-sands",         search: "White Sands National Park New Mexico" },
  { publicId: "snap-lens/extreme/landmarks/bonneville",          search: "Bonneville Salt Flats Utah" },
  { publicId: "snap-lens/extreme/landmarks/goblin-valley",       search: "Goblin Valley State Park Utah" },
  { publicId: "snap-lens/extreme/landmarks/mesa-arch",           search: "Mesa Arch Canyonlands Utah sunrise" },
  { publicId: "snap-lens/extreme/landmarks/badlands",            search: "Badlands National Park South Dakota sunset" },
  { publicId: "snap-lens/extreme/landmarks/devils-tower",        search: "Devils Tower Wyoming" },
  { publicId: "snap-lens/extreme/landmarks/tunnel-view",         search: "Tunnel View Yosemite Valley California" },
  { publicId: "snap-lens/extreme/landmarks/bristlecone",         search: "Bristlecone pine ancient forest California" },
  { publicId: "snap-lens/extreme/landmarks/havasu-falls",        search: "Havasu Falls Havasupai Arizona" },
  { publicId: "snap-lens/extreme/landmarks/maroon-bells",        search: "Maroon Bells Colorado reflection" },
  { publicId: "snap-lens/extreme/landmarks/rocky-mountain",      search: "Rocky Mountain National Park Colorado" },
  { publicId: "snap-lens/extreme/landmarks/great-sand-dunes",    search: "Great Sand Dunes National Park Colorado" },
  { publicId: "snap-lens/extreme/landmarks/bioluminescent-bay",  search: "bioluminescent bay Puerto Rico night" },
  { publicId: "snap-lens/extreme/landmarks/na-pali",             search: "Na Pali Coast Kauai Hawaii" },
  { publicId: "snap-lens/extreme/landmarks/waimea-canyon",       search: "Waimea Canyon Kauai Hawaii" },
  { publicId: "snap-lens/extreme/landmarks/black-sand-beach",    search: "black sand beach Hawaii volcanic" },
  { publicId: "snap-lens/extreme/landmarks/denali",              search: "Denali mountain peak Alaska" },
  { publicId: "snap-lens/extreme/landmarks/mendenhall",          search: "Mendenhall Glacier Alaska" },
  { publicId: "snap-lens/extreme/landmarks/kenai-fjords",        search: "Kenai Fjords National Park Alaska" },
  { publicId: "snap-lens/extreme/landmarks/pictured-rocks",      search: "Pictured Rocks National Lakeshore Michigan" },
  { publicId: "snap-lens/extreme/landmarks/apostle-islands",     search: "Apostle Islands ice caves Wisconsin" },
  { publicId: "snap-lens/extreme/landmarks/thors-hammer",        search: "Thor's Hammer Bryce Canyon Utah" },
  { publicId: "snap-lens/extreme/landmarks/delicate-arch",       search: "Delicate Arch sunset Utah" },
  { publicId: "snap-lens/extreme/landmarks/dry-tortugas",        search: "Dry Tortugas National Park Florida aerial" },
  { publicId: "snap-lens/extreme/landmarks/cumberland-island",   search: "Cumberland Island wild horses Georgia" },
  { publicId: "snap-lens/extreme/landmarks/palouse-falls",       search: "Palouse Falls Washington state" },

  // ── easy/celebrities (2 missing) ─────────────────────────
  { publicId: "snap-lens/easy/celebrities/virat-kohli",          search: "Virat Kohli cricketer portrait" },
  { publicId: "snap-lens/easy/celebrities/priyanka-chopra",      search: "Priyanka Chopra actress portrait" },

  // ── medium/celebrities (34 missing) ──────────────────────
  { publicId: "snap-lens/medium/celebrities/rohit-sharma",       search: "Rohit Sharma cricketer India" },
  { publicId: "snap-lens/medium/celebrities/jasprit-bumrah",     search: "Jasprit Bumrah cricketer India" },
  { publicId: "snap-lens/medium/celebrities/pv-sindhu",          search: "PV Sindhu badminton India" },
  { publicId: "snap-lens/medium/celebrities/neeraj-chopra",      search: "Neeraj Chopra javelin India Olympics" },
  { publicId: "snap-lens/medium/celebrities/sania-mirza",        search: "Sania Mirza tennis India" },
  { publicId: "snap-lens/medium/celebrities/mary-kom",           search: "Mary Kom boxing India" },
  { publicId: "snap-lens/medium/celebrities/mithali-raj",        search: "Mithali Raj cricket India women" },
  { publicId: "snap-lens/medium/celebrities/saina-nehwal",       search: "Saina Nehwal badminton India" },
  { publicId: "snap-lens/medium/celebrities/leander-paes",       search: "Leander Paes tennis India" },
  { publicId: "snap-lens/medium/celebrities/shah-rukh-khan",     search: "Shah Rukh Khan Bollywood actor" },
  { publicId: "snap-lens/medium/celebrities/amitabh-bachchan",   search: "Amitabh Bachchan Bollywood actor" },
  { publicId: "snap-lens/medium/celebrities/aamir-khan",         search: "Aamir Khan Bollywood actor" },
  { publicId: "snap-lens/medium/celebrities/ranveer-singh",      search: "Ranveer Singh Bollywood actor" },
  { publicId: "snap-lens/medium/celebrities/kareena-kapoor",     search: "Kareena Kapoor Bollywood actress" },
  { publicId: "snap-lens/medium/celebrities/katrina-kaif",       search: "Katrina Kaif Bollywood actress" },
  { publicId: "snap-lens/medium/celebrities/kapil-sharma",       search: "Kapil Sharma comedian India" },
  { publicId: "snap-lens/medium/celebrities/narendra-modi",      search: "Narendra Modi Prime Minister India" },
  { publicId: "snap-lens/medium/celebrities/rahul-gandhi",       search: "Rahul Gandhi politician India" },
  { publicId: "snap-lens/medium/celebrities/arvind-kejriwal",    search: "Arvind Kejriwal politician Delhi" },
  { publicId: "snap-lens/medium/celebrities/sundar-pichai",      search: "Sundar Pichai Google CEO" },
  { publicId: "snap-lens/medium/celebrities/satya-nadella",      search: "Satya Nadella Microsoft CEO" },
  { publicId: "snap-lens/medium/celebrities/bajrang-punia",      search: "Bajrang Punia wrestler India" },
  { publicId: "snap-lens/medium/celebrities/taapsee-pannu",      search: "Taapsee Pannu actress India" },
  { publicId: "snap-lens/medium/celebrities/deepika-padukone-m", search: "Deepika Padukone Bollywood actress" },
  { publicId: "snap-lens/medium/celebrities/sudha-murthy",       search: "Sudha Murthy philanthropist India" },
  { publicId: "snap-lens/medium/celebrities/bhuvan-bam",         search: "Bhuvan Bam BB Ki Vines YouTuber India" },
  { publicId: "snap-lens/medium/celebrities/carry-minati",       search: "CarryMinati YouTube India" },
  { publicId: "snap-lens/medium/celebrities/ashish-chanchlani",  search: "Ashish Chanchlani YouTuber India" },
  { publicId: "snap-lens/medium/celebrities/zakir-khan",         search: "Zakir Khan comedian India" },
  { publicId: "snap-lens/medium/celebrities/kunal-kamra",        search: "Kunal Kamra stand-up India" },
  { publicId: "snap-lens/medium/celebrities/ranveer-allahbadia", search: "Ranveer Allahbadia BeerBiceps India" },
  { publicId: "snap-lens/medium/celebrities/ankur-warikoo",      search: "Ankur Warikoo entrepreneur India" },
  { publicId: "snap-lens/medium/celebrities/sonia-gandhi",       search: "Sonia Gandhi India politician" },
  { publicId: "snap-lens/medium/celebrities/niharika-nm",        search: "Niharika NM influencer India" },

  // ── extreme/celebrities (39 missing) ─────────────────────
  { publicId: "snap-lens/extreme/celebrities/hardik-pandya",     search: "Hardik Pandya cricketer India" },
  { publicId: "snap-lens/extreme/celebrities/kl-rahul",          search: "KL Rahul cricketer India" },
  { publicId: "snap-lens/extreme/celebrities/smriti-mandhana",   search: "Smriti Mandhana cricket India women" },
  { publicId: "snap-lens/extreme/celebrities/shubman-gill",      search: "Shubman Gill cricketer India" },
  { publicId: "snap-lens/extreme/celebrities/yashasvi-jaiswal",  search: "Yashasvi Jaiswal cricketer India" },
  { publicId: "snap-lens/extreme/celebrities/abhinav-bindra",    search: "Abhinav Bindra shooting Olympics India" },
  { publicId: "snap-lens/extreme/celebrities/hima-das",          search: "Hima Das sprinter India" },
  { publicId: "snap-lens/extreme/celebrities/mirabai-chanu",     search: "Mirabai Chanu weightlifting Olympics India" },
  { publicId: "snap-lens/extreme/celebrities/ravi-dahiya",       search: "Ravi Dahiya wrestler Olympics India" },
  { publicId: "snap-lens/extreme/celebrities/vijender-singh",    search: "Vijender Singh boxer India" },
  { publicId: "snap-lens/extreme/celebrities/yuvraj-singh",      search: "Yuvraj Singh cricketer India" },
  { publicId: "snap-lens/extreme/celebrities/harbhajan-singh",   search: "Harbhajan Singh cricketer India" },
  { publicId: "snap-lens/extreme/celebrities/sourav-ganguly",    search: "Sourav Ganguly cricketer India" },
  { publicId: "snap-lens/extreme/celebrities/anil-kapoor",       search: "Anil Kapoor Bollywood actor" },
  { publicId: "snap-lens/extreme/celebrities/ajay-devgn",        search: "Ajay Devgn Bollywood actor" },
  { publicId: "snap-lens/extreme/celebrities/vidya-balan",       search: "Vidya Balan Bollywood actress" },
  { publicId: "snap-lens/extreme/celebrities/nawazuddin",        search: "Nawazuddin Siddiqui actor India" },
  { publicId: "snap-lens/extreme/celebrities/pankaj-tripathi",   search: "Pankaj Tripathi actor India" },
  { publicId: "snap-lens/extreme/celebrities/rajkummar-rao",     search: "Rajkummar Rao actor India" },
  { publicId: "snap-lens/extreme/celebrities/alia-bhatt",        search: "Alia Bhatt Bollywood actress" },
  { publicId: "snap-lens/extreme/celebrities/varun-dhawan",      search: "Varun Dhawan Bollywood actor" },
  { publicId: "snap-lens/extreme/celebrities/nora-fatehi",       search: "Nora Fatehi dancer actress" },
  { publicId: "snap-lens/extreme/celebrities/irrfan-khan",       search: "Irrfan Khan actor India" },
  { publicId: "snap-lens/extreme/celebrities/rekha",             search: "Rekha Bollywood actress India" },
  { publicId: "snap-lens/extreme/celebrities/milkha-singh",      search: "Milkha Singh sprinter India" },
  { publicId: "snap-lens/extreme/celebrities/dipa-karmakar",     search: "Dipa Karmakar gymnastics India" },
  { publicId: "snap-lens/extreme/celebrities/deepti-sharma",     search: "Deepti Sharma cricket India women" },
  { publicId: "snap-lens/extreme/celebrities/kenny-sebastian",   search: "Kenny Sebastian stand-up comedian India" },
  { publicId: "snap-lens/extreme/celebrities/biswa-kalyan",      search: "Biswa Kalyan Rath comedian India" },
  { publicId: "snap-lens/extreme/celebrities/dhruv-rathee",      search: "Dhruv Rathee YouTuber India" },
  { publicId: "snap-lens/extreme/celebrities/nikhil-kamath",     search: "Nikhil Kamath entrepreneur India" },
  { publicId: "snap-lens/extreme/celebrities/chetan-bhagat",     search: "Chetan Bhagat author India" },
  { publicId: "snap-lens/extreme/celebrities/lilly-singh",       search: "Lilly Singh YouTuber IISuperwomanII" },
  { publicId: "snap-lens/extreme/celebrities/radhika-apte",      search: "Radhika Apte actress India" },
  { publicId: "snap-lens/extreme/celebrities/yami-gautam",       search: "Yami Gautam actress India" },
  { publicId: "snap-lens/extreme/celebrities/hema-malini",       search: "Hema Malini actress India" },
  { publicId: "snap-lens/extreme/celebrities/faye-dsouza",       search: "Faye D'Souza journalist India" },
  { publicId: "snap-lens/extreme/celebrities/sumukhi-suresh",    search: "Sumukhi Suresh comedian India" },
  { publicId: "snap-lens/extreme/celebrities/masoom-minawala",   search: "Masoom Minawala fashion influencer India" },
];

// ══════════════════════════════════════════════════════════
//  MAIN
// ══════════════════════════════════════════════════════════
console.log(`\n📋 Approved list: ${APPROVED.length} images`);
console.log("🔍 Fetching existing Cloudinary images...\n");

const existing = await fetchExisting("snap-lens");
const toUpload = APPROVED.filter(x => !existing.has(x.publicId));

console.log(`✅ Already on Cloudinary: ${APPROVED.length - toUpload.length}`);
console.log(`📤 To upload: ${toUpload.length}\n`);

if (toUpload.length === 0) {
  console.log("Nothing to do!");
  process.exit(0);
}

let uploaded = 0, failed = 0;
const failures = [];

for (const item of toUpload) {
  const shortId = item.publicId.replace("snap-lens/", "");
  process.stdout.write(`  ⏳ ${shortId} ... `);

  const imageUrl = await findImage(item.search);
  if (!imageUrl) {
    console.log(`❌ No image found for "${item.search}"`);
    failures.push({ ...item, reason: "no image found" });
    failed++;
    await sleep(300);
    continue;
  }

  try {
    await cloudinary.uploader.upload(imageUrl, {
      public_id: item.publicId,
      overwrite: false,
      resource_type: "image",
      folder: "",
    });
    console.log(`✅`);
    uploaded++;
  } catch (e) {
    // Already exists = fine, count as success
    if (e?.http_code === 409 || e?.message?.includes("already exists")) {
      console.log(`⚠️  already exists`);
      uploaded++;
    } else {
      console.log(`❌ Upload failed: ${e.message}`);
      failures.push({ ...item, reason: e.message });
      failed++;
    }
  }

  await sleep(400);
}

console.log(`\n${"═".repeat(50)}`);
console.log(`  ✅ Uploaded: ${uploaded}`);
console.log(`  ❌ Failed:   ${failed}`);
if (failures.length > 0) {
  console.log(`\n  Failed items:`);
  failures.forEach(f => console.log(`    - ${f.publicId.replace("snap-lens/","")}: ${f.reason}`));
}
console.log(`${"═".repeat(50)}\n`);
