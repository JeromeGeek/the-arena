/**
 * SnapQuiz — Smart Upload v2 (verified Wikimedia URLs via Commons search API)
 *
 * Strategy:
 *  - Wikimedia images: search Commons API for real filenames → verified URL → download → upload
 *  - Flags: flagpedia.net (direct, always reliable)
 *  - Logos: cdn.simpleicons.org SVG (direct, always reliable)
 *  - URL results cached in .wiki-cache/url-cache.json to survive restarts
 *
 * Run: node scripts/upload-smart.mjs
 */

import { readFileSync, mkdirSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createHash } from "crypto";
import https from "https";
import http from "http";
import { v2 as cloudinary } from "cloudinary";
import * as simpleIcons from "simple-icons";

const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dir, "../.env.local");
const CACHE_DIR = join(__dir, "../.wiki-cache");
const URL_CACHE_FILE = join(CACHE_DIR, "url-cache.json");
mkdirSync(CACHE_DIR, { recursive: true });

// ── Parse .env.local ──────────────────────────────────────
const env = {};
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx === -1) continue;
  env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
}

cloudinary.config({
  cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

console.log(`\n🔑 Cloud: ${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`);
console.log(`   Key:   ${env.CLOUDINARY_API_KEY?.slice(0, 8)}...`);

// ── Persistent URL cache ───────────────────────────────────
const urlCache = existsSync(URL_CACHE_FILE)
  ? JSON.parse(readFileSync(URL_CACHE_FILE, "utf8"))
  : {};
function saveUrlCache() {
  writeFileSync(URL_CACHE_FILE, JSON.stringify(urlCache, null, 2));
}

// ── HTTP helper ────────────────────────────────────────────
function apiGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { "User-Agent": "SnapQuizUploader/2.0 (https://github.com/JeromeGeek/the-arena)" },
    }, (res) => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Search Wikimedia Commons for best image URL ───────────
// Returns a thumbnail URL (max 1600px wide) to avoid oversized files.
async function findCommonsImage(searchQuery, minSizeKB = 80) {
  if (urlCache[searchQuery] !== undefined) return urlCache[searchQuery];

  try {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srsearch=${encodeURIComponent(searchQuery)}&srlimit=10&format=json&formatversion=2`;
    const result = await apiGet(searchUrl);
    const hits = result?.query?.search || [];

    for (const hit of hits) {
      const title = hit.title.replace("File:", "");
      // Skip obvious non-photos
      if (/\.(svg|gif|webp)$/i.test(title)) continue;
      if (/map|plan|diagram|schema|drawing|coat_of_arms|logo|icon|flag/i.test(title) && !/landmark|mountain|waterfall|canyon|cave/i.test(searchQuery)) continue;

      try {
        // Request both full imageinfo AND a 1600px thumbnail URL
        const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|size|thumburl&iiurlwidth=1600&format=json&formatversion=2`;
        const info = await apiGet(infoUrl);
        const pages = info?.query?.pages || [];
        const page = Array.isArray(pages) ? pages[0] : Object.values(pages)[0];
        const imgInfo = page?.imageinfo?.[0];

        if (!imgInfo?.url) continue;
        const sizeKB = Math.round((imgInfo.size || 0) / 1024);
        if (sizeKB < minSizeKB) continue;

        // Prefer the 1600px thumbnail — it's always under 10MB and loads fast
        const useUrl = imgInfo.thumburl || imgInfo.url;
        urlCache[searchQuery] = useUrl;
        saveUrlCache();
        return useUrl;
      } catch { /* try next hit */ }

      await sleep(150);
    }
  } catch (e) {
    console.error(`    Search error for "${searchQuery}": ${e.message}`);
  }

  urlCache[searchQuery] = null;
  saveUrlCache();
  return null;
}

// ── Source URL helpers ─────────────────────────────────────
const FLAG = cc => `https://flagpedia.net/data/flags/w2560/${cc}.png`;
const SI = (name, color = "000000") => `https://cdn.simpleicons.org/${name}/${color}`;

// ── Download image to buffer ───────────────────────────────
function downloadToBuffer(url) {
  return new Promise((resolve, reject) => {
    const fetchImage = (u, redirects = 8) => {
      if (redirects < 0) return reject(new Error("Too many redirects"));
      const mod = u.startsWith("https") ? https : http;
      const req = mod.get(u, {
        headers: {
          "User-Agent": "SnapQuizUploader/2.0 (https://github.com/JeromeGeek/the-arena)",
          "Accept": "image/jpeg,image/png,image/*;q=0.9",
        },
      }, (res) => {
        if ([301, 302, 307, 308].includes(res.statusCode)) {
          res.resume();
          return fetchImage(res.headers.location, redirects - 1);
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode} for ${u}`));
        }
        const chunks = [];
        res.on("data", c => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      });
      req.on("error", reject);
      req.setTimeout(60000, () => { req.destroy(); reject(new Error("Timeout")); });
    };
    fetchImage(url);
  });
}

// ══════════════════════════════════════════════════════════
//  600-IMAGE MANIFEST
//  Format: [cloudinary_public_id, type, query_or_value]
//  type: "wiki" | "flag" | "logo"
// ══════════════════════════════════════════════════════════
const IMAGES = [

  // ── LANDMARKS easy (50) ───────────────────────────────
  ["snap-lens/easy/landmarks/eiffel-tower",          "wiki", "Eiffel Tower Paris photo"],
  ["snap-lens/easy/landmarks/taj-mahal",             "wiki", "Taj Mahal Agra India photo"],
  ["snap-lens/easy/landmarks/colosseum",             "wiki", "Colosseum Rome Italy photo"],
  ["snap-lens/easy/landmarks/statue-of-liberty",     "wiki", "Statue of Liberty New York photo"],
  ["snap-lens/easy/landmarks/burj-khalifa",          "wiki", "Burj Khalifa Dubai photo"],
  ["snap-lens/easy/landmarks/big-ben",               "wiki", "Big Ben London Westminster photo"],
  ["snap-lens/easy/landmarks/great-wall",            "wiki", "Great Wall of China photo"],
  ["snap-lens/easy/landmarks/machu-picchu",          "wiki", "Machu Picchu Peru photo"],
  ["snap-lens/easy/landmarks/sydney-opera-house",    "wiki", "Sydney Opera House photo"],
  ["snap-lens/easy/landmarks/pyramids-giza",         "wiki", "Pyramids of Giza Egypt photo"],
  ["snap-lens/easy/landmarks/golden-gate",           "wiki", "Golden Gate Bridge San Francisco photo"],
  ["snap-lens/easy/landmarks/tower-bridge",          "wiki", "Tower Bridge London photo"],
  ["snap-lens/easy/landmarks/niagara-falls",         "wiki", "Niagara Falls Horseshoe Falls waterfall photo"],
  ["snap-lens/easy/landmarks/christ-redeemer",       "wiki", "Christ the Redeemer Rio de Janeiro photo"],
  ["snap-lens/easy/landmarks/tower-of-pisa",         "wiki", "Leaning Tower of Pisa photo"],
  ["snap-lens/easy/landmarks/stonehenge",            "wiki", "Stonehenge England photo"],
  ["snap-lens/easy/landmarks/acropolis",             "wiki", "Acropolis Athens Greece photo"],
  ["snap-lens/easy/landmarks/sagrada-familia",       "wiki", "Sagrada Familia Barcelona photo"],
  ["snap-lens/easy/landmarks/mount-fuji",            "wiki", "Mount Fuji Japan snow photo"],
  ["snap-lens/easy/landmarks/angkor-wat",            "wiki", "Angkor Wat Cambodia reflection photo"],
  ["snap-lens/easy/landmarks/petra",                 "wiki", "Petra Treasury Jordan photo"],
  ["snap-lens/easy/landmarks/hagia-sophia",          "wiki", "Hagia Sophia Istanbul photo"],
  ["snap-lens/easy/landmarks/santorini",             "wiki", "Santorini Greece white blue photo"],
  ["snap-lens/easy/landmarks/forbidden-city",        "wiki", "Forbidden City Beijing photo"],
  ["snap-lens/easy/landmarks/chichen-itza",          "wiki", "Chichen Itza El Castillo step pyramid Yucatan photo"],
  ["snap-lens/easy/landmarks/neuschwanstein",        "wiki", "Neuschwanstein Castle Bavaria photo"],
  ["snap-lens/easy/landmarks/mount-everest",         "wiki", "Mount Everest Himalayas photo"],
  ["snap-lens/easy/landmarks/colosseum-inside",      "wiki", "Colosseum Rome interior arena photo"],
  ["snap-lens/easy/landmarks/eiffel-night",          "wiki", "Eiffel Tower night illuminated photo"],
  ["snap-lens/easy/landmarks/golden-gate-fog",       "wiki", "Golden Gate Bridge fog mist photo"],
  ["snap-lens/easy/landmarks/big-ben-westminster",   "wiki", "Big Ben Westminster Bridge London photo"],
  ["snap-lens/easy/landmarks/machu-picchu-aerial",   "wiki", "Machu Picchu"],
  ["snap-lens/easy/landmarks/stonehenge-sunset",     "wiki", "Stonehenge sunset"],
  ["snap-lens/easy/landmarks/sagrada-towers",        "wiki", "Sagrada Familia towers"],
  ["snap-lens/easy/landmarks/neuschwanstein-aerial", "wiki", "Neuschwanstein Castle"],
  ["snap-lens/easy/landmarks/petra-siq",             "wiki", "Petra Siq narrow canyon Jordan photo"],
  ["snap-lens/easy/landmarks/angkor-wat-sunrise",    "wiki", "Angkor Wat sunrise silhouette photo"],
  ["snap-lens/easy/landmarks/burj-khalifa-aerial",   "wiki", "Burj Khalifa aerial Dubai skyline photo"],
  ["snap-lens/easy/landmarks/acropolis-parthenon",   "wiki", "Parthenon Acropolis Athens columns photo"],
  ["snap-lens/easy/landmarks/chichen-itza-equinox",  "wiki", "Chichen Itza El Castillo pyramid photo"],
  ["snap-lens/easy/landmarks/sydney-opera-night",    "wiki", "Sydney Opera House night reflection photo"],
  ["snap-lens/easy/landmarks/pyramids-aerial",       "wiki", "Pyramids Giza aerial desert photo"],
  ["snap-lens/easy/landmarks/great-wall-autumn",     "wiki", "Great Wall China autumn fall photo"],
  ["snap-lens/easy/landmarks/trevi-fountain",        "wiki", "Trevi Fountain Rome night photo"],
  ["snap-lens/easy/landmarks/alhambra-palace",       "wiki", "Alhambra Palace Granada Spain photo"],
  ["snap-lens/easy/landmarks/victoria-falls",        "wiki", "Victoria Falls waterfall Africa photo"],
  ["snap-lens/easy/landmarks/burj-khalifa-top",      "wiki", "Burj Khalifa observation deck view photo"],
  ["snap-lens/easy/landmarks/mont-blanc",            "wiki", "Mont Blanc glacier Alps France photo"],
  ["snap-lens/easy/landmarks/aurora-borealis",       "wiki", "Aurora borealis northern lights Iceland photo"],
  ["snap-lens/easy/landmarks/venice-canals",         "wiki", "Venice Grand Canal gondola Italy photo"],

  // ── LANDMARKS medium (50) ────────────────────────────
  ["snap-lens/medium/landmarks/mont-saint-michel",   "wiki", "Mont Saint-Michel France tidal island photo"],
  ["snap-lens/medium/landmarks/alhambra",            "wiki", "Alhambra Granada Spain palace photo"],
  ["snap-lens/medium/landmarks/cappadocia",          "wiki", "Cappadocia hot air balloons sunrise Turkey photo"],
  ["snap-lens/medium/landmarks/bagan-temples",       "wiki", "Bagan temples Myanmar sunrise photo"],
  ["snap-lens/medium/landmarks/edinburgh-castle",    "wiki", "Edinburgh Castle Scotland rock hill photo"],
  ["snap-lens/medium/landmarks/prague-castle",       "wiki", "Prague Castle Czech Republic Hradcany photo"],
  ["snap-lens/medium/landmarks/meteora",             "wiki", "Meteora monasteries pillar rock Greece photo"],
  ["snap-lens/medium/landmarks/amalfi-coast",        "wiki", "Amalfi Coast"],
  ["snap-lens/medium/landmarks/dubrovnik",           "wiki", "Dubrovnik old town Croatia city walls photo"],
  ["snap-lens/medium/landmarks/potala-palace",       "wiki", "Potala Palace Lhasa Tibet photo"],
  ["snap-lens/medium/landmarks/borobudur",           "wiki", "Borobudur Buddhist temple Indonesia sunrise photo"],
  ["snap-lens/medium/landmarks/easter-island",       "wiki", "Easter Island Moai statues Ahu Tongariki photo"],
  ["snap-lens/medium/landmarks/louvre",              "wiki", "Louvre Museum Paris glass pyramid photo"],
  ["snap-lens/medium/landmarks/buckingham-palace",   "wiki", "Buckingham Palace London ceremonial photo"],
  ["snap-lens/medium/landmarks/arc-triomphe",        "wiki", "Arc de Triomphe Paris photo"],
  ["snap-lens/medium/landmarks/trevi-fountain",      "wiki", "Trevi Fountain Rome Italy night photo"],
  ["snap-lens/medium/landmarks/iguazu-falls",        "wiki", "Iguazu Falls Argentina Brazil photo"],
  ["snap-lens/medium/landmarks/iguazu-falls-air",    "wiki", "Iguazu Falls aerial view Argentina photo"],
  ["snap-lens/medium/landmarks/halong-bay",          "wiki", "Ha Long Bay Vietnam karst limestone photo"],
  ["snap-lens/medium/landmarks/grand-canyon",        "wiki", "Grand Canyon Arizona USA photo"],
  ["snap-lens/medium/landmarks/pompeii",             "wiki", "Pompeii ruins street Italy photo"],
  ["snap-lens/medium/landmarks/notre-dame",          "wiki", "Notre Dame Cathedral Paris photo"],
  ["snap-lens/medium/landmarks/versailles",          "wiki", "Palace of Versailles gardens fountain photo"],
  ["snap-lens/medium/landmarks/uluru",               "wiki", "Uluru Ayers Rock Australia photo"],
  ["snap-lens/medium/landmarks/matterhorn",          "wiki", "Matterhorn Switzerland alpine photo"],
  ["snap-lens/medium/landmarks/empire-state",        "wiki", "Empire State Building New York photo"],
  ["snap-lens/medium/landmarks/burj-al-arab",        "wiki", "Burj Al Arab hotel"],
  ["snap-lens/medium/landmarks/yellowstone",         "wiki", "Grand Prismatic Spring Yellowstone photo"],
  ["snap-lens/medium/landmarks/dead-sea",            "wiki", "Dead Sea floating Israel Jordan photo"],
  ["snap-lens/medium/landmarks/varanasi-ghats",      "wiki", "Varanasi ghats Ganges India photo"],
  ["snap-lens/medium/landmarks/norway-fjords",       "wiki", "Geirangerfjord Norway fjord photo"],
  ["snap-lens/medium/landmarks/great-sphinx",        "wiki", "Great Sphinx Giza Egypt photo"],
  ["snap-lens/medium/landmarks/sistine-chapel",      "wiki", "Sistine Chapel ceiling Vatican Michelangelo photo"],
  ["snap-lens/medium/landmarks/cologne-cathedral",   "wiki", "Cologne Cathedral Germany gothic photo"],
  ["snap-lens/medium/landmarks/alcazar-segovia",     "wiki", "Alcazar Segovia castle Spain photo"],
  ["snap-lens/medium/landmarks/alhambra-court",      "wiki", "Alhambra Court of Lions Granada photo"],
  ["snap-lens/medium/landmarks/mezquita-cordoba",    "wiki", "Mezquita Cathedral Cordoba Spain arches photo"],
  ["snap-lens/medium/landmarks/inca-trail",          "wiki", "Inca Trail Peru"],
  ["snap-lens/medium/landmarks/valley-kings",        "wiki", "Valley of the Kings Luxor Egypt photo"],
  ["snap-lens/medium/landmarks/angkor-thom",         "wiki", "Angkor Thom Bayon temple faces photo"],
  ["snap-lens/medium/landmarks/serengeti",           "wiki", "Serengeti Tanzania wildebeest migration photo"],
  ["snap-lens/medium/landmarks/sahara-dunes",        "wiki", "Sahara desert sand dunes Morocco photo"],
  ["snap-lens/medium/landmarks/prague-old-town",     "wiki", "Prague Old Town Square astronomical clock photo"],
  ["snap-lens/medium/landmarks/versailles-hall",     "wiki", "Hall of Mirrors Versailles France photo"],
  ["snap-lens/medium/landmarks/halong-boat",         "wiki", "Ha Long Bay junk boat Vietnam photo"],
  ["snap-lens/medium/landmarks/notre-dame-aerial",   "wiki", "Notre Dame Cathedral Paris aerial view photo"],
  ["snap-lens/medium/landmarks/grand-canyon-sunset", "wiki", "Grand Canyon sunset panorama photo"],
  ["snap-lens/medium/landmarks/plitvice-lakes",      "wiki", "Plitvice Lakes waterfall Croatia photo"],
  ["snap-lens/medium/landmarks/pamukkale",           "wiki", "Pamukkale thermal travertine pools Turkey photo"],
  ["snap-lens/medium/landmarks/victoria-falls",      "wiki", "Victoria Falls Zimbabwe Zambia photo"],

  // ── LANDMARKS extreme (50) ───────────────────────────
  ["snap-lens/extreme/landmarks/hallstatt",          "wiki", "Hallstatt Austria village lake photo"],
  ["snap-lens/extreme/landmarks/wadi-rum",           "wiki", "Wadi Rum desert Jordan photo"],
  ["snap-lens/extreme/landmarks/antelope-canyon",    "wiki", "Antelope Canyon Arizona slot canyon photo"],
  ["snap-lens/extreme/landmarks/giants-causeway",    "wiki", "Giant's Causeway Northern Ireland basalt photo"],
  ["snap-lens/extreme/landmarks/trolltunga",         "wiki", "Trolltunga Norway"],
  ["snap-lens/extreme/landmarks/preikestolen",       "wiki", "Preikestolen pulpit rock Norway photo"],
  ["snap-lens/extreme/landmarks/salar-uyuni",        "wiki", "Salar de Uyuni Bolivia salt flat photo"],
  ["snap-lens/extreme/landmarks/zhangjiajie",        "wiki", "Zhangjiajie floating mountains China photo"],
  ["snap-lens/extreme/landmarks/lake-baikal",        "wiki", "Lake Baikal ice Russia photo"],
  ["snap-lens/extreme/landmarks/namib-dunes",        "wiki", "Sossusvlei Namib desert dunes photo"],
  ["snap-lens/extreme/landmarks/marble-caves",       "wiki", "Marble Caves Patagonia Chile photo"],
  ["snap-lens/extreme/landmarks/painted-hills",      "wiki", "Painted Hills Oregon colorful photo"],
  ["snap-lens/extreme/landmarks/jiuzhaigou",         "wiki", "Jiuzhaigou colored lakes China photo"],
  ["snap-lens/extreme/landmarks/lake-hillier",       "wiki", "Lake Hillier pink"],
  ["snap-lens/extreme/landmarks/bryce-canyon",       "wiki", "Bryce Canyon hoodoos Utah USA photo"],
  ["snap-lens/extreme/landmarks/dolomites",          "wiki", "Tre Cime di Lavaredo Dolomites Italy photo"],
  ["snap-lens/extreme/landmarks/fairy-pools",        "wiki", "Fairy Pools Isle of Skye Scotland photo"],
  ["snap-lens/extreme/landmarks/black-sand-beach",   "wiki", "Reynisfjara black sand beach Iceland photo"],
  ["snap-lens/extreme/landmarks/seljalandsfoss",     "wiki", "Seljalandsfoss waterfall Iceland photo"],
  ["snap-lens/extreme/landmarks/peyto-lake",         "wiki", "Peyto Lake Banff Canada turquoise photo"],
  ["snap-lens/extreme/landmarks/door-to-hell",       "wiki", "Darvaza gas crater Turkmenistan fire photo"],
  ["snap-lens/extreme/landmarks/waitomo-caves",      "wiki", "Waitomo glowworm caves New Zealand photo"],
  ["snap-lens/extreme/landmarks/tigers-nest",        "wiki", "Tiger's Nest monastery Bhutan cliff photo"],
  ["snap-lens/extreme/landmarks/torres-del-paine",   "wiki", "Torres del Paine Patagonia Chile photo"],
  ["snap-lens/extreme/landmarks/chocolate-hills",    "wiki", "Chocolate Hills Bohol Philippines photo"],
  ["snap-lens/extreme/landmarks/wave-rock",          "wiki", "Wave Rock Hyden Western Australia photo"],
  ["snap-lens/extreme/landmarks/moeraki-boulders",   "wiki", "Moeraki Boulders New Zealand beach photo"],
  ["snap-lens/extreme/landmarks/tsingy",             "wiki", "Tsingy de Bemaraha Madagascar photo"],
  ["snap-lens/extreme/landmarks/son-doong",          "wiki", "Son Doong cave Vietnam photo"],
  ["snap-lens/extreme/landmarks/lake-natron",        "wiki", "Lake Natron Tanzania flamingo photo"],
  ["snap-lens/extreme/landmarks/rio-tinto",          "wiki", "Rio Tinto red river Huelva Spain photo"],
  ["snap-lens/extreme/landmarks/fingals-cave",       "wiki", "Fingal's Cave Staffa Scotland basalt photo"],
  ["snap-lens/extreme/landmarks/lencois",            "wiki", "Lencois Maranhenses lagoons Brazil photo"],
  ["snap-lens/extreme/landmarks/reine",              "wiki", "Reine Lofoten Islands Norway village photo"],
  ["snap-lens/extreme/landmarks/tepui-roraima",      "wiki", "Mount Roraima"],
  ["snap-lens/extreme/landmarks/patagonia-glacier",  "wiki", "Perito Moreno glacier Patagonia Argentina photo"],
  ["snap-lens/extreme/landmarks/apostle-islands",    "wiki", "Apostle Islands sea caves Wisconsin photo"],
  ["snap-lens/extreme/landmarks/cappadocia-balloon", "wiki", "Cappadocia balloon fairy chimneys Turkey photo"],
  ["snap-lens/extreme/landmarks/danakil",            "wiki", "Danakil Depression Dallol Ethiopia photo"],
  ["snap-lens/extreme/landmarks/socotra",            "wiki", "Socotra Dragon Blood tree Yemen photo"],
  ["snap-lens/extreme/landmarks/cano-cristales",     "wiki", "Cano Cristales Caño Cristales river Colombia photo"],
  ["snap-lens/extreme/landmarks/plain-of-jars",      "wiki", "Plain of Jars Laos"],
  ["snap-lens/extreme/landmarks/gosaikunda",         "wiki", "Gosaikunda Nepal"],
  ["snap-lens/extreme/landmarks/bigar-waterfall",    "wiki", "Bigar waterfall Romania photo"],
  ["snap-lens/extreme/landmarks/vatnajokull",        "wiki", "Vatnajokull glacier Iceland photo"],
  ["snap-lens/extreme/landmarks/ice-cave-iceland",   "wiki", "Ice cave glacier Iceland blue photo"],
  ["snap-lens/extreme/landmarks/fly-geyser",         "wiki", "Fly Geyser Nevada USA photo"],
  ["snap-lens/extreme/landmarks/zhangjiajie-bridge", "wiki", "Zhangjiajie glass bridge China photo"],
  ["snap-lens/extreme/landmarks/wadi-rum-arch",      "wiki", "Wadi Rum natural arch Jordan photo"],
  ["snap-lens/extreme/landmarks/antelope-beam",      "wiki", "Antelope Canyon light beam photo"],

  // ── FLAGS easy (50) ──────────────────────────────────
  ["snap-lens/easy/flags/japan",         "flag", "jp"],
  ["snap-lens/easy/flags/brazil",        "flag", "br"],
  ["snap-lens/easy/flags/canada",        "flag", "ca"],
  ["snap-lens/easy/flags/india",         "flag", "in"],
  ["snap-lens/easy/flags/usa",           "flag", "us"],
  ["snap-lens/easy/flags/uk",            "flag", "gb"],
  ["snap-lens/easy/flags/germany",       "flag", "de"],
  ["snap-lens/easy/flags/france",        "flag", "fr"],
  ["snap-lens/easy/flags/australia",     "flag", "au"],
  ["snap-lens/easy/flags/south-africa",  "flag", "za"],
  ["snap-lens/easy/flags/spain",         "flag", "es"],
  ["snap-lens/easy/flags/italy",         "flag", "it"],
  ["snap-lens/easy/flags/russia",        "flag", "ru"],
  ["snap-lens/easy/flags/china",         "flag", "cn"],
  ["snap-lens/easy/flags/mexico",        "flag", "mx"],
  ["snap-lens/easy/flags/argentina",     "flag", "ar"],
  ["snap-lens/easy/flags/sweden",        "flag", "se"],
  ["snap-lens/easy/flags/switzerland",   "flag", "ch"],
  ["snap-lens/easy/flags/turkey",        "flag", "tr"],
  ["snap-lens/easy/flags/south-korea",   "flag", "kr"],
  ["snap-lens/easy/flags/norway",        "flag", "no"],
  ["snap-lens/easy/flags/greece",        "flag", "gr"],
  ["snap-lens/easy/flags/poland",        "flag", "pl"],
  ["snap-lens/easy/flags/nepal",         "flag", "np"],
  ["snap-lens/easy/flags/egypt",         "flag", "eg"],
  ["snap-lens/easy/flags/portugal",      "flag", "pt"],
  ["snap-lens/easy/flags/netherlands",   "flag", "nl"],
  ["snap-lens/easy/flags/denmark",       "flag", "dk"],
  ["snap-lens/easy/flags/nigeria",       "flag", "ng"],
  ["snap-lens/easy/flags/indonesia",     "flag", "id"],
  ["snap-lens/easy/flags/pakistan",      "flag", "pk"],
  ["snap-lens/easy/flags/new-zealand",   "flag", "nz"],
  ["snap-lens/easy/flags/ukraine",       "flag", "ua"],
  ["snap-lens/easy/flags/saudi-arabia",  "flag", "sa"],
  ["snap-lens/easy/flags/kenya",         "flag", "ke"],
  ["snap-lens/easy/flags/jamaica",       "flag", "jm"],
  ["snap-lens/easy/flags/iran",          "flag", "ir"],
  ["snap-lens/easy/flags/israel",        "flag", "il"],
  ["snap-lens/easy/flags/ethiopia",      "flag", "et"],
  ["snap-lens/easy/flags/thailand",      "flag", "th"],
  ["snap-lens/easy/flags/malaysia",      "flag", "my"],
  ["snap-lens/easy/flags/peru",          "flag", "pe"],
  ["snap-lens/easy/flags/colombia",      "flag", "co"],
  ["snap-lens/easy/flags/bangladesh",    "flag", "bd"],
  ["snap-lens/easy/flags/ghana",         "flag", "gh"],
  ["snap-lens/easy/flags/myanmar",       "flag", "mm"],
  ["snap-lens/easy/flags/cambodia",      "flag", "kh"],
  ["snap-lens/easy/flags/senegal",       "flag", "sn"],
  ["snap-lens/easy/flags/cuba",          "flag", "cu"],
  ["snap-lens/easy/flags/iceland",       "flag", "is"],

  // ── FLAGS medium (50) ────────────────────────────────
  ["snap-lens/medium/flags/finland",        "flag", "fi"],
  ["snap-lens/medium/flags/austria",        "flag", "at"],
  ["snap-lens/medium/flags/belgium",        "flag", "be"],
  ["snap-lens/medium/flags/ireland",        "flag", "ie"],
  ["snap-lens/medium/flags/hungary",        "flag", "hu"],
  ["snap-lens/medium/flags/czech-republic", "flag", "cz"],
  ["snap-lens/medium/flags/romania",        "flag", "ro"],
  ["snap-lens/medium/flags/bulgaria",       "flag", "bg"],
  ["snap-lens/medium/flags/croatia",        "flag", "hr"],
  ["snap-lens/medium/flags/slovakia",       "flag", "sk"],
  ["snap-lens/medium/flags/slovenia",       "flag", "si"],
  ["snap-lens/medium/flags/serbia",         "flag", "rs"],
  ["snap-lens/medium/flags/albania",        "flag", "al"],
  ["snap-lens/medium/flags/morocco",        "flag", "ma"],
  ["snap-lens/medium/flags/algeria",        "flag", "dz"],
  ["snap-lens/medium/flags/tunisia",        "flag", "tn"],
  ["snap-lens/medium/flags/zimbabwe",       "flag", "zw"],
  ["snap-lens/medium/flags/uganda",         "flag", "ug"],
  ["snap-lens/medium/flags/tanzania",       "flag", "tz"],
  ["snap-lens/medium/flags/mozambique",     "flag", "mz"],
  ["snap-lens/medium/flags/angola",         "flag", "ao"],
  ["snap-lens/medium/flags/venezuela",      "flag", "ve"],
  ["snap-lens/medium/flags/chile",          "flag", "cl"],
  ["snap-lens/medium/flags/ecuador",        "flag", "ec"],
  ["snap-lens/medium/flags/uruguay",        "flag", "uy"],
  ["snap-lens/medium/flags/paraguay",       "flag", "py"],
  ["snap-lens/medium/flags/bolivia",        "flag", "bo"],
  ["snap-lens/medium/flags/kazakhstan",     "flag", "kz"],
  ["snap-lens/medium/flags/uzbekistan",     "flag", "uz"],
  ["snap-lens/medium/flags/afghanistan",    "flag", "af"],
  ["snap-lens/medium/flags/iraq",           "flag", "iq"],
  ["snap-lens/medium/flags/syria",          "flag", "sy"],
  ["snap-lens/medium/flags/jordan",         "flag", "jo"],
  ["snap-lens/medium/flags/lebanon",        "flag", "lb"],
  ["snap-lens/medium/flags/vietnam",        "flag", "vn"],
  ["snap-lens/medium/flags/philippines",    "flag", "ph"],
  ["snap-lens/medium/flags/sri-lanka",      "flag", "lk"],
  ["snap-lens/medium/flags/mongolia",       "flag", "mn"],
  ["snap-lens/medium/flags/north-korea",    "flag", "kp"],
  ["snap-lens/medium/flags/haiti",          "flag", "ht"],
  ["snap-lens/medium/flags/trinidad",       "flag", "tt"],
  ["snap-lens/medium/flags/sudan",          "flag", "sd"],
  ["snap-lens/medium/flags/somalia",        "flag", "so"],
  ["snap-lens/medium/flags/cameroon",       "flag", "cm"],
  ["snap-lens/medium/flags/ivory-coast",    "flag", "ci"],
  ["snap-lens/medium/flags/guatemala",      "flag", "gt"],
  ["snap-lens/medium/flags/panama",         "flag", "pa"],
  ["snap-lens/medium/flags/costa-rica",     "flag", "cr"],
  ["snap-lens/medium/flags/moldova",        "flag", "md"],
  ["snap-lens/medium/flags/eritrea",        "flag", "er"],

  // ── FLAGS extreme (50) ───────────────────────────────
  ["snap-lens/extreme/flags/bhutan",               "flag", "bt"],
  ["snap-lens/extreme/flags/kiribati",             "flag", "ki"],
  ["snap-lens/extreme/flags/papua-new-guinea",     "flag", "pg"],
  ["snap-lens/extreme/flags/vanuatu",              "flag", "vu"],
  ["snap-lens/extreme/flags/fiji",                 "flag", "fj"],
  ["snap-lens/extreme/flags/solomon-islands",      "flag", "sb"],
  ["snap-lens/extreme/flags/micronesia",           "flag", "fm"],
  ["snap-lens/extreme/flags/palau",                "flag", "pw"],
  ["snap-lens/extreme/flags/tuvalu",               "flag", "tv"],
  ["snap-lens/extreme/flags/nauru",                "flag", "nr"],
  ["snap-lens/extreme/flags/maldives",             "flag", "mv"],
  ["snap-lens/extreme/flags/turkmenistan",         "flag", "tm"],
  ["snap-lens/extreme/flags/tajikistan",           "flag", "tj"],
  ["snap-lens/extreme/flags/kyrgyzstan",           "flag", "kg"],
  ["snap-lens/extreme/flags/azerbaijan",           "flag", "az"],
  ["snap-lens/extreme/flags/georgia",              "flag", "ge"],
  ["snap-lens/extreme/flags/armenia",              "flag", "am"],
  ["snap-lens/extreme/flags/kosovo",               "flag", "xk"],
  ["snap-lens/extreme/flags/montenegro",           "flag", "me"],
  ["snap-lens/extreme/flags/north-macedonia",      "flag", "mk"],
  ["snap-lens/extreme/flags/bosnia",               "flag", "ba"],
  ["snap-lens/extreme/flags/belarus",              "flag", "by"],
  ["snap-lens/extreme/flags/burundi",              "flag", "bi"],
  ["snap-lens/extreme/flags/rwanda",               "flag", "rw"],
  ["snap-lens/extreme/flags/malawi",               "flag", "mw"],
  ["snap-lens/extreme/flags/lesotho",              "flag", "ls"],
  ["snap-lens/extreme/flags/eswatini",             "flag", "sz"],
  ["snap-lens/extreme/flags/mauritius",            "flag", "mu"],
  ["snap-lens/extreme/flags/cape-verde",           "flag", "cv"],
  ["snap-lens/extreme/flags/comoros",              "flag", "km"],
  ["snap-lens/extreme/flags/djibouti",             "flag", "dj"],
  ["snap-lens/extreme/flags/gambia",               "flag", "gm"],
  ["snap-lens/extreme/flags/sierra-leone",         "flag", "sl"],
  ["snap-lens/extreme/flags/guinea",               "flag", "gn"],
  ["snap-lens/extreme/flags/guinea-bissau",        "flag", "gw"],
  ["snap-lens/extreme/flags/sao-tome",             "flag", "st"],
  ["snap-lens/extreme/flags/equatorial-guinea",    "flag", "gq"],
  ["snap-lens/extreme/flags/gabon",                "flag", "ga"],
  ["snap-lens/extreme/flags/tonga",                "flag", "to"],
  ["snap-lens/extreme/flags/samoa",                "flag", "ws"],
  ["snap-lens/extreme/flags/togo",                 "flag", "tg"],
  ["snap-lens/extreme/flags/benin",                "flag", "bj"],
  ["snap-lens/extreme/flags/niger",                "flag", "ne"],
  ["snap-lens/extreme/flags/mali",                 "flag", "ml"],
  ["snap-lens/extreme/flags/burkina-faso",         "flag", "bf"],
  ["snap-lens/extreme/flags/chad",                 "flag", "td"],
  ["snap-lens/extreme/flags/central-african-republic", "flag", "cf"],
  ["snap-lens/extreme/flags/congo",                "flag", "cg"],
  ["snap-lens/extreme/flags/dr-congo",             "flag", "cd"],
  ["snap-lens/extreme/flags/east-timor",           "flag", "tl"],

  // ── LOGOS easy (50) ──────────────────────────────────
  ["snap-lens/easy/logos/apple",           "logo", ["apple",          "000000"]],
  ["snap-lens/easy/logos/chrome",          "logo", ["googlechrome",   "4285F4"]],
  ["snap-lens/easy/logos/youtube",         "logo", ["youtube",        "FF0000"]],
  ["snap-lens/easy/logos/twitter",         "logo", ["x",              "000000"]],
  ["snap-lens/easy/logos/facebook",        "logo", ["facebook",       "1877F2"]],
  ["snap-lens/easy/logos/instagram",       "logo", ["instagram",      "E4405F"]],
  ["snap-lens/easy/logos/whatsapp",        "logo", ["whatsapp",       "25D366"]],
  ["snap-lens/easy/logos/spotify",         "logo", ["spotify",        "1DB954"]],
  ["snap-lens/easy/logos/ebay",            "logo", ["ebay",           "E53238"]],
  ["snap-lens/easy/logos/netflix",         "logo", ["netflix",        "E50914"]],
  ["snap-lens/easy/logos/mcdonalds",       "logo", ["mcdonalds",      "FBC817"]],
  ["snap-lens/easy/logos/nike",            "logo", ["nike",           "111111"]],
  ["snap-lens/easy/logos/adidas",          "logo", ["adidas",         "111111"]],
  ["snap-lens/easy/logos/ford",            "logo", ["ford",           "003499"]],
  ["snap-lens/easy/logos/bmw",             "logo", ["bmw",            "0066B1"]],
  ["snap-lens/easy/logos/intel",           "logo", ["intel",          "0071C5"]],
  ["snap-lens/easy/logos/samsung",         "logo", ["samsung",        "1428A0"]],
  ["snap-lens/easy/logos/coca-cola",       "logo", ["cocacola",       "F40009"]],
  ["snap-lens/easy/logos/nasa",            "logo", ["nasa",           "E03C31"]],
  ["snap-lens/easy/logos/shell",           "logo", ["shell",          "DD1D21"]],
  ["snap-lens/easy/logos/ferrari",         "logo", ["ferrari",        "D40000"]],
  ["snap-lens/easy/logos/puma",            "logo", ["puma",           "111111"]],
  ["snap-lens/easy/logos/dell",            "logo", ["dell",           "007DB8"]],
  ["snap-lens/easy/logos/playstation",     "logo", ["playstation",    "003087"]],
  ["snap-lens/easy/logos/cisco",           "logo", ["cisco",          "1BA0D7"]],
  ["snap-lens/easy/logos/audi",            "logo", ["audi",           "111111"]],
  ["snap-lens/easy/logos/toyota",          "logo", ["toyota",         "EB0A1E"]],
  ["snap-lens/easy/logos/honda",           "logo", ["honda",          "CC0000"]],
  ["snap-lens/easy/logos/mastercard",      "logo", ["mastercard",     "EB001B"]],
  ["snap-lens/easy/logos/visa",            "logo", ["visa",           "1A1F71"]],
  ["snap-lens/easy/logos/ikea",            "logo", ["ikea",           "0058A3"]],
  ["snap-lens/easy/logos/snapchat",        "logo", ["snapchat",       "FFFC00"]],
  ["snap-lens/easy/logos/tiktok",          "logo", ["tiktok",         "111111"]],
  ["snap-lens/easy/logos/hp",              "logo", ["hp",             "0096D6"]],
  ["snap-lens/easy/logos/starbucks",       "logo", ["starbucks",      "00704A"]],
  ["snap-lens/easy/logos/airbnb",          "logo", ["airbnb",         "FF5A5F"]],
  ["snap-lens/easy/logos/uber",            "logo", ["uber",           "111111"]],
  ["snap-lens/easy/logos/paypal",          "logo", ["paypal",         "00457C"]],
  ["snap-lens/easy/logos/reddit",          "logo", ["reddit",         "FF4500"]],
  ["snap-lens/easy/logos/pinterest",       "logo", ["pinterest",      "BD081C"]],
  ["snap-lens/easy/logos/wikipedia",       "logo", ["wikipedia",      "111111"]],
  ["snap-lens/easy/logos/linux",           "logo", ["linux",          "FCC624"]],
  ["snap-lens/easy/logos/android",         "logo", ["android",        "3DDC84"]],
  ["snap-lens/easy/logos/volkswagen",      "logo", ["volkswagen",     "151F6D"]],
  ["snap-lens/easy/logos/trello",          "logo", ["trello",         "0052CC"]],
  ["snap-lens/easy/logos/lamborghini",     "logo", ["lamborghini",    "D5A021"]],
  ["snap-lens/easy/logos/wordpress",       "logo", ["wordpress",      "21759B"]],
  ["snap-lens/easy/logos/zoom",            "logo", ["zoom",           "2D8CFF"]],
  ["snap-lens/easy/logos/discord",         "logo", ["discord",        "5865F2"]],
  ["snap-lens/easy/logos/target",          "logo", ["target",         "CC0000"]],

  // ── LOGOS medium (50) ────────────────────────────────
  ["snap-lens/medium/logos/python",        "logo", ["python",         "3776AB"]],
  ["snap-lens/medium/logos/git",           "logo", ["git",            "F05032"]],
  ["snap-lens/medium/logos/dropbox",       "logo", ["dropbox",        "0061FF"]],
  ["snap-lens/medium/logos/jira",          "logo", ["jira",           "0052CC"]],
  ["snap-lens/medium/logos/twitch",        "logo", ["twitch",         "9146FF"]],
  ["snap-lens/medium/logos/signal",        "logo", ["signal",         "3A76F0"]],
  ["snap-lens/medium/logos/telegram",      "logo", ["telegram",       "26A5E4"]],
  ["snap-lens/medium/logos/docker",        "logo", ["docker",         "2496ED"]],
  ["snap-lens/medium/logos/react",         "logo", ["react",          "61DAFB"]],
  ["snap-lens/medium/logos/nodejs",        "logo", ["nodedotjs",      "339933"]],
  ["snap-lens/medium/logos/typescript",    "logo", ["typescript",     "3178C6"]],
  ["snap-lens/medium/logos/github",        "logo", ["github",         "181717"]],
  ["snap-lens/medium/logos/gitlab",        "logo", ["gitlab",         "FC6D26"]],
  ["snap-lens/medium/logos/stackoverflow", "logo", ["stackoverflow",  "F58025"]],
  ["snap-lens/medium/logos/atlassian",     "logo", ["atlassian",      "0052CC"]],
  ["snap-lens/medium/logos/figma",         "logo", ["figma",          "F24E1E"]],
  ["snap-lens/medium/logos/notion",        "logo", ["notion",         "111111"]],
  ["snap-lens/medium/logos/vercel",        "logo", ["vercel",         "111111"]],
  ["snap-lens/medium/logos/firebase",      "logo", ["firebase",       "FFCA28"]],
  ["snap-lens/medium/logos/mongodb",       "logo", ["mongodb",        "47A248"]],
  ["snap-lens/medium/logos/kubernetes",    "logo", ["kubernetes",     "326CE5"]],
  ["snap-lens/medium/logos/swift",         "logo", ["swift",          "F05138"]],
  ["snap-lens/medium/logos/rust",          "logo", ["rust",           "111111"]],
  ["snap-lens/medium/logos/flutter",       "logo", ["flutter",        "02569B"]],
  ["snap-lens/medium/logos/vue",           "logo", ["vuedotjs",       "4FC08D"]],
  ["snap-lens/medium/logos/angular",       "logo", ["angular",        "DD0031"]],
  ["snap-lens/medium/logos/graphql",       "logo", ["graphql",        "E10098"]],
  ["snap-lens/medium/logos/stripe",        "logo", ["stripe",         "626CD9"]],
  ["snap-lens/medium/logos/shopify",       "logo", ["shopify",        "7AB55C"]],
  ["snap-lens/medium/logos/grafana",       "logo", ["grafana",        "F46800"]],
  ["snap-lens/medium/logos/nextjs",        "logo", ["nextdotjs",      "111111"]],
  ["snap-lens/medium/logos/tailwind",      "logo", ["tailwindcss",    "06B6D4"]],
  ["snap-lens/medium/logos/supabase",      "logo", ["supabase",       "3ECF8E"]],
  ["snap-lens/medium/logos/nginx",         "logo", ["nginx",          "009639"]],
  ["snap-lens/medium/logos/pytorch",       "logo", ["pytorch",        "EE4C2C"]],
  ["snap-lens/medium/logos/tensorflow",    "logo", ["tensorflow",     "FF6F00"]],
  ["snap-lens/medium/logos/bluetooth",     "logo", ["bluetooth",      "0082FC"]],
  ["snap-lens/medium/logos/debian",        "logo", ["debian",         "A81D33"]],
  ["snap-lens/medium/logos/redis",         "logo", ["redis",          "DC382D"]],
  ["snap-lens/medium/logos/netlify",       "logo", ["netlify",        "00C7B7"]],
  ["snap-lens/medium/logos/prisma",        "logo", ["prisma",         "2D3748"]],
  ["snap-lens/medium/logos/huggingface",   "logo", ["huggingface",    "FFD21E"]],
  ["snap-lens/medium/logos/sass",          "logo", ["sass",           "CC6699"]],
  ["snap-lens/medium/logos/kotlin",        "logo", ["kotlin",         "7F52FF"]],
  ["snap-lens/medium/logos/dart",          "logo", ["dart",           "0175C2"]],
  ["snap-lens/medium/logos/golang",        "logo", ["go",             "00ADD8"]],
  ["snap-lens/medium/logos/scala",         "logo", ["scala",          "DC322F"]],
  ["snap-lens/medium/logos/lyft",          "logo", ["lyft",           "FF00BF"]],
  ["snap-lens/medium/logos/cloudinary",    "logo", ["cloudinary",     "3448C5"]],
  ["snap-lens/medium/logos/kafka",         "logo", ["apachekafka",    "231F20"]],

  // ── LOGOS extreme (50) ──────────────────────────────
  ["snap-lens/extreme/logos/ubuntu",       "logo", ["ubuntu",         "E95420"]],
  ["snap-lens/extreme/logos/kali",         "logo", ["kalilinux",      "557C94"]],
  ["snap-lens/extreme/logos/arch-linux",   "logo", ["archlinux",      "1793D1"]],
  ["snap-lens/extreme/logos/fedora",       "logo", ["fedora",         "51A2DA"]],
  ["snap-lens/extreme/logos/raspberry-pi", "logo", ["raspberrypi",    "A22846"]],
  ["snap-lens/extreme/logos/tor",          "logo", ["torproject",     "7D4698"]],
  ["snap-lens/extreme/logos/vlc",          "logo", ["vlcmediaplayer", "FF8800"]],
  ["snap-lens/extreme/logos/gimp",         "logo", ["gimp",           "5C5543"]],
  ["snap-lens/extreme/logos/libreoffice",  "logo", ["libreoffice",    "18A303"]],
  ["snap-lens/extreme/logos/vim",          "logo", ["vim",            "019733"]],
  ["snap-lens/extreme/logos/emacs",        "logo", ["gnuemacs",       "7F5AB6"]],
  ["snap-lens/extreme/logos/neovim",       "logo", ["neovim",         "57A143"]],
  ["snap-lens/extreme/logos/haskell",      "logo", ["haskell",        "5D4F85"]],
  ["snap-lens/extreme/logos/elixir",       "logo", ["elixir",         "4B275F"]],
  ["snap-lens/extreme/logos/erlang",       "logo", ["erlang",         "A90533"]],
  ["snap-lens/extreme/logos/clojure",      "logo", ["clojure",        "5881D8"]],
  ["snap-lens/extreme/logos/julia",        "logo", ["julia",          "9558B2"]],
  ["snap-lens/extreme/logos/lua",          "logo", ["lua",            "2C2D72"]],
  ["snap-lens/extreme/logos/perl",         "logo", ["perl",           "39457E"]],
  ["snap-lens/extreme/logos/r-lang",       "logo", ["r",              "276DC3"]],
  ["snap-lens/extreme/logos/apache",       "logo", ["apache",         "D22128"]],
  ["snap-lens/extreme/logos/nginx",        "logo", ["nginx",          "009639"]],
  ["snap-lens/extreme/logos/ansible",      "logo", ["ansible",        "EE0000"]],
  ["snap-lens/extreme/logos/terraform",    "logo", ["terraform",      "7B42BC"]],
  ["snap-lens/extreme/logos/prometheus",   "logo", ["prometheus",     "E6522C"]],
  ["snap-lens/extreme/logos/grafana",      "logo", ["grafana",        "F46800"]],
  ["snap-lens/extreme/logos/rabbitmq",     "logo", ["rabbitmq",       "FF6600"]],
  ["snap-lens/extreme/logos/neo4j",        "logo", ["neo4j",          "008CC1"]],
  ["snap-lens/extreme/logos/webassembly",  "logo", ["webassembly",    "654FF0"]],
  ["snap-lens/extreme/logos/deno",         "logo", ["deno",           "111111"]],
  ["snap-lens/extreme/logos/osi",          "logo", ["opensourceinitiative","3DA639"]],
  ["snap-lens/extreme/logos/internet-archive","logo",["internetarchive","866354"]],
  ["snap-lens/extreme/logos/openstreetmap","logo", ["openstreetmap",  "7EBC6F"]],
  ["snap-lens/extreme/logos/gnome",        "logo", ["gnome",          "4A86CF"]],
  ["snap-lens/extreme/logos/kde",          "logo", ["kde",            "1D99F3"]],
  ["snap-lens/extreme/logos/nixos",        "logo", ["nixos",          "5277C3"]],
  ["snap-lens/extreme/logos/openbsd",      "logo", ["openbsd",        "F2CA30"]],
  ["snap-lens/extreme/logos/freebsd",      "logo", ["freebsd",        "AB2B28"]],
  ["snap-lens/extreme/logos/gentoo",       "logo", ["gentoo",         "54487A"]],
  ["snap-lens/extreme/logos/elasticsearch","logo", ["elasticsearch",  "005571"]],
  ["snap-lens/extreme/logos/cassandra",    "logo", ["apachecassandra","1287B1"]],
  ["snap-lens/extreme/logos/postgresql",   "logo", ["postgresql",     "4169E1"]],
  ["snap-lens/extreme/logos/hashicorp",    "logo", ["hashicorp",      "111111"]],
  ["snap-lens/extreme/logos/unitednations","logo", ["unitednations",  "009EDB"]],
  ["snap-lens/extreme/logos/wikipedia",    "logo", ["wikimediafoundation","000000"]],
  ["snap-lens/extreme/logos/blender",      "logo", ["blender",        "F5792A"]],
  ["snap-lens/extreme/logos/inkscape",     "logo", ["inkscape",       "000000"]],
  ["snap-lens/extreme/logos/audacity",     "logo", ["audacity",       "0000CC"]],
  ["snap-lens/extreme/logos/matrix",       "logo", ["matrix",         "000000"]],
  ["snap-lens/extreme/logos/mastodon",     "logo", ["mastodon",       "6364FF"]],

  // ── CELEBRITIES easy (50) ────────────────────────────
  ["snap-lens/easy/celebrities/einstein",        "wiki", "Albert Einstein portrait photo"],
  ["snap-lens/easy/celebrities/gandhi",          "wiki", "Mahatma Gandhi portrait photo"],
  ["snap-lens/easy/celebrities/mandela",         "wiki", "Nelson Mandela portrait photo"],
  ["snap-lens/easy/celebrities/marie-curie",     "wiki", "Marie Curie portrait photo scientist"],
  ["snap-lens/easy/celebrities/lincoln",         "wiki", "Abraham Lincoln portrait photograph"],
  ["snap-lens/easy/celebrities/da-vinci",        "wiki", "Leonardo da Vinci portrait Ambrosiana"],
  ["snap-lens/easy/celebrities/tesla",           "wiki", "Nikola Tesla portrait photograph"],
  ["snap-lens/easy/celebrities/newton",          "wiki", "Isaac Newton portrait painting"],
  ["snap-lens/easy/celebrities/darwin",          "wiki", "Charles Darwin portrait photograph"],
  ["snap-lens/easy/celebrities/napoleon",        "wiki", "Napoleon Bonaparte portrait painting"],
  ["snap-lens/easy/celebrities/shakespeare",     "wiki", "William Shakespeare portrait painting"],
  ["snap-lens/easy/celebrities/beethoven",       "wiki", "Ludwig van Beethoven portrait painting"],
  ["snap-lens/easy/celebrities/mozart",          "wiki", "Wolfgang Amadeus Mozart portrait painting"],
  ["snap-lens/easy/celebrities/frida-kahlo",     "wiki", "Frida Kahlo self portrait photo"],
  ["snap-lens/easy/celebrities/churchill",       "wiki", "Winston Churchill portrait photograph"],
  ["snap-lens/easy/celebrities/mlk",             "wiki", "Martin Luther King Jr portrait photograph"],
  ["snap-lens/easy/celebrities/chaplin",         "wiki", "Charlie Chaplin portrait photograph"],
  ["snap-lens/easy/celebrities/amelia-earhart",  "wiki", "Amelia Earhart portrait photograph"],
  ["snap-lens/easy/celebrities/thomas-edison",   "wiki", "Thomas Edison portrait photograph"],
  ["snap-lens/easy/celebrities/galileo",         "wiki", "Galileo Galilei"],
  ["snap-lens/easy/celebrities/nightingale",     "wiki", "Florence Nightingale photograph nurse portrait"],
  ["snap-lens/easy/celebrities/sigmund-freud",   "wiki", "Sigmund Freud portrait photograph"],
  ["snap-lens/easy/celebrities/karl-marx",       "wiki", "Karl Marx portrait photograph"],
  ["snap-lens/easy/celebrities/washington",      "wiki", "George Washington portrait painting"],
  ["snap-lens/easy/celebrities/van-gogh",        "wiki", "Vincent van Gogh self portrait painting"],
  ["snap-lens/easy/celebrities/mao",             "wiki", "Mao Zedong portrait photograph"],
  ["snap-lens/easy/celebrities/queen-elizabeth", "wiki", "Queen Elizabeth II portrait photograph"],
  ["snap-lens/easy/celebrities/princess-diana",  "wiki", "Princess Diana portrait photograph"],
  ["snap-lens/easy/celebrities/che-guevara",     "wiki", "Che Guevara portrait photograph"],
  ["snap-lens/easy/celebrities/mother-teresa",   "wiki", "Mother Teresa portrait photograph"],
  ["snap-lens/easy/celebrities/jfk",             "wiki", "John F Kennedy portrait photograph"],
  ["snap-lens/easy/celebrities/rosa-parks",      "wiki", "Rosa Parks civil rights 1955 photograph"],
  ["snap-lens/easy/celebrities/marilyn-monroe",  "wiki", "Marilyn Monroe portrait photograph"],
  ["snap-lens/easy/celebrities/audrey-hepburn",  "wiki", "Audrey Hepburn portrait photograph"],
  ["snap-lens/easy/celebrities/elvis",           "wiki", "Elvis Presley portrait photograph"],
  ["snap-lens/easy/celebrities/michael-jackson", "wiki", "Michael Jackson portrait photograph"],
  ["snap-lens/easy/celebrities/muhammad-ali",    "wiki", "Muhammad Ali portrait photograph"],
  ["snap-lens/easy/celebrities/hawking",         "wiki", "Stephen Hawking portrait photograph"],
  ["snap-lens/easy/celebrities/neil-armstrong",  "wiki", "Neil Armstrong astronaut portrait photograph"],
  ["snap-lens/easy/celebrities/anne-frank",      "wiki", "Anne Frank portrait photograph"],
  ["snap-lens/easy/celebrities/michelangelo",    "wiki", "Michelangelo portrait painting"],
  ["snap-lens/easy/celebrities/rembrandt",       "wiki", "Rembrandt self portrait painting"],
  ["snap-lens/easy/celebrities/bach",            "wiki", "Johann Sebastian Bach portrait painting"],
  ["snap-lens/easy/celebrities/fdr",             "wiki", "Franklin Roosevelt portrait photograph"],
  ["snap-lens/easy/celebrities/julius-caesar",   "wiki", "Julius Caesar marble bust sculpture"],
  ["snap-lens/easy/celebrities/cleopatra-bust",  "wiki", "Cleopatra ancient bust sculpture"],
  ["snap-lens/easy/celebrities/de-gaulle",       "wiki", "Charles de Gaulle portrait photograph"],
  ["snap-lens/easy/celebrities/beatles",         "wiki", "The Beatles group photograph"],
  ["snap-lens/easy/celebrities/stalin",          "wiki", "Joseph Stalin portrait photograph"],
  ["snap-lens/easy/celebrities/oprah",           "wiki", "Oprah Winfrey"],

  // ── CELEBRITIES medium (50) ──────────────────────────
  ["snap-lens/medium/celebrities/genghis-khan",     "wiki", "Genghis Khan portrait painting"],
  ["snap-lens/medium/celebrities/columbus",         "wiki", "Christopher Columbus portrait painting"],
  ["snap-lens/medium/celebrities/joan-of-arc",      "wiki", "Joan of Arc portrait painting"],
  ["snap-lens/medium/celebrities/marie-antoinette", "wiki", "Marie Antoinette portrait painting"],
  ["snap-lens/medium/celebrities/catherine-great",  "wiki", "Catherine the Great portrait painting"],
  ["snap-lens/medium/celebrities/peter-great",      "wiki", "Peter the Great portrait painting"],
  ["snap-lens/medium/celebrities/socrates",         "wiki", "Socrates ancient Greek bust sculpture"],
  ["snap-lens/medium/celebrities/aristotle",        "wiki", "Aristotle bust"],
  ["snap-lens/medium/celebrities/plato",            "wiki", "Plato ancient Greek bust sculpture"],
  ["snap-lens/medium/celebrities/alexander-great",  "wiki", "Alexander the Great portrait mosaic"],
  ["snap-lens/medium/celebrities/hannibal",         "wiki", "Hannibal Carthage"],
  ["snap-lens/medium/celebrities/chopin",           "wiki", "Frederic Chopin portrait painting"],
  ["snap-lens/medium/celebrities/ada-lovelace",     "wiki", "Ada Lovelace portrait photograph"],
  ["snap-lens/medium/celebrities/alan-turing",      "wiki", "Alan Turing portrait photograph"],
  ["snap-lens/medium/celebrities/confucius",        "wiki", "Confucius portrait painting"],
  ["snap-lens/medium/celebrities/buddha",           "wiki", "Gautama Buddha statue sculpture photograph"],
  ["snap-lens/medium/celebrities/vlad-impaler",     "wiki", "Vlad Tepes portrait painting"],
  ["snap-lens/medium/celebrities/ivan-terrible",    "wiki", "Ivan the Terrible portrait painting"],
  ["snap-lens/medium/celebrities/eleanor-roosevelt","wiki", "Eleanor Roosevelt portrait photograph"],
  ["snap-lens/medium/celebrities/harriet-tubman",   "wiki", "Harriet Tubman portrait photograph"],
  ["snap-lens/medium/celebrities/frederick-douglass","wiki","Frederick Douglass portrait photograph"],
  ["snap-lens/medium/celebrities/geronimo",         "wiki", "Geronimo Apache portrait photograph"],
  ["snap-lens/medium/celebrities/simon-bolivar",    "wiki", "Simon Bolivar portrait painting"],
  ["snap-lens/medium/celebrities/edgar-poe",        "wiki", "Edgar Allan Poe portrait photograph"],
  ["snap-lens/medium/celebrities/marco-polo",       "wiki", "Marco Polo"],
  ["snap-lens/medium/celebrities/hippocrates",      "wiki", "Hippocrates Greek bust"],
  ["snap-lens/medium/celebrities/goya",             "wiki", "Francisco Goya self portrait painting"],
  ["snap-lens/medium/celebrities/magellan",         "wiki", "Ferdinand Magellan portrait painting"],
  ["snap-lens/medium/celebrities/da-vinci-vitruvian","wiki","Leonardo da Vinci Vitruvian Man drawing"],
  ["snap-lens/medium/celebrities/curie-lab",        "wiki", "Marie Curie laboratory photograph"],
  ["snap-lens/medium/celebrities/attila",           "wiki", "Attila the Hun portrait painting"],
  ["snap-lens/medium/celebrities/charlemagne",      "wiki", "Charlemagne portrait"],
  ["snap-lens/medium/celebrities/homer-ancient",    "wiki", "Homer ancient Greek bust sculpture"],
  ["snap-lens/medium/celebrities/sun-tzu",          "wiki", "Sun Tzu portrait painting Chinese"],
  ["snap-lens/medium/celebrities/laozi",            "wiki", "Laozi portrait painting Chinese"],
  ["snap-lens/medium/celebrities/saladin",          "wiki", "Saladin portrait"],
  ["snap-lens/medium/celebrities/caesar-bust",      "wiki", "Julius Caesar marble bust Roman sculpture"],
  ["snap-lens/medium/celebrities/liszt",            "wiki", "Franz Liszt portrait photograph painting"],
  ["snap-lens/medium/celebrities/vasco-da-gama",    "wiki", "Vasco da Gama portrait painting"],
  ["snap-lens/medium/celebrities/archimedes",       "wiki", "Archimedes ancient Greek bust sculpture"],
  ["snap-lens/medium/celebrities/galileo-portrait", "wiki", "Galileo Galilei portrait"],
  ["snap-lens/medium/celebrities/bach-portrait",    "wiki", "Bach portrait"],
  ["snap-lens/medium/celebrities/boudicca",         "wiki", "Boudicca statue"],
  ["snap-lens/medium/celebrities/spartacus",        "wiki", "Spartacus Roman"],
  ["snap-lens/medium/celebrities/caligula",         "wiki", "Caligula Roman emperor bust sculpture"],
  ["snap-lens/medium/celebrities/nero",             "wiki", "Nero Roman emperor bust sculpture"],
  ["snap-lens/medium/celebrities/hadrian",          "wiki", "Hadrian Roman emperor bust sculpture"],
  ["snap-lens/medium/celebrities/marcus-aurelius",  "wiki", "Marcus Aurelius emperor bust sculpture"],
  ["snap-lens/medium/celebrities/cicero",           "wiki", "Cicero Roman bust"],
  ["snap-lens/medium/celebrities/livia",            "wiki", "Livia Augusta empress bust"],

  // ── CELEBRITIES extreme (50) ─────────────────────────
  ["snap-lens/extreme/celebrities/ashoka",          "wiki", "Ashoka Emperor India edicts photograph"],
  ["snap-lens/extreme/celebrities/akbar",           "wiki", "Akbar the Great Mughal Emperor portrait"],
  ["snap-lens/extreme/celebrities/tamerlane",       "wiki", "Timur Tamerlane portrait painting"],
  ["snap-lens/extreme/celebrities/mansa-musa",      "wiki", "Mansa Musa Mali Emperor Catalan Atlas"],
  ["snap-lens/extreme/celebrities/shaka-zulu",      "wiki", "Shaka Zulu king"],
  ["snap-lens/extreme/celebrities/ramesses",        "wiki", "Ramesses II Abu Simbel statue photograph"],
  ["snap-lens/extreme/celebrities/nefertiti",       "wiki", "Nefertiti bust Berlin museum photograph"],
  ["snap-lens/extreme/celebrities/tutankhamun",     "wiki", "Tutankhamun golden mask photograph"],
  ["snap-lens/extreme/celebrities/hatshepsut",      "wiki", "Hatshepsut pharaoh statue photograph"],
  ["snap-lens/extreme/celebrities/qin-shi-huang",   "wiki", "Qin Shi Huang"],
  ["snap-lens/extreme/celebrities/hammurabi",       "wiki", "Hammurabi stele basalt Louvre museum photograph"],
  ["snap-lens/extreme/celebrities/wu-zetian",       "wiki", "Wu Zetian Empress Tang Dynasty portrait"],
  ["snap-lens/extreme/celebrities/kublai-khan",     "wiki", "Kublai Khan Yuan Dynasty portrait painting"],
  ["snap-lens/extreme/celebrities/tokugawa",        "wiki", "Tokugawa Ieyasu"],
  ["snap-lens/extreme/celebrities/nobunaga",        "wiki", "Oda Nobunaga Daitokuji portrait painting Japan"],
  ["snap-lens/extreme/celebrities/zapata",          "wiki", "Emiliano Zapata Mexico portrait photograph"],
  ["snap-lens/extreme/celebrities/pancho-villa",    "wiki", "Pancho Villa Mexico portrait photograph"],
  ["snap-lens/extreme/celebrities/toussaint",       "wiki", "Toussaint Louverture Haiti portrait painting"],
  ["snap-lens/extreme/celebrities/haile-selassie",  "wiki", "Haile Selassie Ethiopia Emperor photograph"],
  ["snap-lens/extreme/celebrities/lumumba",         "wiki", "Patrice Lumumba Congo portrait photograph"],
  ["snap-lens/extreme/celebrities/ho-chi-minh",     "wiki", "Ho Chi Minh Vietnam portrait photograph"],
  ["snap-lens/extreme/celebrities/sukarno",         "wiki", "Sukarno President Indonesia portrait photograph"],
  ["snap-lens/extreme/celebrities/nehru",           "wiki", "Jawaharlal Nehru India portrait photograph"],
  ["snap-lens/extreme/celebrities/ataturk",         "wiki", "Mustafa Kemal Ataturk Turkey portrait photograph"],
  ["snap-lens/extreme/celebrities/rosa-luxemburg",  "wiki", "Rosa Luxemburg portrait photograph"],
  ["snap-lens/extreme/celebrities/trotsky",         "wiki", "Leon Trotsky portrait photograph"],
  ["snap-lens/extreme/celebrities/lenin",           "wiki", "Vladimir Lenin portrait photograph"],
  ["snap-lens/extreme/celebrities/mussolini",       "wiki", "Benito Mussolini Italy portrait photograph"],
  ["snap-lens/extreme/celebrities/franco",          "wiki", "Francisco Franco Spain portrait photograph"],
  ["snap-lens/extreme/celebrities/khrushchev",      "wiki", "Nikita Khrushchev portrait photograph"],
  ["snap-lens/extreme/celebrities/gorbachev",       "wiki", "Mikhail Gorbachev portrait photograph"],
  ["snap-lens/extreme/celebrities/indira-gandhi",   "wiki", "Indira Gandhi India portrait photograph"],
  ["snap-lens/extreme/celebrities/golda-meir",      "wiki", "Golda Meir Israel portrait photograph"],
  ["snap-lens/extreme/celebrities/sadat",           "wiki", "Anwar Sadat Egypt portrait photograph"],
  ["snap-lens/extreme/celebrities/allende",         "wiki", "Salvador Allende Chile portrait photograph"],
  ["snap-lens/extreme/celebrities/simone-beauvoir", "wiki", "Simone de Beauvoir 1955 author photograph"],
  ["snap-lens/extreme/celebrities/xerxes",          "wiki", "Xerxes Persepolis"],
  ["snap-lens/extreme/celebrities/darius",          "wiki", "Darius the Great Persepolis relief photograph"],
  ["snap-lens/extreme/celebrities/pinochet",        "wiki", "Augusto Pinochet Chile portrait photograph"],
  ["snap-lens/extreme/celebrities/marc-antony",     "wiki", "Mark Antony Roman"],
  ["snap-lens/extreme/celebrities/subhas-bose",     "wiki", "Subhas Chandra Bose India independence photograph"],
  ["snap-lens/extreme/celebrities/sankara",         "wiki", "Thomas Sankara Burkina Faso portrait photograph"],
  ["snap-lens/extreme/celebrities/crazy-horse",     "wiki", "Crazy Horse Lakota Sioux portrait photograph"],
  ["snap-lens/extreme/celebrities/tupac-amaru",     "wiki", "Tupac Amaru Peru portrait painting"],
  ["snap-lens/extreme/celebrities/olof-palme",      "wiki", "Olof Palme Sweden portrait photograph"],
  ["snap-lens/extreme/celebrities/imelda-marcos",   "wiki", "Imelda Marcos Philippines 1970s photograph"],
  ["snap-lens/extreme/celebrities/arafat",          "wiki", "Yasser Arafat"],
  ["snap-lens/extreme/celebrities/sundiata",        "wiki", "Sundiata Mali"],
  ["snap-lens/extreme/celebrities/cyrus",           "wiki", "Cyrus Cylinder British Museum photograph"],
  ["snap-lens/extreme/celebrities/sitting-bull-pipe","wiki","Sitting Bull pipe photograph portrait"],

  // ══════════════════════════════════════════════════════
  // 🇮🇳 INDIA — LANDMARKS (40 total: 13 easy + 13 medium + 14 extreme)
  // ══════════════════════════════════════════════════════

  // ── INDIA LANDMARKS easy (13) ───────────────────────
  ["snap-lens/easy/landmarks/taj-mahal",          "wiki", "Taj Mahal"],
  ["snap-lens/easy/landmarks/red-fort",           "wiki", "Red Fort Delhi"],
  ["snap-lens/easy/landmarks/india-gate",         "wiki", "India Gate New Delhi"],
  ["snap-lens/easy/landmarks/golden-temple",      "wiki", "Golden Temple Amritsar"],
  ["snap-lens/easy/landmarks/gateway-india",      "wiki", "Gateway of India Mumbai"],
  ["snap-lens/easy/landmarks/lotus-temple",       "wiki", "Lotus Temple New Delhi"],
  ["snap-lens/easy/landmarks/qutub-minar",        "wiki", "Qutub Minar Delhi"],
  ["snap-lens/easy/landmarks/hawa-mahal",         "wiki", "Hawa Mahal Jaipur"],
  ["snap-lens/easy/landmarks/mysore-palace",      "wiki", "Mysore Palace Karnataka"],
  ["snap-lens/easy/landmarks/meenakshi-temple",   "wiki", "Meenakshi Temple Madurai"],
  ["snap-lens/easy/landmarks/charminar",          "wiki", "Charminar Hyderabad"],
  ["snap-lens/easy/landmarks/victoria-memorial",  "wiki", "Victoria Memorial Kolkata"],
  ["snap-lens/easy/landmarks/varanasi-ghats",     "wiki", "Varanasi Ganges ghats"],

  // ── INDIA LANDMARKS medium (13) ─────────────────────
  ["snap-lens/medium/landmarks/ajanta-caves",     "wiki", "Ajanta Caves Maharashtra"],
  ["snap-lens/medium/landmarks/ellora-caves",     "wiki", "Ellora Caves"],
  ["snap-lens/medium/landmarks/khajuraho",        "wiki", "Khajuraho temples"],
  ["snap-lens/medium/landmarks/brihadeeswarar",   "wiki", "Brihadeeswarar Temple Thanjavur"],
  ["snap-lens/medium/landmarks/konark-sun",       "wiki", "Konark Sun Temple Odisha"],
  ["snap-lens/medium/landmarks/hampi",            "wiki", "Hampi ruins Karnataka"],
  ["snap-lens/medium/landmarks/sanchi-stupa",     "wiki", "Sanchi Stupa Madhya Pradesh"],
  ["snap-lens/medium/landmarks/amer-fort",        "wiki", "Amer Fort Jaipur"],
  ["snap-lens/medium/landmarks/fatehpur-sikri",   "wiki", "Fatehpur Sikri Agra"],
  ["snap-lens/medium/landmarks/elephanta-caves",  "wiki", "Elephanta Caves Mumbai"],
  ["snap-lens/medium/landmarks/mahabalipuram",    "wiki", "Mahabalipuram Shore Temple"],
  ["snap-lens/medium/landmarks/ranthambore-fort", "wiki", "Ranthambore Fort Rajasthan"],
  ["snap-lens/medium/landmarks/pattadakal",       "wiki", "Pattadakal temples Karnataka"],

  // ── INDIA LANDMARKS extreme (14) ────────────────────
  ["snap-lens/extreme/landmarks/nalanda",         "wiki", "Nalanda university ruins Bihar"],
  ["snap-lens/extreme/landmarks/lepakshi",        "wiki", "Lepakshi temple Andhra Pradesh"],
  ["snap-lens/extreme/landmarks/rani-ki-vav",     "wiki", "Rani ki Vav stepwell Gujarat"],
  ["snap-lens/extreme/landmarks/chand-baori",     "wiki", "Chand Baori stepwell Rajasthan"],
  ["snap-lens/extreme/landmarks/bishnupur",       "wiki", "Bishnupur terracotta temples West Bengal"],
  ["snap-lens/extreme/landmarks/vijay-stambha",   "wiki", "Vijay Stambha Chittorgarh"],
  ["snap-lens/extreme/landmarks/mattancherry",    "wiki", "Mattancherry Palace Kerala"],
  ["snap-lens/extreme/landmarks/dholavira",       "wiki", "Dholavira archaeological site Gujarat"],
  ["snap-lens/extreme/landmarks/sravanabelagola", "wiki", "Sravanabelagola Gomateshwara statue Karnataka"],
  ["snap-lens/extreme/landmarks/gol-gumbaz",      "wiki", "Gol Gumbaz Bijapur Karnataka"],
  ["snap-lens/extreme/landmarks/ranakpur",        "wiki", "Ranakpur Jain temple Rajasthan"],
  ["snap-lens/extreme/landmarks/somnath-temple",  "wiki", "Somnath Temple Gujarat"],
  ["snap-lens/extreme/landmarks/padmanabhapuram", "wiki", "Padmanabhapuram Palace Kerala"],
  ["snap-lens/extreme/landmarks/kamakhya",        "wiki", "Kamakhya Temple Assam"],

  // ══════════════════════════════════════════════════════
  // 🇮🇳 INDIA — CELEBRITIES (40 total: 13 easy + 13 medium + 14 extreme)
  // ══════════════════════════════════════════════════════

  // ── INDIA CELEBRITIES easy (13) ─────────────────────
  ["snap-lens/easy/celebrities/mahatma-gandhi",   "wiki", "Mahatma Gandhi"],
  ["snap-lens/easy/celebrities/nehru",            "wiki", "Jawaharlal Nehru"],
  ["snap-lens/easy/celebrities/ambedkar",         "wiki", "B R Ambedkar"],
  ["snap-lens/easy/celebrities/subhas-bose",      "wiki", "Subhas Chandra Bose"],
  ["snap-lens/easy/celebrities/indira-gandhi",    "wiki", "Indira Gandhi"],
  ["snap-lens/easy/celebrities/rajiv-gandhi",     "wiki", "Rajiv Gandhi"],
  ["snap-lens/easy/celebrities/apj-kalam",        "wiki", "APJ Abdul Kalam"],
  ["snap-lens/easy/celebrities/sachin-tendulkar", "wiki", "Sachin Tendulkar"],
  ["snap-lens/easy/celebrities/mother-teresa",    "wiki", "Mother Teresa"],
  ["snap-lens/easy/celebrities/rabindranath-tagore","wiki","Rabindranath Tagore"],
  ["snap-lens/easy/celebrities/ratan-tata",       "wiki", "Ratan Tata"],
  ["snap-lens/easy/celebrities/swami-vivekananda","wiki", "Swami Vivekananda"],
  ["snap-lens/easy/celebrities/ms-dhoni",         "wiki", "MS Dhoni"],

  // ── INDIA CELEBRITIES medium (13) ───────────────────
  ["snap-lens/medium/celebrities/sardar-patel",   "wiki", "Sardar Vallabhbhai Patel"],
  ["snap-lens/medium/celebrities/bhagat-singh",   "wiki", "Bhagat Singh"],
  ["snap-lens/medium/celebrities/lal-bahadur",    "wiki", "Lal Bahadur Shastri"],
  ["snap-lens/medium/celebrities/srinivasa-ramanujan","wiki","Srinivasa Ramanujan mathematician"],
  ["snap-lens/medium/celebrities/cv-raman",       "wiki", "C V Raman Nobel physicist"],
  ["snap-lens/medium/celebrities/vikram-sarabhai","wiki", "Vikram Sarabhai ISRO"],
  ["snap-lens/medium/celebrities/sarojini-naidu", "wiki", "Sarojini Naidu"],
  ["snap-lens/medium/celebrities/bal-gangadhar",  "wiki", "Bal Gangadhar Tilak"],
  ["snap-lens/medium/celebrities/maulana-azad",   "wiki", "Maulana Abul Kalam Azad"],
  ["snap-lens/medium/celebrities/mirabai",        "wiki", "Mirabai devotional poet"],
  ["snap-lens/medium/celebrities/homi-bhabha",    "wiki", "Homi Bhabha nuclear physicist India"],
  ["snap-lens/medium/celebrities/laxmibai",       "wiki", "Rani Lakshmibai Jhansi"],
  ["snap-lens/medium/celebrities/virat-kohli",    "wiki", "Virat Kohli cricket"],

  // ── INDIA CELEBRITIES extreme (14) ──────────────────
  ["snap-lens/extreme/celebrities/chandragupta",  "wiki", "Chandragupta Maurya emperor"],
  ["snap-lens/extreme/celebrities/ashoka",        "wiki", "Ashoka Maurya inscription"],
  ["snap-lens/extreme/celebrities/akbar",         "wiki", "Akbar Mughal Emperor"],
  ["snap-lens/extreme/celebrities/maharana-pratap","wiki","Maharana Pratap Mewar"],
  ["snap-lens/extreme/celebrities/shivaji",       "wiki", "Shivaji Maratha Empire"],
  ["snap-lens/extreme/celebrities/aurangzeb",     "wiki", "Aurangzeb Mughal Emperor"],
  ["snap-lens/extreme/celebrities/tipu-sultan",   "wiki", "Tipu Sultan Mysore"],
  ["snap-lens/extreme/celebrities/aryabhata",     "wiki", "Aryabhata mathematician astronomer"],
  ["snap-lens/extreme/celebrities/chanakya",      "wiki", "Chanakya Arthashastra"],
  ["snap-lens/extreme/celebrities/gopal-krishna", "wiki", "Gopal Krishna Gokhale"],
  ["snap-lens/extreme/celebrities/periyar",       "wiki", "Periyar E V Ramasamy"],
  ["snap-lens/extreme/celebrities/phule",         "wiki", "Jyotirao Phule Phulewada"],
  ["snap-lens/extreme/celebrities/durgabai",      "wiki", "Durgabai Deshmukh"],
  ["snap-lens/extreme/celebrities/birsa-munda",   "wiki", "Birsa Munda tribal leader"],

  // ══════════════════════════════════════════════════════
  // 🌟 NEW CELEBRITIES — Global (easy / medium / extreme)
  // ══════════════════════════════════════════════════════

  // ── Global easy celebrities ──────────────────────────
  ["snap-lens/easy/celebrities/obama",            "wiki", "Barack Obama portrait photograph"],
  ["snap-lens/easy/celebrities/bill-gates",       "wiki", "Bill Gates portrait photograph"],
  ["snap-lens/easy/celebrities/steve-jobs",       "wiki", "Steve Jobs portrait photograph"],
  ["snap-lens/easy/celebrities/elon-musk",        "wiki", "Elon Musk portrait photograph"],
  ["snap-lens/easy/celebrities/mark-zuckerberg",  "wiki", "Mark Zuckerberg portrait photograph"],
  ["snap-lens/easy/celebrities/beyonce",          "wiki", "Beyoncé Knowles entertainer Grammy"],
  ["snap-lens/easy/celebrities/taylor-swift",     "wiki", "Taylor Swift American singer songwriter"],
  ["snap-lens/easy/celebrities/cristiano-ronaldo","wiki", "Cristiano Ronaldo footballer portrait photograph"],
  ["snap-lens/easy/celebrities/lionel-messi",     "wiki", "Lionel Messi footballer portrait photograph"],
  ["snap-lens/easy/celebrities/usain-bolt",       "wiki", "Usain Bolt sprinter portrait photograph"],
  ["snap-lens/easy/celebrities/serena-williams",  "wiki", "Serena Williams tennis portrait photograph"],
  ["snap-lens/easy/celebrities/michael-jordan",   "wiki", "Michael Jordan basketball portrait photograph"],
  ["snap-lens/easy/celebrities/lebron-james",     "wiki", "LeBron James basketball portrait photograph"],
  ["snap-lens/easy/celebrities/roger-federer",    "wiki", "Roger Federer tennis portrait photograph"],
  ["snap-lens/easy/celebrities/bruce-lee",        "wiki", "Bruce Lee Enter the Dragon film"],
  ["snap-lens/easy/celebrities/pope-francis",     "wiki", "Pope Francis portrait photograph"],
  ["snap-lens/easy/celebrities/dalai-lama",       "wiki", "Dalai Lama portrait photograph"],
  ["snap-lens/easy/celebrities/morgan-freeman",   "wiki", "Morgan Freeman Hollywood actor Shawshank Redemption"],
  ["snap-lens/easy/celebrities/arnold-schwarzenegger","wiki","Arnold Schwarzenegger portrait photograph"],

  // ── Global medium celebrities ────────────────────────
  ["snap-lens/medium/celebrities/ada-lovelace",   "wiki", "Ada Lovelace portrait painting mathematician"],
  ["snap-lens/medium/celebrities/alan-turing",    "wiki", "Alan Turing portrait photograph computer science"],
  ["snap-lens/medium/celebrities/srinivasa-ramanujan","wiki","Srinivasa Ramanujan mathematician portrait"],
  ["snap-lens/medium/celebrities/vikram-sarabhai","wiki", "Vikram Sarabhai ISRO space scientist portrait"],
  ["snap-lens/medium/celebrities/bal-gangadhar",  "wiki", "Bal Gangadhar Tilak portrait photograph"],
  ["snap-lens/medium/celebrities/maulana-azad",   "wiki", "Maulana Abul Kalam Azad portrait photograph"],
  ["snap-lens/medium/celebrities/laxmibai",       "wiki", "Rani Lakshmibai Jhansi portrait painting"],
  ["snap-lens/medium/celebrities/frida-kahlo",    "wiki", "Frida Kahlo self portrait photograph"],
  ["snap-lens/medium/celebrities/salvador-dali",  "wiki", "Salvador Dali artist portrait photograph"],
  ["snap-lens/medium/celebrities/pablo-picasso",  "wiki", "Pablo Picasso artist portrait photograph"],
  ["snap-lens/medium/celebrities/andy-warhol",    "wiki", "Andy Warhol artist portrait photograph"],
  ["snap-lens/medium/celebrities/socrates",       "wiki", "Socrates philosopher bust sculpture photograph"],
  ["snap-lens/medium/celebrities/aristotle",      "wiki", "Aristotle philosopher bust sculpture photograph"],
  ["snap-lens/medium/celebrities/plato",          "wiki", "Plato philosopher bust sculpture photograph"],
  ["snap-lens/medium/celebrities/confucius",      "wiki", "Confucius philosopher portrait painting"],
  ["snap-lens/medium/celebrities/cleopatra",      "wiki", "Cleopatra VII bust Vatican Museums"],
  ["snap-lens/medium/celebrities/julius-caesar",  "wiki", "Julius Caesar Roman portrait bust photograph"],
  ["snap-lens/medium/celebrities/alexander-great","wiki", "Alexander the Great bust mosaic photograph"],
  ["snap-lens/medium/celebrities/simon-bolivar",  "wiki", "Simon Bolivar portrait painting South America"],
  ["snap-lens/medium/celebrities/benjamin-franklin","wiki","Benjamin Franklin portrait painting"],
  ["snap-lens/medium/celebrities/harriet-tubman", "wiki", "Harriet Tubman portrait photograph abolitionist"],
  ["snap-lens/medium/celebrities/florence-nightingale","wiki","Florence Nightingale nurse portrait photograph"],
  ["snap-lens/medium/celebrities/amelia-earhart", "wiki", "Amelia Earhart aviator portrait photograph"],
  ["snap-lens/medium/celebrities/yuri-gagarin",   "wiki", "Yuri Gagarin cosmonaut portrait photograph"],
  ["snap-lens/medium/celebrities/stephen-hawking","wiki", "Stephen Hawking physicist Cambridge portrait photograph"],
  ["snap-lens/medium/celebrities/carl-sagan",     "wiki", "Carl Sagan astronomer portrait photograph"],

  // ── Global extreme celebrities ───────────────────────
  ["snap-lens/extreme/celebrities/sundiata",      "wiki", "Sundiata Keita Mali Empire"],
  ["snap-lens/extreme/celebrities/cyrus",         "wiki", "Cyrus the Great Achaemenid Persian"],
  ["snap-lens/extreme/celebrities/sitting-bull-pipe","wiki","Sitting Bull Lakota Sioux pipe portrait photograph"],
  ["snap-lens/extreme/celebrities/subhas-bose",   "wiki", "Subhas Chandra Bose Indian National Army photograph"],
  ["snap-lens/extreme/celebrities/aurangzeb",     "wiki", "Aurangzeb Mughal Emperor portrait painting"],
  ["snap-lens/extreme/celebrities/chanakya",      "wiki", "Chanakya Arthashastra philosopher India"],
  ["snap-lens/extreme/celebrities/chandragupta",  "wiki", "Chandragupta Maurya emperor India"],
  ["snap-lens/extreme/celebrities/gopal-krishna", "wiki", "Gopal Krishna Gokhale Indian nationalist photograph"],
  ["snap-lens/extreme/celebrities/phule",         "wiki", "Jyotirao Phule social reformer Maharashtra photograph"],
  ["snap-lens/extreme/celebrities/durgabai",      "wiki", "Durgabai Deshmukh Andhra Pradesh social worker"],
  ["snap-lens/extreme/celebrities/birsa-munda",   "wiki", "Birsa Munda freedom fighter photograph"],
  ["snap-lens/extreme/celebrities/ashoka",        "wiki", "Ashoka Emperor Maurya India edicts"],
  ["snap-lens/extreme/celebrities/akbar",         "wiki", "Akbar Mughal Emperor portrait miniature painting"],
  ["snap-lens/extreme/celebrities/shaka-zulu",    "wiki", "Shaka Zulu king portrait illustration"],
  ["snap-lens/extreme/celebrities/kwame-nkrumah", "wiki", "Kwame Nkrumah Ghanaian statesman leader"],
  ["snap-lens/extreme/celebrities/che-guevara",   "wiki", "Che Guevara Guerrillero Heroico photograph"],
  ["snap-lens/extreme/celebrities/fidel-castro",  "wiki", "Fidel Castro Cuba portrait photograph"],
  ["snap-lens/extreme/celebrities/kemal-ataturk", "wiki", "Mustafa Kemal Ataturk Turkey portrait photograph"],
  ["snap-lens/extreme/celebrities/simone-de-beauvoir","wiki","Simone de Beauvoir French author existentialist"],
  ["snap-lens/extreme/celebrities/genghis-khan",  "wiki", "Genghis Khan Yuan Dynasty portrait painting"],
  ["snap-lens/extreme/celebrities/wu-zetian",     "wiki", "Wu Zetian Tang Dynasty Chinese empress"],
  ["snap-lens/extreme/celebrities/joan-of-arc",   "wiki", "Joan of Arc Jeanne d Arc French heroine"],
  ["snap-lens/extreme/celebrities/saladin",       "wiki", "Saladin sultan medieval miniature painting"],
  ["snap-lens/extreme/celebrities/vlad-impaler",  "wiki", "Vlad III Impaler Wallachia portrait painting"],
  ["snap-lens/extreme/celebrities/charlemagne",   "wiki", "Charlemagne Frankish king portrait Durer painting"],
  ["snap-lens/extreme/celebrities/sankara",       "wiki", "Thomas Sankara Burkinabe president portrait"],

  // ══════════════════════════════════════════════════════
  // 📱 INDIAN INSTAGRAM INFLUENCERS (5 easy + 5 medium + 5 extreme)
  // ══════════════════════════════════════════════════════

  // ── Indian influencers easy ──────────────────────────
  ["snap-lens/easy/celebrities/priyanka-chopra",  "wiki", "Priyanka Chopra Jonas actress singer"],
  ["snap-lens/easy/celebrities/deepika-padukone", "wiki", "Deepika Padukone Bollywood actress"],
  ["snap-lens/easy/celebrities/ranveer-singh",    "wiki", "Ranveer Singh Bollywood actor"],
  ["snap-lens/easy/celebrities/alia-bhatt",       "wiki", "Alia Bhatt Bollywood actress"],
  ["snap-lens/easy/celebrities/hrithik-roshan",   "wiki", "Hrithik Roshan Bollywood actor photograph"],

  // ── Indian influencers medium ────────────────────────
  ["snap-lens/medium/celebrities/shraddha-kapoor","wiki", "Shraddha Kapoor Bollywood actress"],
  ["snap-lens/medium/celebrities/kartik-aaryan",  "wiki", "Kartik Aaryan Bollywood actor"],
  ["snap-lens/medium/celebrities/tiger-shroff",   "wiki", "Tiger Shroff Bollywood actor martial arts"],
  ["snap-lens/medium/celebrities/katrina-kaif",   "wiki", "Katrina Kaif Bollywood actress"],
  ["snap-lens/medium/celebrities/varun-dhawan",   "wiki", "Varun Dhawan Bollywood actor"],

  // ── Indian influencers extreme ───────────────────────
  ["snap-lens/extreme/celebrities/bhuvan-bam",    "wiki", "Bhuvan Bam BB Ki Vines Indian YouTuber"],
  ["snap-lens/extreme/celebrities/carry-minati",  "wiki", "CarryMinati Ajey Nagar Indian YouTuber"],
  ["snap-lens/extreme/celebrities/harsh-beniwal", "wiki", "Harsh Beniwal Indian comedian actor"],
  ["snap-lens/extreme/celebrities/ashish-chanchlani","wiki","Ashish Chanchlani Vines Indian comedian"],
  ["snap-lens/extreme/celebrities/elvish-yadav",  "wiki", "Elvish Yadav Indian content creator YouTuber"],

  // ══════════════════════════════════════════════════════
  // 🌍 NEW LANDMARKS — easy / medium / extreme
  // ══════════════════════════════════════════════════════

  // ── New easy landmarks ───────────────────────────────
  ["snap-lens/easy/landmarks/hawa-mahal",         "wiki", "Hawa Mahal Palace of Winds Jaipur India"],
  ["snap-lens/easy/landmarks/burj-khalifa",       "wiki", "Burj Khalifa Dubai tallest building photo"],
  ["snap-lens/easy/landmarks/niagara-falls",      "wiki", "Niagara Falls Horseshoe Canada waterfall photo"],
  ["snap-lens/easy/landmarks/acropolis",          "wiki", "Acropolis Athens Parthenon Greece photo"],
  ["snap-lens/easy/landmarks/sagrada-familia",    "wiki", "Sagrada Familia Barcelona exterior Gaudi photo"],
  ["snap-lens/easy/landmarks/angkor-wat",         "wiki", "Angkor Wat Cambodia sunrise reflection photo"],
  ["snap-lens/easy/landmarks/petra",              "wiki", "Petra Treasury Al Khazneh Jordan photo"],
  ["snap-lens/easy/landmarks/hagia-sophia",       "wiki", "Hagia Sophia Istanbul Turkey photo"],
  ["snap-lens/easy/landmarks/santorini",          "wiki", "Santorini Oia Greece white blue domes photo"],
  ["snap-lens/easy/landmarks/notre-dame",         "wiki", "Notre Dame Cathedral Paris photo"],
  ["snap-lens/easy/landmarks/empire-state",       "wiki", "Empire State Building New York photo"],
  ["snap-lens/easy/landmarks/trevi-fountain",     "wiki", "Trevi Fountain Rome Italy photo"],
  ["snap-lens/easy/landmarks/buckingham-palace",  "wiki", "Buckingham Palace London photo"],
  ["snap-lens/easy/landmarks/colosseum-night",    "wiki", "Colosseum Rome illuminated night exterior"],
  ["snap-lens/easy/landmarks/mount-rushmore",     "wiki", "Mount Rushmore presidents photo"],

  // ── New medium landmarks ─────────────────────────────
  ["snap-lens/medium/landmarks/elephanta-caves",  "wiki", "Elephanta Caves Mumbai island photo"],
  ["snap-lens/medium/landmarks/mahabalipuram",    "wiki", "Mahabalipuram Shore Temple Tamil Nadu photo"],
  ["snap-lens/medium/landmarks/ranthambore-fort", "wiki", "Ranthambore Fort Rajasthan photo"],
  ["snap-lens/medium/landmarks/mont-saint-michel","wiki", "Mont Saint Michel France tidal island photo"],
  ["snap-lens/medium/landmarks/alhambra",         "wiki", "Alhambra Palace Granada Spain photo"],
  ["snap-lens/medium/landmarks/prague-castle",    "wiki", "Prague Castle Czech Republic photo"],
  ["snap-lens/medium/landmarks/dubrovnik",        "wiki", "Dubrovnik old town Croatia walls photo"],
  ["snap-lens/medium/landmarks/potala-palace",    "wiki", "Potala Palace Lhasa Tibet photo"],
  ["snap-lens/medium/landmarks/borobudur",        "wiki", "Borobudur Buddhist temple Java Indonesia photo"],
  ["snap-lens/medium/landmarks/easter-island",    "wiki", "Easter Island Moai statues photo"],
  ["snap-lens/medium/landmarks/uluru",            "wiki", "Uluru Ayers Rock Australia photo"],
  ["snap-lens/medium/landmarks/matterhorn",       "wiki", "Matterhorn Swiss Alps photo"],
  ["snap-lens/medium/landmarks/pompeii",          "wiki", "Pompeii ruins Italy volcano photo"],
  ["snap-lens/medium/landmarks/cartagena-castle", "wiki", "Castillo San Felipe Cartagena Colombia photo"],
  ["snap-lens/medium/landmarks/valley-of-kings",  "wiki", "Valley of the Kings Luxor Egypt photo"],
  ["snap-lens/medium/landmarks/colosseum-inside", "wiki", "Colosseum interior hypogeum Rome photo"],
  ["snap-lens/medium/landmarks/burj-al-arab",     "wiki", "Burj Al Arab Dubai hotel photo"],
  ["snap-lens/medium/landmarks/victoria-falls",   "wiki", "Victoria Falls Zimbabwe Zambia photo"],
  ["snap-lens/medium/landmarks/serengeti",        "wiki", "Serengeti savanna Tanzania wildebeest migration photo"],
  ["snap-lens/medium/landmarks/blue-mosque",      "wiki", "Blue Mosque Sultan Ahmed Istanbul photo"],
  ["snap-lens/medium/landmarks/sigiriya",         "wiki", "Sigiriya Lion Rock Sri Lanka photo"],
  ["snap-lens/medium/landmarks/chefchaouen",      "wiki", "Chefchaouen blue city Morocco photo"],

  // ── New extreme landmarks ────────────────────────────
  ["snap-lens/extreme/landmarks/nalanda",         "wiki", "Nalanda university ruins Bihar India photo"],
  ["snap-lens/extreme/landmarks/lepakshi",        "wiki", "Lepakshi temple hanging pillar Andhra Pradesh photo"],
  ["snap-lens/extreme/landmarks/rani-ki-vav",     "wiki", "Rani ki Vav stepwell Patan Gujarat India photo"],
  ["snap-lens/extreme/landmarks/chand-baori",     "wiki", "Chand Baori stepwell Abhaneri Rajasthan photo"],
  ["snap-lens/extreme/landmarks/bishnupur",       "wiki", "Bishnupur terracotta temples West Bengal India photo"],
  ["snap-lens/extreme/landmarks/mattancherry",    "wiki", "Mattancherry Dutch Palace Kerala India photo"],
  ["snap-lens/extreme/landmarks/dholavira",       "wiki", "Dholavira archaeological site Harappan Rann of Kutch"],
  ["snap-lens/extreme/landmarks/sravanabelagola", "wiki", "Bahubali Gomateshwara statue Shravanabelagola Karnataka"],
  ["snap-lens/extreme/landmarks/padmanabhapuram", "wiki", "Padmanabhapuram Palace Tamil Nadu wooden palace photo"],
  ["snap-lens/extreme/landmarks/vijay-stambha",   "wiki", "Vijay Stambha Victory Tower Chittorgarh photo"],
  ["snap-lens/extreme/landmarks/gol-gumbaz",      "wiki", "Gol Gumbaz Bijapur Karnataka dome photo"],
  ["snap-lens/extreme/landmarks/ranakpur",        "wiki", "Ranakpur Jain temple marble Rajasthan photo"],
  ["snap-lens/extreme/landmarks/somnath-temple",  "wiki", "Somnath Temple Gujarat reconstructed Jyotirlinga"],
  ["snap-lens/extreme/landmarks/gosaikunda",      "wiki", "Gosaikunda sacred lake Nepal photo"],
  ["snap-lens/extreme/landmarks/jiuzhaigou",      "wiki", "Jiuzhaigou Valley colorful lakes China photo"],
  ["snap-lens/extreme/landmarks/wadi-rum",        "wiki", "Wadi Rum desert Jordan photo"],
  ["snap-lens/extreme/landmarks/zhangjiajie",     "wiki", "Zhangjiajie Avatar mountains China photo"],
  ["snap-lens/extreme/landmarks/waitomo",         "wiki", "Waitomo Glowworm Caves New Zealand photo"],
  ["snap-lens/extreme/landmarks/lake-baikal",     "wiki", "Lake Baikal Russia deepest lake photo"],
  ["snap-lens/extreme/landmarks/trolltunga",      "wiki", "Trolltunga Hardanger fjord Norway cliff hiker"],
  ["snap-lens/extreme/landmarks/preikestolen",    "wiki", "Preikestolen Pulpit Rock Norway fjord photo"],
  ["snap-lens/extreme/landmarks/fingals-cave",    "wiki", "Fingals Cave Staffa Scotland basalt columns photo"],
  ["snap-lens/extreme/landmarks/giants-causeway", "wiki", "Giants Causeway Northern Ireland basalt columns photo"],
  ["snap-lens/extreme/landmarks/seljalandsfoss",  "wiki", "Seljalandsfoss waterfall Iceland photo"],
  ["snap-lens/extreme/landmarks/lake-hillier",    "wiki", "Lake Hillier pink lake Western Australia photo"],
  ["snap-lens/extreme/landmarks/peyto-lake",      "wiki", "Peyto Lake turquoise Banff Canada photo"],
  ["snap-lens/extreme/landmarks/crooked-forest",  "wiki", "Krzywy Las crooked forest bent pine trees Gryfino"],
  ["snap-lens/extreme/landmarks/mount-roraima",   "wiki", "Mount Roraima tepui Venezuela photo"],
  ["snap-lens/extreme/landmarks/marble-caves",    "wiki", "Marble Caves Chile Chico Patagonia turquoise"],
  ["snap-lens/extreme/landmarks/fairy-pools",     "wiki", "Fairy Pools Isle of Skye Scotland photo"],

  // ══════════════════════════════════════════════════════
  // 🏷️ NEW LOGOS — easy
  // ══════════════════════════════════════════════════════
  ["snap-lens/easy/logos/nasa",        "logo", ["nasa",          "0B3D91"]],
  ["snap-lens/easy/logos/firefox",     "logo", ["firefoxbrowser", "FF7139"]],
  ["snap-lens/easy/logos/amazon",      "logo", ["amazon",         "FF9900"]],
  ["snap-lens/easy/logos/mercedes",    "logo", ["mercedesbenz",   "000000"]],
  ["snap-lens/easy/logos/microsoft",   "logo", ["microsoft",      "5E5E5E"]],
  ["snap-lens/easy/logos/pepsi",       "wiki", "Pepsi logo brand blue"],
  ["snap-lens/easy/logos/coca-cola",   "logo", ["cocacola",       "F40009"]],
  ["snap-lens/easy/logos/lego",        "wiki", "LEGO logo brick toy brand"],
  ["snap-lens/easy/logos/batman",      "wiki", "Batman logo symbol DC Comics"],
  ["snap-lens/easy/logos/xbox",        "logo", ["xbox",           "107C10"]],
  ["snap-lens/easy/logos/star-wars",   "wiki", "Star Wars franchise film logo"],
  ["snap-lens/easy/logos/olympic-rings","wiki","Olympic rings symbol five continents"],
];

// ── Stats ──────────────────────────────────────────────────
let ok = 0, skipped = 0, failed = 0;
const failures = [];

// ── Upload one image (with retry) ─────────────────────────
async function uploadOne([publicId, type, query], idx) {
  const label = `[${idx + 1}/${IMAGES.length}]`;
  const isSvg = type === "logo";
  let uploadArg;

  // ── Resolve upload source ──────────────────────────────
  if (type === "flag") {
    // Flags: upload by remote URL — flagpedia.net is reliable and allows hotlinking
    uploadArg = FLAG(query);
  } else if (type === "logo") {
    // Logos: use simple-icons npm package SVG data directly (avoids CDN 404s for removed brands).
    const slug = query[0];
    const color = query[1] || "000000";
    // simple-icons exports icons as siSlugname (camelCase, strip non-alphanumeric)
    const iconKey = "si" + slug.charAt(0).toUpperCase() + slug.slice(1).replace(/[^a-zA-Z0-9]/g, "");
    const icon = simpleIcons[iconKey];
    if (!icon) {
      // Fallback: try CDN download for icons not in the npm package
      const svgUrl = SI(slug, color);
      try {
        const buf = await downloadToBuffer(svgUrl);
        uploadArg = `data:image/svg+xml;base64,${buf.toString("base64")}`;
      } catch (e) {
        console.log(`  ❌ ${label} FAIL   ${publicId} (icon not in pkg & cdn 404: ${slug})`);
        failed++;
        failures.push({ publicId, query, error: `Icon not found in simple-icons pkg: ${slug}` });
        return;
      }
    } else {
      const coloredSvg = icon.svg.replace("<svg ", `<svg fill="#${color}" `);
      uploadArg = `data:image/svg+xml;base64,${Buffer.from(coloredSvg).toString("base64")}`;
    }
  } else {
    // Wiki: use the remote CDN URL directly
    const imageUrl = urlCache[query];
    if (!imageUrl) {
      console.log(`  ⚠️  ${label} NO_URL  ${publicId}`);
      failed++;
      failures.push({ publicId, query, error: "No image URL resolved" });
      return;
    }
    uploadArg = imageUrl;
  }

  const MAX_RETRIES = 5;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const uploadOptions = {
        public_id: publicId,
        overwrite: false,
        resource_type: "image",
        ...(isSvg
          ? { format: "svg" }
          : {
              // Resize to max 1600px — reduces file size below Cloudinary's limit
              eager: [{ width: 1600, height: 1600, crop: "limit", quality: "auto:good" }],
              eager_async: false,
              format: "jpg",
            }),
      };

      const result = await cloudinary.uploader.upload(uploadArg, uploadOptions);

      const kb = Math.round((result.bytes || 0) / 1024);
      console.log(`  ✅ ${label} ${publicId} (${kb}KB)`);
      ok++;
      return;
    } catch (e) {
      const msg = e?.error?.message || e?.message || JSON.stringify(e);

      // Already exists — not an error
      if (msg.includes("already exists") || msg.includes("already been used") || e?.http_code === 409) {
        console.log(`  ⏭️  ${label} EXISTS  ${publicId}`);
        skipped++;
        return;
      }

      // Non-retryable errors
      const isInvalidUrl = msg.includes("Invalid image") || msg.includes("not a supported");
      if (isInvalidUrl) {
        console.log(`  ❌ ${label} FAIL   ${publicId}`);
        console.log(`       → ${msg.slice(0, 160)}`);
        failed++;
        failures.push({ publicId, query, error: msg });
        return;
      }

      // Retryable errors (EPIPE, ECONNRESET, rate limit, timeout, too large)
      const isRetryable = msg.includes("EPIPE") || msg.includes("ECONNRESET") ||
                          msg.includes("ETIMEDOUT") || msg.includes("ENOTFOUND") ||
                          msg.includes("429") || msg.includes("503") ||
                          msg.includes("File size too large") ||
                          msg.includes("socket") || msg.includes("network");
      if (isRetryable && attempt < MAX_RETRIES) {
        const is429 = msg.includes("429");
        const isTooBig = msg.includes("File size too large");
        const waitMs = is429 ? 8000 * attempt : isTooBig ? 3000 : 2000 * attempt;
        process.stdout.write(`  ⏳ ${label} retry ${attempt}/${MAX_RETRIES - 1} (${msg.slice(0, 30)})... `);
        await sleep(waitMs);
        continue;
      }

      console.log(`  ❌ ${label} FAIL   ${publicId}`);
      console.log(`       → ${msg.slice(0, 160)}`);
      failed++;
      failures.push({ publicId, query, error: msg });
      return;
    }
  }
}

// ── Main ───────────────────────────────────────────────────
async function run() {
  const wikiImages = IMAGES.filter(([, t]) => t === "wiki");

  console.log(`\n🚀 SnapQuiz Smart Upload`);
  console.log(`   Total: ${IMAGES.length} images → Cloudinary: ${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`);
  console.log(`   Wiki: ${wikiImages.length} | Flags: ${IMAGES.filter(([,t])=>t==="flag").length} | Logos: ${IMAGES.filter(([,t])=>t==="logo").length}\n`);

  // ── Phase 1: Resolve Wiki URLs via Commons search API ────
  const unresolved = wikiImages.filter(([, , q]) => urlCache[q] === undefined);
  if (unresolved.length > 0) {
    console.log(`🔍 Phase 1: Resolving ${unresolved.length} new Wiki URLs (${wikiImages.length - unresolved.length} cached)...\n`);
    for (let i = 0; i < unresolved.length; i++) {
      const [publicId, , query] = unresolved[i];
      process.stdout.write(`  [${i+1}/${unresolved.length}] ${query.slice(0, 60)}... `);
      const url = await findCommonsImage(query);
      console.log(url ? `✓ ${url.split("/").pop().slice(0, 45)}` : `✗ not found`);
      await sleep(500); // polite Commons API gap
    }
  } else {
    console.log(`✅ Phase 1: All ${wikiImages.length} Wiki URLs already cached.\n`);
  }

  const resolved = wikiImages.filter(([, , q]) => urlCache[q]);
  const notFound = wikiImages.filter(([, , q]) => urlCache[q] === null);
  console.log(`\n   ✅ Resolved: ${resolved.length}  ❌ Not found: ${notFound.length}\n`);
  if (notFound.length) {
    console.log(`   Not found queries:`);
    notFound.forEach(([id, , q]) => console.log(`     • ${q}`));
    console.log();
  }

  // ── Phase 2: Skip download — upload directly by URL ─────
  console.log(`   ✅ Skipping download phase — uploading wiki images directly by URL.\n`);

  // ── Phase 3: Upload all to Cloudinary ────────────────────
  console.log(`\n☁️  Phase 3: Uploading all ${IMAGES.length} images to Cloudinary (batch 2)...\n`);
  const CONCURRENCY = 2;
  for (let i = 0; i < IMAGES.length; i += CONCURRENCY) {
    await Promise.all(
      IMAGES.slice(i, i + CONCURRENCY).map((img, j) => uploadOne(img, i + j))
    );
    await sleep(200);
  }

  // ── Summary ───────────────────────────────────────────────
  console.log(`\n${"═".repeat(56)}`);
  console.log(`✅ Uploaded : ${ok}`);
  console.log(`⏭️  Existed  : ${skipped}`);
  console.log(`❌ Failed   : ${failed}`);
  console.log(`   Total    : ${ok + skipped + failed} / ${IMAGES.length}`);

  if (failures.length) {
    const failFile = join(CACHE_DIR, "failures.json");
    writeFileSync(failFile, JSON.stringify(failures, null, 2));
    console.log(`\n⚠️  ${failures.length} failures → ${failFile}`);
    failures.slice(0, 10).forEach(f =>
      console.log(`  • ${f.publicId}\n    ${(f.error || "").slice(0, 100)}`)
    );
  }
}

run().catch(console.error);
