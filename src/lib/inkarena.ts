// ── Ink Arena: Team Clash — Word Bank ──

export interface WordCategory {
  name: string;
  emoji: string;
  words: string[];
}

export type DrawDifficulty = "easy" | "medium" | "hard";

export const wordCategories: WordCategory[] = [
  {
    name: "Animals",
    emoji: "🐾",
    words: [
      "Elephant", "Penguin", "Giraffe", "Flamingo", "Crocodile", "Kangaroo",
      "Peacock", "Jellyfish", "Octopus", "Dolphin", "Panda", "Koala",
      "Chameleon", "Platypus", "Toucan", "Armadillo", "Narwhal", "Axolotl",
      "Sloth", "Meerkat", "Warthog", "Capybara", "Hamster", "Lobster",
      "Hedgehog", "Fennec Fox", "Snow Leopard", "Mantis Shrimp", "Flying Squirrel",
      "Sea Horse", "Pelican", "Walrus", "Bison", "Pangolin", "Tapir",
      "Naked Mole Rat", "Quokka", "Binturong", "Aye-aye", "Blobfish",
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
      "Fondue", "Paella", "Dim Sum", "Pho", "Baklava", "Tiramisu",
      "Falafel", "Schnitzel", "Empanada", "Boba Tea", "Gelato", "S'mores",
      "Pancake Stack", "Lobster Roll", "Truffle", "Soufflé",
    ],
  },
  {
    name: "Sports & Games",
    emoji: "⚽",
    words: [
      "Basketball", "Skateboarding", "Surfing", "Boxing", "Wrestling",
      "Volleyball", "Tennis", "Bowling", "Golf", "Archery", "Fencing",
      "Gymnastics", "Diving", "Snowboarding", "Pole Vault", "Marathon",
      "Chess", "Badminton", "Cricket", "Karate", "Curling", "Luge",
      "Water Polo", "Polo", "Lacrosse", "Squash", "Table Tennis",
      "High Jump", "Discus Throw", "Triathlon", "Weightlifting", "Rowing",
      "Rock Climbing", "Parkour", "Darts", "Snooker", "Arm Wrestling",
    ],
  },
  {
    name: "Pop Culture",
    emoji: "🎬",
    words: [
      "Superhero", "Robot", "Alien", "Pirate", "Ninja", "Wizard",
      "Dragon", "Mermaid", "Unicorn", "Zombie", "Ghost", "Vampire",
      "Astronaut", "Caveman", "Knight", "Jedi", "Viking", "Pharaoh",
      "Cowboy", "Samurai", "Time Travel", "Teleportation", "Invisibility",
      "Mind Reading", "Cloning", "Parallel Universe", "Black Hole",
      "Matrix", "Dystopia", "Utopia", "Cyborg", "Werewolf", "Genie",
      "Witch", "Centaur", "Minotaur", "Phoenix", "Kraken", "Yeti",
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
      "Arctic Tundra", "Coral Reef", "Rainforest", "Volcano Island",
      "Underground City", "Floating Market", "Salt Flat", "Glacier",
      "Canyon", "Swamp", "Observatory", "Nuclear Plant", "Ghost Town",
      "Underwater Hotel", "Cliff Monastery", "Bamboo Forest",
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
      "Photobombing", "Planking", "Dabbing", "Twerking", "Air Guitar",
      "Limbo", "Hula Hooping", "Speed Reading", "Sleepwalking", "Crowd Surfing",
      "Bungee Jumping", "Parasailing", "Zip Lining", "Cliff Diving",
    ],
  },
  {
    name: "Everyday Objects",
    emoji: "🪑",
    words: [
      "Umbrella", "Toothbrush", "Scissors", "Stapler", "Lamp",
      "Couch", "Blender", "Microwave", "Telescope", "Compass",
      "Hourglass", "Briefcase", "Padlock", "Doorbell", "Piggy Bank",
      "Thermometer", "Magnifying Glass", "Metronome", "Candelabra",
      "Ironing Board", "Lava Lamp", "Snow Globe", "Music Box",
      "Rubber Duck", "Fidget Spinner", "Swiss Army Knife",
    ],
  },
  {
    name: "Vehicles",
    emoji: "🚗",
    words: [
      "Monster Truck", "Hovercraft", "Segway", "Rickshaw", "Gondola",
      "Cable Car", "Bulldozer", "Fire Engine", "Ice Cream Truck",
      "Ambulance", "Forklift", "Jet Ski", "Snowmobile", "Tuk-tuk",
      "Unicycle", "Double-decker Bus", "Submarine", "Zeppelin",
      "Space Shuttle", "Helicopter", "Chairlift", "Dogsleds",
    ],
  },
];

// ── Difficulty word lists ──────────────────────────────────────────────────────
// Easy: simple, single-concept things anyone can draw in seconds
export const easyWords: string[] = [
  // Animals (simple)
  "Cat", "Dog", "Fish", "Bird", "Frog", "Duck", "Cow", "Pig", "Horse", "Sheep",
  "Lion", "Bear", "Fox", "Wolf", "Owl", "Bee", "Ant", "Crab", "Shark", "Whale",
  // Food & drink
  "Apple", "Banana", "Pizza", "Burger", "Taco", "Egg", "Milk", "Bread", "Cheese", "Cookie",
  "Cake", "Ice Cream", "Lemon", "Cherry", "Grape", "Strawberry", "Carrot", "Corn", "Onion", "Mushroom",
  // Nature & weather
  "Sun", "Moon", "Star", "Cloud", "Rain", "Snow", "Tree", "Flower", "Leaf", "Mountain",
  "River", "Beach", "Island", "Cave", "Rainbow", "Lightning", "Wind", "Fire", "Wave", "Rock",
  // Everyday objects
  "Hat", "Cup", "Bed", "Key", "Door", "Book", "Shoe", "Ball", "Bag", "Sock",
  "Chair", "Table", "Lamp", "Clock", "Phone", "Ring", "Flag", "Gift", "Drum", "Bell",
  // Transport & places
  "Car", "Bus", "Boat", "Plane", "Train", "Bike", "Truck", "Kite", "Balloon", "Rocket",
  "House", "Bridge", "Road", "Fence", "Garden", "Well", "Tent", "Slide", "Swing", "Ladder",
];

// Medium: recognisable things that need more thought to draw clearly
export const mediumWords: string[] = [
  // Animals (trickier)
  "Elephant", "Penguin", "Giraffe", "Octopus", "Jellyfish", "Kangaroo", "Crocodile", "Flamingo", "Peacock", "Platypus",
  "Parrot", "Chameleon", "Gorilla", "Panda", "Koala", "Narwhal", "Axolotl", "Meerkat", "Capybara", "Hedgehog",
  // Food & drink
  "Sushi", "Waffle", "Donut", "Pretzel", "Croissant", "Ramen", "Dumpling", "Nachos", "Hot Dog", "Popcorn",
  "Cotton Candy", "Churro", "Boba Tea", "Cheesecake", "Fondue", "Paella", "Dim Sum", "Burrito", "S'mores", "Tiramisu",
  // Sports & activities
  "Skateboarding", "Surfing", "Bowling", "Archery", "Gymnastics", "Diving", "Karate", "Curling", "Fencing", "Pole Vault",
  "Rock Climbing", "Bungee Jumping", "Tightrope Walking", "Hula Hooping", "Breakdancing", "Yoga", "Juggling", "Limbo", "Cartwheel", "Headstand",
  // Fantasy & pop culture
  "Robot", "Alien", "Pirate", "Ninja", "Wizard", "Dragon", "Mermaid", "Unicorn", "Zombie", "Vampire",
  "Astronaut", "Caveman", "Knight", "Viking", "Pharaoh", "Cowboy", "Samurai", "Genie", "Werewolf", "Centaur",
  // Places & structures
  "Eiffel Tower", "Pyramid", "Volcano", "Waterfall", "Lighthouse", "Igloo", "Castle", "Windmill", "Submarine", "Rollercoaster",
  "Ferris Wheel", "Treehouse", "Sandcastle", "Snowman", "Scarecrow", "Trampoline", "Hammock", "Hot Air Balloon", "Space Station", "Ghost Town",
];

// Hard: tricky to draw but still visual — requires creativity, not impossible
export const hardWords: string[] = [
  // Scenes & situations
  "Earthquake", "Avalanche", "Shipwreck", "Car Crash", "Traffic Jam", "Prison Break", "Bank Robbery", "Wedding", "Funeral", "Birthday Party",
  "Job Interview", "First Date", "Camping Trip", "Road Trip", "School Exam", "Graduation", "Surgery", "Court Trial", "Circus Act", "Fashion Show",
  // Compound concepts (drawable with creativity)
  "Sleepwalking", "Sunburn", "Brain Freeze", "Food Fight", "Pillow Fight", "Snowball Fight", "Arm Wrestling", "Thumb War", "Tug of War", "Treasure Hunt",
  "Hide and Seek", "Musical Chairs", "Hot Potato", "Red Carpet", "Photobomb", "Stage Fright", "Writer's Block", "Rush Hour", "Black Market", "Time Bomb",
  // Tricky objects & animals
  "Chandelier", "Grandfather Clock", "Cuckoo Clock", "Mousetrap", "Quicksand", "Treadmill", "Wrecking Ball", "Bulldozer", "Crane", "Forklift",
  "Stingray", "Porcupine", "Chameleon", "Praying Mantis", "Venus Flytrap", "Cactus Garden", "Coral Reef", "Deep Sea Diver", "Loch Ness Monster", "Bigfoot",
  // Actions & expressions
  "Snoring", "Hiccups", "Yawning", "Tripping", "Fainting", "Blushing", "Winking", "Crying", "Laughing", "Screaming",
  "Whispering", "Gossiping", "Eavesdropping", "Daydreaming", "Nightmare", "Insomnia", "Jetlag", "Hangover", "Allergies", "Braces",
  // Pop culture (drawable)
  "Selfie", "Photobooth", "Karaoke", "Flash Mob", "Paparazzi", "Red Carpet Walk", "Award Ceremony", "Concert Crowd", "Mosh Pit", "Music Festival",
  "Food Truck", "Drive-In Movie", "Escape Room", "Haunted House", "Corn Maze", "Theme Park", "Water Park", "Zoo", "Aquarium", "Museum",
];



export const allWords: string[] = [...new Set([...easyWords, ...mediumWords, ...hardWords])];

export function getWordsByDifficulty(difficulty: DrawDifficulty): string[] {
  switch (difficulty) {
    case "easy":   return easyWords;
    case "medium": return mediumWords;
    case "hard":   return hardWords;
  }
}

export function getRandomWord(excludeWords: string[] = [], difficulty: DrawDifficulty = "medium"): string {
  const pool = getWordsByDifficulty(difficulty);
  const available = pool.filter((w) => !excludeWords.includes(w));
  const source = available.length > 0 ? available : pool;
  return source[Math.floor(Math.random() * source.length)];
}

export function getWordsForRound(count: number, excludeWords: string[] = [], difficulty: DrawDifficulty = "medium"): string[] {
  const pool = getWordsByDifficulty(difficulty);
  const available = pool.filter((w) => !excludeWords.includes(w));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ── Game config ──
export const ROUND_SECONDS = 60;
export const BONUS_SECONDS_THRESHOLD = 15; // under this = bonus
export const POINTS_CORRECT_GUESS = 100;
export const POINTS_FAST_BONUS = 50;
export const POINTS_STEAL_PENALTY = 50;
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

// ── Team config ──
export interface TeamConfig {
  teamNames: string[];           // e.g. ["Red", "Blue", "Green", "Purple"]
  teamCount: number;
  difficulty: DrawDifficulty;
  totalRounds: number;
  scores: number[];
}

// ── Supabase channel event types ──
export type InkArenaEvent =
  | { type: "stroke"; stroke: DrawStroke }
  | { type: "clear" }
  | { type: "guess"; team: number; guess: string; playerId: string }
  | { type: "round_start"; word: string; drawingTeam: number; drawerId: string; roundNumber: number }
  | { type: "round_end"; correct: boolean; guessingTeam: number; timeLeft: number }
  | { type: "steal"; stealingTeam: number; guess: string; playerId: string }
  | { type: "game_over"; winner: number; scores: number[] }
  | { type: "player_join"; team: number; name: string; playerId: string; role: "drawer" | "guesser" }
  | { type: "host_ready" }
  | { type: "scores_update"; scores: number[] }
  | { type: "sabotage"; effect: "shrink" | "shake" | "flip"; fromTeam: number };

// ── Team colours ──
export const TEAM_COLORS = [
  { accent: "#FF416C", bg: "rgba(255,65,108,0.12)",  border: "rgba(255,65,108,0.35)",  gradient: "linear-gradient(135deg,#FF416C,#FF4B2B)" },
  { accent: "#00B4DB", bg: "rgba(0,180,219,0.12)",   border: "rgba(0,180,219,0.35)",   gradient: "linear-gradient(135deg,#00B4DB,#0083B0)" },
  { accent: "#A855F7", bg: "rgba(168,85,247,0.12)",  border: "rgba(168,85,247,0.35)",  gradient: "linear-gradient(135deg,#A855F7,#7C3AED)" },
  { accent: "#22C55E", bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.35)",   gradient: "linear-gradient(135deg,#22C55E,#16A34A)" },
];

export const DEFAULT_TEAM_NAMES = ["Red Team", "Blue Team", "Purple Team", "Green Team"];
