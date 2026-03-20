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
    name: "Objects",
    words: [
      "Umbrella", "Microwave", "Toothbrush", "Backpack", "Ladder", "Mirror", "Candle", "Scissors",
      "Pillow", "Clock", "Shovel", "Binoculars", "Stapler", "Flashlight", "Blender",
      "Trampoline", "Lawnmower", "Telescope", "Compass", "Magnifying Glass",
      "Rubik's Cube", "Yo-Yo", "Fidget Spinner", "Slinky", "Boomerang",
      "Fire Extinguisher", "Parking Meter", "Vending Machine", "ATM", "Slot Machine",
      "Power Drill", "Jackhammer", "Pressure Cooker", "Tiffin Box", "Thermos",
      "Selfie Stick", "Ring Light", "VR Headset", "Drone", "Gamepad",
      "Treadmill", "Surfboard", "Skateboard", "Dart Board", "Bowling Ball",
      "Handcuffs", "Treasure Map", "Blueprint", "Stethoscope", "Syringe",
      // New
      "Typewriter", "Gramophone", "Metronome", "Kaleidoscope", "Periscope",
      "Snow Globe", "Lava Lamp", "Bubble Wrap", "Duct Tape", "Swiss Army Knife",
      "Walkie-Talkie", "Megaphone", "Hearing Aid", "Pacemaker", "Defibrillator",
      "Corkscrew", "Nutcracker", "Garlic Press", "Cheese Grater", "Rolling Pin",
      "Hammock", "Bean Bag", "Rocking Chair", "Chandelier", "Grandfather Clock",
      "Turntable", "Cassette Player", "Floppy Disk", "USB Drive", "Hard Drive",
      "Smoke Detector", "Carbon Monoxide Detector", "Doorbell Camera", "Smart Speaker", "Robot Vacuum",
      "Waffle Iron", "Espresso Machine", "Instant Pot", "Air Fryer", "Rice Cooker",
      "Punching Bag", "Resistance Band", "Foam Roller", "Jump Rope", "Kettlebell",
      "Lightsaber", "Magic Wand", "Crystal Ball", "Ouija Board", "Dream Catcher",
      "Monocle", "Top Hat", "Cane", "Pocket Watch", "Music Box",
    ],
  },
  {
    name: "Celebrities",
    words: [
      "Drake", "Beyoncé", "Elon Musk", "Taylor Swift", "The Rock", "Kim Kardashian",
      "Cristiano Ronaldo", "Rihanna", "MrBeast", "Oprah", "Snoop Dogg", "Zendaya",
      "Kevin Hart", "Lionel Messi", "Billie Eilish", "Ariana Grande", "Ed Sheeran",
      "Harry Styles", "Dua Lipa", "Bad Bunny", "BTS", "Cardi B", "Post Malone",
      "Ryan Reynolds", "Chris Evans", "Tom Holland", "Pedro Pascal", "Timothée Chalamet",
      "Margot Robbie", "Sydney Sweeney", "Florence Pugh", "Jacob Elordi",
      "Sabrina Carpenter", "Charli XCX", "Olivia Rodrigo", "SZA", "Travis Scott",
      "Simone Biles", "LeBron James", "Novak Djokovic", "Carlos Alcaraz",
      "Jeff Bezos", "Mark Zuckerberg", "Tim Cook",
      // New
      "Keanu Reeves", "Robert Downey Jr.", "Chris Hemsworth", "Scarlett Johansson", "Leonardo DiCaprio",
      "Jennifer Lawrence", "Emma Stone", "Gal Gadot", "Jason Momoa", "Henry Cavill",
      "Will Smith", "Morgan Freeman", "Denzel Washington", "Tom Hanks", "Brad Pitt",
      "Angelina Jolie", "Sandra Bullock", "Meryl Streep", "Julia Roberts", "Nicole Kidman",
      "Lady Gaga", "Justin Bieber", "Kanye West", "Shakira", "Adele",
      "Selena Gomez", "Miley Cyrus", "Katy Perry", "Bruno Mars", "The Weeknd",
      "Virat Kohli", "MS Dhoni", "Sachin Tendulkar", "Roger Federer", "Serena Williams",
      "Usain Bolt", "Michael Phelps", "Tiger Woods", "Lewis Hamilton", "Conor McGregor",
      "Gordon Ramsay", "David Beckham", "Kylie Jenner", "Gigi Hadid", "Bella Hadid",
      "Barack Obama", "Queen Elizabeth", "Princess Diana", "Nelson Mandela", "Malala Yousafzai",
      "Albert Einstein", "Stephen Hawking", "Steve Jobs", "Bill Gates", "Warren Buffett",
      "Dwayne Johnson", "Vin Diesel", "Ice Cube", "Samuel L. Jackson", "Idris Elba",
    ],
  },
  {
    name: "Brands",
    words: [
      "Nike", "Apple", "McDonald's", "Tesla", "Google", "Netflix", "IKEA",
      "Coca-Cola", "Supreme", "Gucci", "Amazon", "PlayStation", "Red Bull", "Spotify", "Starbucks",
      "Louis Vuitton", "Rolex", "Ferrari", "Lamborghini", "Porsche",
      "Adidas", "Puma", "New Balance", "Balenciaga", "Off-White",
      "Disney", "Marvel", "DC", "Warner Bros", "Universal",
      "Samsung", "Sony", "Microsoft", "Intel", "NVIDIA",
      "Uber", "Airbnb", "Tinder", "Snapchat", "Instagram",
      "Zara", "H&M", "Uniqlo", "Levi's", "Ralph Lauren",
      "Tata", "Infosys", "Wipro", "Reliance", "Jio",
      "Flipkart", "Swiggy", "Zomato", "Ola", "BYJU'S",
      "Amul", "Parle", "Haldiram's", "MTR", "Paper Boat",
      "Tanishq", "Titan", "Bajaj", "Hero", "Mahindra",
      // New
      "WhatsApp", "YouTube", "TikTok", "Twitter", "LinkedIn",
      "Pinterest", "Reddit", "Telegram", "Signal", "Discord",
      "Chanel", "Hermès", "Prada", "Dior", "Versace",
      "BMW", "Audi", "Mercedes-Benz", "Rolls-Royce", "Bugatti",
      "Nintendo", "Xbox", "Steam", "Epic Games", "Riot Games",
      "Walmart", "Target", "Costco", "Whole Foods", "Trader Joe's",
      "FedEx", "DHL", "UPS", "PayPal", "Visa",
      "Mastercard", "American Express", "JPMorgan", "Goldman Sachs", "Bloomberg",
      "CNN", "BBC", "Reuters", "ESPN", "National Geographic",
      "Lego", "Mattel", "Hot Wheels", "Nerf", "Barbie",
    ],
  },
  {
    name: "Countries & Cities",
    words: [
      "Tokyo", "Brazil", "Paris", "Dubai", "New York", "Egypt", "London",
      "Australia", "Mexico", "Bangkok", "Iceland", "Rome", "Jamaica", "Singapore", "Morocco",
      "Mumbai", "Delhi", "Bangalore", "Kolkata", "Chennai", "Hyderabad",
      "Goa", "Jaipur", "Varanasi", "Udaipur", "Kashmir",
      "Seoul", "Shanghai", "Hong Kong", "Taipei", "Kuala Lumpur",
      "Amsterdam", "Barcelona", "Prague", "Vienna", "Istanbul",
      "Toronto", "Sydney", "Cape Town", "Buenos Aires", "Rio de Janeiro",
      "Las Vegas", "Los Angeles", "Chicago", "Miami", "San Francisco",
      "Athens", "Lisbon", "Santorini", "Maldives", "Bali",
      "Antarctica", "Alaska", "Sahara", "Amazon", "Siberia",
      // New
      "Berlin", "Munich", "Zurich", "Geneva", "Monaco",
      "Dublin", "Edinburgh", "Oslo", "Stockholm", "Helsinki",
      "Moscow", "St. Petersburg", "Beijing", "Kyoto", "Osaka",
      "Hanoi", "Ho Chi Minh City", "Phnom Penh", "Manila", "Jakarta",
      "Nairobi", "Lagos", "Cairo", "Marrakech", "Casablanca",
      "Havana", "Lima", "Bogota", "Santiago", "Cancun",
      "India", "Japan", "Germany", "Canada", "Switzerland",
      "Norway", "Sweden", "Denmark", "Finland", "New Zealand",
      "Thailand", "Vietnam", "Philippines", "Malaysia", "Indonesia",
      "Kenya", "South Africa", "Nigeria", "Tanzania", "Ethiopia",
      "Peru", "Colombia", "Argentina", "Chile", "Cuba",
      "Portugal", "Greece", "Croatia", "Hungary", "Poland",
    ],
  },
  {
    name: "Movies & TV Shows",
    words: [
      "Stranger Things", "Inception", "The Office", "Squid Game", "Titanic",
      "Breaking Bad", "Avatar", "Friends", "Wednesday", "Interstellar",
      "Game of Thrones", "Shrek", "The Batman", "One Piece", "Parasite",
      "Oppenheimer", "Barbie", "Dune", "Top Gun Maverick", "Everything Everywhere",
      "The Bear", "Severance", "White Lotus", "Succession", "Euphoria",
      "Ted Lasso", "Abbott Elementary", "The Last of Us", "House of the Dragon",
      "Peaky Blinders", "Ozark", "Mindhunter", "Dark", "Money Heist",
      "Sacred Games", "Mirzapur", "Delhi Crime", "Scam 1992", "Panchayat",
      "The Family Man", "Kota Factory", "Farzi", "Paatal Lok",
      "3 Idiots", "Dangal", "Sholay", "Dilwale Dulhania Le Jayenge", "RRR",
      "Bahubali", "KGF", "Pushpa", "Pathaan", "Animal",
      // New
      "The Godfather", "Pulp Fiction", "Fight Club", "The Matrix", "Forrest Gump",
      "The Shawshank Redemption", "Goodfellas", "Gladiator", "Saving Private Ryan", "Schindler's List",
      "Jurassic Park", "Harry Potter", "Lord of the Rings", "Star Wars", "Indiana Jones",
      "The Avengers", "Spider-Man", "Black Panther", "Guardians of the Galaxy", "Iron Man",
      "Frozen", "Toy Story", "Finding Nemo", "Inside Out", "The Lion King",
      "The Mandalorian", "Loki", "Wandavision", "Ahsoka", "Andor",
      "Narcos", "Vikings", "Sherlock", "Black Mirror", "The Crown",
      "The Witcher", "Cobra Kai", "Yellowstone", "Outer Banks", "Bridgerton",
      "Better Call Saul", "Mr. Robot", "Fargo", "True Detective", "Westworld",
      "Lagaan", "Swades", "Dil Chahta Hai", "Gangs of Wasseypur", "Andhadhun",
    ],
  },
  {
    name: "Internet Culture",
    words: [
      "Among Us", "Skibidi", "Sigma", "Rizz", "Minecraft", "Fortnite",
      "TikTok", "Meme", "Discord Mod", "Brainrot",
      "NPC", "Slay", "No Cap", "Bussin", "Sheesh",
      "Ratio", "Touch Grass", "Based", "Cringe", "Vibe Check",
      "Caught in 4K", "It's Giving", "Understood the Assignment",
      "Main Character", "Rent Free", "Red Flag", "Green Flag", "Situationship",
      "Ghosting", "Soft Launch", "Delulu", "Beige Flag", "Ick",
      "FOMO", "YOLO", "IYKYK", "POV", "Era",
      "Lowkey", "Highkey", "Slaps", "Hits Different", "Core",
      "Dark Mode", "Spam Liking", "Story Viewer", "Finsta", "Dump Account",
      // New
      "L + Ratio", "W", "Cope", "Seethe", "Mald",
      "Boomer", "Zoomer", "Gen Alpha", "iPad Kid", "Chronically Online",
      "Side Quest", "Lore Drop", "Plot Armor", "Character Arc", "Canon Event",
      "Roman Empire", "Aura Points", "Looksmaxxing", "Mewing", "Mogging",
      "Unhinged", "Feral", "Gaslight Gatekeep Girlboss", "Pick Me", "Not Like Other Girls",
      "Tea", "Spill", "Snatched", "Iconic", "Periodt",
      "Doomscrolling", "Doom Posting", "Rage Bait", "Engagement Farming", "Bot Account",
      "Deepfake", "AI Art", "ChatGPT", "Prompt Engineer", "Digital Nomad",
      "Speedrun", "Any%", "Glitchless", "World Record", "Let's Go",
      "Twitch Chat", "Poggers", "KEKW", "Sadge", "Copium",
      "Stan", "Simp", "Parasocial", "Content Creator", "Influencer",
      "Clickbait", "Algorithm", "Shadow Banned", "Viral", "Going Viral",
    ],
  },
  {
    name: "Music & Bands",
    words: [
      "The Beatles", "BTS", "Nirvana", "Coldplay", "Eminem", "Daft Punk",
      "Arctic Monkeys", "Kanye West", "ABBA", "Travis Scott", "Queen",
      "Linkin Park", "Bad Bunny", "Doja Cat", "Kendrick Lamar",
      "Taylor Swift", "Beyoncé", "Drake", "Rihanna", "Ed Sheeran",
      "The Weeknd", "Harry Styles", "Olivia Rodrigo", "Billie Eilish",
      "Sabrina Carpenter", "Charli XCX", "SZA", "Tyler the Creator",
      "Frank Ocean", "Childish Gambino", "J. Cole", "Cardi B", "Nicki Minaj",
      "Led Zeppelin", "Pink Floyd", "Rolling Stones", "AC/DC", "Metallica",
      "Radiohead", "Fleetwood Mac", "Elton John", "David Bowie", "Prince",
      "Michael Jackson", "Madonna", "Whitney Houston", "Mariah Carey",
      "AR Rahman", "Arijit Singh", "Shreya Ghoshal", "Sonu Nigam",
      "Lata Mangeshkar", "Kishore Kumar", "Mohammed Rafi",
      "Nucleya", "Divine", "Raftaar", "Badshah", "Yo Yo Honey Singh",
      // New
      "Imagine Dragons", "Maroon 5", "OneRepublic", "Panic! At The Disco", "Fall Out Boy",
      "Twenty One Pilots", "Gorillaz", "Tame Impala", "The 1975", "Glass Animals",
      "Lil Nas X", "Jack Harlow", "Metro Boomin", "21 Savage", "Future",
      "Megan Thee Stallion", "Ice Spice", "Dua Lipa", "Rosalía", "Anitta",
      "Green Day", "Blink-182", "Red Hot Chili Peppers", "Foo Fighters", "Weezer",
      "Guns N' Roses", "U2", "Bon Jovi", "Aerosmith", "Depeche Mode",
      "Avicii", "Marshmello", "Calvin Harris", "Kygo", "Martin Garrix",
      "Sunidhi Chauhan", "Neha Kakkar", "Armaan Malik", "Darshan Raval", "Jubin Nautiyal",
      "Pritam", "Vishal-Shekhar", "Shankar Ehsaan Loy", "Amit Trivedi", "Anu Malik",
      "Bob Marley", "Bob Dylan", "Jimi Hendrix", "Stevie Wonder", "Aretha Franklin",
    ],
  },
  {
    name: "Bollywood",
    words: [
      "Shah Rukh Khan", "Amitabh Bachchan", "Alia Bhatt", "Ranveer Singh",
      "Deepika Padukone", "Salman Khan", "Hrithik Roshan", "Kareena Kapoor",
      "Ranbir Kapoor", "Akshay Kumar", "Priyanka Chopra", "Arijit Singh",
      "Katrina Kaif", "Virat Kohli", "Aamir Khan",
      "Madhuri Dixit", "Kajol", "Rekha", "Sridevi", "Hema Malini",
      "Rajinikanth", "Kamal Haasan", "Vijay", "Allu Arjun", "Prabhas",
      "Ram Charan", "Jr. NTR", "Yash", "Diljit Dosanjh", "Taapsee Pannu",
      "Kartik Aaryan", "Tiger Shroff", "Janhvi Kapoor", "Ananya Panday",
      "Dilwale Dulhania Le Jayenge", "Sholay", "Mughal-E-Azam", "Mother India",
      "3 Idiots", "Dangal", "Lagaan", "Swades", "Dil Chahta Hai",
      "Kabhi Khushi Kabhie Gham", "Kal Ho Na Ho", "Jab We Met",
      "RRR", "Bahubali", "KGF", "Pushpa", "Pathaan", "Animal", "Jawan",
      // New
      "Dharmendra", "Dilip Kumar", "Dev Anand", "Raj Kapoor", "Shammi Kapoor",
      "Mithun Chakraborty", "Anil Kapoor", "Govinda", "Jackie Shroff", "Sunny Deol",
      "Vidya Balan", "Kangana Ranaut", "Kriti Sanon", "Shraddha Kapoor", "Sara Ali Khan",
      "Varun Dhawan", "Ayushmann Khurrana", "Rajkummar Rao", "Vicky Kaushal", "Sidharth Malhotra",
      "Nawazuddin Siddiqui", "Manoj Bajpayee", "Pankaj Tripathi", "Irrfan Khan", "Naseeruddin Shah",
      "Gangs of Wasseypur", "Andhadhun", "Barfi", "Queen", "Zindagi Na Milegi Dobara",
      "Rang De Basanti", "Taare Zameen Par", "PK", "Bajrangi Bhaijaan", "Sultan",
      "Thalapathy Vijay", "Suriya", "Dhanush", "Mahesh Babu", "Nani",
      "Samantha Ruth Prabhu", "Nayanthara", "Rashmika Mandanna", "Pooja Hegde", "Kiara Advani",
      "Hera Pheri", "Chak De India", "Munna Bhai MBBS", "Golmaal", "Dhamaal",
    ],
  },
  {
    name: "Food",
    words: [
      "Pizza", "Sushi", "Burger", "Biryani", "Tacos", "Ramen", "Pasta",
      "Fried Chicken", "Dim Sum", "Kebab", "Shawarma", "Pho", "Pad Thai",
      "Samosa", "Pani Puri", "Vada Pav", "Butter Chicken", "Dal Makhani",
      "Masala Dosa", "Chole Bhature", "Rajma Chawal", "Pav Bhaji",
      "Gulab Jamun", "Jalebi", "Rasgulla", "Halwa", "Kheer",
      "Cheesecake", "Tiramisu", "Croissant", "Macaron", "Crème Brûlée",
      "Steak", "Paella", "Fish and Chips", "Pretzel", "Waffle",
      "Cotton Candy", "Churro", "Nachos", "Hot Dog", "Popcorn",
      "Milkshake", "Bubble Tea", "Masala Chai", "Lassi", "Espresso",
      // New
      "Falafel", "Hummus", "Baklava", "Gyros", "Moussaka",
      "Pancake", "French Toast", "Bagel", "Donut", "Muffin",
      "Spaghetti", "Lasagna", "Risotto", "Gnocchi", "Ravioli",
      "Tom Yum", "Spring Rolls", "Satay", "Nasi Goreng", "Laksa",
      "Tandoori Chicken", "Paneer Tikka", "Naan", "Paratha", "Idli",
      "Kulfi", "Rabri", "Mysore Pak", "Kaju Katli", "Ladoo",
      "Banana Split", "Gelato", "Sorbet", "Pavlova", "Trifle",
      "Fondue", "Bruschetta", "Carpaccio", "Ceviche", "Tempura",
      "Beef Wellington", "Lobster", "Caviar", "Truffle", "Foie Gras",
      "Mango Lassi", "Coconut Water", "Kombucha", "Matcha Latte", "Turkish Coffee",
      "Avocado Toast", "Acai Bowl", "Granola", "Smoothie Bowl", "Protein Shake",
    ],
  },
  {
    name: "Sports",
    words: [
      "Cricket", "Football", "Basketball", "Tennis", "Badminton",
      "Kabaddi", "Wrestling", "Boxing", "Swimming", "Gymnastics",
      "Formula 1", "Golf", "Table Tennis", "Volleyball", "Hockey",
      "Rugby", "Baseball", "Surfing", "Skiing", "Skateboarding",
      "MMA", "Judo", "Taekwondo", "Archery", "Fencing",
      "Cycling", "Marathon", "Triathlon", "Weightlifting", "Powerlifting",
      "IPL", "FIFA World Cup", "Olympics", "Tour de France", "Wimbledon",
      "Super Bowl", "NBA Finals", "Champions League", "Indian Premier League",
      "Pro Kabaddi League", "Kho-Kho", "Polo", "Equestrian", "Rowing",
      // New
      "UFC", "WWE", "Handball", "Water Polo", "Lacrosse",
      "Ice Hockey", "Figure Skating", "Snowboarding", "Bobsled", "Curling",
      "Rock Climbing", "Bouldering", "Parkour", "CrossFit", "Yoga",
      "Esports", "Chess", "Poker", "Darts", "Snooker",
      "Motor GP", "NASCAR", "Rally Racing", "Drag Racing", "Go-Karting",
      "Long Jump", "High Jump", "Shot Put", "Javelin", "Decathlon",
      "Sumo", "Karate", "Kung Fu", "Capoeira", "Muay Thai",
      "Canoeing", "Kayaking", "Sailing", "Windsurfing", "Kiteboarding",
      "Australian Open", "US Open", "French Open", "World Series", "Stanley Cup",
      "Commonwealth Games", "Asian Games", "Ryder Cup", "Davis Cup", "World Cup",
      "Cricket World Cup", "T20 World Cup", "Ashes", "IPL Final", "El Clasico", "Grand Slam",
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
