// Charades — game logic and word banks

export interface CharadesCategory {
  name: string;
  words: string[];
}

// Charades — game logic and word banks

export interface CharadesCategory {
  name: string;
  words: string[];
}

// ── Session-based used-word tracking ──────────────────────────────────────────
const STORAGE_KEY = "arena-charades-used";

function getUsedWords(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function markWordsUsed(category: string, words: string[]) {
  if (typeof window === "undefined") return;
  const used = getUsedWords();
  if (!used[category]) used[category] = [];
  used[category].push(...words);
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(used)); } catch { /* quota */ }
}

/** Filter out recently used words. Resets when pool runs low. */
function filterUsed(category: string, pool: string[], needed: number): string[] {
  const used = getUsedWords();
  const usedSet = new Set(used[category] ?? []);
  const available = pool.filter((w) => !usedSet.has(w));

  // If not enough fresh words, reset history
  if (available.length < needed) {
    if (typeof window !== "undefined") {
      const u = getUsedWords();
      delete u[category];
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(u)); } catch {}
    }
    return pool;
  }
  return available;
}

export const charadesCategories: CharadesCategory[] = [
  {
    name: "Act It Out",
    words: [
      // Physical actions
      "Swimming", "Surfing", "Cooking", "Fishing", "Dancing", "Boxing",
      "Painting", "Driving", "Sleeping", "Skydiving", "Yoga", "Karate",
      "Singing", "Running", "Typing", "Juggling", "Sneezing", "Climbing",
      "Weightlifting", "Archery", "Skateboarding", "Snowboarding", "Skiing",
      "Rollerblading", "Hula Hooping", "Jump Roping", "Tightrope Walking",
      "Breakdancing", "Moonwalking", "Somersaulting", "Cartwheeling", "Handstanding",
      "Meditating", "Knitting", "Ironing", "Vacuuming", "Mopping",
      "Gardening", "Chopping Wood", "Hammering", "Sawing",
      "Playing Guitar", "Playing Drums", "Playing Piano",
      "Cheerleading", "Fencing", "Pole Vaulting", "Javelin Throwing",
      "High Jumping", "Long Jumping", "Hurdles", "Rowing", "Kayaking",
      "Rock Climbing", "Bungee Jumping", "Paragliding", "Zip Lining",
      "Texting", "Selfie Taking", "Scrolling Phone", "Video Calling",
      "Brushing Teeth", "Shaving", "Applying Makeup",
      "Eating Spaghetti", "Slurping Noodles", "Cracking Eggs",
      "Chopping Onions", "Stirring a Pot", "Blowing Candles",
      "Wrapping a Gift", "Opening a Present", "Blowing Balloons",
      "Building Sandcastle", "Flying a Kite", "Walking a Dog",
      "Catching a Fish", "Rowing a Boat", "Building a Snowman",
      "Making Snow Angels", "Sledding", "Ice Skating", "Roller Skating",
      "Hailing a Taxi", "Taking a Photo", "Pointing at Stars",
      "Whispering", "Yawning", "Stretching", "Tripping", "Ducking",
      // Sports
      "Basketball", "Tennis", "Golf", "Wrestling", "Bowling", "Hockey",
      "Table Tennis", "Cricket", "Volleyball", "Badminton",
      "Gymnastics", "Figure Skating", "Baseball", "Kickboxing",
      "Rugby", "Soccer", "Football", "Diving", "Water Polo",
      "Lacrosse", "Softball", "Curling", "Bobsled",
      "Judo", "Taekwondo", "Sumo", "MMA", "Muay Thai",
      "Sailing", "Windsurfing", "Kitesurfing", "Mountain Biking",
      "Formula 1", "Horse Racing", "Cycling", "Marathon",
      "Pickleball", "Squash", "Handball", "Ultimate Frisbee",
      "Parkour", "Slacklining", "Freediving",
      "Arm Wrestling", "Thumb War", "Air Hockey", "Foosball",
      "Darts", "Beer Pong",
      // Indian
      "Playing Cricket", "Doing Namaste", "Wearing Saree",
      "Doing Garba", "Playing Dhol", "Eating with Hands", "Bargaining",
      "Riding Auto Rickshaw", "Doing Pooja",
      "Playing Kabaddi", "Doing Bhangra", "Cooking Roti", "Making Chai",
      "Kho-Kho", "Gilli-Danda", "Lagori",
    ],
  },
  {
    name: "Movies & TV",
    words: [
      // Hollywood blockbusters
      "Titanic", "Jaws", "Frozen", "Inception", "Rocky", "Shrek", "Avatar",
      "Spider-Man", "Gladiator", "Jurassic Park", "The Matrix", "Finding Nemo",
      "Harry Potter", "Star Wars", "The Lion King", "Batman", "Top Gun",
      "Transformers", "Toy Story", "Indiana Jones", "The Avengers", "Black Panther",
      "The Dark Knight", "Interstellar", "Forrest Gump", "The Godfather", "Pulp Fiction",
      "The Shawshank Redemption", "Fight Club", "The Terminator",
      "Back to the Future", "E.T.", "Home Alone", "Die Hard", "Scarface",
      "Pirates of the Caribbean", "Mean Girls", "The Hangover",
      "Superbad", "Anchorman", "Step Brothers", "Elf", "Zoolander",
      "Moana", "Coco", "Soul", "Up", "WALL-E", "Ratatouille", "The Incredibles",
      "Despicable Me", "Minions", "Kung Fu Panda", "Ice Age", "Encanto",
      "Doctor Strange", "Thor", "Iron Man", "Aquaman", "Wonder Woman",
      "Deadpool", "Wolverine", "Joker", "Oppenheimer", "Barbie", "Dune",
      "Ghostbusters", "The Mummy", "Night at the Museum", "Paddington",
      "The Grand Budapest Hotel", "Parasite", "Knives Out", "Tenet",
      // TV shows
      "Game of Thrones", "Breaking Bad", "Stranger Things", "The Office",
      "Friends", "Seinfeld", "The Simpsons", "South Park", "Family Guy",
      "Brooklyn Nine-Nine", "Parks and Recreation",
      "Narcos", "Ozark", "True Detective", "Black Mirror", "Westworld",
      "Sherlock", "Peaky Blinders", "The Crown", "Ted Lasso",
      "Squid Game", "Money Heist", "Dark", "Wednesday",
      "Bridgerton", "Euphoria", "Succession", "White Lotus", "Severance",
      "The Last of Us", "House of the Dragon", "Yellowstone",
      // Bollywood & Indian
      "Dilwale Dulhania Le Jayenge", "Sholay", "3 Idiots", "Dangal",
      "Lagaan", "Dil Chahta Hai", "Zindagi Na Milegi Dobara",
      "Kabhi Khushi Kabhie Gham", "Jab We Met", "Chennai Express",
      "PK", "Bajrangi Bhaijaan", "RRR", "Bahubali", "KGF", "Pushpa",
      "Pathaan", "Animal", "Jawan", "Hera Pheri", "Andhadhun",
      "Gangs of Wasseypur", "Munna Bhai MBBS",
      "Mirzapur", "Sacred Games", "Scam 1992", "Panchayat",
      "The Family Man", "Kota Factory", "Farzi",
      "Taarak Mehta Ka Ooltah Chashmah", "Bigg Boss", "Kaun Banega Crorepati",
      "CID", "Sarabhai vs Sarabhai", "Kapil Sharma Show",
    ],
  },
  {
    name: "Famous People",
    words: [
      "Michael Jackson", "Beyoncé", "Elvis Presley", "The Rock", "Taylor Swift",
      "Cristiano Ronaldo", "Oprah", "Arnold Schwarzenegger", "Usain Bolt",
      "Bob Marley", "Marilyn Monroe", "Elon Musk", "Muhammad Ali",
      "Freddie Mercury", "Snoop Dogg", "Lady Gaga", "Bruce Lee",
      "Charlie Chaplin", "Shakira", "Drake", "Rihanna", "Eminem", "Jay-Z",
      "Kanye West", "Nicki Minaj", "Cardi B", "Post Malone", "Ed Sheeran",
      "Justin Bieber", "Harry Styles", "Billie Eilish", "Ariana Grande",
      "Bruno Mars", "The Weeknd", "Dua Lipa", "Bad Bunny", "BTS",
      "LeBron James", "Michael Jordan", "Lionel Messi",
      "Serena Williams", "Tiger Woods", "Conor McGregor",
      "Will Smith", "Leonardo DiCaprio", "Tom Hanks", "Meryl Streep",
      "Brad Pitt", "Angelina Jolie", "Johnny Depp",
      "Ryan Reynolds", "Chris Evans", "Robert Downey Jr.", "Scarlett Johansson",
      "Zendaya", "Timothée Chalamet", "Dwayne Johnson", "Kevin Hart",
      "Adele", "Olivia Rodrigo", "Sabrina Carpenter", "Travis Scott", "SZA",
      "Pedro Pascal", "Sydney Sweeney", "Florence Pugh", "Tom Holland",
      "Novak Djokovic", "Simone Biles",
      // Indian
      "Shah Rukh Khan", "Ranveer Singh", "Deepika Padukone", "Priyanka Chopra",
      "Amitabh Bachchan", "Virat Kohli", "Sachin Tendulkar", "MS Dhoni",
      "Neeraj Chopra", "PV Sindhu", "Mary Kom",
      "Aamir Khan", "Salman Khan", "Akshay Kumar", "Hrithik Roshan",
      "Ranbir Kapoor", "Alia Bhatt", "Katrina Kaif", "Kajol",
      "Madhuri Dixit", "Rajinikanth", "Allu Arjun", "Prabhas",
      "AR Rahman", "Shreya Ghoshal", "Lata Mangeshkar", "Kishore Kumar",
      "Narendra Modi", "APJ Abdul Kalam", "Ratan Tata",
      // Professions (easy to act out)
      "Doctor", "Firefighter", "Chef", "Pilot", "Detective", "Teacher",
      "Astronaut", "Magician", "DJ", "Dentist", "Lifeguard", "Farmer",
      "Photographer", "Surgeon", "Barber", "Mechanic", "Plumber",
      "Waiter", "Painter", "Architect", "Lawyer", "Judge",
      "Police Officer", "Soldier", "Pirate", "Knight", "Ninja", "Samurai", "Cowboy",
      "Zookeeper", "Veterinarian", "Nurse", "Scientist",
      "Journalist", "News Anchor", "Actor", "Director",
      "Influencer", "Youtuber", "Streamer",
      "Flight Attendant", "Tour Guide", "Spy", "Secret Agent",
      "Stand-up Comedian", "Circus Performer", "Escape Artist",
      "Auto Rickshaw Driver", "Chai Wallah", "Street Food Vendor",
    ],
  },
  {
    name: "Things & Places",
    words: [
      // Objects
      "Umbrella", "Scissors", "Ladder", "Guitar", "Telescope", "Microwave",
      "Trampoline", "Skateboard", "Balloon", "Chainsaw", "Vacuum Cleaner",
      "Toothbrush", "Sword", "Binoculars", "Parachute", "Blender",
      "Treadmill", "Camera", "Compass", "Piano", "Washing Machine",
      "Lawnmower", "Fire Extinguisher", "Vending Machine",
      "Bowling Ball", "Frisbee", "Boomerang", "Yo-Yo", "Slinky",
      "Fidget Spinner", "Rubik's Cube", "Magnifying Glass", "Stethoscope",
      "Wheelchair", "Crutches", "Syringe", "Thermometer",
      "Selfie Stick", "Ring Light", "Drone", "VR Headset",
      "Gaming Controller", "Bluetooth Speaker", "Earbuds", "Smart Watch",
      "Projector", "Stapler", "Paper Shredder",
      "Surfboard", "Snowboard", "Sleeping Bag", "Tent", "Backpack",
      "Life Jacket", "Snorkel", "Flippers", "Diving Tank",
      "Lightsaber", "Wand", "Trident", "Crossbow", "Slingshot",
      "Handcuffs", "Treasure Map",
      "Dhol", "Sitar", "Tabla", "Pressure Cooker", "Tiffin Box",
      "Auto Rickshaw", "Bullock Cart",
      // Places & landmarks
      "Eiffel Tower", "Big Ben", "Colosseum", "Great Wall of China", "Taj Mahal",
      "Machu Picchu", "Pyramids of Giza", "Stonehenge", "Angkor Wat",
      "Niagara Falls", "Grand Canyon", "Amazon Rainforest", "Sahara Desert",
      "Mount Everest", "Great Barrier Reef",
      "Times Square", "Hollywood", "Las Vegas", "Golden Gate Bridge",
      "Statue of Liberty", "Mount Rushmore", "Disney World",
      "Red Fort", "Qutub Minar", "India Gate", "Gateway of India",
      "Charminar", "Hawa Mahal", "Golden Temple", "Varanasi Ghats",
      "Marine Drive Mumbai", "Connaught Place", "Chandni Chowk",
      "Santorini", "Maldives", "Bora Bora", "Bali",
      "Northern Lights", "Victoria Falls",
    ],
  },
  {
    name: "Food & Animals",
    words: [
      // Food
      "Pizza", "Sushi", "Taco", "Burrito", "Waffle", "Donut", "Pretzel",
      "Croissant", "Milkshake", "Ramen", "Dumpling", "Nachos",
      "Hot Dog", "Popcorn", "Cotton Candy", "Churro", "Biryani",
      "Spaghetti", "Burger", "Cheesecake", "Steak", "BBQ",
      "Fried Chicken", "Fish and Chips", "Pad Thai", "Dim Sum", "Samosa",
      "Falafel", "Kebab", "Shawarma", "Ice Cream Sundae", "Banana Split",
      "Tiramisu", "Gelato", "Bubble Tea", "Espresso", "Hot Chocolate",
      "Guacamole", "Empanada", "Peking Duck", "Korean BBQ",
      "Butter Chicken", "Chole Bhature", "Pav Bhaji", "Vada Pav", "Pani Puri",
      "Masala Dosa", "Idli Sambar", "Naan", "Tandoori Chicken", "Paneer Tikka",
      "Gulab Jamun", "Jalebi", "Rasgulla", "Ladoo", "Chai", "Lassi",
      // Animals
      "Penguin", "Elephant", "Snake", "Monkey", "Kangaroo", "Giraffe", "Crab",
      "Eagle", "Octopus", "Frog", "Shark", "Flamingo", "Gorilla", "Butterfly",
      "Chicken", "Horse", "Dolphin", "Cat", "Dog", "Bear", "Sloth", "Panda",
      "Koala", "Cheetah", "Lion", "Tiger", "Zebra", "Hippo", "Rhino", "Crocodile",
      "Chameleon", "Parrot", "Toucan", "Ostrich", "Platypus",
      "Hedgehog", "Beaver", "Otter", "Seal", "Walrus", "Polar Bear",
      "Chimpanzee", "Meerkat", "Hyena", "Camel", "Llama",
      "Peacock", "Owl", "Bat", "Hamster", "Rabbit", "Raccoon", "Skunk",
      "Capybara", "Jaguar", "Narwhal", "Orca", "Manatee",
      "Komodo Dragon", "Axolotl", "Piranha", "Clownfish", "Pufferfish",
      "Jellyfish", "Lobster", "Scorpion", "Tarantula", "Dragonfly",
      "Hummingbird", "Bengal Tiger", "Indian Cobra", "King Cobra",
      "Indian Peacock", "Langur", "Great Hornbill",
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
        const slug = c.name.toLowerCase().replace(/\s*&\s*/g, "-").replace(/\s+/g, "-");
        return c.name.toLowerCase() === categoryName.toLowerCase() || slug === categoryName.toLowerCase();
      })
    : charadesCategories;
  
  const category = pool.length > 0
    ? pool[Math.floor(randomFn() * pool.length)]
    : charadesCategories[Math.floor(randomFn() * charadesCategories.length)];

  // Determine tracking key — "Random" gets its own key
  const isRandom = !categoryName || categoryName === "random";
  const trackingKey = isRandom ? "__random__" : category.name;

  // Collect words — if random, pull from all categories (deduplicated)
  let wordPool: string[];
  if (isRandom) {
    wordPool = [...new Set(charadesCategories.flatMap((c) => c.words))];
  } else {
    wordPool = category.words;
  }

  // Filter out recently used words
  const freshPool = filterUsed(trackingKey, wordPool, wordCount);

  // Shuffle and pick
  const shuffled = [...freshPool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // If we need more words than fresh pool, cycle
  let finalWords = shuffled;
  while (finalWords.length < wordCount) {
    const extra = [...wordPool];
    for (let i = extra.length - 1; i > 0; i--) {
      const j = Math.floor(randomFn() * (i + 1));
      [extra[i], extra[j]] = [extra[j], extra[i]];
    }
    finalWords = [...finalWords, ...extra];
  }

  const selected = finalWords.slice(0, wordCount);

  // Mark these words as used for this session
  markWordsUsed(trackingKey, selected);

  return {
    words: selected,
    category: isRandom ? "Random" : category.name,
  };
}
