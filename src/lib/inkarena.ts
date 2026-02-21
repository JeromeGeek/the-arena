// ── Ink Arena: Team Clash — Word Bank ──

export interface WordCategory {
  name: string;
  emoji: string;
  words: string[];
}

export const wordCategories: WordCategory[] = [
  {
    name: "Animals",
    emoji: "🐾",
    words: [
      "Elephant", "Penguin", "Giraffe", "Flamingo", "Crocodile", "Kangaroo",
      "Peacock", "Jellyfish", "Octopus", "Dolphin", "Panda", "Koala",
      "Chameleon", "Platypus", "Toucan", "Armadillo", "Narwhal", "Axolotl",
      "Sloth", "Meerkat", "Warthog", "Capybara", "Hamster", "Lobster",
    ],
  },
  {
    name: "Food & Drink",
    emoji: "🍕",
    words: [
      "Pizza", "Sushi", "Taco", "Burrito", "Waffle", "Donut", "Pretzel",
      "Croissant", "Smoothie", "Milkshake", "Ramen", "Dumpling", "Nachos",
      "Hot Dog", "Popcorn", "Cotton Candy", "Churro", "Crepe", "Biryani",
      "Spaghetti", "Burger", "Cheesecake", "Pineapple", "Watermelon",
    ],
  },
  {
    name: "Sports & Games",
    emoji: "⚽",
    words: [
      "Basketball", "Skateboarding", "Surfing", "Boxing", "Wrestling",
      "Volleyball", "Tennis", "Bowling", "Golf", "Archery", "Fencing",
      "Gymnastics", "Diving", "Snowboarding", "Pole Vault", "Marathon",
      "Chess", "Badminton", "Cricket", "Karate",
    ],
  },
  {
    name: "Pop Culture",
    emoji: "🎬",
    words: [
      "Superhero", "Robot", "Alien", "Pirate", "Ninja", "Wizard",
      "Dragon", "Mermaid", "Unicorn", "Zombie", "Ghost", "Vampire",
      "Astronaut", "Caveman", "Knight", "Jedi", "Viking", "Pharaoh",
      "Cowboy", "Samurai",
    ],
  },
  {
    name: "Places",
    emoji: "🌍",
    words: [
      "Eiffel Tower", "Pyramid", "Volcano", "Waterfall", "Treehouse",
      "Lighthouse", "Igloo", "Castle", "Windmill", "Submarine",
      "Space Station", "Haunted House", "Skyscraper", "Cave", "Maze",
      "Hot Air Balloon", "Roller Coaster", "Ferris Wheel", "Jungle", "Desert",
    ],
  },
  {
    name: "Actions",
    emoji: "🏃",
    words: [
      "Surfing", "Juggling", "Moonwalking", "Tightrope Walking", "Skydiving",
      "Karaoke", "Breakdancing", "Yoga", "Sneezing", "Yawning",
      "Tripping", "Winking", "Flexing", "Shrugging", "Facepalm",
      "Saluting", "Headstand", "Cartwheel", "Somersault", "Mime",
    ],
  },
];

export const allWords: string[] = wordCategories.flatMap((c) => c.words);

export function getRandomWord(excludeWords: string[] = []): string {
  const available = allWords.filter((w) => !excludeWords.includes(w));
  if (available.length === 0) return allWords[Math.floor(Math.random() * allWords.length)];
  return available[Math.floor(Math.random() * available.length)];
}

export function getWordsForRound(count: number, excludeWords: string[] = []): string[] {
  const available = allWords.filter((w) => !excludeWords.includes(w));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ── Game config ──
export const ROUND_SECONDS = 45;
export const BONUS_SECONDS_THRESHOLD = 15; // under this = bonus
export const POINTS_CORRECT_GUESS = 100;
export const POINTS_FAST_BONUS = 50;
export const POINTS_STEAL = 50; // percent stolen
export const POINTS_STEAL_PENALTY = 30; // deducted from drawing team
export const POINTS_TO_WIN = 1000;

// ── Room code generator (6-char alphanumeric) ──
export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ── Stroke type for real-time drawing ──
export interface DrawStroke {
  type: "stroke" | "clear" | "undo";
  x?: number;
  y?: number;
  px?: number; // previous x (for line)
  py?: number; // previous y
  color: string;
  brushSize: number;
  isStart?: boolean;
}

// ── Supabase channel event types ──
export type InkArenaEvent =
  | { type: "stroke"; stroke: DrawStroke }
  | { type: "clear" }
  | { type: "guess"; team: "red" | "blue"; guess: string; playerId: string }
  | { type: "round_start"; word: string; drawingTeam: "red" | "blue"; drawerId: string; roundNumber: number }
  | { type: "round_end"; correct: boolean; guessingTeam: "red" | "blue"; timeLeft: number }
  | { type: "steal"; stealingTeam: "red" | "blue"; guess: string; playerId: string }
  | { type: "game_over"; winner: "red" | "blue"; scores: { red: number; blue: number } }
  | { type: "player_join"; team: "red" | "blue"; name: string; playerId: string; role: "drawer" | "guesser" }
  | { type: "host_ready" }
  | { type: "scores_update"; scores: { red: number; blue: number } }
  | { type: "sabotage"; effect: "shrink" | "shake" | "flip"; fromTeam: "red" | "blue" };
