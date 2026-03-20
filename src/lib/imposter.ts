// Imposter game logic and data
export interface ImposterCategory {
  name: string;
  words: string[];
}

// ── Session-based used-word tracking ──────────────────────────────────────────
// Prevents the same word from appearing again for ~50+ rounds per category
const STORAGE_KEY = "arena-imposter-used";

function getUsedWords(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function markWordUsed(category: string, word: string) {
  if (typeof window === "undefined") return;
  const used = getUsedWords();
  if (!used[category]) used[category] = [];
  used[category].push(word);
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(used)); } catch { /* quota */ }
}

/** Pick a word that hasn't been used this session. Resets if pool exhausted. */
function pickFreshWord(category: string, words: string[], random: () => number): string {
  const used = getUsedWords();
  const usedSet = new Set(used[category] ?? []);
  const available = words.filter((w) => !usedSet.has(w));

  // If all words used, reset history for this category
  if (available.length === 0) {
    if (typeof window !== "undefined") {
      const u = getUsedWords();
      delete u[category];
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(u)); } catch { /* quota */ }
    }
    const idx = Math.floor(random() * words.length);
    const word = words[idx];
    markWordUsed(category, word);
    return word;
  }

  const idx = Math.floor(random() * available.length);
  const word = available[idx];
  markWordUsed(category, word);
  return word;
}

export const categories: ImposterCategory[] = [
  {
    name: "Famous People",
    words: [
      // Hollywood & global celebrities
      "Drake", "Beyoncé", "Elon Musk", "Taylor Swift", "The Rock", "Kim Kardashian",
      "Cristiano Ronaldo", "Rihanna", "MrBeast", "Oprah", "Snoop Dogg", "Zendaya",
      "Kevin Hart", "Lionel Messi", "Billie Eilish", "Ariana Grande", "Ed Sheeran",
      "Harry Styles", "Dua Lipa", "Bad Bunny", "BTS", "Cardi B", "Post Malone",
      "Ryan Reynolds", "Chris Evans", "Tom Holland", "Pedro Pascal", "Timothée Chalamet",
      "Margot Robbie", "Sydney Sweeney", "Florence Pugh", "Jacob Elordi",
      "Sabrina Carpenter", "Charli XCX", "Olivia Rodrigo", "SZA", "Travis Scott",
      "Keanu Reeves", "Robert Downey Jr.", "Chris Hemsworth", "Scarlett Johansson", "Leonardo DiCaprio",
      "Jennifer Lawrence", "Emma Stone", "Gal Gadot", "Jason Momoa", "Henry Cavill",
      "Will Smith", "Morgan Freeman", "Denzel Washington", "Tom Hanks", "Brad Pitt",
      "Angelina Jolie", "Meryl Streep", "Julia Roberts", "Nicole Kidman", "Sandra Bullock",
      "Lady Gaga", "Justin Bieber", "Kanye West", "Shakira", "Adele",
      "Selena Gomez", "Miley Cyrus", "Katy Perry", "Bruno Mars", "The Weeknd",
      "Gordon Ramsay", "David Beckham", "Kylie Jenner", "Gigi Hadid", "Bella Hadid",
      "Dwayne Johnson", "Vin Diesel", "Samuel L. Jackson", "Idris Elba", "Ice Cube",
      // Sports icons
      "Simone Biles", "LeBron James", "Novak Djokovic", "Carlos Alcaraz",
      "Roger Federer", "Serena Williams", "Usain Bolt", "Michael Phelps", "Tiger Woods",
      "Lewis Hamilton", "Conor McGregor",
      // Tech & world figures
      "Jeff Bezos", "Mark Zuckerberg", "Tim Cook", "Steve Jobs", "Bill Gates", "Warren Buffett",
      "Barack Obama", "Nelson Mandela", "Malala Yousafzai", "Albert Einstein", "Stephen Hawking",
      // Musicians & bands
      "The Beatles", "Nirvana", "Coldplay", "Eminem", "Daft Punk", "Arctic Monkeys",
      "Queen", "Linkin Park", "Kendrick Lamar", "Tyler the Creator", "Frank Ocean",
      "Led Zeppelin", "Pink Floyd", "Rolling Stones", "AC/DC", "Metallica",
      "Radiohead", "Elton John", "David Bowie", "Prince", "Michael Jackson",
      "Madonna", "Whitney Houston", "Mariah Carey", "Bob Marley", "Bob Dylan",
      "Jimi Hendrix", "Stevie Wonder", "Aretha Franklin",
      "Imagine Dragons", "Maroon 5", "Twenty One Pilots", "Green Day", "Foo Fighters",
      "Red Hot Chili Peppers", "Guns N' Roses", "U2", "Bon Jovi",
      "Avicii", "Marshmello", "Calvin Harris", "Martin Garrix",
      // Bollywood & Indian
      "Shah Rukh Khan", "Amitabh Bachchan", "Alia Bhatt", "Ranveer Singh",
      "Deepika Padukone", "Salman Khan", "Hrithik Roshan", "Kareena Kapoor",
      "Ranbir Kapoor", "Akshay Kumar", "Priyanka Chopra", "Aamir Khan",
      "Madhuri Dixit", "Kajol", "Rajinikanth", "Allu Arjun", "Prabhas",
      "Diljit Dosanjh", "Kartik Aaryan", "Vicky Kaushal",
      "Nawazuddin Siddiqui", "Manoj Bajpayee", "Pankaj Tripathi", "Irrfan Khan",
      "Virat Kohli", "MS Dhoni", "Sachin Tendulkar",
      "AR Rahman", "Arijit Singh", "Shreya Ghoshal", "Sonu Nigam",
      "Lata Mangeshkar", "Kishore Kumar",
      "Neha Kakkar", "Badshah", "Yo Yo Honey Singh", "Pritam", "Amit Trivedi",
    ],
  },
  {
    name: "Movies & Entertainment",
    words: [
      // Hollywood blockbusters
      "Stranger Things", "Inception", "The Office", "Squid Game", "Titanic",
      "Breaking Bad", "Avatar", "Friends", "Wednesday", "Interstellar",
      "Game of Thrones", "Shrek", "The Batman", "One Piece", "Parasite",
      "Oppenheimer", "Barbie", "Dune", "Top Gun Maverick", "Everything Everywhere",
      "The Bear", "Severance", "White Lotus", "Succession", "Euphoria",
      "Ted Lasso", "The Last of Us", "House of the Dragon",
      "Peaky Blinders", "Ozark", "Mindhunter", "Dark", "Money Heist",
      "The Godfather", "Pulp Fiction", "Fight Club", "The Matrix", "Forrest Gump",
      "The Shawshank Redemption", "Goodfellas", "Gladiator", "Saving Private Ryan",
      "Jurassic Park", "Harry Potter", "Lord of the Rings", "Star Wars", "Indiana Jones",
      "The Avengers", "Spider-Man", "Black Panther", "Guardians of the Galaxy", "Iron Man",
      "Frozen", "Toy Story", "Finding Nemo", "Inside Out", "The Lion King",
      "The Mandalorian", "Loki", "Ahsoka", "Andor",
      "Narcos", "Vikings", "Sherlock", "Black Mirror", "The Crown",
      "The Witcher", "Cobra Kai", "Yellowstone", "Outer Banks", "Bridgerton",
      "Better Call Saul", "Mr. Robot", "Fargo", "True Detective", "Westworld",
      // Indian cinema & shows
      "Sacred Games", "Mirzapur", "Delhi Crime", "Scam 1992", "Panchayat",
      "The Family Man", "Kota Factory", "Farzi", "Paatal Lok",
      "3 Idiots", "Dangal", "Sholay", "Dilwale Dulhania Le Jayenge", "RRR",
      "Bahubali", "KGF", "Pushpa", "Pathaan", "Animal", "Jawan",
      "Lagaan", "Swades", "Dil Chahta Hai", "Gangs of Wasseypur", "Andhadhun",
      "Rang De Basanti", "PK", "Bajrangi Bhaijaan",
      "Hera Pheri", "Chak De India", "Munna Bhai MBBS", "Golmaal",
      "Zindagi Na Milegi Dobara", "Barfi", "Kabhi Khushi Kabhie Gham",
      // Games, memes & internet
      "Among Us", "Minecraft", "Fortnite", "Roblox", "GTA",
      "Call of Duty", "FIFA", "Mario Kart", "Pokémon", "Zelda",
      "Elden Ring", "God of War", "Valorant", "League of Legends", "Apex Legends",
    ],
  },
  {
    name: "Brands & Things",
    words: [
      // Tech & apps
      "Nike", "Apple", "McDonald's", "Tesla", "Google", "Netflix", "IKEA",
      "Coca-Cola", "Supreme", "Gucci", "Amazon", "PlayStation", "Red Bull", "Spotify", "Starbucks",
      "Samsung", "Sony", "Microsoft", "Intel", "NVIDIA",
      "WhatsApp", "YouTube", "TikTok", "Twitter", "Instagram",
      "Uber", "Airbnb", "Tinder", "Snapchat", "Discord",
      "Pinterest", "Reddit", "LinkedIn", "Telegram", "Signal",
      "Nintendo", "Xbox", "Steam", "Epic Games",
      "Disney", "Marvel", "DC", "Warner Bros", "Universal",
      "CNN", "BBC", "ESPN", "National Geographic",
      // Fashion & luxury
      "Louis Vuitton", "Rolex", "Ferrari", "Lamborghini", "Porsche",
      "Adidas", "Puma", "New Balance", "Balenciaga", "Off-White",
      "Chanel", "Hermès", "Prada", "Dior", "Versace",
      "Zara", "H&M", "Uniqlo", "Levi's", "Ralph Lauren",
      "BMW", "Audi", "Mercedes-Benz", "Rolls-Royce", "Bugatti",
      // Indian brands
      "Tata", "Reliance", "Jio", "Flipkart", "Swiggy",
      "Zomato", "Ola", "Amul", "Parle", "Haldiram's",
      "Tanishq", "Titan", "Bajaj", "Hero", "Mahindra",
      // Everyday objects
      "Umbrella", "Microwave", "Toothbrush", "Backpack", "Ladder",
      "Mirror", "Candle", "Scissors", "Pillow", "Clock",
      "Flashlight", "Blender", "Telescope", "Compass", "Binoculars",
      "Rubik's Cube", "Fidget Spinner", "Boomerang", "Drone", "Gamepad",
      "VR Headset", "Selfie Stick", "Ring Light", "Smart Speaker", "Robot Vacuum",
      "Fire Extinguisher", "Vending Machine", "ATM",
      "Typewriter", "Gramophone", "Lava Lamp", "Snow Globe", "Kaleidoscope",
      "Walkie-Talkie", "Swiss Army Knife", "Duct Tape", "Bubble Wrap",
      "Espresso Machine", "Air Fryer", "Instant Pot",
      "Lightsaber", "Magic Wand", "Crystal Ball", "Dream Catcher",
      "Lego", "Hot Wheels", "Nerf", "Barbie",
      "FedEx", "PayPal", "Visa", "Mastercard",
    ],
  },
  {
    name: "Places & Travel",
    words: [
      // Asia
      "Tokyo", "Seoul", "Shanghai", "Hong Kong", "Taipei", "Bangkok",
      "Singapore", "Kuala Lumpur", "Bali", "Jakarta", "Manila",
      "Hanoi", "Ho Chi Minh City", "Kyoto", "Osaka", "Beijing",
      "Maldives", "Dubai", "Mumbai", "Delhi", "Bangalore",
      "Kolkata", "Chennai", "Hyderabad", "Goa", "Jaipur",
      "Varanasi", "Udaipur", "Kashmir",
      // Europe
      "Paris", "London", "Rome", "Barcelona", "Amsterdam",
      "Prague", "Vienna", "Istanbul", "Berlin", "Munich",
      "Zurich", "Geneva", "Monaco", "Dublin", "Edinburgh",
      "Oslo", "Stockholm", "Helsinki", "Lisbon", "Athens",
      "Santorini", "Croatia", "Budapest", "Warsaw",
      // Americas
      "New York", "Los Angeles", "San Francisco", "Las Vegas", "Miami",
      "Chicago", "Toronto", "Cancun", "Havana", "Rio de Janeiro",
      "Buenos Aires", "Lima", "Bogota", "Santiago",
      // Africa & Oceania
      "Cape Town", "Cairo", "Nairobi", "Lagos", "Marrakech",
      "Casablanca", "Sydney", "Melbourne",
      // Countries
      "Brazil", "Mexico", "Egypt", "Morocco", "Jamaica",
      "Iceland", "Australia", "India", "Japan", "Germany",
      "Canada", "Switzerland", "Norway", "Sweden", "Denmark",
      "Finland", "New Zealand", "Thailand", "Vietnam", "Philippines",
      "Malaysia", "Indonesia", "Kenya", "South Africa", "Nigeria",
      "Peru", "Colombia", "Argentina", "Chile", "Cuba",
      "Portugal", "Greece", "Hungary", "Poland",
      // Landmarks & regions
      "Antarctica", "Alaska", "Sahara", "Amazon", "Siberia",
    ],
  },
  {
    name: "Food & Sports",
    words: [
      // Global food
      "Pizza", "Sushi", "Burger", "Biryani", "Tacos", "Ramen", "Pasta",
      "Fried Chicken", "Dim Sum", "Kebab", "Shawarma", "Pho", "Pad Thai",
      "Steak", "Paella", "Fish and Chips", "Pretzel", "Waffle",
      "Cheesecake", "Tiramisu", "Croissant", "Macaron", "Crème Brûlée",
      "Cotton Candy", "Churro", "Nachos", "Hot Dog", "Popcorn",
      "Falafel", "Hummus", "Baklava", "Gyros",
      "Pancake", "French Toast", "Bagel", "Donut",
      "Spaghetti", "Lasagna", "Risotto", "Ravioli",
      "Spring Rolls", "Satay", "Tempura", "Ceviche", "Fondue",
      "Lobster", "Caviar", "Beef Wellington",
      // Indian food
      "Samosa", "Pani Puri", "Vada Pav", "Butter Chicken", "Dal Makhani",
      "Masala Dosa", "Chole Bhature", "Rajma Chawal", "Pav Bhaji",
      "Gulab Jamun", "Jalebi", "Rasgulla", "Kheer", "Kulfi",
      "Tandoori Chicken", "Paneer Tikka", "Naan", "Paratha", "Idli",
      "Kaju Katli", "Ladoo",
      // Drinks
      "Milkshake", "Bubble Tea", "Masala Chai", "Lassi", "Espresso",
      "Mango Lassi", "Kombucha", "Matcha Latte",
      // Sports
      "Cricket", "Football", "Basketball", "Tennis", "Badminton",
      "Kabaddi", "Wrestling", "Boxing", "Swimming", "Gymnastics",
      "Formula 1", "Golf", "Table Tennis", "Volleyball", "Hockey",
      "Rugby", "Baseball", "Surfing", "Skiing", "Skateboarding",
      "MMA", "Judo", "Taekwondo", "Archery", "Fencing",
      "Cycling", "Marathon", "Weightlifting",
      "UFC", "WWE", "Ice Hockey", "Snowboarding", "Rock Climbing",
      "Esports", "Chess", "Poker", "Yoga", "CrossFit",
      "Sumo", "Karate", "Kung Fu", "Muay Thai",
      // Events
      "IPL", "FIFA World Cup", "Olympics", "Wimbledon",
      "Super Bowl", "NBA Finals", "Champions League",
      "Cricket World Cup", "T20 World Cup", "El Clasico",
    ],
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
  const secretWord = pickFreshWord(category.name, category.words, random);

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
