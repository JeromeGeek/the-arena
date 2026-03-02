#!/usr/bin/env node
/**
 * upload-local.mjs
 * 1. Downloads each image via curl (uses YOUR local IP — avoids Wikimedia 429s)
 * 2. Uploads the local temp file to Cloudinary
 * 3. Cleans up temp files
 *
 * Run: CLOUDINARY_CLOUD_NAME=xxx CLOUDINARY_API_KEY=xxx CLOUDINARY_API_SECRET=xxx node scripts/upload-local.mjs
 */

import { v2 as cloudinary } from "cloudinary";
import { execSync, spawnSync } from "child_process";
import { existsSync, unlinkSync, mkdirSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── MISSING IMAGES TO UPLOAD ────────────────────────────────────────────────
// All logo images use icon-only sources (no brand name/text in image).
// Landmark images are actual photos of the landmark.
// Difficulty affects blur level in-game: easy=14px, medium=28px, extreme=48px.

const images = [

  // ══ LANDMARKS ══
  // easy
  { id: "snap-lens/easy/landmarks/eiffel-tower",       url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Eiffel_Tower_from_Champ_de_Mars%2C_2%2C_Paris%2C_July_2011.jpg/800px-Eiffel_Tower_from_Champ_de_Mars%2C_2%2C_Paris%2C_July_2011.jpg" },
  { id: "snap-lens/easy/landmarks/statue-of-liberty",  url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/24701-nature-natural-beauty.jpg/800px-24701-nature-natural-beauty.jpg" },
  { id: "snap-lens/easy/landmarks/big-ben",            url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Elizabeth_Tower_-_2022.jpg/640px-Elizabeth_Tower_-_2022.jpg" },
  { id: "snap-lens/easy/landmarks/burj-khalifa",       url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Burj_Khalifa.jpg/640px-Burj_Khalifa.jpg" },
  { id: "snap-lens/easy/landmarks/sydney-opera-house", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Sydney_Opera_House_-_Dec_2008.jpg/1024px-Sydney_Opera_House_-_Dec_2008.jpg" },
  { id: "snap-lens/easy/landmarks/tower-bridge",       url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Tower_Bridge_from_Shad_Thames.jpg/800px-Tower_Bridge_from_Shad_Thames.jpg" },
  // medium
  { id: "snap-lens/medium/landmarks/tower-of-pisa",    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Leaning_tower_of_pisa_2.jpg/640px-Leaning_tower_of_pisa_2.jpg" },
  { id: "snap-lens/medium/landmarks/sagrada-familia",  url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Sagrada_Familia_01.jpg/640px-Sagrada_Familia_01.jpg" },
  { id: "snap-lens/medium/landmarks/angkor-wat",       url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Angkor_Wat%2C_Angkor%2C_Cambodia.jpg/1024px-Angkor_Wat%2C_Angkor%2C_Cambodia.jpg" },
  { id: "snap-lens/medium/landmarks/niagara-falls",    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Niagara_Falls_2009-07-17_02.jpg/800px-Niagara_Falls_2009-07-17_02.jpg" },
  { id: "snap-lens/medium/landmarks/petra",            url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Petra_Jordan_BW_21.JPG/800px-Petra_Jordan_BW_21.JPG" },
  { id: "snap-lens/medium/landmarks/santorini",        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Santorini_island.jpg/800px-Santorini_island.jpg" },
  { id: "snap-lens/medium/landmarks/forbidden-city",   url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Forbidden_City_Beijing_Shenwumen_Gate.jpg/1024px-Forbidden_City_Beijing_Shenwumen_Gate.jpg" },
  // extreme
  { id: "snap-lens/extreme/landmarks/mont-saint-michel", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Mont_St_Michel_3%2C_Brittany%2C_France_-_July_2011.jpg/1024px-Mont_St_Michel_3%2C_Brittany%2C_France_-_July_2011.jpg" },
  { id: "snap-lens/extreme/landmarks/alhambra",          url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Alhambra_at_Dusk.jpg/1024px-Alhambra_at_Dusk.jpg" },
  { id: "snap-lens/extreme/landmarks/colosseum-inside",  url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/DSCF0852.jpg/1024px-DSCF0852.jpg" },
  { id: "snap-lens/extreme/landmarks/colosseum-night",   url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Colosseum_2019.jpg/1024px-Colosseum_2019.jpg" },
  { id: "snap-lens/extreme/landmarks/plitvice-lakes",    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Plitvice_lakes_park_2012.jpg/1024px-Plitvice_lakes_park_2012.jpg" },
  { id: "snap-lens/extreme/landmarks/pamukkale",         url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Pamukkale_May_2009.jpg/1024px-Pamukkale_May_2009.jpg" },
  { id: "snap-lens/extreme/landmarks/cappadocia",        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Kapadokya_Balloons.jpg/1024px-Kapadokya_Balloons.jpg" },
  { id: "snap-lens/extreme/landmarks/bagan-temples",     url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Bagan_Balloon.jpg/1024px-Bagan_Balloon.jpg" },

  // ══ FLAGS (remaining) ══
  { id: "snap-lens/medium/flags/switzerland",  url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Flag_of_Switzerland.svg/600px-Flag_of_Switzerland.svg.png" },
  { id: "snap-lens/medium/flags/nepal",        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Flag_of_Nepal.svg/600px-Flag_of_Nepal.svg.png" },
  { id: "snap-lens/extreme/flags/pakistan",    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Flag_of_Pakistan.svg/800px-Flag_of_Pakistan.svg.png" },
  { id: "snap-lens/extreme/flags/myanmar",     url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Flag_of_Myanmar.svg/800px-Flag_of_Myanmar.svg.png" },
  { id: "snap-lens/extreme/flags/new-zealand", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Flag_of_New_Zealand.svg/800px-Flag_of_New_Zealand.svg.png" },
  { id: "snap-lens/extreme/flags/cambodia",    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Flag_of_Cambodia.svg/800px-Flag_of_Cambodia.svg.png" },
  { id: "snap-lens/extreme/flags/moldova",     url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Flag_of_Moldova.svg/800px-Flag_of_Moldova.svg.png" },
  { id: "snap-lens/extreme/flags/eritrea",     url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Flag_of_Eritrea.svg/800px-Flag_of_Eritrea.svg.png" },

  // ══ LOGOS — ICON-ONLY (no name/text in image) ══
  // easy: very recognisable symbols
  { id: "snap-lens/easy/logos/nasa",             url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/800px-NASA_logo.svg.png" },
  // NASA meatball is icon-only (the circular emblem, no text block)
  { id: "snap-lens/easy/logos/tux",              url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Tux.svg/600px-Tux.svg.png" },
  { id: "snap-lens/easy/logos/firefox",          url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Firefox_logo%2C_2019.svg/600px-Firefox_logo%2C_2019.svg.png" },
  { id: "snap-lens/easy/logos/volkswagen",       url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/600px-Volkswagen_logo_2019.svg.png" },
  { id: "snap-lens/easy/logos/red-cross",        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Flag_of_the_Red_Cross.svg/600px-Flag_of_the_Red_Cross.svg.png" },
  { id: "snap-lens/easy/logos/united-nations",   url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Emblem_of_the_United_Nations.svg/600px-Emblem_of_the_United_Nations.svg.png" },
  { id: "snap-lens/easy/logos/olympic-rings",    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Olympic_rings_without_rims.svg/800px-Olympic_rings_without_rims.svg.png" },
  { id: "snap-lens/easy/logos/android",          url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Android_robot.svg/600px-Android_robot.svg.png" },
  { id: "snap-lens/easy/logos/creative-commons", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Cc.logo.circle.svg/600px-Cc.logo.circle.svg.png" },
  // medium: recognisable tech/org symbols
  { id: "snap-lens/medium/logos/bluetooth",      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Bluetooth_FM_Color.png/600px-Bluetooth_FM_Color.png" },
  { id: "snap-lens/medium/logos/wifi",           url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/WiFi_Logo.svg/600px-WiFi_Logo.svg.png" },
  { id: "snap-lens/medium/logos/python",         url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/600px-Python-logo-notext.svg.png" },
  { id: "snap-lens/medium/logos/debian",         url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Debian-OpenLogo.svg/600px-Debian-OpenLogo.svg.png" },
  { id: "snap-lens/medium/logos/wordpress",      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/WordPress_blue_logo.svg/600px-WordPress_blue_logo.svg.png" },
  { id: "snap-lens/medium/logos/greenpeace",     url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Greenpeace_logo.svg/800px-Greenpeace_logo.svg.png" },
  { id: "snap-lens/medium/logos/uefa",           url: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/UEFA_logo.svg/800px-UEFA_logo.svg.png" },
  { id: "snap-lens/medium/logos/fifa",           url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/FIFA_logo.svg/800px-FIFA_logo.svg.png" },
  // extreme: niche icon-only symbols
  { id: "snap-lens/extreme/logos/amnesty",       url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Amnesty_International_logo.svg/600px-Amnesty_International_logo.svg.png" },
  { id: "snap-lens/extreme/logos/unicef",        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/UNICEF_logo_since_2006.svg/800px-UNICEF_logo_since_2006.svg.png" },
  { id: "snap-lens/extreme/logos/who",           url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/World_Health_Organization_Logo.svg/600px-World_Health_Organization_Logo.svg.png" },
  { id: "snap-lens/extreme/logos/osi",           url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Opensource.svg/600px-Opensource.svg.png" },
  { id: "snap-lens/extreme/logos/raspberry-pi",  url: "https://upload.wikimedia.org/wikipedia/de/thumb/c/cb/Raspberry_Pi_Logo.svg/600px-Raspberry_Pi_Logo.svg.png" },
  { id: "snap-lens/extreme/logos/tor",           url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Tor-logo-2011-flat.svg/600px-Tor-logo-2011-flat.svg.png" },
  { id: "snap-lens/extreme/logos/github",        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Octicons-mark-github.svg/600px-Octicons-mark-github.svg.png" },
  { id: "snap-lens/extreme/logos/vlc",           url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/VLC_icon.png/600px-VLC_icon.png" },
  { id: "snap-lens/extreme/logos/ubuntu",        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Logo-ubuntu_cof-orange-hex.svg/600px-Logo-ubuntu_cof-orange-hex.svg.png" },
  { id: "snap-lens/extreme/logos/internet-archive", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Internet_Archive_logo_and_wordmark.svg/800px-Internet_Archive_logo_and_wordmark.svg.png" },

  // ══ CELEBRITIES ══
  { id: "snap-lens/easy/celebrities/einstein",    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Albert_Einstein_Head.jpg/600px-Albert_Einstein_Head.jpg" },
  { id: "snap-lens/easy/celebrities/gandhi",      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Mahatma-Gandhi%2C_studio%2C_1931.jpg/600px-Mahatma-Gandhi%2C_studio%2C_1931.jpg" },
  { id: "snap-lens/easy/celebrities/mandela",     url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Nelson_Mandela-2008_%28edit%29.jpg/600px-Nelson_Mandela-2008_%28edit%29.jpg" },
  { id: "snap-lens/easy/celebrities/curie",       url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Marie_Curie_c._1920s.jpg/600px-Marie_Curie_c._1920s.jpg" },
  { id: "snap-lens/easy/celebrities/lincoln",     url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Abraham_Lincoln_O-77_matte_collodion_print.jpg/600px-Abraham_Lincoln_O-77_matte_collodion_print.jpg" },
  { id: "snap-lens/easy/celebrities/da-vinci",    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Leonardo_self.jpg/600px-Leonardo_self.jpg" },
  { id: "snap-lens/easy/celebrities/tesla",       url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/N_Tesla.jpg/600px-N_Tesla.jpg" },
  { id: "snap-lens/easy/celebrities/newton",      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Portrait_of_Sir_Isaac_Newton%2C_1689.jpg/600px-Portrait_of_Sir_Isaac_Newton%2C_1689.jpg" },
  { id: "snap-lens/easy/celebrities/darwin",      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Charles_Darwin_seated_crop.jpg/600px-Charles_Darwin_seated_crop.jpg" },
  { id: "snap-lens/easy/celebrities/napoleon",    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg/600px-Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg" },
  { id: "snap-lens/medium/celebrities/shakespeare",  url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Shakespeare.jpg/600px-Shakespeare.jpg" },
  { id: "snap-lens/medium/celebrities/cleopatra",    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/0702_-_Napoli%2C_Museo_Archeologico_Nazionale_-_Cleopatra_-_Foto_Giovanni_Dall%27Orto%2C_2_dic_2012.jpg/500px-0702_-_Napoli%2C_Museo_Archeologico_Nazionale_-_Cleopatra_-_Foto_Giovanni_Dall%27Orto%2C_2_dic_2012.jpg" },
  { id: "snap-lens/medium/celebrities/beethoven",    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Beethoven.jpg/600px-Beethoven.jpg" },
  { id: "snap-lens/medium/celebrities/mozart",       url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Croce-Mozart-Detail.jpg/600px-Croce-Mozart-Detail.jpg" },
  { id: "snap-lens/medium/celebrities/frida-kahlo",  url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Frida_Kahlo%2C_by_Guillermo_Kahlo.jpg/600px-Frida_Kahlo%2C_by_Guillermo_Kahlo.jpg" },
  { id: "snap-lens/medium/celebrities/churchill",    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Sir_Winston_S_Churchill.jpg/600px-Sir_Winston_S_Churchill.jpg" },
  { id: "snap-lens/medium/celebrities/mlk",          url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Martin_Luther_King%2C_Jr..jpg/600px-Martin_Luther_King%2C_Jr..jpg" },
  { id: "snap-lens/medium/celebrities/chaplin",      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Charlie_Chaplin_portrait.jpg/600px-Charlie_Chaplin_portrait.jpg" },
  { id: "snap-lens/medium/celebrities/earhart",      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amelia_Earhart_1935.jpg/600px-Amelia_Earhart_1935.jpg" },
  { id: "snap-lens/medium/celebrities/caesar",       url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Gaius_Iulius_Caesar_%28100-44_BC%29.jpg/600px-Gaius_Iulius_Caesar_%28100-44_BC%29.jpg" },
  { id: "snap-lens/extreme/celebrities/edison",      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Thomas_Edison2.jpg/600px-Thomas_Edison2.jpg" },
  { id: "snap-lens/extreme/celebrities/galileo",     url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Galileo_Galilei_%281564-1642%29_-_Restoration.jpg/600px-Galileo_Galilei_%281564-1642%29_-_Restoration.jpg" },
  { id: "snap-lens/extreme/celebrities/de-gaulle",   url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/De_Gaulle_General.jpg/500px-De_Gaulle_General.jpg" },
  { id: "snap-lens/extreme/celebrities/lincoln-2",   url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Abraham_Lincoln_seated%2C_Feb_9%2C_1864.jpg/500px-Abraham_Lincoln_seated%2C_Feb_9%2C_1864.jpg" },
  { id: "snap-lens/extreme/celebrities/nightingale", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Florence_Nightingale_%28H_Hering_NPG_x82368%29.jpg/600px-Florence_Nightingale_%28H_Hering_NPG_x82368%29.jpg" },
  { id: "snap-lens/extreme/celebrities/freud",       url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Sigmund_Freud%2C_by_Max_Halberstadt_%281921%29.jpg/600px-Sigmund_Freud%2C_by_Max_Halberstadt_%281921%29.jpg" },
  { id: "snap-lens/extreme/celebrities/marx",        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Karl_Marx_001.jpg/600px-Karl_Marx_001.jpg" },
  { id: "snap-lens/extreme/celebrities/genghis-khan",url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Yun-nan_sheng_tu_%281330%29.jpg/600px-Yun-nan_sheng_tu_%281330%29.jpg" },
  { id: "snap-lens/extreme/celebrities/washington",  url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Gilbert_Stuart_Williamstown_Portrait_of_George_Washington.jpg/600px-Gilbert_Stuart_Williamstown_Portrait_of_George_Washington.jpg" },
  { id: "snap-lens/extreme/celebrities/van-gogh",    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project.jpg/600px-Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project.jpg" },
];

// ─── ALSO re-upload logos that had text (deleted, need fresh icon-only upload) ───
// All replaced with icon-only versions above. No changes needed here.

const TMP = "/tmp/snap-lens-upload";
mkdirSync(TMP, { recursive: true });

async function alreadyUploaded(publicId) {
  try { await cloudinary.api.resource(publicId); return true; }
  catch { return false; }
}

async function downloadFile(url, dest) {
  const result = spawnSync("curl", [
    "-L", "-s", "-A",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/121 Safari/537.36",
    "--max-time", "30",
    "-o", dest,
    url
  ]);
  if (result.status !== 0) throw new Error(`curl failed: ${result.stderr?.toString()}`);
  // Check file is not empty / error page
  const { statSync } = await import("fs");
  const size = statSync(dest).size;
  if (size < 500) throw new Error(`Downloaded file too small (${size} bytes) — likely an error page`);
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log(`\nUpload ${images.length} images (download-first strategy)...\n`);
  let uploaded = 0, skipped = 0, failed = 0;

  for (const { id, url } of images) {
    if (await alreadyUploaded(id)) {
      console.log(`  ⏭️  Skip     ${id}`);
      skipped++;
      continue;
    }

    const ext  = url.match(/\.(png|jpg|jpeg|svg|webp)(\?|$)/i)?.[1] ?? "jpg";
    const safe = id.replace(/\//g, "__");
    const tmp  = join(TMP, `${safe}.${ext}`);

    try {
      await downloadFile(url, tmp);
      await cloudinary.uploader.upload(tmp, {
        public_id: id,
        overwrite: false,
        resource_type: "image",
      });
      console.log(`  ✅ Uploaded  ${id}`);
      uploaded++;
    } catch (err) {
      console.error(`  ❌ Failed   ${id}: ${err.message}`);
      failed++;
    } finally {
      if (existsSync(tmp)) unlinkSync(tmp);
    }

    await sleep(400); // small gap between uploads
  }

  console.log(`\n──────────────────────────────────`);
  console.log(`  ✅ Uploaded : ${uploaded}`);
  console.log(`  ⏭️  Skipped  : ${skipped}`);
  console.log(`  ❌ Failed   : ${failed}`);
  console.log(`──────────────────────────────────\n`);
  if (failed > 0) process.exit(1);
}

main().catch(e => { console.error(e); process.exit(1); });
