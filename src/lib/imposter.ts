// Imposter game logic and data
export interface ImposterCategory {
  name: string;
  words: string[];
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
      "Elon Musk", "Jeff Bezos", "Mark Zuckerberg", "Tim Cook",
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
      // Indian brands
      "Tata", "Infosys", "Wipro", "Reliance", "Jio",
      "Flipkart", "Swiggy", "Zomato", "Ola", "BYJU'S",
      "Amul", "Parle", "Haldiram's", "MTR", "Paper Boat",
      "Tanishq", "Titan", "Bajaj", "Hero", "Mahindra",
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
      // Indian
      "Sacred Games", "Mirzapur", "Delhi Crime", "Scam 1992", "Panchayat",
      "The Family Man", "Kota Factory", "Farzi", "Paatal Lok",
      "3 Idiots", "Dangal", "Sholay", "Dilwale Dulhania Le Jayenge", "RRR",
      "Bahubali", "KGF", "Pushpa", "Pathaan", "Animal",
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
      // Indian music
      "AR Rahman", "Arijit Singh", "Shreya Ghoshal", "Sonu Nigam",
      "Lata Mangeshkar", "Kishore Kumar", "Mohammed Rafi",
      "Nucleya", "Divine", "Raftaar", "Badshah", "Yo Yo Honey Singh",
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
