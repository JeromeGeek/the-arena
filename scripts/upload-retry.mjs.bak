import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Only the images that failed or were not yet uploaded
const images = [
  // ── LANDMARKS (remaining) ──
  { publicId: "snap-lens/easy/landmarks/burj-khalifa",       sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Burj_Khalifa.jpg/800px-Burj_Khalifa.jpg" },
  { publicId: "snap-lens/easy/landmarks/statue-of-liberty",  sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Statue_of_Liberty%2C_NY.jpg/800px-Statue_of_Liberty%2C_NY.jpg" },
  { publicId: "snap-lens/easy/landmarks/big-ben",            sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Elizabeth_Tower_-_2022.jpg/800px-Elizabeth_Tower_-_2022.jpg" },
  { publicId: "snap-lens/easy/landmarks/sydney-opera-house", sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Sydney_Australia._(21339175489).jpg/1280px-Sydney_Australia._(21339175489).jpg" },
  { publicId: "snap-lens/easy/landmarks/tower-bridge",       sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Tower_Bridge_from_Shad_Thames.jpg/1024px-Tower_Bridge_from_Shad_Thames.jpg" },
  { publicId: "snap-lens/medium/landmarks/tower-of-pisa",    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Leaning_tower_of_pisa_2.jpg/640px-Leaning_tower_of_pisa_2.jpg" },
  { publicId: "snap-lens/medium/landmarks/sagrada-familia",  sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Sagrada_Familia_01.jpg/640px-Sagrada_Familia_01.jpg" },
  { publicId: "snap-lens/medium/landmarks/angkor-wat",       sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Angkor_Wat_temple.jpg/1280px-Angkor_Wat_temple.jpg" },
  { publicId: "snap-lens/medium/landmarks/niagara-falls",    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Niagara_Falls_2009-07-17_02.jpg/1024px-Niagara_Falls_2009-07-17_02.jpg" },
  { publicId: "snap-lens/medium/landmarks/petra",            sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Petra_Jordan_BW_21.JPG/1024px-Petra_Jordan_BW_21.JPG" },
  { publicId: "snap-lens/medium/landmarks/santorini",        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Santorini_island.jpg/1024px-Santorini_island.jpg" },
  { publicId: "snap-lens/medium/landmarks/forbidden-city",   sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Forbidden_City_Beijing.jpg/1280px-Forbidden_City_Beijing.jpg" },
  { publicId: "snap-lens/extreme/landmarks/mont-saint-michel",  sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Mont-Saint-Michel_depuis_les_gr%C3%A8ves.jpg/1280px-Mont-Saint-Michel_depuis_les_gr%C3%A8ves.jpg" },
  { publicId: "snap-lens/extreme/landmarks/alhambra",           sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Alhambra_evening_panorama_Mirador_San_Nicolas_sRGB-1.jpg/1280px-Alhambra_evening_panorama_Mirador_San_Nicolas_sRGB-1.jpg" },
  { publicId: "snap-lens/extreme/landmarks/colosseum-inside",   sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Colosseum-interior-arena-floor.jpg/1280px-Colosseum-interior-arena-floor.jpg" },
  { publicId: "snap-lens/extreme/landmarks/colosseum-night",    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Colosseum-serale.jpg/1280px-Colosseum-serale.jpg" },
  { publicId: "snap-lens/extreme/landmarks/plitvice-lakes",     sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Plitvice_lakes_park_2012.jpg/1280px-Plitvice_lakes_park_2012.jpg" },
  { publicId: "snap-lens/extreme/landmarks/pamukkale",          sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Pamukkale_May_2009.jpg/1280px-Pamukkale_May_2009.jpg" },
  { publicId: "snap-lens/extreme/landmarks/cappadocia",         sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Kapadokya_Balloons.jpg/1280px-Kapadokya_Balloons.jpg" },
  { publicId: "snap-lens/extreme/landmarks/bagan-temples",      sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Bagan_Balloon.jpg/1280px-Bagan_Balloon.jpg" },

  // ── FLAGS (remaining) ──
  { publicId: "snap-lens/medium/flags/switzerland",  sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Flag_of_Switzerland.svg/640px-Flag_of_Switzerland.svg.png" },
  { publicId: "snap-lens/medium/flags/nepal",        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Flag_of_Nepal.svg/640px-Flag_of_Nepal.svg.png" },
  { publicId: "snap-lens/medium/flags/indonesia",    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Flag_of_Indonesia.svg/1024px-Flag_of_Indonesia.svg.png" },
  { publicId: "snap-lens/extreme/flags/pakistan",    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Flag_of_Pakistan.svg/1024px-Flag_of_Pakistan.svg.png" },
  { publicId: "snap-lens/extreme/flags/myanmar",     sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Flag_of_Myanmar.svg/1024px-Flag_of_Myanmar.svg.png" },
  { publicId: "snap-lens/extreme/flags/new-zealand", sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Flag_of_New_Zealand.svg/1024px-Flag_of_New_Zealand.svg.png" },
  { publicId: "snap-lens/extreme/flags/peru",        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Flag_of_Peru.svg/1024px-Flag_of_Peru.svg.png" },
  { publicId: "snap-lens/extreme/flags/cambodia",    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Flag_of_Cambodia.svg/1024px-Flag_of_Cambodia.svg.png" },
  { publicId: "snap-lens/extreme/flags/moldova",     sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Flag_of_Moldova.svg/1024px-Flag_of_Moldova.svg.png" },
  { publicId: "snap-lens/extreme/flags/eritrea",     sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Flag_of_Eritrea.svg/1024px-Flag_of_Eritrea.svg.png" },

  // ── LOGOS (all) ──
  { publicId: "snap-lens/easy/logos/nasa",             sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/1224px-NASA_logo.svg.png" },
  { publicId: "snap-lens/easy/logos/wikipedia",        sourceUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png" },
  { publicId: "snap-lens/easy/logos/tux",              sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Tux.svg/800px-Tux.svg.png" },
  { publicId: "snap-lens/easy/logos/firefox",          sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Firefox_logo%2C_2019.svg/800px-Firefox_logo%2C_2019.svg.png" },
  { publicId: "snap-lens/easy/logos/volkswagen",       sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/800px-Volkswagen_logo_2019.svg.png" },
  { publicId: "snap-lens/easy/logos/red-cross",        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Flag_of_the_Red_Cross.svg/800px-Flag_of_the_Red_Cross.svg.png" },
  { publicId: "snap-lens/easy/logos/united-nations",   sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Emblem_of_the_United_Nations.svg/800px-Emblem_of_the_United_Nations.svg.png" },
  { publicId: "snap-lens/easy/logos/olympic-rings",    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Olympic_rings_without_rims.svg/1280px-Olympic_rings_without_rims.svg.png" },
  { publicId: "snap-lens/easy/logos/android",          sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Android_robot.svg/800px-Android_robot.svg.png" },
  { publicId: "snap-lens/easy/logos/creative-commons", sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Cc.logo.circle.svg/800px-Cc.logo.circle.svg.png" },
  { publicId: "snap-lens/medium/logos/bluetooth",      sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Bluetooth_FM_Color.png/800px-Bluetooth_FM_Color.png" },
  { publicId: "snap-lens/medium/logos/wifi",           sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/WiFi_Logo.svg/800px-WiFi_Logo.svg.png" },
  { publicId: "snap-lens/medium/logos/greenpeace",     sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Greenpeace_logo.svg/1200px-Greenpeace_logo.svg.png" },
  { publicId: "snap-lens/medium/logos/uefa",           sourceUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/UEFA_logo.svg/1200px-UEFA_logo.svg.png" },
  { publicId: "snap-lens/medium/logos/fifa",           sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/FIFA_logo.svg/1280px-FIFA_logo.svg.png" },
  { publicId: "snap-lens/medium/logos/python",         sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/800px-Python-logo-notext.svg.png" },
  { publicId: "snap-lens/medium/logos/git",            sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Git-logo.svg/1280px-Git-logo.svg.png" },
  { publicId: "snap-lens/medium/logos/debian",         sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Debian-OpenLogo.svg/800px-Debian-OpenLogo.svg.png" },
  { publicId: "snap-lens/medium/logos/wordpress",      sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/WordPress_blue_logo.svg/800px-WordPress_blue_logo.svg.png" },
  { publicId: "snap-lens/medium/logos/w3c",            sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/W3C%C2%AE_Icon.svg/1280px-W3C%C2%AE_Icon.svg.png" },
  { publicId: "snap-lens/extreme/logos/amnesty",       sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Amnesty_International_logo.svg/1200px-Amnesty_International_logo.svg.png" },
  { publicId: "snap-lens/extreme/logos/unicef",        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/UNICEF_logo_since_2006.svg/1280px-UNICEF_logo_since_2006.svg.png" },
  { publicId: "snap-lens/extreme/logos/who",           sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/World_Health_Organization_Logo.svg/1280px-World_Health_Organization_Logo.svg.png" },
  { publicId: "snap-lens/extreme/logos/osi",           sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Opensource.svg/800px-Opensource.svg.png" },
  { publicId: "snap-lens/extreme/logos/raspberry-pi",  sourceUrl: "https://upload.wikimedia.org/wikipedia/de/thumb/c/cb/Raspberry_Pi_Logo.svg/800px-Raspberry_Pi_Logo.svg.png" },
  { publicId: "snap-lens/extreme/logos/tor",           sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Tor-logo-2011-flat.svg/1200px-Tor-logo-2011-flat.svg.png" },
  { publicId: "snap-lens/extreme/logos/github",        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Octicons-mark-github.svg/800px-Octicons-mark-github.svg.png" },
  { publicId: "snap-lens/extreme/logos/vlc",           sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/VLC_icon.png/800px-VLC_icon.png" },
  { publicId: "snap-lens/extreme/logos/ubuntu",        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Logo-ubuntu_cof-orange-hex.svg/800px-Logo-ubuntu_cof-orange-hex.svg.png" },
  { publicId: "snap-lens/extreme/logos/internet-archive", sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Internet_Archive_logo_and_wordmark.svg/1280px-Internet_Archive_logo_and_wordmark.svg.png" },

  // ── CELEBRITIES (all) ──
  { publicId: "snap-lens/easy/celebrities/einstein",    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Albert_Einstein_Head.jpg/800px-Albert_Einstein_Head.jpg" },
  { publicId: "snap-lens/easy/celebrities/gandhi",      sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Mahatma-Gandhi%2C_studio%2C_1931.jpg/800px-Mahatma-Gandhi%2C_studio%2C_1931.jpg" },
  { publicId: "snap-lens/easy/celebrities/mandela",     sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Nelson_Mandela-2008_%28edit%29.jpg/800px-Nelson_Mandela-2008_%28edit%29.jpg" },
  { publicId: "snap-lens/easy/celebrities/curie",       sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Marie_Curie_c._1920s.jpg/800px-Marie_Curie_c._1920s.jpg" },
  { publicId: "snap-lens/easy/celebrities/lincoln",     sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Abraham_Lincoln_O-77_matte_collodion_print.jpg/800px-Abraham_Lincoln_O-77_matte_collodion_print.jpg" },
  { publicId: "snap-lens/easy/celebrities/da-vinci",    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Leonardo_self.jpg/800px-Leonardo_self.jpg" },
  { publicId: "snap-lens/easy/celebrities/tesla",       sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/N_Tesla.jpg/800px-N_Tesla.jpg" },
  { publicId: "snap-lens/easy/celebrities/newton",      sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Portrait_of_Sir_Isaac_Newton%2C_1689.jpg/800px-Portrait_of_Sir_Isaac_Newton%2C_1689.jpg" },
  { publicId: "snap-lens/easy/celebrities/darwin",      sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Charles_Darwin_seated_crop.jpg/800px-Charles_Darwin_seated_crop.jpg" },
  { publicId: "snap-lens/easy/celebrities/napoleon",    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg/800px-Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg" },
  { publicId: "snap-lens/medium/celebrities/shakespeare", sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Shakespeare.jpg/800px-Shakespeare.jpg" },
  { publicId: "snap-lens/medium/celebrities/beethoven",   sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Beethoven.jpg/800px-Beethoven.jpg" },
  { publicId: "snap-lens/medium/celebrities/mozart",      sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Croce-Mozart-Detail.jpg/800px-Croce-Mozart-Detail.jpg" },
  { publicId: "snap-lens/medium/celebrities/frida-kahlo", sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Frida_Kahlo%2C_by_Guillermo_Kahlo.jpg/800px-Frida_Kahlo%2C_by_Guillermo_Kahlo.jpg" },
  { publicId: "snap-lens/medium/celebrities/churchill",   sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Sir_Winston_S_Churchill.jpg/800px-Sir_Winston_S_Churchill.jpg" },
  { publicId: "snap-lens/medium/celebrities/mlk",         sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Martin_Luther_King%2C_Jr..jpg/800px-Martin_Luther_King%2C_Jr..jpg" },
  { publicId: "snap-lens/medium/celebrities/chaplin",     sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Charlie_Chaplin_portrait.jpg/800px-Charlie_Chaplin_portrait.jpg" },
  { publicId: "snap-lens/medium/celebrities/earhart",     sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amelia_Earhart_1935.jpg/800px-Amelia_Earhart_1935.jpg" },
  { publicId: "snap-lens/medium/celebrities/caesar",      sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Gaius_Iulius_Caesar_%28100-44_BC%29.jpg/800px-Gaius_Iulius_Caesar_%28100-44_BC%29.jpg" },
  { publicId: "snap-lens/medium/celebrities/cleopatra",   sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/0702_-_Napoli%2C_Museo_Archeologico_Nazionale_-_Cleopatra_-_Foto_Giovanni_Dall%27Orto%2C_2_dic_2012.jpg/640px-0702_-_Napoli%2C_Museo_Archeologico_Nazionale_-_Cleopatra_-_Foto_Giovanni_Dall%27Orto%2C_2_dic_2012.jpg" },
  { publicId: "snap-lens/extreme/celebrities/edison",      sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Thomas_Edison2.jpg/800px-Thomas_Edison2.jpg" },
  { publicId: "snap-lens/extreme/celebrities/galileo",     sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Galileo_Galilei_%281564-1642%29_-_Restoration.jpg/800px-Galileo_Galilei_%281564-1642%29_-_Restoration.jpg" },
  { publicId: "snap-lens/extreme/celebrities/de-gaulle",   sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/De_Gaulle_General.jpg/640px-De_Gaulle_General.jpg" },
  { publicId: "snap-lens/extreme/celebrities/lincoln-2",   sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Abraham_Lincoln_seated%2C_Feb_9%2C_1864.jpg/640px-Abraham_Lincoln_seated%2C_Feb_9%2C_1864.jpg" },
  { publicId: "snap-lens/extreme/celebrities/nightingale", sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Florence_Nightingale_%28H_Hering_NPG_x82368%29.jpg/800px-Florence_Nightingale_%28H_Hering_NPG_x82368%29.jpg" },
  { publicId: "snap-lens/extreme/celebrities/freud",       sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Sigmund_Freud%2C_by_Max_Halberstadt_%281921%29.jpg/800px-Sigmund_Freud%2C_by_Max_Halberstadt_%281921%29.jpg" },
  { publicId: "snap-lens/extreme/celebrities/marx",        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Karl_Marx_001.jpg/800px-Karl_Marx_001.jpg" },
  { publicId: "snap-lens/extreme/celebrities/genghis-khan",sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Yun-nan_sheng_tu_%281330%29.jpg/800px-Yun-nan_sheng_tu_%281330%29.jpg" },
  { publicId: "snap-lens/extreme/celebrities/washington",  sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Gilbert_Stuart_Williamstown_Portrait_of_George_Washington.jpg/800px-Gilbert_Stuart_Williamstown_Portrait_of_George_Washington.jpg" },
  { publicId: "snap-lens/extreme/celebrities/van-gogh",    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project.jpg/800px-Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project.jpg" },
];

// ─── Upload with skip-if-exists and 1.5s between each (no batching — Wikimedia is strict) ───

async function alreadyUploaded(publicId) {
  try { await cloudinary.api.resource(publicId); return true; }
  catch { return false; }
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log(`\nRetry upload of ${images.length} images (1 at a time, 1.5s gap)...\n`);
  let uploaded = 0, skipped = 0, failed = 0;

  for (const { publicId, sourceUrl } of images) {
    if (await alreadyUploaded(publicId)) {
      console.log(`  ⏭️  Skipped  ${publicId}`);
      skipped++;
      await sleep(200);
      continue;
    }
    try {
      await cloudinary.uploader.upload(sourceUrl, { public_id: publicId, overwrite: false, resource_type: "image" });
      console.log(`  ✅ Uploaded ${publicId}`);
      uploaded++;
    } catch (err) {
      console.error(`  ❌ Failed  ${publicId}: ${err.message}`);
      failed++;
    }
    await sleep(1500);
  }

  console.log(`\n────────────────────────────────`);
  console.log(`  ✅ Uploaded : ${uploaded}`);
  console.log(`  ⏭️  Skipped  : ${skipped}`);
  console.log(`  ❌ Failed   : ${failed}`);
  console.log(`────────────────────────────────\n`);
  if (failed > 0) process.exit(1);
}

main().catch(e => { console.error(e); process.exit(1); });
