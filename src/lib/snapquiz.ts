// SnapQuiz — Image bank for the image-guessing party game
// All images are sourced from Wikimedia Commons (public domain)

export type SnapCategory = "landmarks" | "movies" | "people" | "india" | "random";
export type SnapDifficulty = "easy" | "medium" | "extreme";

export interface SnapImage {
  id: string;
  answer: string;
  hint: string; // shown after wrong guess or pass
  url: string;
  category: SnapCategory;
}

// ── World Landmarks ──────────────────────────────────────────────────────────
const landmarks: SnapImage[] = [
  {
    id: "lm01", answer: "Eiffel Tower", hint: "Paris, France",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Sightseeing_in_Paris.jpg/800px-Sightseeing_in_Paris.jpg",
    category: "landmarks",
  },
  {
    id: "lm02", answer: "Taj Mahal", hint: "Agra, India",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/1024px-Taj_Mahal_%28Edited%29.jpeg",
    category: "landmarks",
  },
  {
    id: "lm03", answer: "Colosseum", hint: "Rome, Italy",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/1024px-Colosseo_2020.jpg",
    category: "landmarks",
  },
  {
    id: "lm04", answer: "Statue of Liberty", hint: "New York, USA",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Statue_of_Liberty_7.jpg/800px-Statue_of_Liberty_7.jpg",
    category: "landmarks",
  },
  {
    id: "lm05", answer: "Burj Khalifa", hint: "Dubai, UAE",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Burj_Khalifa.jpg/800px-Burj_Khalifa.jpg",
    category: "landmarks",
  },
  {
    id: "lm06", answer: "Big Ben", hint: "London, England",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Big_ben_postcard.jpg/800px-Big_ben_postcard.jpg",
    category: "landmarks",
  },
  {
    id: "lm07", answer: "Great Wall of China", hint: "Northern China",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg/1024px-The_Great_Wall_of_China_at_Jinshanling-edit.jpg",
    category: "landmarks",
  },
  {
    id: "lm08", answer: "Machu Picchu", hint: "Peru, South America",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Machu_Picchu%2C_Peru.jpg/1024px-Machu_Picchu%2C_Peru.jpg",
    category: "landmarks",
  },
  {
    id: "lm09", answer: "Sydney Opera House", hint: "Sydney, Australia",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Sydney_Opera_House_-_Dec_2008.jpg/1024px-Sydney_Opera_House_-_Dec_2008.jpg",
    category: "landmarks",
  },
  {
    id: "lm10", answer: "Pyramids of Giza", hint: "Egypt, Africa",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Kheops-Pyramid.jpg/1024px-Kheops-Pyramid.jpg",
    category: "landmarks",
  },
  {
    id: "lm11", answer: "Stonehenge", hint: "Wiltshire, England",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Stonehenge2007_07_30.jpg/1024px-Stonehenge2007_07_30.jpg",
    category: "landmarks",
  },
  {
    id: "lm12", answer: "Leaning Tower of Pisa", hint: "Pisa, Italy",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Leaning_tower_of_pisa_2.jpg/800px-Leaning_tower_of_pisa_2.jpg",
    category: "landmarks",
  },
  {
    id: "lm13", answer: "Sagrada Família", hint: "Barcelona, Spain",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Sagrada_Familia_01.jpg/800px-Sagrada_Familia_01.jpg",
    category: "landmarks",
  },
  {
    id: "lm14", answer: "Niagara Falls", hint: "USA / Canada border",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Niagara_falls_2009.jpg/1024px-Niagara_falls_2009.jpg",
    category: "landmarks",
  },
  {
    id: "lm15", answer: "Mount Fuji", hint: "Japan",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/080103_hakkai_fuji.jpg/1024px-080103_hakkai_fuji.jpg",
    category: "landmarks",
  },
];

// ── Famous People (all public domain / historical) ───────────────────────────
const people: SnapImage[] = [
  {
    id: "pp01", answer: "Albert Einstein", hint: "Theory of Relativity",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Albert_Einstein_Head.jpg/800px-Albert_Einstein_Head.jpg",
    category: "people",
  },
  {
    id: "pp02", answer: "Mahatma Gandhi", hint: "Father of the Nation",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Mahatma-Gandhi%2C_studio%2C_1931.jpg/800px-Mahatma-Gandhi%2C_studio%2C_1931.jpg",
    category: "people",
  },
  {
    id: "pp03", answer: "Leonardo da Vinci", hint: "Renaissance genius",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Leonardo_self.jpg/800px-Leonardo_self.jpg",
    category: "people",
  },
  {
    id: "pp04", answer: "Nelson Mandela", hint: "South African president",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Nelson_Mandela_1994.jpg/800px-Nelson_Mandela_1994.jpg",
    category: "people",
  },
  {
    id: "pp05", answer: "Marie Curie", hint: "Nobel Prize in Physics & Chemistry",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Marie_Curie_c1920.jpg/800px-Marie_Curie_c1920.jpg",
    category: "people",
  },
  {
    id: "pp06", answer: "Abraham Lincoln", hint: "16th US President",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Abraham_Lincoln_O-77_matte_collodion_print.jpg/800px-Abraham_Lincoln_O-77_matte_collodion_print.jpg",
    category: "people",
  },
  {
    id: "pp07", answer: "Charles Darwin", hint: "Theory of Evolution",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Charles_Darwin_seated_crop.jpg/800px-Charles_Darwin_seated_crop.jpg",
    category: "people",
  },
  {
    id: "pp08", answer: "Isaac Newton", hint: "Laws of Motion & Gravity",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Portrait_of_Sir_Isaac_Newton%2C_1689.jpg/800px-Portrait_of_Sir_Isaac_Newton%2C_1689.jpg",
    category: "people",
  },
  {
    id: "pp09", answer: "Napoleon Bonaparte", hint: "French Emperor",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project_2.jpg/800px-Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project_2.jpg",
    category: "people",
  },
  {
    id: "pp10", answer: "Nikola Tesla", hint: "Invented AC electricity",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/N.Tesla.JPG/800px-N.Tesla.JPG",
    category: "people",
  },
  {
    id: "pp11", answer: "Cleopatra", hint: "Last pharaoh of Egypt",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Kleopatra-VII.-Altes-Museum-Berlin1.jpg/800px-Kleopatra-VII.-Altes-Museum-Berlin1.jpg",
    category: "people",
  },
  {
    id: "pp12", answer: "William Shakespeare", hint: "Famous playwright",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Shakespeare.jpg/800px-Shakespeare.jpg",
    category: "people",
  },
];

// ── India ────────────────────────────────────────────────────────────────────
const india: SnapImage[] = [
  {
    id: "in01", answer: "Taj Mahal", hint: "Symbol of love, Agra",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/1024px-Taj_Mahal_%28Edited%29.jpeg",
    category: "india",
  },
  {
    id: "in02", answer: "Red Fort", hint: "Delhi, India",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/RedFortDelhi.jpg/1024px-RedFortDelhi.jpg",
    category: "india",
  },
  {
    id: "in03", answer: "Gateway of India", hint: "Mumbai harbour",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Mumbai_03-2016_30_Gateway_of_India.jpg/1024px-Mumbai_03-2016_30_Gateway_of_India.jpg",
    category: "india",
  },
  {
    id: "in04", answer: "Hawa Mahal", hint: "Palace of Winds, Jaipur",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Hawa_Mahal_Jaipur.jpg/800px-Hawa_Mahal_Jaipur.jpg",
    category: "india",
  },
  {
    id: "in05", answer: "Lotus Temple", hint: "New Delhi, India",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Lotus_Temple_New_Delhi.jpg/1024px-Lotus_Temple_New_Delhi.jpg",
    category: "india",
  },
  {
    id: "in06", answer: "Qutub Minar", hint: "Tallest brick minaret",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Qtub_Minar.jpg/800px-Qtub_Minar.jpg",
    category: "india",
  },
  {
    id: "in07", answer: "India Gate", hint: "War memorial, New Delhi",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/India_Gate_in_New_Delhi_03-2016.jpg/1024px-India_Gate_in_New_Delhi_03-2016.jpg",
    category: "india",
  },
  {
    id: "in08", answer: "Mysore Palace", hint: "Karnataka, India",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Mysore_Palace_Morning.jpg/1024px-Mysore_Palace_Morning.jpg",
    category: "india",
  },
  {
    id: "in09", answer: "Hampi", hint: "UNESCO site, Karnataka",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Hampi_virupaksha_temple.jpg/1024px-Hampi_virupaksha_temple.jpg",
    category: "india",
  },
  {
    id: "in10", answer: "Golden Temple", hint: "Amritsar, Punjab",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Golden_Temple_Amritsar_2019.jpg/1024px-Golden_Temple_Amritsar_2019.jpg",
    category: "india",
  },
  {
    id: "in11", answer: "Meenakshi Temple", hint: "Madurai, Tamil Nadu",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Meenakshi_Amman_Temple_Madurai.jpg/800px-Meenakshi_Amman_Temple_Madurai.jpg",
    category: "india",
  },
  {
    id: "in12", answer: "Ajanta Caves", hint: "Rock-cut Buddhist caves, Maharashtra",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Ajanta_cave9.jpg/1024px-Ajanta_cave9.jpg",
    category: "india",
  },
];

// ── Movies (public domain posters / famous artworks used as stills) ──────────
const movies: SnapImage[] = [
  {
    id: "mv01", answer: "Metropolis", hint: "1927 German silent sci-fi",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Metropolis_Poster.jpg/800px-Metropolis_Poster.jpg",
    category: "movies",
  },
  {
    id: "mv02", answer: "Nosferatu", hint: "1922 German horror",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Nosferatu_eine_Symphonie_des_Grauens_poster.jpg/800px-Nosferatu_eine_Symphonie_des_Grauens_poster.jpg",
    category: "movies",
  },
  {
    id: "mv03", answer: "The General", hint: "1926 Buster Keaton comedy",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Buster_Keaton_The_General_1926.jpg/1024px-Buster_Keaton_The_General_1926.jpg",
    category: "movies",
  },
  {
    id: "mv04", answer: "Battleship Potemkin", hint: "1925 Soviet classic",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Battleship_Potemkin_poster.jpg/800px-Battleship_Potemkin_poster.jpg",
    category: "movies",
  },
  {
    id: "mv05", answer: "City Lights", hint: "1931 Charlie Chaplin",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Charlie_Chaplin_City_Lights.jpg/800px-Charlie_Chaplin_City_Lights.jpg",
    category: "movies",
  },
  {
    id: "mv06", answer: "Gone with the Wind", hint: "1939 Civil War epic",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Gone_with_the_Wind_poster.jpg/800px-Gone_with_the_Wind_poster.jpg",
    category: "movies",
  },
  {
    id: "mv07", answer: "Casablanca", hint: "1942 Humphrey Bogart",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Casablanca_poster.jpg/800px-Casablanca_poster.jpg",
    category: "movies",
  },
  {
    id: "mv08", answer: "Citizen Kane", hint: "1941 Orson Welles",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Citizen_Kane_poster%2C_1941_%28Style_B%2C_unrestored%29.jpg/800px-Citizen_Kane_poster%2C_1941_%28Style_B%2C_unrestored%29.jpg",
    category: "movies",
  },
];

// ── All images combined ───────────────────────────────────────────────────────
export const allSnapImages: SnapImage[] = [
  ...landmarks,
  ...people,
  ...india,
  ...movies,
];

export const snapCategories = [
  { id: "random",    label: "Random Mix",       emoji: "🎲", images: allSnapImages },
  { id: "landmarks", label: "World Landmarks",  emoji: "🌍", images: landmarks },
  { id: "people",    label: "Famous People",    emoji: "⭐", images: people },
  { id: "india",     label: "India",            emoji: "🇮🇳", images: india },
  { id: "movies",    label: "Movie Posters",    emoji: "🎬", images: movies },
] as const;

export const difficultyConfig = {
  easy:    { label: "Easy",    emoji: "🟢", blurPx: 14, revealMs: 2000, extraPoints: 0 },
  medium:  { label: "Medium",  emoji: "🟡", blurPx: 28, revealMs: 4000, extraPoints: 0 },
  extreme: { label: "Extreme", emoji: "🔴", blurPx: 48, revealMs: 8000, extraPoints: 0 },
} as const;

export const POINTS_PER_CORRECT = 5;

export function getSnapImages(
  categoryId: string,
  count: number,
  random: () => number,
): SnapImage[] {
  const cat = snapCategories.find((c) => c.id === categoryId);
  const pool = cat ? [...cat.images] : [...allSnapImages];
  const shuffled = pool.sort(() => random() - 0.5);
  // Cycle if not enough images
  const result: SnapImage[] = [];
  while (result.length < count) result.push(...shuffled);
  return result.slice(0, count);
}
