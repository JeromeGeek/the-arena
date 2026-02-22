// HeadRush — word banks for the heads-up guessing game

export interface HeadRushCategory {
  name: string;
  emoji: string;
  words: string[];
}

export const headRushCategories: HeadRushCategory[] = [
  {
    name: "Famous People",
    emoji: "⭐",
    words: [
      "Elon Musk", "Taylor Swift", "Cristiano Ronaldo", "Beyoncé", "The Rock",
      "Oprah", "Leonardo DiCaprio", "Rihanna", "LeBron James", "Kanye West",
      "Drake", "Kim Kardashian", "Eminem", "Serena Williams", "Will Smith",
      "Adele", "Lionel Messi", "Lady Gaga", "Justin Bieber", "Nicki Minaj",
      "Michael Jordan", "Billie Eilish", "Tiger Woods", "Ariana Grande", "Shakira",
      "Post Malone", "Cardi B", "Tom Cruise", "Selena Gomez", "Jeff Bezos",
    ],
  },
  {
    name: "Movies & TV",
    emoji: "🎬",
    words: [
      "The Office", "Game of Thrones", "Breaking Bad", "Titanic", "Avengers",
      "Harry Potter", "Star Wars", "The Lion King", "Shrek", "Spider-Man",
      "Friends", "The Simpsons", "Stranger Things", "Inception", "The Dark Knight",
      "Squid Game", "Money Heist", "Interstellar", "Jurassic Park", "The Notebook",
      "Avatar", "Frozen", "The Godfather", "Pulp Fiction", "Mean Girls",
      "Toy Story", "Finding Nemo", "Top Gun", "Fast & Furious", "Black Panther",
    ],
  },
  {
    name: "Animals",
    emoji: "🐾",
    words: [
      "Elephant", "Penguin", "Shark", "Giraffe", "Octopus",
      "Cheetah", "Gorilla", "Flamingo", "Kangaroo", "Crocodile",
      "Polar Bear", "Peacock", "Panda", "Dolphin", "Bald Eagle",
      "Koala", "Meerkat", "Narwhal", "Platypus", "Chameleon",
      "Toucan", "Axolotl", "Capybara", "Hammerhead Shark", "Komodo Dragon",
      "Sloth", "Orca", "Grizzly Bear", "Snow Leopard", "Tarantula",
    ],
  },
  {
    name: "Food & Drink",
    emoji: "🍕",
    words: [
      "Pizza", "Sushi", "Tacos", "Burger", "Ramen",
      "Croissant", "Hot Dog", "Nachos", "Waffle", "Burrito",
      "Cheesecake", "Ice Cream", "Donut", "Cotton Candy", "Popcorn",
      "Margarita", "Milkshake", "Espresso", "Guacamole", "Dumplings",
      "Lobster", "Steak", "Pad Thai", "Hummus", "Churros",
      "Pretzel", "Smoothie", "Crepe", "Biryani", "Spaghetti",
    ],
  },
  {
    name: "Actions",
    emoji: "🏃",
    words: [
      "Surfing", "Skydiving", "Moonwalking", "Breakdancing", "Juggling",
      "Tightrope Walking", "Karaoke", "Yoga", "Sneezing", "Yawning",
      "Facepalm", "Flexing", "Tripping", "Winking", "Saluting",
      "Headstand", "Cartwheel", "Somersault", "Air Guitar", "Slow Motion Running",
      "Hula Hooping", "Limbo", "Thumb Wrestling", "Finger Guns", "Mic Drop",
      "High Five", "Belly Flop", "Photobombing", "Ghosting", "Vibing",
    ],
  },
  {
    name: "Places",
    emoji: "🌍",
    words: [
      "Eiffel Tower", "Times Square", "Great Wall of China", "Machu Picchu", "Colosseum",
      "Niagara Falls", "Grand Canyon", "Mount Everest", "Venice", "Las Vegas",
      "Amazon Rainforest", "Sahara Desert", "Great Barrier Reef", "Stonehenge", "Pyramids of Giza",
      "Hollywood Sign", "Big Ben", "Statue of Liberty", "Taj Mahal", "Leaning Tower of Pisa",
      "Antarctica", "Bermuda Triangle", "Area 51", "Vatican City", "Mount Fuji",
      "Buckingham Palace", "Central Park", "Silicon Valley", "Dead Sea", "Northern Lights",
    ],
  },
  {
    name: "Random",
    emoji: "🎲",
    words: [
      "Déjà Vu", "Rollercoaster", "Championship Belt", "Time Machine", "Invisible Man",
      "Winning Lottery Ticket", "Selfie Stick", "Conspiracy Theory", "Photobomb", "Plot Twist",
      "Bucket List", "Dream Job", "Reality TV Show", "Social Media Influencer", "Side Quest",
      "Cheat Code", "Easter Egg", "Final Boss", "Loading Screen", "Respawn Point",
      "Comfort Zone", "Glow Up", "Plot Armor", "Villain Origin Story", "Main Character",
      "NPC Energy", "Chaos Theory", "Butterfly Effect", "Quantum Physics", "Black Hole",
    ],
  },
];

export const allHeadRushWords = headRushCategories.flatMap((c) => c.words);

export function getHeadRushWords(
  categoryName: string | undefined,
  count: number,
  random: () => number,
): string[] {
  const pool =
    !categoryName || categoryName === "random"
      ? allHeadRushWords
      : headRushCategories.find((c) => c.name.toLowerCase().replace(/\s+/g, "-") === categoryName)?.words ??
        allHeadRushWords;

  const shuffled = [...pool].sort(() => random() - 0.5);
  // Return enough words for many rounds — cycle if needed
  const result: string[] = [];
  while (result.length < count) {
    result.push(...shuffled);
  }
  return result.slice(0, count);
}
