// Charades — game logic and word banks

export interface CharadesCategory {
  name: string;
  words: string[];
}

export const charadesCategories: CharadesCategory[] = [
  {
    name: "Movies",
    words: [
      "Titanic", "Jaws", "Frozen", "Inception", "Rocky", "Shrek", "Avatar",
      "Spider-Man", "Gladiator", "Jurassic Park", "The Matrix", "Finding Nemo",
      "Harry Potter", "Star Wars", "The Lion King", "Batman", "Top Gun",
      "Transformers", "Toy Story", "Indiana Jones",
    ],
  },
  {
    name: "Animals",
    words: [
      "Penguin", "Elephant", "Snake", "Monkey", "Kangaroo", "Giraffe", "Crab",
      "Eagle", "Octopus", "Frog", "Shark", "Flamingo", "Gorilla", "Butterfly",
      "Chicken", "Horse", "Dolphin", "Cat", "Dog", "Bear",
    ],
  },
  {
    name: "Actions",
    words: [
      "Swimming", "Surfing", "Cooking", "Fishing", "Dancing", "Boxing",
      "Painting", "Driving", "Sleeping", "Skydiving", "Yoga", "Karate",
      "Singing", "Running", "Typing", "Juggling", "Sneezing", "Climbing",
      "Weightlifting", "Archery",
    ],
  },
  {
    name: "Celebrities",
    words: [
      "Michael Jackson", "Beyoncé", "Elvis Presley", "The Rock", "Taylor Swift",
      "Cristiano Ronaldo", "Oprah", "Arnold Schwarzenegger", "Usain Bolt",
      "Bob Marley", "Marilyn Monroe", "Elon Musk", "Muhammad Ali",
      "Freddie Mercury", "Snoop Dogg", "Lady Gaga", "Bruce Lee",
      "Charlie Chaplin", "Shakira", "Drake",
    ],
  },
  {
    name: "Professions",
    words: [
      "Doctor", "Firefighter", "Chef", "Pilot", "Detective", "Teacher",
      "Astronaut", "Magician", "DJ", "Dentist", "Lifeguard", "Farmer",
      "Photographer", "Surgeon", "Barber", "Mechanic", "Plumber",
      "Electrician", "Waiter", "Painter",
    ],
  },
  {
    name: "Objects",
    words: [
      "Umbrella", "Scissors", "Ladder", "Guitar", "Telescope", "Microwave",
      "Trampoline", "Skateboard", "Balloon", "Chainsaw", "Vacuum Cleaner",
      "Toothbrush", "Sword", "Binoculars", "Parachute", "Blender",
      "Treadmill", "Camera", "Compass", "Piano",
    ],
  },
  {
    name: "Sports",
    words: [
      "Basketball", "Tennis", "Golf", "Wrestling", "Bowling", "Hockey",
      "Table Tennis", "Cricket", "Volleyball", "Badminton", "Fencing",
      "Gymnastics", "Figure Skating", "Baseball", "Skiing", "Surfing",
      "Boxing", "Archery", "Rugby", "Karate",
    ],
  },
];

export type CharadesDifficulty = "easy" | "medium" | "hard";

export interface CharadesGame {
  players: string[];
  category: string;
  words: string[];
  currentWordIndex: number;
  currentPlayerIndex: number;
  scores: Record<string, number>;
  timerSeconds: number;
  round: number;
}

export function setupCharadesGame(
  playerNames: string[],
  categoryName?: string,
  randomFn: () => number = Math.random,
  wordCount: number = 50
): { words: string[]; category: string } {
  // Pick category
  const pool = categoryName
    ? charadesCategories.filter((c) => {
        const slug = c.name.toLowerCase().replace(/\s+/g, "-");
        return c.name.toLowerCase() === categoryName.toLowerCase() || slug === categoryName.toLowerCase();
      })
    : charadesCategories;
  
  const category = pool.length > 0
    ? pool[Math.floor(randomFn() * pool.length)]
    : charadesCategories[Math.floor(randomFn() * charadesCategories.length)];

  // Collect words — if random, pull from all categories (deduplicated)
  let wordPool: string[];
  if (!categoryName || categoryName === "random") {
    wordPool = [...new Set(charadesCategories.flatMap((c) => c.words))];
  } else {
    wordPool = category.words;
  }

  // Shuffle and pick — if wordCount exceeds pool, cycle through pool multiple times
  const shuffled = [...wordPool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // If we need more words than the pool, repeat the shuffled pool
  let finalWords = shuffled;
  while (finalWords.length < wordCount) {
    const extra = [...wordPool];
    for (let i = extra.length - 1; i > 0; i--) {
      const j = Math.floor(randomFn() * (i + 1));
      [extra[i], extra[j]] = [extra[j], extra[i]];
    }
    finalWords = [...finalWords, ...extra];
  }

  return {
    words: finalWords.slice(0, wordCount),
    category: categoryName === "random" || !categoryName ? "Random" : category.name,
  };
}
