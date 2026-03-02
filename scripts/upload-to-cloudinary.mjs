import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE MANIFEST
// Structure: { publicId, sourceUrl }
// Folder convention: snap-lens/<difficulty>/<category>/<filename>
// ─────────────────────────────────────────────────────────────────────────────

const images = [

  // ── LANDMARKS ── easy (10)
  { publicId: "snap-lens/easy/landmarks/eiffel-tower",       sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camponotus_flavomarginatus_ant.jpg/320px-Camponotus_flavomarginatus_ant.jpg" },
  { publicId: "snap-lens/easy/landmarks/taj-mahal",          sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/1280px-Taj_Mahal_%28Edited%29.jpeg" },
  { publicId: "snap-lens/easy/landmarks/colosseum",          sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/1280px-Colosseo_2020.jpg" },
  { publicId: "snap-lens/easy/landmarks/statue-of-liberty",  sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/24701-nature-natural-beauty.jpg/1280px-24701-nature-natural-beauty.jpg" },
  { publicId: "snap-lens/easy/landmarks/burj-khalifa",       sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Burj_Khalifa.jpg/800px-Burj_Khalifa.jpg" },
  { publicId: "snap-lens/easy/landmarks/big-ben",            sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Elizabeth_Tower_-_2022.jpg/800px-Elizabeth_Tower_-_2022.jpg" },
  { publicId: "snap-lens/easy/landmarks/great-wall",         sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg/1280px-The_Great_Wall_of_China_at_Jinshanling-edit.jpg" },
  { publicId: "snap-lens/easy/landmarks/machu-picchu",       sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Machu_Picchu%2C_Peru.jpg/1280px-Machu_Picchu%2C_Peru.jpg" },
  { publicId: "snap-lens/easy/landmarks/sydney-opera-house", sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Sydney_NSW_2000%2C_Australia_-_panoramio%2811%29.jpg/1280px-Sydney_NSW_2000%2C_Australia_-_panoramio%2811%29.jpg" },
  { publicId: "snap-lens/easy/landmarks/pyramids-giza",      sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/All_Gizah_Pyramids.jpg/1280px-All_Gizah_Pyramids.jpg" },
  { publicId: "snap-lens/easy/landmarks/golden-gate",        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/GoldenGateBridge-001.jpg/1280px-GoldenGateBridge-001.jpg" },
  { publicId: "snap-lens/easy/landmarks/tower-bridge",       sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Tower_Bridge_from_Shad_Thames.jpg/1280px-Tower_Bridge_from_Shad_Thames.jpg" },

  // ── LANDMARKS ── medium (10)
  { publicId: "snap-lens/medium/landmarks/stonehenge",        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Stonehenge2007_07_30.jpg/1280px-Stonehenge2007_07_30.jpg" },
  { publicId: "snap-lens/medium/landmarks/tower-of-pisa",     sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Leaning_tower_of_pisa_2.jpg/800px-Leaning_tower_of_pisa_2.jpg" },
  { publicId: "snap-lens/medium/landmarks/sagrada-familia",   sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Sagrada_Familia_01.jpg/800px-Sagrada_Familia_01.jpg" },
  { publicId: "snap-lens/medium/landmarks/niagara-falls",     sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Niagara_Falls_2009-07-17_02.jpg/1280px-Niagara_Falls_2009-07-17_02.jpg" },
  { publicId: "snap-lens/medium/landmarks/mount-fuji",        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/080103_hakkai_fuji.jpg/1280px-080103_hakkai_fuji.jpg" },
  { publicId: "snap-lens/medium/landmarks/angkor-wat",        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Angkor_Wat_from_the_top.jpg/1280px-Angkor_Wat_from_the_top.jpg" },
  { publicId: "snap-lens/medium/landmarks/petra",             sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Petra_Jordan_BW_21.JPG/1280px-Petra_Jordan_BW_21.JPG" },
  { publicId: "snap-lens/medium/landmarks/acropolis",         sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/The_Parthenon_in_Athens.jpg/1280px-The_Parthenon_in_Athens.jpg" },
  { publicId: "snap-lens/medium/landmarks/christ-redeemer",   sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Christ_the_Redeemer_-_Cristo_Redentor.jpg/800px-Christ_the_Redeemer_-_Cristo_Redentor.jpg" },
  { publicId: "snap-lens/medium/landmarks/hagia-sophia",      sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Hagia_Sophia_Mars_2013.jpg/1280px-Hagia_Sophia_Mars_2013.jpg" },
  { publicId: "snap-lens/medium/landmarks/santorini",         sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Santorini_island.jpg/1280px-Santorini_island.jpg" },
  { publicId: "snap-lens/medium/landmarks/forbidden-city",    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/The_Forbidden_City_-_The_Hall_of_Supreme_Harmony.JPG/1280px-The_Forbidden_City_-_The_Hall_of_Supreme_Harmony.JPG" },

  // ── LANDMARKS ── extreme (10)
  { publicId: "snap-lens/extreme/landmarks/mont-saint-michel",   sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Mont_Saint-Michel%2C_Normandy%2C_France.jpg/1280px-Mont_Saint-Michel%2C_Normandy%2C_France.jpg" },
  { publicId: "snap-lens/extreme/landmarks/chichen-itza",        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Chichen_Itza_3.jpg/1280px-Chichen_Itza_3.jpg" },
  { publicId: "snap-lens/extreme/landmarks/alhambra",            sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Palace_of_Charles_V_-_Alhambra_and_Generalife.jpg/1280px-Palace_of_Charles_V_-_Alhambra_and_Generalife.jpg" },
  { publicId: "snap-lens/extreme/landmarks/neuschwanstein",      sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Schloss_Neuschwanstein_2013.jpg/1280px-Schloss_Neuschwanstein_2013.jpg" },
  { publicId: "snap-lens/extreme/landmarks/colosseum-inside",    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Colosseum_in_Rome-April_2007-1-_copie_2B.jpg/1280px-Colosseum_in_Rome-April_2007-1-_copie_2B.jpg" },
  { publicId: "snap-lens/extreme/landmarks/colosseum-night",     sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/080615_Colosseum_Rome-edit.jpg/1280px-080615_Colosseum_Rome-edit.jpg" },
  { publicId: "snap-lens/extreme/landmarks/plitvice-lakes",      sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Plitvice_jezera.jpg/1280px-Plitvice_jezera.jpg" },
  { publicId: "snap-lens/extreme/landmarks/pamukkale",           sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Pamukkale_Travertine_pools.jpg/1280px-Pamukkale_Travertine_pools.jpg" },
  { publicId: "snap-lens/extreme/landmarks/cappadocia",          sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Ortahisar%2C_Cappadocia.jpg/1280px-Ortahisar%2C_Cappadocia.jpg" },
  { publicId: "snap-lens/extreme/landmarks/bagan-temples",       sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Bagan_temples.jpg/1280px-Bagan_temples.jpg" },

  // ── FLAGS ── easy (17)
  { publicId: "snap-lens/easy/flags/japan",           sourceUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9e/Flag_of_Japan.svg/1280px-Flag_of_Japan.svg.png" },
  { publicId: "snap-lens/easy/flags/brazil",          sourceUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Flag_of_Brazil.svg/1280px-Flag_of_Brazil.svg.png" },
  { publicId: "snap-lens/easy/flags/canada",          sourceUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Flag_of_Canada.svg/1280px-Flag_of_Canada.svg.png" },
  { publicId: "snap-lens/easy/flags/india",           sourceUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/1280px-Flag_of_India.svg.png" },
  { publicId: "snap-lens/easy/flags/usa",             sourceUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Flag_of_the_United_States.svg/1280px-Flag_of_the_United_States.svg.png" },
  { publicId: "snap-lens/easy/flags/uk",              sourceUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/a/ae/Flag_of_the_United_Kingdom.svg/1280px-Flag_of_the_United_Kingdom.svg.png" },
  { publicId: "snap-lens/easy/flags/germany",         sourceUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/b/ba/Flag_of_Germany.svg/1280px-Flag_of_Germany.svg.png" },
  { publicId: "snap-lens/easy/flags/france",          sourceUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c3/Flag_of_France.svg/1280px-Flag_of_France.svg.png" },
  { publicId: "snap-lens/easy/flags/australia",       sourceUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/Flag_of_Australia.svg/1280px-Flag_of_Australia.svg.png" },
  { publicId: "snap-lens/easy/flags/south-africa",    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Flag_of_South_Africa.svg/1280px-Flag_of_South_Africa.svg.png" },
  { publicId: "snap-lens/easy/flags/spain",           sourceUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Flag_of_Spain.svg/1280px-Flag_of_Spain.svg.png" },
  { publicId: "snap-lens/easy/flags/italy",           sourceUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/0/03/Flag_of_Italy.svg/1280px-Flag_of_Italy.svg.png" },
  { publicId: "snap-lens/easy/flags/russia",          sourceUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/Flag_of_Russia.svg/1280px-Flag_of_Russia.svg.png" },
  { publicId: "snap-lens/easy/flags/china",           sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1280px-Flag_of_the_People%27s_Republic_of_China.svg.png" },
  { publicId: "snap-lens/easy/flags/mexico",          sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Flag_of_Mexico.svg/1280px-Flag_of_Mexico.svg.png" },
  { publicId: "snap-lens/easy/flags/argentina",       sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Flag_of_Argentina.svg/1280px-Flag_of_Argentina.svg.png" },
  { publicId: "snap-lens/easy/flags/sweden",          sourceUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Flag_of_Sweden.svg/1280px-Flag_of_Sweden.svg.png" },

  // ── FLAGS ── medium (17)
  { publicId: "snap-lens/medium/flags/switzerland",   sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Flag_of_Switzerland.svg/800px-Flag_of_Switzerland.svg.png" },
  { publicId: "snap-lens/medium/flags/turkey",        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/1280px-Flag_of_Turkey.svg.png" },
  { publicId: "snap-lens/medium/flags/portugal",      sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Flag_of_Portugal.svg/1280px-Flag_of_Portugal.svg.png" },
  { publicId: "snap-lens/medium/flags/norway",        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Flag_of_Norway.svg/1280px-Flag_of_Norway.svg.png" },
  { publicId: "snap-lens/medium/flags/nigeria",       sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Flag_of_Nigeria.svg/1280px-Flag_of_Nigeria.svg.png" },
  { publicId: "snap-lens/medium/flags/south-korea",   sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Flag_of_South_Korea.svg/1280px-Flag_of_South_Korea.svg.png" },
  { publicId: "snap-lens/medium/flags/nepal",         sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Flag_of_Nepal.svg/916px-Flag_of_Nepal.svg.png" },
  { publicId: "snap-lens/medium/flags/greece",        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Flag_of_Greece.svg/1280px-Flag_of_Greece.svg.png" },
  { publicId: "snap-lens/medium/flags/egypt",         sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_Egypt.svg/1280px-Flag_of_Egypt.svg.png" },
  { publicId: "snap-lens/medium/flags/indonesia",     sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Flag_of_Indonesia.svg/1280px-Flag_of_Indonesia.svg.png" },
  { publicId: "snap-lens/medium/flags/netherlands",   sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Flag_of_the_Netherlands.svg/1280px-Flag_of_the_Netherlands.svg.png" },
  { publicId: "snap-lens/medium/flags/poland",        sourceUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/1/12/Flag_of_Poland.svg/1280px-Flag_of_Poland.svg.png" },
  { publicId: "snap-lens/medium/flags/denmark",       sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Flag_of_Denmark.svg/1280px-Flag_of_Denmark.svg.png" },
  { publicId: "snap-lens/medium/flags/iran",          sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Flag_of_Iran.svg/1280px-Flag_of_Iran.svg.png" },
  { publicId: "snap-lens/medium/flags/ethiopia",      sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Flag_of_Ethiopia.svg/1280px-Flag_of_Ethiopia.svg.png" },
  { publicId: "snap-lens/medium/flags/malaysia",      sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Flag_of_Malaysia.svg/1280px-Flag_of_Malaysia.svg.png" },
  { publicId: "snap-lens/medium/flags/thailand",      sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Flag_of_Thailand.svg/1280px-Flag_of_Thailand.svg.png" },

  // ── FLAGS ── extreme (16)
  { publicId: "snap-lens/extreme/flags/pakistan",      sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Flag_of_Pakistan.svg/1280px-Flag_of_Pakistan.svg.png" },
  { publicId: "snap-lens/extreme/flags/ukraine",       sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Flag_of_Ukraine.svg/1280px-Flag_of_Ukraine.svg.png" },
  { publicId: "snap-lens/extreme/flags/jamaica",       sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Flag_of_Jamaica.svg/1280px-Flag_of_Jamaica.svg.png" },
  { publicId: "snap-lens/extreme/flags/kenya",         sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Flag_of_Kenya.svg/1280px-Flag_of_Kenya.svg.png" },
  { publicId: "snap-lens/extreme/flags/saudi-arabia",  sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Flag_of_Saudi_Arabia.svg/1280px-Flag_of_Saudi_Arabia.svg.png" },
  { publicId: "snap-lens/extreme/flags/bangladesh",    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Flag_of_Bangladesh.svg/1280px-Flag_of_Bangladesh.svg.png" },
  { publicId: "snap-lens/extreme/flags/ghana",         sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Flag_of_Ghana.svg/1280px-Flag_of_Ghana.svg.png" },
  { publicId: "snap-lens/extreme/flags/myanmar",       sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Flag_of_Myanmar.svg/1280px-Flag_of_Myanmar.svg.png" },
  { publicId: "snap-lens/extreme/flags/israel",        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Flag_of_Israel.svg/1280px-Flag_of_Israel.svg.png" },
  { publicId: "snap-lens/extreme/flags/new-zealand",   sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Flag_of_New_Zealand.svg/1280px-Flag_of_New_Zealand.svg.png" },
  { publicId: "snap-lens/extreme/flags/peru",          sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Flag_of_Peru.svg/1280px-Flag_of_Peru.svg.png" },
  { publicId: "snap-lens/extreme/flags/colombia",      sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Colombia.svg/1280px-Flag_of_Colombia.svg.png" },
  { publicId: "snap-lens/extreme/flags/senegal",       sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Flag_of_Senegal.svg/1280px-Flag_of_Senegal.svg.png" },
  { publicId: "snap-lens/extreme/flags/cambodia",      sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Flag_of_Cambodia.svg/1280px-Flag_of_Cambodia.svg.png" },
  { publicId: "snap-lens/extreme/flags/moldova",       sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Flag_of_Moldova.svg/1280px-Flag_of_Moldova.svg.png" },
  { publicId: "snap-lens/extreme/flags/eritrea",       sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Flag_of_Eritrea.svg/1280px-Flag_of_Eritrea.svg.png" },

  // ── LOGOS ── easy (10)
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

  // ── LOGOS ── medium (10)
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

  // ── LOGOS ── extreme (10)
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

  // ── CELEBRITIES ── easy (10)
  { publicId: "snap-lens/easy/celebrities/einstein",    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Albert_Einstein_Head.jpg/800px-Albert_Einstein_Head.jpg" },
  { publicId: "snap-lens/easy/celebrities/gandhi",      sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Mahatma-Gandhi%2C_studio%2C_1931.jpg/800px-Mahatma-Gandhi%2C_studio%2C_1931.jpg" },
  { publicId: "snap-lens/easy/celebrities/mandela",     sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Nelson_Mandela-2008_%28edit%29.jpg/800px-Nelson_Mandela-2008_%28edit%29.jpg" },
  { publicId: "snap-lens/easy/celebrities/curie",       sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Marie_Curie_c._1920s.jpg/800px-Marie_Curie_c._1920s.jpg" },
  { publicId: "snap-lens/easy/celebrities/lincoln",     sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Abraham_Lincoln_O-77_matte_collodion_print.jpg/800px-Abraham_Lincoln_O-77_matte_collodion_print.jpg" },
  { publicId: "snap-lens/easy/celebrities/da-vinci",    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Leonardo_self.jpg/800px-Leonardo_self.jpg" },
  { publicId: "snap-lens/easy/celebrities/tesla",       sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/N_Tesla.jpg/800px-N_Tesla.jpg" },
  { publicId: "snap-lens/easy/celebrities/newton",      sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Portrait_of_Sir_Isaac_Newton%2C_1689.jpg/800px-Portrait_of_Sir_Isaac_Newton%2C_1689.jpg" },
  { publicId: "snap-lens/easy/celebrities/darwin",      sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Charles_Darwin_seated_crop.jpg/800px-Charles_Darwin_seated_crop.jpg" },
  { publicId: "snap-lens/easy/celebrities/napoleon",    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project_2.jpg/800px-Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project_2.jpg" },

  // ── CELEBRITIES ── medium (10)
  { publicId: "snap-lens/medium/celebrities/shakespeare",  sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Shakespeare.jpg/800px-Shakespeare.jpg" },
  { publicId: "snap-lens/medium/celebrities/cleopatra",    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/0702_-_Napoli%2C_Museo_Archeologico_Nazionale_-_Cleopatra_-_Foto_Giovanni_Dall%27Orto%2C_2_dic_2012.jpg/800px-0702_-_Napoli%2C_Museo_Archeologico_Nazionale_-_Cleopatra_-_Foto_Giovanni_Dall%27Orto%2C_2_dic_2012.jpg" },
  { publicId: "snap-lens/medium/celebrities/beethoven",    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Beethoven.jpg/800px-Beethoven.jpg" },
  { publicId: "snap-lens/medium/celebrities/mozart",       sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Croce-Mozart-Detail.jpg/800px-Croce-Mozart-Detail.jpg" },
  { publicId: "snap-lens/medium/celebrities/frida-kahlo",  sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Frida_Kahlo%2C_by_Guillermo_Kahlo.jpg/800px-Frida_Kahlo%2C_by_Guillermo_Kahlo.jpg" },
  { publicId: "snap-lens/medium/celebrities/churchill",    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Sir_Winston_S_Churchill.jpg/800px-Sir_Winston_S_Churchill.jpg" },
  { publicId: "snap-lens/medium/celebrities/mlk",          sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Martin_Luther_King%2C_Jr..jpg/800px-Martin_Luther_King%2C_Jr..jpg" },
  { publicId: "snap-lens/medium/celebrities/chaplin",      sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Charlie_Chaplin_portrait.jpg/800px-Charlie_Chaplin_portrait.jpg" },
  { publicId: "snap-lens/medium/celebrities/earhart",      sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amelia_Earhart_1935.jpg/800px-Amelia_Earhart_1935.jpg" },
  { publicId: "snap-lens/medium/celebrities/caesar",       sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Gaius_Iulius_Caesar_%28100-44_BC%29.jpg/800px-Gaius_Iulius_Caesar_%28100-44_BC%29.jpg" },

  // ── CELEBRITIES ── extreme (10)
  { publicId: "snap-lens/extreme/celebrities/edison",       sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Thomas_Edison2.jpg/800px-Thomas_Edison2.jpg" },
  { publicId: "snap-lens/extreme/celebrities/galileo",      sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Galileo_Galilei_%281564-1642%29_-_Restoration.jpg/800px-Galileo_Galilei_%281564-1642%29_-_Restoration.jpg" },
  { publicId: "snap-lens/extreme/celebrities/de-gaulle",    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/De_Gaulle_General.jpg/800px-De_Gaulle_General.jpg" },
  { publicId: "snap-lens/extreme/celebrities/lincoln-2",    sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Abraham_Lincoln_seated%2C_Feb_9%2C_1864.jpg/800px-Abraham_Lincoln_seated%2C_Feb_9%2C_1864.jpg" },
  { publicId: "snap-lens/extreme/celebrities/nightingale",  sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Florence_Nightingale_%28H_Hering_NPG_x82368%29.jpg/800px-Florence_Nightingale_%28H_Hering_NPG_x82368%29.jpg" },
  { publicId: "snap-lens/extreme/celebrities/freud",        sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Sigmund_Freud%2C_by_Max_Halberstadt_%281921%29.jpg/800px-Sigmund_Freud%2C_by_Max_Halberstadt_%281921%29.jpg" },
  { publicId: "snap-lens/extreme/celebrities/marx",         sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Karl_Marx_001.jpg/800px-Karl_Marx_001.jpg" },
  { publicId: "snap-lens/extreme/celebrities/genghis-khan", sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Yun-nan_sheng_tu_%281330%29.jpg/800px-Yun-nan_sheng_tu_%281330%29.jpg" },
  { publicId: "snap-lens/extreme/celebrities/washington",   sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Gilbert_Stuart_Williamstown_Portrait_of_George_Washington.jpg/800px-Gilbert_Stuart_Williamstown_Portrait_of_George_Washington.jpg" },
  { publicId: "snap-lens/extreme/celebrities/van-gogh",     sourceUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project.jpg/800px-Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project.jpg" },
];

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD LOGIC
// ─────────────────────────────────────────────────────────────────────────────

const BATCH_SIZE = 3;
const BATCH_DELAY_MS = 800;

async function alreadyUploaded(publicId) {
  try {
    await cloudinary.api.resource(publicId);
    return true;
  } catch {
    return false;
  }
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log(`\nStarting upload of ${images.length} images...\n`);
  let uploaded = 0, skipped = 0, failed = 0;

  for (let i = 0; i < images.length; i += BATCH_SIZE) {
    const batch = images.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async ({ publicId, sourceUrl }) => {
        if (await alreadyUploaded(publicId)) {
          console.log(`  ⏭️  Skipped  ${publicId}`);
          skipped++;
          return;
        }
        try {
          await cloudinary.uploader.upload(sourceUrl, {
            public_id: publicId,
            overwrite: false,
            resource_type: "image",
          });
          console.log(`  ✅ Uploaded ${publicId}`);
          uploaded++;
        } catch (err) {
          console.error(`  ❌ Failed  ${publicId}:`, err.message);
          failed++;
        }
      })
    );
    if (i + BATCH_SIZE < images.length) await sleep(BATCH_DELAY_MS);
  }

  console.log(`\n────────────────────────────────`);
  console.log(`  ✅ Uploaded : ${uploaded}`);
  console.log(`  ⏭️  Skipped  : ${skipped}`);
  console.log(`  ❌ Failed   : ${failed}`);
  console.log(`────────────────────────────────\n`);

  if (failed > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
