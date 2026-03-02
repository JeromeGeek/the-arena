/**
 * SnapQuiz — Upload all 600 images to Cloudinary
 * Strategy: Cloudinary uploads directly from source URLs (server-side fetch)
 * Sources:
 *   Flags      → flagpedia.net/data/flags/w2560/<cc>.png  (high-res PNG, no rate-limit)
 *   Landmarks  → Wikimedia Commons Special:FilePath (full-res JPEGs, 400KB–4MB)
 *   Logos      → cdn.simpleicons.org SVGs (vector, infinite quality, icon-only)
 *   Celebrities→ Wikimedia Commons Special:FilePath (full-res JPEGs)
 *
 * Run: node scripts/upload-all.mjs
 */

import { readFileSync, mkdirSync, createReadStream, existsSync, unlinkSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createHash } from "crypto";
import https from "https";
import http from "http";
import { v2 as cloudinary } from "cloudinary";

const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dir, "../.env.local");

// Persistent cache dir — survives restarts, so we never re-download the same file
const CACHE_DIR = join(__dir, "../.wiki-cache");
mkdirSync(CACHE_DIR, { recursive: true });

// Parse .env.local robustly (handles comments, blank lines, values with = in them)
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

// ── Source URL helpers ────────────────────────────────────
// High-res country flags (PNG ~4–25 KB each, clean, no text)
const FLAG = (cc) => `https://flagpedia.net/data/flags/w2560/${cc}.png`;

// Wikimedia Commons — DIRECT CDN URL (no redirect, no rate-limit)
// Uses Wikimedia's storage scheme: MD5(filename) → <a>/<ab>/<filename>
// This bypasses Special:FilePath entirely, hitting the CDN directly.
// Use Node's built-in crypto for correct MD5 hashes (Wikimedia CDN path formula)
const WIKI = (file) => {
  const h = createHash("md5").update(file).digest("hex");
  return `https://upload.wikimedia.org/wikipedia/commons/${h[0]}/${h.slice(0,2)}/${encodeURIComponent(file)}`;
};

// SimpleIcons SVG — icon-only logo, no brand name text, perfect vector quality
const SI = (name, color = "000000") =>
  `https://cdn.simpleicons.org/${name}/${color}`;

// ── 600-image manifest ────────────────────────────────────
// Format: [cloudinary_public_id, source_url]
const IMAGES = [

  // ════════════════════════════════════════════════════════
  //  LANDMARKS — easy (50)
  // ════════════════════════════════════════════════════════
  ["snap-lens/easy/landmarks/eiffel-tower",          WIKI("Eiffel_Tower_3.jpg")],
  ["snap-lens/easy/landmarks/taj-mahal",             WIKI("Taj_Mahal_2012.jpg")],
  ["snap-lens/easy/landmarks/colosseum",             WIKI("Colosseum_in_Rome,_Italy_-_April_2007.jpg")],
  ["snap-lens/easy/landmarks/statue-of-liberty",     WIKI("Statue_of_Liberty_7.jpg")],
  ["snap-lens/easy/landmarks/burj-khalifa",          WIKI("Dubai_Burj_Khalifa.jpg")],
  ["snap-lens/easy/landmarks/big-ben",               WIKI("Big_Ben.jpg")],
  ["snap-lens/easy/landmarks/great-wall",            WIKI("The_Great_Wall_of_China_at_Jinshanling.jpg")],
  ["snap-lens/easy/landmarks/machu-picchu",          WIKI("80_-_Machu_Picchu_-_Juin_2009_-_edit.2.jpg")],
  ["snap-lens/easy/landmarks/sydney-opera-house",    WIKI("SydneyOperaHouse.jpg")],
  ["snap-lens/easy/landmarks/pyramids-giza",         WIKI("All_Gizah_Pyramids.jpg")],
  ["snap-lens/easy/landmarks/golden-gate",           WIKI("GoldenGateBridge-001.jpg")],
  ["snap-lens/easy/landmarks/tower-bridge",          WIKI("Tower_Bridge_London_Feb_2006.jpg")],
  ["snap-lens/easy/landmarks/mount-everest",         WIKI("Mount_Everest_as_seen_from_Drukair2_PLW_edit.jpg")],
  ["snap-lens/easy/landmarks/niagara-falls",         WIKI("Horseshoe_Falls.jpg")],
  ["snap-lens/easy/landmarks/christ-redeemer",       WIKI("Cristo_Redentor_-_Rio_de_Janeiro,_Brasil.jpg")],
  ["snap-lens/easy/landmarks/tower-of-pisa",         WIKI("Leaning_tower_of_pisa_2.jpg")],
  ["snap-lens/easy/landmarks/stonehenge",            WIKI("Stonehenge2007_07_30.jpg")],
  ["snap-lens/easy/landmarks/acropolis",             WIKI("The_Acropolis_of_Athens.jpg")],
  ["snap-lens/easy/landmarks/sagrada-familia",       WIKI("Sagrada_Familia_01.jpg")],
  ["snap-lens/easy/landmarks/mount-fuji",            WIKI("Mount_Fuji_from_Hotel_Mt_Fuji_2002-3-21.jpg")],
  ["snap-lens/easy/landmarks/angkor-wat",            WIKI("Angkor_Wat_temple.jpg")],
  ["snap-lens/easy/landmarks/petra",                 WIKI("Al_Khazneh_Petra_crop.jpg")],
  ["snap-lens/easy/landmarks/hagia-sophia",          WIKI("Hagia_Sophia_Interior,_Istanbul.jpg")],
  ["snap-lens/easy/landmarks/santorini",             WIKI("Santorini_in_the_Cyclades,_Greece.jpg")],
  ["snap-lens/easy/landmarks/forbidden-city",        WIKI("The_Palace_Museum_-_Beijing.jpg")],
  ["snap-lens/easy/landmarks/chichen-itza",          WIKI("ChichenItzaEquinox.jpg")],
  ["snap-lens/easy/landmarks/neuschwanstein",        WIKI("Neuschwanstein_Castle_aerial.jpg")],
  ["snap-lens/easy/landmarks/eiffel-night",          WIKI("Tour_eiffel_at_sunrise_from_the_trocadero.jpg")],
  ["snap-lens/easy/landmarks/big-ben-detail",        WIKI("Elizabeth_Tower.jpg")],
  ["snap-lens/easy/landmarks/colosseum-aerial",      WIKI("Colosseum_interior.jpg")],
  ["snap-lens/easy/landmarks/taj-mahal-reflection",  WIKI("Taj_Mahal_reflection.jpg")],
  ["snap-lens/easy/landmarks/machu-picchu-wide",     WIKI("Machu_Picchu.jpg")],
  ["snap-lens/easy/landmarks/pyramids-wide",         WIKI("Giza_pyramid_complex.jpg")],
  ["snap-lens/easy/landmarks/golden-gate-aerial",    WIKI("Golden_Gate_Bridge_from_above.jpg")],
  ["snap-lens/easy/landmarks/sydney-opera-aerial",   WIKI("Sydney_Opera_House.jpg")],
  ["snap-lens/easy/landmarks/great-wall-autumn",     WIKI("Great_Wall_of_China.jpg")],
  ["snap-lens/easy/landmarks/petra-wide",            WIKI("Petra_Jordan.jpg")],
  ["snap-lens/easy/landmarks/stonehenge-aerial",     WIKI("Stonehenge.jpg")],
  ["snap-lens/easy/landmarks/mount-fuji-lake",       WIKI("Fujisan.jpg")],
  ["snap-lens/easy/landmarks/angkor-wat-reflection", WIKI("Angkor_Wat_reflection.jpg")],
  ["snap-lens/easy/landmarks/hagia-sophia-exterior", WIKI("Hagia_Sophia_Mars_2013.jpg")],
  ["snap-lens/easy/landmarks/neuschwanstein-winter", WIKI("Neuschwanstein_winter.jpg")],
  ["snap-lens/easy/landmarks/tower-bridge-night",    WIKI("Tower_Bridge_at_night.jpg")],
  ["snap-lens/easy/landmarks/christ-redeemer-wide",  WIKI("Cristo_Redentor.jpg")],
  ["snap-lens/easy/landmarks/sagrada-familia-towers",WIKI("Sagrada_Familia.jpg")],
  ["snap-lens/easy/landmarks/colosseum-inside",      WIKI("Colosseum_Rome.jpg")],
  ["snap-lens/easy/landmarks/statue-liberty-close",  WIKI("Statue_of_Liberty_frontal.jpg")],
  ["snap-lens/easy/landmarks/chichen-itza-wide",     WIKI("Chichen_Itza.jpg")],
  ["snap-lens/easy/landmarks/forbidden-city-gate",   WIKI("Tiananmen_Square.jpg")],
  ["snap-lens/easy/landmarks/mount-everest-base",    WIKI("Everest_Base_Camp.jpg")],

  // ════════════════════════════════════════════════════════
  //  LANDMARKS — medium (50)
  // ════════════════════════════════════════════════════════
  ["snap-lens/medium/landmarks/mont-saint-michel",   WIKI("Mont_Saint-Michel.jpg")],
  ["snap-lens/medium/landmarks/alhambra",            WIKI("Alhambra.jpg")],
  ["snap-lens/medium/landmarks/plitvice-lakes",      WIKI("Plitvice_lakes.jpg")],
  ["snap-lens/medium/landmarks/pamukkale",           WIKI("Pamukkale.jpg")],
  ["snap-lens/medium/landmarks/cappadocia",          WIKI("Cappadocia_balloons.jpg")],
  ["snap-lens/medium/landmarks/bagan-temples",       WIKI("Bagan_Myanmar.jpg")],
  ["snap-lens/medium/landmarks/edinburgh-castle",    WIKI("Edinburgh_Castle_from_Princes_Street.jpg")],
  ["snap-lens/medium/landmarks/prague-castle",       WIKI("Prague_Castle.jpg")],
  ["snap-lens/medium/landmarks/meteora",             WIKI("Meteora_Greece.jpg")],
  ["snap-lens/medium/landmarks/amalfi-coast",        WIKI("Amalfi.jpg")],
  ["snap-lens/medium/landmarks/dubrovnik",           WIKI("Dubrovnik.jpg")],
  ["snap-lens/medium/landmarks/potala-palace",       WIKI("Potala_Palace.jpg")],
  ["snap-lens/medium/landmarks/borobudur",           WIKI("Borobudur.jpg")],
  ["snap-lens/medium/landmarks/easter-island",       WIKI("Moai_Rano_raraku.jpg")],
  ["snap-lens/medium/landmarks/louvre",              WIKI("Louvre.jpg")],
  ["snap-lens/medium/landmarks/buckingham-palace",   WIKI("Buckingham_Palace,_London_-_April_2009.jpg")],
  ["snap-lens/medium/landmarks/arc-triomphe",        WIKI("Arc_de_Triomphe,_Paris.jpg")],
  ["snap-lens/medium/landmarks/trevi-fountain",      WIKI("Trevi_Fountain,_Rome,_Italy_2_-_May_2007.jpg")],
  ["snap-lens/medium/landmarks/iguazu-falls",        WIKI("Iguazu_Falls.jpg")],
  ["snap-lens/medium/landmarks/victoria-falls",      WIKI("Victoria_Falls.jpg")],
  ["snap-lens/medium/landmarks/halong-bay",          WIKI("Ha_Long_Bay.jpg")],
  ["snap-lens/medium/landmarks/grand-canyon",        WIKI("Grand_Canyon.jpg")],
  ["snap-lens/medium/landmarks/pompeii",             WIKI("Pompeii_ruins.jpg")],
  ["snap-lens/medium/landmarks/notre-dame",          WIKI("Notre_Dame_de_Paris.jpg")],
  ["snap-lens/medium/landmarks/versailles",          WIKI("Versailles.jpg")],
  ["snap-lens/medium/landmarks/uluru",               WIKI("Uluru.jpg")],
  ["snap-lens/medium/landmarks/matterhorn",          WIKI("Matterhorn_from_Zermatt.jpg")],
  ["snap-lens/medium/landmarks/empire-state",        WIKI("NYC_Empire_State_Building.jpg")],
  ["snap-lens/medium/landmarks/burj-al-arab",        WIKI("Burj_Al-Arab.jpg")],
  ["snap-lens/medium/landmarks/serengeti",           WIKI("Serengeti.jpg")],
  ["snap-lens/medium/landmarks/sahara",              WIKI("Sahara_desert.jpg")],
  ["snap-lens/medium/landmarks/yellowstone",         WIKI("Grand_Prismatic_Spring,_Yellowstone_National_Park.jpg")],
  ["snap-lens/medium/landmarks/halong-bay-aerial",   WIKI("Ha_long_bay.jpg")],
  ["snap-lens/medium/landmarks/dead-sea",            WIKI("Dead_Sea_2000.jpg")],
  ["snap-lens/medium/landmarks/varanasi-ghats",      WIKI("Varanasi.jpg")],
  ["snap-lens/medium/landmarks/norway-fjords",       WIKI("Geirangerfjord,_Norway.jpg")],
  ["snap-lens/medium/landmarks/valley-of-kings",     WIKI("Luxor.jpg")],
  ["snap-lens/medium/landmarks/sphinx",              WIKI("Great_Sphinx_of_Giza.jpg")],
  ["snap-lens/medium/landmarks/angkor-thom",         WIKI("Angkor_Thom.jpg")],
  ["snap-lens/medium/landmarks/inca-trail",          WIKI("Inca_trail.jpg")],
  ["snap-lens/medium/landmarks/sistine-chapel",      WIKI("Sistine_Chapel.jpg")],
  ["snap-lens/medium/landmarks/cologne-cathedral",   WIKI("Cologne_Cathedral.jpg")],
  ["snap-lens/medium/landmarks/galata-tower",        WIKI("Galata_Tower.jpg")],
  ["snap-lens/medium/landmarks/hofburg-palace",      WIKI("Hofburg_Palace.jpg")],
  ["snap-lens/medium/landmarks/verona-arena",        WIKI("Arena_di_Verona.jpg")],
  ["snap-lens/medium/landmarks/edinburgh-night",     WIKI("Edinburgh_Castle_at_night.jpg")],
  ["snap-lens/medium/landmarks/alcazar-segovia",     WIKI("Alcazar_Segovia.jpg")],
  ["snap-lens/medium/landmarks/alhambra-inside",     WIKI("Granada_Alhambra.jpg")],
  ["snap-lens/medium/landmarks/uluru-sunset",        WIKI("Uluru_sunset.jpg")],
  ["snap-lens/medium/landmarks/pompeii-street",      WIKI("Pompeii_street.jpg")],

  // ════════════════════════════════════════════════════════
  //  LANDMARKS — extreme (50)
  // ════════════════════════════════════════════════════════
  ["snap-lens/extreme/landmarks/hallstatt",          WIKI("Hallstatt.jpg")],
  ["snap-lens/extreme/landmarks/cappadocia-rock",    WIKI("Cappadocia.jpg")],
  ["snap-lens/extreme/landmarks/wadi-rum",           WIKI("Wadi_Rum.jpg")],
  ["snap-lens/extreme/landmarks/antelope-canyon",    WIKI("Antelope_Canyon.jpg")],
  ["snap-lens/extreme/landmarks/giants-causeway",    WIKI("Giants_Causeway.jpg")],
  ["snap-lens/extreme/landmarks/trolltunga",         WIKI("Trolltunga.jpg")],
  ["snap-lens/extreme/landmarks/preikestolen",       WIKI("Preikestolen.jpg")],
  ["snap-lens/extreme/landmarks/salar-uyuni",        WIKI("Salar_de_Uyuni_Bolivia.jpg")],
  ["snap-lens/extreme/landmarks/zhangjiajie",        WIKI("Zhangjiajie_National_Forest_Park.jpg")],
  ["snap-lens/extreme/landmarks/lake-baikal",        WIKI("Lake_Baikal.jpg")],
  ["snap-lens/extreme/landmarks/danakil",            WIKI("Dallol.jpg")],
  ["snap-lens/extreme/landmarks/namib-dunes",        WIKI("Sossusvlei.jpg")],
  ["snap-lens/extreme/landmarks/marble-caves",       WIKI("Cuevas_de_Mármol_(Marble_Caves),_Patagonia,_Chile.jpg")],
  ["snap-lens/extreme/landmarks/socotra",            WIKI("Socotra.jpg")],
  ["snap-lens/extreme/landmarks/painted-hills",      WIKI("Painted_Hills.jpg")],
  ["snap-lens/extreme/landmarks/jiuzhaigou",         WIKI("1_jiuzhaigou_valley_wu_hua_hai_2011b.jpg")],
  ["snap-lens/extreme/landmarks/fly-geyser",         WIKI("Fly_Geyser.jpg")],
  ["snap-lens/extreme/landmarks/lake-hillier",       WIKI("Pink_Lake_(Lake_Hillier)_on_Middle_Island_off_the_coast_of_Esperance_Western_Australia.jpg")],
  ["snap-lens/extreme/landmarks/bryce-canyon",       WIKI("Bryce_Canyon.jpg")],
  ["snap-lens/extreme/landmarks/dolomites",          WIKI("Tre_Cime_di_Lavaredo.jpg")],
  ["snap-lens/extreme/landmarks/fairy-pools",        WIKI("Fairy_Pools,_Isle_of_Skye_(22005661613).jpg")],
  ["snap-lens/extreme/landmarks/black-sand-beach",   WIKI("Reynisdrangar.jpg")],
  ["snap-lens/extreme/landmarks/seljalandsfoss",     WIKI("Seljalandsfoss,_Iceland.jpg")],
  ["snap-lens/extreme/landmarks/peyto-lake",         WIKI("Peyto_Lake-Banff_NP-Canada.jpg")],
  ["snap-lens/extreme/landmarks/door-to-hell",       WIKI("Darvasa_gas_crater_panorama.jpg")],
  ["snap-lens/extreme/landmarks/waitomo-caves",      WIKI("Waitomo.jpg")],
  ["snap-lens/extreme/landmarks/tigers-nest",        WIKI("Tigers_Nest.jpg")],
  ["snap-lens/extreme/landmarks/torres-del-paine",   WIKI("Torres_del_Paine.jpg")],
  ["snap-lens/extreme/landmarks/chocolate-hills",    WIKI("Chocolate_Hills.jpg")],
  ["snap-lens/extreme/landmarks/cano-cristales",     WIKI("Caño_Cristales_(4).jpg")],
  ["snap-lens/extreme/landmarks/wave-rock",          WIKI("Wave_rock.jpg")],
  ["snap-lens/extreme/landmarks/moeraki-boulders",   WIKI("Moeraki_Boulders.jpg")],
  ["snap-lens/extreme/landmarks/tsingy",             WIKI("Tsingy_de_Bemaraha.jpg")],
  ["snap-lens/extreme/landmarks/plain-of-jars",      WIKI("Plain_of_Jars.jpg")],
  ["snap-lens/extreme/landmarks/son-doong",          WIKI("Son_Doong_Cave_DB_(2)-edited.jpg")],
  ["snap-lens/extreme/landmarks/gosaikunda",         WIKI("Gosaikunda_Lake.jpg")],
  ["snap-lens/extreme/landmarks/lake-natron",        WIKI("Lake_Natron,_Tanzania.jpg")],
  ["snap-lens/extreme/landmarks/rio-tinto",          WIKI("Río_Tinto,_cauce_36.jpg")],
  ["snap-lens/extreme/landmarks/crooked-forest",     WIKI("Crooked_Forest.jpg")],
  ["snap-lens/extreme/landmarks/deception-island",   WIKI("Deception_Island.jpg")],
  ["snap-lens/extreme/landmarks/fingals-cave",       WIKI("Fingals_Cave_Interior.jpg")],
  ["snap-lens/extreme/landmarks/bigar-waterfall",    WIKI("Izvorul_Bigăr.JPG")],
  ["snap-lens/extreme/landmarks/vatnajokull",        WIKI("Iceland_glacier.jpg")],
  ["snap-lens/extreme/landmarks/ice-cave",           WIKI("Ice_cave.jpg")],
  ["snap-lens/extreme/landmarks/lencois",            WIKI("Lencois_maranhenses.jpg")],
  ["snap-lens/extreme/landmarks/reine",              WIKI("Reine,_Lofoten,_Norway.jpg")],
  ["snap-lens/extreme/landmarks/tepui",              WIKI("Roraima.jpg")],
  ["snap-lens/extreme/landmarks/mount-roraima",      WIKI("Monte_Roraima.jpg")],
  ["snap-lens/extreme/landmarks/patagonia-glacier",  WIKI("Perito_Moreno_Glacier,_Argentina.jpg")],
  ["snap-lens/extreme/landmarks/apostle-islands",    WIKI("Apostle_Island_Sea_Cave_in_Winter.jpg")],

  // ════════════════════════════════════════════════════════
  //  FLAGS — flagpedia.net w2560 (high-res PNG, no rate-limit)
  //  easy (50)
  // ════════════════════════════════════════════════════════
  ["snap-lens/easy/flags/japan",         FLAG("jp")],
  ["snap-lens/easy/flags/brazil",        FLAG("br")],
  ["snap-lens/easy/flags/canada",        FLAG("ca")],
  ["snap-lens/easy/flags/india",         FLAG("in")],
  ["snap-lens/easy/flags/usa",           FLAG("us")],
  ["snap-lens/easy/flags/uk",            FLAG("gb")],
  ["snap-lens/easy/flags/germany",       FLAG("de")],
  ["snap-lens/easy/flags/france",        FLAG("fr")],
  ["snap-lens/easy/flags/australia",     FLAG("au")],
  ["snap-lens/easy/flags/south-africa",  FLAG("za")],
  ["snap-lens/easy/flags/spain",         FLAG("es")],
  ["snap-lens/easy/flags/italy",         FLAG("it")],
  ["snap-lens/easy/flags/russia",        FLAG("ru")],
  ["snap-lens/easy/flags/china",         FLAG("cn")],
  ["snap-lens/easy/flags/mexico",        FLAG("mx")],
  ["snap-lens/easy/flags/argentina",     FLAG("ar")],
  ["snap-lens/easy/flags/sweden",        FLAG("se")],
  ["snap-lens/easy/flags/switzerland",   FLAG("ch")],
  ["snap-lens/easy/flags/turkey",        FLAG("tr")],
  ["snap-lens/easy/flags/south-korea",   FLAG("kr")],
  ["snap-lens/easy/flags/norway",        FLAG("no")],
  ["snap-lens/easy/flags/greece",        FLAG("gr")],
  ["snap-lens/easy/flags/poland",        FLAG("pl")],
  ["snap-lens/easy/flags/nepal",         FLAG("np")],
  ["snap-lens/easy/flags/egypt",         FLAG("eg")],
  ["snap-lens/easy/flags/portugal",      FLAG("pt")],
  ["snap-lens/easy/flags/netherlands",   FLAG("nl")],
  ["snap-lens/easy/flags/denmark",       FLAG("dk")],
  ["snap-lens/easy/flags/nigeria",       FLAG("ng")],
  ["snap-lens/easy/flags/indonesia",     FLAG("id")],
  ["snap-lens/easy/flags/pakistan",      FLAG("pk")],
  ["snap-lens/easy/flags/new-zealand",   FLAG("nz")],
  ["snap-lens/easy/flags/ukraine",       FLAG("ua")],
  ["snap-lens/easy/flags/saudi-arabia",  FLAG("sa")],
  ["snap-lens/easy/flags/kenya",         FLAG("ke")],
  ["snap-lens/easy/flags/jamaica",       FLAG("jm")],
  ["snap-lens/easy/flags/iran",          FLAG("ir")],
  ["snap-lens/easy/flags/israel",        FLAG("il")],
  ["snap-lens/easy/flags/ethiopia",      FLAG("et")],
  ["snap-lens/easy/flags/thailand",      FLAG("th")],
  ["snap-lens/easy/flags/malaysia",      FLAG("my")],
  ["snap-lens/easy/flags/peru",          FLAG("pe")],
  ["snap-lens/easy/flags/colombia",      FLAG("co")],
  ["snap-lens/easy/flags/bangladesh",    FLAG("bd")],
  ["snap-lens/easy/flags/ghana",         FLAG("gh")],
  ["snap-lens/easy/flags/myanmar",       FLAG("mm")],
  ["snap-lens/easy/flags/cambodia",      FLAG("kh")],
  ["snap-lens/easy/flags/senegal",       FLAG("sn")],
  ["snap-lens/easy/flags/moldova",       FLAG("md")],
  ["snap-lens/easy/flags/eritrea",       FLAG("er")],

  // flags — medium (50)
  ["snap-lens/medium/flags/finland",        FLAG("fi")],
  ["snap-lens/medium/flags/austria",        FLAG("at")],
  ["snap-lens/medium/flags/belgium",        FLAG("be")],
  ["snap-lens/medium/flags/ireland",        FLAG("ie")],
  ["snap-lens/medium/flags/hungary",        FLAG("hu")],
  ["snap-lens/medium/flags/czech-republic", FLAG("cz")],
  ["snap-lens/medium/flags/romania",        FLAG("ro")],
  ["snap-lens/medium/flags/bulgaria",       FLAG("bg")],
  ["snap-lens/medium/flags/croatia",        FLAG("hr")],
  ["snap-lens/medium/flags/slovakia",       FLAG("sk")],
  ["snap-lens/medium/flags/slovenia",       FLAG("si")],
  ["snap-lens/medium/flags/serbia",         FLAG("rs")],
  ["snap-lens/medium/flags/albania",        FLAG("al")],
  ["snap-lens/medium/flags/morocco",        FLAG("ma")],
  ["snap-lens/medium/flags/algeria",        FLAG("dz")],
  ["snap-lens/medium/flags/tunisia",        FLAG("tn")],
  ["snap-lens/medium/flags/libya",          FLAG("ly")],
  ["snap-lens/medium/flags/zimbabwe",       FLAG("zw")],
  ["snap-lens/medium/flags/uganda",         FLAG("ug")],
  ["snap-lens/medium/flags/tanzania",       FLAG("tz")],
  ["snap-lens/medium/flags/mozambique",     FLAG("mz")],
  ["snap-lens/medium/flags/angola",         FLAG("ao")],
  ["snap-lens/medium/flags/cuba",           FLAG("cu")],
  ["snap-lens/medium/flags/venezuela",      FLAG("ve")],
  ["snap-lens/medium/flags/chile",          FLAG("cl")],
  ["snap-lens/medium/flags/ecuador",        FLAG("ec")],
  ["snap-lens/medium/flags/uruguay",        FLAG("uy")],
  ["snap-lens/medium/flags/paraguay",       FLAG("py")],
  ["snap-lens/medium/flags/bolivia",        FLAG("bo")],
  ["snap-lens/medium/flags/kazakhstan",     FLAG("kz")],
  ["snap-lens/medium/flags/uzbekistan",     FLAG("uz")],
  ["snap-lens/medium/flags/afghanistan",    FLAG("af")],
  ["snap-lens/medium/flags/iraq",           FLAG("iq")],
  ["snap-lens/medium/flags/syria",          FLAG("sy")],
  ["snap-lens/medium/flags/jordan",         FLAG("jo")],
  ["snap-lens/medium/flags/lebanon",        FLAG("lb")],
  ["snap-lens/medium/flags/vietnam",        FLAG("vn")],
  ["snap-lens/medium/flags/philippines",    FLAG("ph")],
  ["snap-lens/medium/flags/sri-lanka",      FLAG("lk")],
  ["snap-lens/medium/flags/mongolia",       FLAG("mn")],
  ["snap-lens/medium/flags/north-korea",    FLAG("kp")],
  ["snap-lens/medium/flags/haiti",          FLAG("ht")],
  ["snap-lens/medium/flags/trinidad",       FLAG("tt")],
  ["snap-lens/medium/flags/sudan",          FLAG("sd")],
  ["snap-lens/medium/flags/somalia",        FLAG("so")],
  ["snap-lens/medium/flags/cameroon",       FLAG("cm")],
  ["snap-lens/medium/flags/ivory-coast",    FLAG("ci")],
  ["snap-lens/medium/flags/guatemala",      FLAG("gt")],
  ["snap-lens/medium/flags/panama",         FLAG("pa")],
  ["snap-lens/medium/flags/costa-rica",     FLAG("cr")],

  // flags — extreme (50)
  ["snap-lens/extreme/flags/bhutan",               FLAG("bt")],
  ["snap-lens/extreme/flags/kiribati",             FLAG("ki")],
  ["snap-lens/extreme/flags/papua-new-guinea",     FLAG("pg")],
  ["snap-lens/extreme/flags/vanuatu",              FLAG("vu")],
  ["snap-lens/extreme/flags/fiji",                 FLAG("fj")],
  ["snap-lens/extreme/flags/solomon-islands",      FLAG("sb")],
  ["snap-lens/extreme/flags/micronesia",           FLAG("fm")],
  ["snap-lens/extreme/flags/palau",                FLAG("pw")],
  ["snap-lens/extreme/flags/tuvalu",               FLAG("tv")],
  ["snap-lens/extreme/flags/nauru",                FLAG("nr")],
  ["snap-lens/extreme/flags/maldives",             FLAG("mv")],
  ["snap-lens/extreme/flags/turkmenistan",         FLAG("tm")],
  ["snap-lens/extreme/flags/tajikistan",           FLAG("tj")],
  ["snap-lens/extreme/flags/kyrgyzstan",           FLAG("kg")],
  ["snap-lens/extreme/flags/azerbaijan",           FLAG("az")],
  ["snap-lens/extreme/flags/georgia",              FLAG("ge")],
  ["snap-lens/extreme/flags/armenia",              FLAG("am")],
  ["snap-lens/extreme/flags/kosovo",               FLAG("xk")],
  ["snap-lens/extreme/flags/montenegro",           FLAG("me")],
  ["snap-lens/extreme/flags/north-macedonia",      FLAG("mk")],
  ["snap-lens/extreme/flags/bosnia",               FLAG("ba")],
  ["snap-lens/extreme/flags/belarus",              FLAG("by")],
  ["snap-lens/extreme/flags/burundi",              FLAG("bi")],
  ["snap-lens/extreme/flags/rwanda",               FLAG("rw")],
  ["snap-lens/extreme/flags/malawi",               FLAG("mw")],
  ["snap-lens/extreme/flags/lesotho",              FLAG("ls")],
  ["snap-lens/extreme/flags/eswatini",             FLAG("sz")],
  ["snap-lens/extreme/flags/mauritius",            FLAG("mu")],
  ["snap-lens/extreme/flags/cape-verde",           FLAG("cv")],
  ["snap-lens/extreme/flags/comoros",              FLAG("km")],
  ["snap-lens/extreme/flags/djibouti",             FLAG("dj")],
  ["snap-lens/extreme/flags/gambia",               FLAG("gm")],
  ["snap-lens/extreme/flags/sierra-leone",         FLAG("sl")],
  ["snap-lens/extreme/flags/guinea",               FLAG("gn")],
  ["snap-lens/extreme/flags/guinea-bissau",        FLAG("gw")],
  ["snap-lens/extreme/flags/sao-tome",             FLAG("st")],
  ["snap-lens/extreme/flags/equatorial-guinea",    FLAG("gq")],
  ["snap-lens/extreme/flags/gabon",                FLAG("ga")],
  ["snap-lens/extreme/flags/tonga",                FLAG("to")],
  ["snap-lens/extreme/flags/samoa",                FLAG("ws")],
  ["snap-lens/extreme/flags/togo",                 FLAG("tg")],
  ["snap-lens/extreme/flags/benin",                FLAG("bj")],
  ["snap-lens/extreme/flags/niger",                FLAG("ne")],
  ["snap-lens/extreme/flags/mali",                 FLAG("ml")],
  ["snap-lens/extreme/flags/burkina-faso",         FLAG("bf")],
  ["snap-lens/extreme/flags/chad",                 FLAG("td")],
  ["snap-lens/extreme/flags/central-african-republic", FLAG("cf")],
  ["snap-lens/extreme/flags/congo",                FLAG("cg")],
  ["snap-lens/extreme/flags/dr-congo",             FLAG("cd")],
  ["snap-lens/extreme/flags/east-timor",           FLAG("tl")],

  // ════════════════════════════════════════════════════════
  //  LOGOS — simpleicons.org (vector SVG = infinite quality)
  //  easy (50)
  // ════════════════════════════════════════════════════════
  ["snap-lens/easy/logos/nasa",            SI("nasa",           "E03C31")],
  ["snap-lens/easy/logos/wikipedia",       SI("wikipedia",      "000000")],
  ["snap-lens/easy/logos/linux",           SI("linux",          "FCC624")],
  ["snap-lens/easy/logos/firefox",         SI("firefox",        "FF7139")],
  ["snap-lens/easy/logos/volkswagen",      SI("volkswagen",     "151F6D")],
  ["snap-lens/easy/logos/android",         SI("android",        "3DDC84")],
  ["snap-lens/easy/logos/creative-commons",SI("creativecommons","EF9421")],
  ["snap-lens/easy/logos/apple",           SI("apple",          "000000")],
  ["snap-lens/easy/logos/chrome",          SI("googlechrome",   "4285F4")],
  ["snap-lens/easy/logos/youtube",         SI("youtube",        "FF0000")],
  ["snap-lens/easy/logos/twitter",         SI("x",              "000000")],
  ["snap-lens/easy/logos/facebook",        SI("facebook",       "1877F2")],
  ["snap-lens/easy/logos/instagram",       SI("instagram",      "E4405F")],
  ["snap-lens/easy/logos/whatsapp",        SI("whatsapp",       "25D366")],
  ["snap-lens/easy/logos/spotify",         SI("spotify",        "1DB954")],
  ["snap-lens/easy/logos/amazon",          SI("amazon",         "FF9900")],
  ["snap-lens/easy/logos/netflix",         SI("netflix",        "E50914")],
  ["snap-lens/easy/logos/mcdonalds",       SI("mcdonalds",      "FBC817")],
  ["snap-lens/easy/logos/nike",            SI("nike",           "000000")],
  ["snap-lens/easy/logos/adidas",          SI("adidas",         "000000")],
  ["snap-lens/easy/logos/mercedes",        SI("mercedes",       "000000")],
  ["snap-lens/easy/logos/bmw",             SI("bmw",            "0066B1")],
  ["snap-lens/easy/logos/microsoft",       SI("microsoft",      "5E5E5E")],
  ["snap-lens/easy/logos/pepsi",           SI("pepsi",          "004B93")],
  ["snap-lens/easy/logos/coca-cola",       SI("cocacola",       "F40009")],
  ["snap-lens/easy/logos/target",          SI("target",         "CC0000")],
  ["snap-lens/easy/logos/shell",           SI("shell",          "DD1D21")],
  ["snap-lens/easy/logos/ferrari",         SI("ferrari",        "D40000")],
  ["snap-lens/easy/logos/lamborghini",     SI("lamborghini",    "D5A021")],
  ["snap-lens/easy/logos/puma",            SI("puma",           "000000")],
  ["snap-lens/easy/logos/lego",            SI("lego",           "E3000B")],
  ["snap-lens/easy/logos/star-wars",       SI("starwars",       "FFE81F")],
  ["snap-lens/easy/logos/playstation",     SI("playstation",    "003087")],
  ["snap-lens/easy/logos/xbox",            SI("xbox",           "107C10")],
  ["snap-lens/easy/logos/audi",            SI("audi",           "000000")],
  ["snap-lens/easy/logos/toyota",          SI("toyota",         "EB0A1E")],
  ["snap-lens/easy/logos/honda",           SI("honda",          "CC0000")],
  ["snap-lens/easy/logos/mastercard",      SI("mastercard",     "EB001B")],
  ["snap-lens/easy/logos/visa",            SI("visa",           "1A1F71")],
  ["snap-lens/easy/logos/ikea",            SI("ikea",           "0058A3")],
  ["snap-lens/easy/logos/snapchat",        SI("snapchat",       "FFFC00")],
  ["snap-lens/easy/logos/tiktok",          SI("tiktok",         "000000")],
  ["snap-lens/easy/logos/linkedin",        SI("linkedin",       "0A66C2")],
  ["snap-lens/easy/logos/starbucks",       SI("starbucks",      "00704A")],
  ["snap-lens/easy/logos/airbnb",          SI("airbnb",         "FF5A5F")],
  ["snap-lens/easy/logos/uber",            SI("uber",           "000000")],
  ["snap-lens/easy/logos/paypal",          SI("paypal",         "00457C")],
  ["snap-lens/easy/logos/wordpress",       SI("wordpress",      "21759B")],
  ["snap-lens/easy/logos/reddit",          SI("reddit",         "FF4500")],
  ["snap-lens/easy/logos/pinterest",       SI("pinterest",      "BD081C")],

  // logos — medium (50)
  ["snap-lens/medium/logos/bluetooth",     SI("bluetooth",      "0082FC")],
  ["snap-lens/medium/logos/python",        SI("python",         "3776AB")],
  ["snap-lens/medium/logos/git",           SI("git",            "F05032")],
  ["snap-lens/medium/logos/debian",        SI("debian",         "A81D33")],
  ["snap-lens/medium/logos/dropbox",       SI("dropbox",        "0061FF")],
  ["snap-lens/medium/logos/slack",         SI("slack",          "4A154B")],
  ["snap-lens/medium/logos/discord",       SI("discord",        "5865F2")],
  ["snap-lens/medium/logos/twitch",        SI("twitch",         "9146FF")],
  ["snap-lens/medium/logos/signal",        SI("signal",         "3A76F0")],
  ["snap-lens/medium/logos/telegram",      SI("telegram",       "26A5E4")],
  ["snap-lens/medium/logos/zoom",          SI("zoom",           "2D8CFF")],
  ["snap-lens/medium/logos/docker",        SI("docker",         "2496ED")],
  ["snap-lens/medium/logos/react",         SI("react",          "61DAFB")],
  ["snap-lens/medium/logos/nodejs",        SI("nodedotjs",      "339933")],
  ["snap-lens/medium/logos/typescript",    SI("typescript",     "3178C6")],
  ["snap-lens/medium/logos/github",        SI("github",         "181717")],
  ["snap-lens/medium/logos/gitlab",        SI("gitlab",         "FC6D26")],
  ["snap-lens/medium/logos/stackoverflow", SI("stackoverflow",  "F58025")],
  ["snap-lens/medium/logos/vscode",        SI("visualstudiocode","007ACC")],
  ["snap-lens/medium/logos/figma",         SI("figma",          "F24E1E")],
  ["snap-lens/medium/logos/notion",        SI("notion",         "000000")],
  ["snap-lens/medium/logos/vercel",        SI("vercel",         "000000")],
  ["snap-lens/medium/logos/netlify",       SI("netlify",        "00C7B7")],
  ["snap-lens/medium/logos/firebase",      SI("firebase",       "FFCA28")],
  ["snap-lens/medium/logos/mongodb",       SI("mongodb",        "47A248")],
  ["snap-lens/medium/logos/redis",         SI("redis",          "DC382D")],
  ["snap-lens/medium/logos/kubernetes",    SI("kubernetes",     "326CE5")],
  ["snap-lens/medium/logos/swift",         SI("swift",          "F05138")],
  ["snap-lens/medium/logos/rust",          SI("rust",           "000000")],
  ["snap-lens/medium/logos/flutter",       SI("flutter",        "02569B")],
  ["snap-lens/medium/logos/vue",           SI("vuedotjs",       "4FC08D")],
  ["snap-lens/medium/logos/angular",       SI("angular",        "DD0031")],
  ["snap-lens/medium/logos/sass",          SI("sass",           "CC6699")],
  ["snap-lens/medium/logos/graphql",       SI("graphql",        "E10098")],
  ["snap-lens/medium/logos/stripe",        SI("stripe",         "626CD9")],
  ["snap-lens/medium/logos/shopify",       SI("shopify",        "7AB55C")],
  ["snap-lens/medium/logos/canva",         SI("canva",          "00C4CC")],
  ["snap-lens/medium/logos/lyft",          SI("lyft",           "FF00BF")],
  ["snap-lens/medium/logos/cloudinary",    SI("cloudinary",     "3448C5")],
  ["snap-lens/medium/logos/greenpeace",    SI("greenpeace",     "6DB33F")],
  ["snap-lens/medium/logos/uefa",          SI("uefa",           "003478")],
  ["snap-lens/medium/logos/fifa",          SI("fifa",           "326295")],
  ["snap-lens/medium/logos/nextjs",        SI("nextdotjs",      "000000")],
  ["snap-lens/medium/logos/tailwind",      SI("tailwindcss",    "06B6D4")],
  ["snap-lens/medium/logos/supabase",      SI("supabase",       "3ECF8E")],
  ["snap-lens/medium/logos/prisma",        SI("prisma",         "2D3748")],
  ["snap-lens/medium/logos/openai",        SI("openai",         "412991")],
  ["snap-lens/medium/logos/huggingface",   SI("huggingface",    "FFD21E")],
  ["snap-lens/medium/logos/pytorch",       SI("pytorch",        "EE4C2C")],
  ["snap-lens/medium/logos/tensorflow",    SI("tensorflow",     "FF6F00")],

  // logos — extreme (50)
  ["snap-lens/extreme/logos/amnesty",      SI("amnesty",        "FFFF00")],
  ["snap-lens/extreme/logos/unicef",       SI("unicef",         "00AEEF")],
  ["snap-lens/extreme/logos/osi",          SI("opensourceinitiative","3DA639")],
  ["snap-lens/extreme/logos/raspberry-pi", SI("raspberrypi",    "A22846")],
  ["snap-lens/extreme/logos/tor",          SI("torproject",     "7D4698")],
  ["snap-lens/extreme/logos/vlc",          SI("vlcmediaplayer", "FF8800")],
  ["snap-lens/extreme/logos/ubuntu",       SI("ubuntu",         "E95420")],
  ["snap-lens/extreme/logos/internet-archive", SI("internetarchive","866354")],
  ["snap-lens/extreme/logos/openstreetmap",SI("openstreetmap",  "7EBC6F")],
  ["snap-lens/extreme/logos/gnome",        SI("gnome",          "4A86CF")],
  ["snap-lens/extreme/logos/kde",          SI("kde",            "1D99F3")],
  ["snap-lens/extreme/logos/gimp",         SI("gimp",           "5C5543")],
  ["snap-lens/extreme/logos/libreoffice",  SI("libreoffice",    "18A303")],
  ["snap-lens/extreme/logos/kali",         SI("kalilinux",      "557C94")],
  ["snap-lens/extreme/logos/arch-linux",   SI("archlinux",      "1793D1")],
  ["snap-lens/extreme/logos/gentoo",       SI("gentoo",         "54487A")],
  ["snap-lens/extreme/logos/nixos",        SI("nixos",          "5277C3")],
  ["snap-lens/extreme/logos/fedora",       SI("fedora",         "51A2DA")],
  ["snap-lens/extreme/logos/openbsd",      SI("openbsd",        "F2CA30")],
  ["snap-lens/extreme/logos/freebsd",      SI("freebsd",        "AB2B28")],
  ["snap-lens/extreme/logos/vim",          SI("vim",            "019733")],
  ["snap-lens/extreme/logos/emacs",        SI("gnuemacs",       "7F5AB6")],
  ["snap-lens/extreme/logos/neovim",       SI("neovim",         "57A143")],
  ["snap-lens/extreme/logos/haskell",      SI("haskell",        "5D4F85")],
  ["snap-lens/extreme/logos/elixir",       SI("elixir",         "4B275F")],
  ["snap-lens/extreme/logos/erlang",       SI("erlang",         "A90533")],
  ["snap-lens/extreme/logos/clojure",      SI("clojure",        "5881D8")],
  ["snap-lens/extreme/logos/julia",        SI("julia",          "9558B2")],
  ["snap-lens/extreme/logos/kotlin",       SI("kotlin",         "7F52FF")],
  ["snap-lens/extreme/logos/dart",         SI("dart",           "0175C2")],
  ["snap-lens/extreme/logos/golang",       SI("go",             "00ADD8")],
  ["snap-lens/extreme/logos/scala",        SI("scala",          "DC322F")],
  ["snap-lens/extreme/logos/lua",          SI("lua",            "2C2D72")],
  ["snap-lens/extreme/logos/perl",         SI("perl",           "39457E")],
  ["snap-lens/extreme/logos/r-lang",       SI("r",              "276DC3")],
  ["snap-lens/extreme/logos/apache",       SI("apache",         "D22128")],
  ["snap-lens/extreme/logos/nginx",        SI("nginx",          "009639")],
  ["snap-lens/extreme/logos/ansible",      SI("ansible",        "EE0000")],
  ["snap-lens/extreme/logos/terraform",    SI("terraform",      "7B42BC")],
  ["snap-lens/extreme/logos/hashicorp",    SI("hashicorp",      "000000")],
  ["snap-lens/extreme/logos/prometheus",   SI("prometheus",     "E6522C")],
  ["snap-lens/extreme/logos/grafana",      SI("grafana",        "F46800")],
  ["snap-lens/extreme/logos/elasticsearch",SI("elasticsearch",  "005571")],
  ["snap-lens/extreme/logos/kafka",        SI("apachekafka",    "231F20")],
  ["snap-lens/extreme/logos/rabbitmq",     SI("rabbitmq",       "FF6600")],
  ["snap-lens/extreme/logos/cassandra",    SI("apachecassandra","1287B1")],
  ["snap-lens/extreme/logos/neo4j",        SI("neo4j",          "008CC1")],
  ["snap-lens/extreme/logos/postgis",      SI("postgresql",     "4169E1")],
  ["snap-lens/extreme/logos/webassembly",  SI("webassembly",    "654FF0")],
  ["snap-lens/extreme/logos/deno",         SI("deno",           "000000")],

  // ════════════════════════════════════════════════════════
  //  CELEBRITIES — Wikimedia Special:FilePath (full-res)
  //  easy (50)
  // ════════════════════════════════════════════════════════
  ["snap-lens/easy/celebrities/einstein",        WIKI("Albert_Einstein_Head.jpg")],
  ["snap-lens/easy/celebrities/gandhi",          WIKI("Mahatma-Gandhi,_studio,_1931.jpg")],
  ["snap-lens/easy/celebrities/mandela",         WIKI("Nelson_Mandela-2008_(edit).jpg")],
  ["snap-lens/easy/celebrities/marie-curie",     WIKI("Marie_Curie_c._1920s.jpg")],
  ["snap-lens/easy/celebrities/lincoln",         WIKI("Abraham_Lincoln_O-77_matte_collodion_print.jpg")],
  ["snap-lens/easy/celebrities/da-vinci",        WIKI("Leonardo_self.jpg")],
  ["snap-lens/easy/celebrities/tesla",           WIKI("Nikola_Tesla.jpg")],
  ["snap-lens/easy/celebrities/newton",          WIKI("Portrait_of_Sir_Isaac_Newton,_1689.jpg")],
  ["snap-lens/easy/celebrities/darwin",          WIKI("Charles_Darwin_seated_crop.jpg")],
  ["snap-lens/easy/celebrities/napoleon",        WIKI("Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg")],
  ["snap-lens/easy/celebrities/shakespeare",     WIKI("Shakespeare.jpg")],
  ["snap-lens/easy/celebrities/cleopatra-bust",  WIKI("Kleopatra-VII.-Altes-Museum-Berlin1.jpg")],
  ["snap-lens/easy/celebrities/beethoven",       WIKI("Beethoven.jpg")],
  ["snap-lens/easy/celebrities/mozart",          WIKI("Croce-Mozart-Detail.jpg")],
  ["snap-lens/easy/celebrities/frida-kahlo",     WIKI("Frida_Kahlo,_by_Guillermo_Kahlo.jpg")],
  ["snap-lens/easy/celebrities/churchill",       WIKI("Sir_Winston_S_Churchill.jpg")],
  ["snap-lens/easy/celebrities/mlk",             WIKI("Martin_Luther_King,_Jr..jpg")],
  ["snap-lens/easy/celebrities/chaplin",         WIKI("Charlie_Chaplin.jpg")],
  ["snap-lens/easy/celebrities/amelia-earhart",  WIKI("Amelia_Earhart_1935.jpg")],
  ["snap-lens/easy/celebrities/julius-caesar",   WIKI("Gaius_Julius_Caesar.jpg")],
  ["snap-lens/easy/celebrities/thomas-edison",   WIKI("Thomas_Edison2.jpg")],
  ["snap-lens/easy/celebrities/galileo",         WIKI("Galileo_Galilei_(1564-1642)_-_Restoration.jpg")],
  ["snap-lens/easy/celebrities/nightingale",     WIKI("Florence_Nightingale_(H_Hering_NPG_x82368).jpg")],
  ["snap-lens/easy/celebrities/sigmund-freud",   WIKI("Sigmund_Freud.jpg")],
  ["snap-lens/easy/celebrities/karl-marx",       WIKI("Karl_Marx_001.jpg")],
  ["snap-lens/easy/celebrities/washington",      WIKI("Gilbert_Stuart_Williamstown_Portrait_of_George_Washington.jpg")],
  ["snap-lens/easy/celebrities/van-gogh",        WIKI("Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project.jpg")],
  ["snap-lens/easy/celebrities/de-gaulle",       WIKI("De_Gaulle.jpg")],
  ["snap-lens/easy/celebrities/mao",             WIKI("Mao_Zedong.jpg")],
  ["snap-lens/easy/celebrities/stalin",          WIKI("Stalin_1945.jpg")],
  ["snap-lens/easy/celebrities/queen-elizabeth", WIKI("Queen_Elizabeth_II_in_March_2015.jpg")],
  ["snap-lens/easy/celebrities/princess-diana",  WIKI("Diana,_Princess_of_Wales_1997_(2).jpg")],
  ["snap-lens/easy/celebrities/che-guevara",     WIKI("CheHigh.jpg")],
  ["snap-lens/easy/celebrities/mother-teresa",   WIKI("Mother_Teresa_1.jpg")],
  ["snap-lens/easy/celebrities/fdr",             WIKI("FDR_in_1933.jpg")],
  ["snap-lens/easy/celebrities/jfk",             WIKI("John_F._Kennedy,_White_House_color_photo_portrait.jpg")],
  ["snap-lens/easy/celebrities/rosa-parks",      WIKI("Rosa_Parks.jpg")],
  ["snap-lens/easy/celebrities/marilyn-monroe",  WIKI("Marilyn_Monroe_in_1952.jpg")],
  ["snap-lens/easy/celebrities/audrey-hepburn",  WIKI("Audrey_Hepburn_1956.jpg")],
  ["snap-lens/easy/celebrities/elvis",           WIKI("Elvis_Presley_promoting_Jailhouse_Rock.jpg")],
  ["snap-lens/easy/celebrities/beatles",         WIKI("The_Beatles_arrive_at_JFK_Airport.jpg")],
  ["snap-lens/easy/celebrities/michael-jackson", WIKI("Michael_Jackson_1988.jpg")],
  ["snap-lens/easy/celebrities/muhammad-ali",    WIKI("Muhammad_Ali_NYWTS.jpg")],
  ["snap-lens/easy/celebrities/hawking",         WIKI("Stephen_Hawking.StarChild.jpg")],
  ["snap-lens/easy/celebrities/neil-armstrong",  WIKI("Neil_Armstrong_pose.jpg")],
  ["snap-lens/easy/celebrities/anne-frank",      WIKI("Anne_Frank.jpg")],
  ["snap-lens/easy/celebrities/hitler",          WIKI("Bundesarchiv_Bild_183-H1216-0500-002,_Adolf_Hitler.jpg")],
  ["snap-lens/easy/celebrities/michelangelo",    WIKI("Michelangelo_Daniele_da_Volterra_(dettaglio).jpg")],
  ["snap-lens/easy/celebrities/rembrandt",       WIKI("Rembrandt_van_Rijn_-_Self-Portrait_-_Google_Art_Project.jpg")],
  ["snap-lens/easy/celebrities/bach",            WIKI("Johann_Sebastian_Bach.jpg")],

  // celebrities — medium (50)
  ["snap-lens/medium/celebrities/genghis-khan",     WIKI("Genghis_Khan.jpg")],
  ["snap-lens/medium/celebrities/columbus",         WIKI("Portrait_of_a_Man,_Said_to_be_Christopher_Columbus.jpg")],
  ["snap-lens/medium/celebrities/vasco-da-gama",    WIKI("Vasco_da_Gama.jpg")],
  ["snap-lens/medium/celebrities/joan-of-arc",      WIKI("Joan_of_Arc_miniature_graded.jpg")],
  ["snap-lens/medium/celebrities/marie-antoinette", WIKI("Marie_Antoinette.jpg")],
  ["snap-lens/medium/celebrities/catherine-great",  WIKI("Catherine_II.jpg")],
  ["snap-lens/medium/celebrities/peter-great",      WIKI("Peter_the_Great.jpg")],
  ["snap-lens/medium/celebrities/socrates",         WIKI("Socrates_Louvre.jpg")],
  ["snap-lens/medium/celebrities/aristotle",        WIKI("Aristotle_Altemps_Inv8575.jpg")],
  ["snap-lens/medium/celebrities/plato",            WIKI("Plato_Silanion_Musei_Capitolini_MC1377.jpg")],
  ["snap-lens/medium/celebrities/alexander-great",  WIKI("Alexander_the_Great_mosaic.jpg")],
  ["snap-lens/medium/celebrities/caesar-bust",      WIKI("Bust_Julius_Caesar.jpg")],
  ["snap-lens/medium/celebrities/hannibal",         WIKI("Hannibal_Barca.jpg")],
  ["snap-lens/medium/celebrities/chopin",           WIKI("Frederic_Chopin.jpg")],
  ["snap-lens/medium/celebrities/liszt",            WIKI("Franz_Liszt_1858.jpg")],
  ["snap-lens/medium/celebrities/ada-lovelace",     WIKI("Ada_Lovelace_portrait.jpg")],
  ["snap-lens/medium/celebrities/alan-turing",      WIKI("Alan_Turing_Aged_16.jpg")],
  ["snap-lens/medium/celebrities/archimedes",       WIKI("Archimedes.jpg")],
  ["snap-lens/medium/celebrities/confucius",        WIKI("Confucius_Tang_Dynasty.jpg")],
  ["snap-lens/medium/celebrities/buddha",           WIKI("Buddha_in_Sarnath_Museum_(Dhammajak_Mutra).jpg")],
  ["snap-lens/medium/celebrities/saladin",          WIKI("Saladin.jpg")],
  ["snap-lens/medium/celebrities/vlad-impaler",     WIKI("Vlad_Tepes_002.jpg")],
  ["snap-lens/medium/celebrities/ivan-terrible",    WIKI("Ivan_IV_of_Russia.jpg")],
  ["snap-lens/medium/celebrities/da-vinci-vitruvian",WIKI("Da_Vinci_Vitruve_Luc_Viatour.jpg")],
  ["snap-lens/medium/celebrities/einstein-tongue",  WIKI("Albert_Einstein_1947.jpg")],
  ["snap-lens/medium/celebrities/darwin-beard",     WIKI("Charles_Darwin_by_Julia_Margaret_Cameron,_c._1868.jpg")],
  ["snap-lens/medium/celebrities/eleanor-roosevelt",WIKI("Eleanor_Roosevelt_portrait_1933.jpg")],
  ["snap-lens/medium/celebrities/harriet-tubman",   WIKI("Harriet_Tubman_by_Squyer,_NPG,_c1885.jpg")],
  ["snap-lens/medium/celebrities/frederick-douglass",WIKI("Frederick_Douglass_portrait.jpg")],
  ["snap-lens/medium/celebrities/sitting-bull",     WIKI("Sitting_Bull.jpg")],
  ["snap-lens/medium/celebrities/geronimo",         WIKI("Geronimo.jpg")],
  ["snap-lens/medium/celebrities/simon-bolivar",    WIKI("Simon_Bolivar.jpg")],
  ["snap-lens/medium/celebrities/edgar-poe",        WIKI("Edgar_Allan_Poe_2_-_edit1.jpg")],
  ["snap-lens/medium/celebrities/attila",           WIKI("Attila.jpg")],
  ["snap-lens/medium/celebrities/charlemagne",      WIKI("Charlemagne_denier_Mayence_812_814.jpg")],
  ["snap-lens/medium/celebrities/marco-polo",       WIKI("Marco_Polo_portrait.jpg")],
  ["snap-lens/medium/celebrities/homer-ancient",    WIKI("Homer.jpg")],
  ["snap-lens/medium/celebrities/hippocrates",      WIKI("Hippocrates_pushkin02.jpg")],
  ["snap-lens/medium/celebrities/sun-tzu",          WIKI("Eleven_Commentaries_to_The_Art_of_War_by_Sunzi_WDL11410_(cropped).jpg")],
  ["snap-lens/medium/celebrities/laozi",            WIKI("Lao_Tzu_-_Project_Gutenberg_eText_15250.jpg")],
  ["snap-lens/medium/celebrities/goya",             WIKI("Goya.jpg")],
  ["snap-lens/medium/celebrities/tesla-lab",        WIKI("Tesla_young.jpg")],
  ["snap-lens/medium/celebrities/rembrandt",        WIKI("Rembrandt_van_Rijn_-_Self-Portrait_-_Google_Art_Project.jpg")],
  ["snap-lens/medium/celebrities/churchill-v",      WIKI("Churchill.jpg")],
  ["snap-lens/medium/celebrities/michelangelo",     WIKI("Michelangelo_Daniele_da_Volterra_(dettaglio).jpg")],
  ["snap-lens/medium/celebrities/curie-lab",        WIKI("Marie_Curie.jpg")],
  ["snap-lens/medium/celebrities/magellan",         WIKI("Ferdinand_Magellan.jpg")],
  ["snap-lens/medium/celebrities/galileo-telescope",WIKI("Galileo_Galilei.jpg")],
  ["snap-lens/medium/celebrities/newton-apple",     WIKI("Newton-WilliamBlake.jpg")],
  ["snap-lens/medium/celebrities/bach",             WIKI("Johann_Sebastian_Bach.jpg")],

  // celebrities — extreme (50)
  ["snap-lens/extreme/celebrities/ashoka",          WIKI("Ashoka.jpg")],
  ["snap-lens/extreme/celebrities/akbar",           WIKI("Akbar.jpg")],
  ["snap-lens/extreme/celebrities/tamerlane",       WIKI("Timur_reconstruction03.jpg")],
  ["snap-lens/extreme/celebrities/mansa-musa",      WIKI("Mansa_Musa.jpg")],
  ["snap-lens/extreme/celebrities/shaka-zulu",      WIKI("Shaka.jpg")],
  ["snap-lens/extreme/celebrities/ramesses",        WIKI("Memphis,_Pharaoh_Rameses_II,_Ancient_Egypt.jpg")],
  ["snap-lens/extreme/celebrities/nefertiti",       WIKI("Nefertiti_30-01-2006.jpg")],
  ["snap-lens/extreme/celebrities/tutankhamun",     WIKI("Tutankhamun.jpg")],
  ["snap-lens/extreme/celebrities/hatshepsut",      WIKI("Hatshepsut.jpg")],
  ["snap-lens/extreme/celebrities/cyrus",           WIKI("Cyrus_the_Great.jpg")],
  ["snap-lens/extreme/celebrities/hammurabi",       WIKI("P1050763_Louvre_code_Hammurabi_face_rwk.JPG")],
  ["snap-lens/extreme/celebrities/qin-shi-huang",   WIKI("Qinshihuang.jpg")],
  ["snap-lens/extreme/celebrities/wu-zetian",       WIKI("A_Tang_Dynasty_Empress_Wu_Zetian.JPG")],
  ["snap-lens/extreme/celebrities/kublai-khan",     WIKI("Kublai_Khan.jpg")],
  ["snap-lens/extreme/celebrities/tokugawa",        WIKI("Tokugawa_Ieyasu.jpg")],
  ["snap-lens/extreme/celebrities/nobunaga",        WIKI("Oda_Nobunaga.jpg")],
  ["snap-lens/extreme/celebrities/crazy-horse",     WIKI("CrazyHorseMarkerByPhilKonstantin.jpg")],
  ["snap-lens/extreme/celebrities/tupac-amaru",     WIKI("Tupac_Amaru.jpg")],
  ["snap-lens/extreme/celebrities/zapata",          WIKI("Emiliano_Zapata.jpg")],
  ["snap-lens/extreme/celebrities/pancho-villa",    WIKI("Pancho_Villa.jpg")],
  ["snap-lens/extreme/celebrities/toussaint",       WIKI("Toussaint_L'Ouverture.jpg")],
  ["snap-lens/extreme/celebrities/haile-selassie",  WIKI("Haile_Selassie.jpg")],
  ["snap-lens/extreme/celebrities/lumumba",         WIKI("Patrice_Lumumba.jpg")],
  ["snap-lens/extreme/celebrities/sankara",         WIKI("Grafiti_Thomas_Sankara_Burkina_Faso.jpg")],
  ["snap-lens/extreme/celebrities/ho-chi-minh",     WIKI("Ho_Chi_Minh_1946.jpg")],
  ["snap-lens/extreme/celebrities/sukarno",         WIKI("Presiden_Sukarno.jpg")],
  ["snap-lens/extreme/celebrities/nehru",           WIKI("Jawaharlal_Nehru.jpg")],
  ["snap-lens/extreme/celebrities/subhas-bose",     WIKI("Subhas_Chandra_Bose.jpg")],
  ["snap-lens/extreme/celebrities/ataturk",         WIKI("Mustafa_Kemal_Ataturk.jpg")],
  ["snap-lens/extreme/celebrities/rosa-luxemburg",  WIKI("Rosa_Luxemburg.jpg")],
  ["snap-lens/extreme/celebrities/trotsky",         WIKI("Trotsky_Portrait.jpg")],
  ["snap-lens/extreme/celebrities/lenin",           WIKI("Lenin_1920.jpg")],
  ["snap-lens/extreme/celebrities/mussolini",       WIKI("Mussolini_mezzobusto.jpg")],
  ["snap-lens/extreme/celebrities/franco",          WIKI("Francisco_Franco.jpg")],
  ["snap-lens/extreme/celebrities/khrushchev",      WIKI("Nikita_Khrushchev_in_WW2.jpg")],
  ["snap-lens/extreme/celebrities/gorbachev",       WIKI("Mikhail_Gorbachev.jpg")],
  ["snap-lens/extreme/celebrities/indira-gandhi",   WIKI("Indira_Gandhi.jpg")],
  ["snap-lens/extreme/celebrities/golda-meir",      WIKI("Golda_Meir.jpg")],
  ["snap-lens/extreme/celebrities/sadat",           WIKI("Anwar_Sadat.jpg")],
  ["snap-lens/extreme/celebrities/arafat",          WIKI("Yasser_Arafat.jpg")],
  ["snap-lens/extreme/celebrities/allende",         WIKI("Salvador_Allende.jpg")],
  ["snap-lens/extreme/celebrities/simone-beauvoir", WIKI("Simone_de_Beauvoir.jpg")],
  ["snap-lens/extreme/celebrities/olof-palme",      WIKI("Palme.jpg")],
  ["snap-lens/extreme/celebrities/xerxes",          WIKI("Xerxes_I_relief.jpg")],
  ["snap-lens/extreme/celebrities/darius",          WIKI("Darius_I_the_Great's_inscription.jpg")],
  ["snap-lens/extreme/celebrities/sundiata",        WIKI("Sundiata.jpg")],
  ["snap-lens/extreme/celebrities/sitting-bull-pipe",WIKI("Sitting_Bull_1885.jpg")],
  ["snap-lens/extreme/celebrities/pinochet",        WIKI("Augusto_Pinochet_foto_oficial_(cropped).jpg")],
  ["snap-lens/extreme/celebrities/imelda-marcos",   WIKI("Imelda_Marcos_1966.jpg")],
  ["snap-lens/extreme/celebrities/marc-antony",     WIKI("Marcus_Antonius.jpg")],
];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Download helper ────────────────────────────────────────
// Uses Wikimedia's imageinfo API to get the canonical URL, then fetches the image.
// The API endpoint is rate-limit-friendly and officially supported for bots.
function downloadToBuffer(url) {
  return new Promise((resolve, reject) => {
    const filename = decodeURIComponent(url.split("/").pop());

    const fetchImage = (u, redirects = 8) => {
      if (redirects < 0) return reject(new Error("Too many redirects"));
      const mod = u.startsWith("https") ? https : http;
      const req = mod.get(u, {
        headers: {
          "User-Agent": "SnapQuizUploader/1.0 (https://github.com/JeromeGeek/the-arena; contact: bot@thearena.app)",
          "Accept": "image/jpeg,image/png,image/*;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
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

    // Hit the Wikimedia Action API imageinfo endpoint — it's bot-friendly and
    // returns the canonical file URL without triggering CDN rate limits.
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(filename)}&prop=imageinfo&iiprop=url&format=json&formatversion=2`;
    const apiReq = https.get(apiUrl, {
      headers: {
        "User-Agent": "SnapQuizUploader/1.0 (https://github.com/JeromeGeek/the-arena; contact: bot@thearena.app)",
        "Accept": "application/json",
      },
    }, (res) => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => {
        try {
          const data = JSON.parse(Buffer.concat(chunks).toString());
          const pages = Object.values(data?.query?.pages || {});
          const imgUrl = pages[0]?.imageinfo?.[0]?.url;
          fetchImage(imgUrl || url);
        } catch { fetchImage(url); }
      });
      res.on("error", () => fetchImage(url));
    });
    apiReq.on("error", () => fetchImage(url));
    apiReq.setTimeout(15000, () => { apiReq.destroy(); fetchImage(url); });
  });
}

// ── Upload one image to Cloudinary ─────────────────────────
let ok = 0, skipped = 0, failed = 0;
const failures = [];

async function uploadOne([publicId, sourceUrl], idx) {
  const label = `[${idx + 1}/${IMAGES.length}]`;
  const isSvg  = sourceUrl.includes("simpleicons.org");

  // For SVG/flag sources: let Cloudinary fetch directly (no rate-limit issues)
  // For Wikimedia: we already have the buffer from the pre-downloaded file on disk
  let uploadArg = sourceUrl;
  let tmpFile   = null;

  if (!isSvg) {
    // File was pre-downloaded to persistent cache dir in Phase 1
    const hash = createHash("md5").update(publicId).digest("hex").slice(0, 8);
    const ext  = sourceUrl.split(".").pop().split("?")[0].toLowerCase() || "jpg";
    tmpFile    = join(CACHE_DIR, `${hash}.${ext}`);
    if (!existsSync(tmpFile)) {
      // Shouldn't happen, but fall back to inline download
      try {
        const buf = await downloadToBuffer(sourceUrl);
        writeFileSync(tmpFile, buf);
      } catch (e) {
        throw e;
      }
    }
    uploadArg = tmpFile;
  }

  try {
    const result = await cloudinary.uploader.upload(uploadArg, {
      public_id: publicId,
      overwrite: false,
      resource_type: "auto",
      ...(isSvg ? { format: "svg" } : { quality: "auto:best" }),
    });

    const kb = Math.round((result.bytes || 0) / 1024);
    console.log(`  ✅ ${label} ${publicId} (${kb}KB)`);
    ok++;
  } catch (e) {
    const msg = e?.error?.message || e?.message || JSON.stringify(e);
    if (msg.includes("already exists") || msg.includes("already been used") || e?.http_code === 409) {
      console.log(`  ⏭️  ${label} EXISTS  ${publicId}`);
      skipped++;
    } else {
      console.log(`  ❌ ${label} FAIL   ${publicId}`);
      console.log(`       → ${msg.slice(0, 160)}`);
      failed++;
      failures.push({ publicId, sourceUrl, error: msg });
    }
  }
}

// ── Main runner ────────────────────────────────────────────
// Strategy:
//   1. Pre-download ALL Wikimedia images sequentially (1 at a time, 1.2s gap)
//      This avoids Wikimedia 429 — serialised, polite, single-IP requests.
//   2. Upload ALL to Cloudinary in parallel batches of 5
//      Cloudinary has no rate limit for direct uploads.
async function run() {
  console.log(`\n🚀 Uploading ${IMAGES.length} images → Cloudinary: ${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}\n`);

  const wikiImages  = IMAGES.filter(([, u]) => u.includes("wikimedia.org"));
  const otherImages = IMAGES.filter(([, u]) => !u.includes("wikimedia.org"));

  // ── Phase 1: Sequential Wikimedia downloads ──────────────
  console.log(`📥 Phase 1: Downloading ${wikiImages.length} Wikimedia images (serial, 1.2s gap)...\n`);
  const tmpFiles = new Map(); // publicId → tmpFilePath

  for (let i = 0; i < wikiImages.length; i++) {
    const [publicId, url] = wikiImages[i];
    const hash    = createHash("md5").update(publicId).digest("hex").slice(0, 8);
    const ext     = url.split(".").pop().split("?")[0].toLowerCase() || "jpg";
    const tmpFile = join(CACHE_DIR, `${hash}.${ext}`);

    // Skip if already on disk from a previous run
    if (existsSync(tmpFile)) {
      console.log(`  💾 [${i+1}/${wikiImages.length}] cached ${publicId}`);
      tmpFiles.set(publicId, tmpFile);
      continue;
    }

    let attempts = 0;
    while (attempts < 5) {
      try {
        process.stdout.write(`  ⬇️  [${i+1}/${wikiImages.length}] ${publicId}... `);
        const buf = await downloadToBuffer(url);
        writeFileSync(tmpFile, buf);
        tmpFiles.set(publicId, tmpFile);
        console.log(`${Math.round(buf.length / 1024)}KB ✓`);
        break;
      } catch (e) {
        attempts++;
        const is429 = e.message.includes("429");
        if (attempts < 5) {
          const wait = is429 ? 8000 * attempts : 2000;
          console.log(`retry ${attempts} (${e.message.slice(0,40)}) wait ${wait}ms...`);
          await sleep(wait);
        } else {
          console.log(`FAILED: ${e.message.slice(0,80)}`);
          failures.push({ publicId, sourceUrl: url, error: e.message });
          failed++;
        }
      }
    }
    // Polite gap between Wikimedia requests
    await sleep(2500);
  }

  // ── Phase 2: Upload everything to Cloudinary ─────────────
  console.log(`\n☁️  Phase 2: Uploading all ${IMAGES.length} images to Cloudinary (batch 5)...\n`);

  const CONCURRENCY = 5;
  for (let i = 0; i < IMAGES.length; i += CONCURRENCY) {
    await Promise.all(
      IMAGES.slice(i, i + CONCURRENCY).map((img, j) => uploadOne(img, i + j))
    );
    await sleep(200);
  }

  console.log(`\n${"═".repeat(52)}`);
  console.log(`✅ Uploaded : ${ok}`);
  console.log(`⏭️  Existed  : ${skipped}`);
  console.log(`❌ Failed   : ${failed}`);
  console.log(`   Total    : ${ok + skipped + failed} / ${IMAGES.length}`);
  if (failures.length) {
    console.log(`\n⚠️  Failures (${failures.length}):`);
    failures.forEach(f => console.log(`  ${f.publicId}\n    ${f.error.slice(0,100)}`));
  }
}

run().catch(console.error);
