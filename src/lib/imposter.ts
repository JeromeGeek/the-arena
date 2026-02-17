// Imposter game logic and data
export interface ImposterCategory {
  name: string;
  words: string[];
}

export const categories: ImposterCategory[] = [
  {
    name: "Objects",
    words: ["Umbrella", "Microwave", "Toothbrush", "Backpack", "Ladder", "Mirror", "Candle", "Scissors", "Pillow", "Clock", "Shovel", "Binoculars", "Stapler", "Flashlight", "Blender"],
  },
  {
    name: "Celebrities",
    words: ["Drake", "Beyoncé", "Elon Musk", "Taylor Swift", "The Rock", "Kim Kardashian", "Cristiano Ronaldo", "Rihanna", "MrBeast", "Oprah", "Snoop Dogg", "Zendaya", "Kevin Hart", "Lionel Messi", "Billie Eilish"],
  },
  {
    name: "Brands",
    words: ["Nike", "Apple", "McDonald's", "Tesla", "Google", "Netflix", "IKEA", "Coca-Cola", "Supreme", "Gucci", "Amazon", "PlayStation", "Red Bull", "Spotify", "Starbucks"],
  },
  {
    name: "Countries & Cities",
    words: ["Tokyo", "Brazil", "Paris", "Dubai", "New York", "Egypt", "London", "Australia", "Mexico", "Bangkok", "Iceland", "Rome", "Jamaica", "Singapore", "Morocco"],
  },
  {
    name: "Movies & TV Shows",
    words: ["Stranger Things", "Inception", "The Office", "Squid Game", "Titanic", "Breaking Bad", "Avatar", "Friends", "Wednesday", "Interstellar", "Game of Thrones", "Shrek", "The Batman", "One Piece", "Parasite"],
  },
  {
    name: "Internet Culture",
    words: ["Among Us", "Skibidi", "Sigma", "Rizz", "Minecraft", "Fortnite", "TikTok", "Meme", "Discord Mod", "Brainrot"],
  },
  {
    name: "Music & Bands",
    words: ["The Beatles", "BTS", "Nirvana", "Coldplay", "Eminem", "Daft Punk", "Arctic Monkeys", "Kanye West", "ABBA", "Travis Scott", "Queen", "Linkin Park", "Bad Bunny", "Doja Cat", "Kendrick Lamar"],
  },
  {
    name: "Bollywood",
    words: ["Shah Rukh Khan", "Amitabh Bachchan", "Alia Bhatt", "Ranveer Singh", "Deepika Padukone", "Salman Khan", "Hrithik Roshan", "Kareena Kapoor", "Ranbir Kapoor", "Akshay Kumar", "Priyanka Chopra", "Arijit Singh", "Katrina Kaif", "Virat Kohli", "Aamir Khan"],
  },
];

export interface ImposterPlayer {
  id: number;
  name: string;
  isImposter: boolean;
  word: string;
  eliminated: boolean;
}

export function setupImposterGame(
  playerNames: string[],
  imposterCount: number = 1,
  random: () => number = Math.random,
  categoryName?: string
): { players: ImposterPlayer[]; category: string; secretWord: string } {
  // Pick category — use specified or random
  // categoryName can be a display name or a URL slug (e.g. "countries-cities")
  const pool = categoryName
    ? categories.filter((c) => {
        const slug = c.name.toLowerCase().replace(/\s*&\s*/g, "-").replace(/\s+/g, "-");
        return c.name.toLowerCase() === categoryName.toLowerCase() || slug === categoryName.toLowerCase();
      })
    : categories;
  const category = pool.length > 0
    ? pool[Math.floor(random() * pool.length)]
    : categories[Math.floor(random() * categories.length)];
  const secretWord = category.words[Math.floor(random() * category.words.length)];

  // Shuffle players and assign imposters
  const shuffledIndices = Array.from({ length: playerNames.length }, (_, i) => i);
  for (let i = shuffledIndices.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
  }

  const imposterIndices = new Set(shuffledIndices.slice(0, imposterCount));

  const players: ImposterPlayer[] = playerNames.map((name, i) => ({
    id: i,
    name,
    isImposter: imposterIndices.has(i),
    word: imposterIndices.has(i) ? "???" : secretWord,
    eliminated: false,
  }));

  return { players, category: category.name, secretWord };
}
