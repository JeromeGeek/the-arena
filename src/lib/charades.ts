// Charades — game logic and word banks

export interface CharadesCategory {
  name: string;
  words: string[];
}

export const charadesCategories: CharadesCategory[] = [
  {
    name: "Movies",
    words: [
      // Hollywood classics & blockbusters
      "Titanic", "Jaws", "Frozen", "Inception", "Rocky", "Shrek", "Avatar",
      "Spider-Man", "Gladiator", "Jurassic Park", "The Matrix", "Finding Nemo",
      "Harry Potter", "Star Wars", "The Lion King", "Batman", "Top Gun",
      "Transformers", "Toy Story", "Indiana Jones", "The Avengers", "Black Panther",
      "The Dark Knight", "Interstellar", "Forrest Gump", "The Godfather", "Pulp Fiction",
      "Goodfellas", "The Shawshank Redemption", "Fight Club", "The Silence of the Lambs",
      "Schindler's List", "Saving Private Ryan", "Braveheart", "The Terminator",
      "Back to the Future", "E.T.", "Home Alone", "Die Hard", "Scarface",
      "Pirates of the Caribbean", "The Notebook", "Grease", "Dirty Dancing",
      "Mean Girls", "Clueless", "Legally Blonde", "Bridesmaids", "The Hangover",
      "Superbad", "Anchorman", "Step Brothers", "Elf", "Zoolander",
      "Moana", "Coco", "Soul", "Up", "WALL-E", "Ratatouille", "The Incredibles",
      "Despicable Me", "Minions", "Kung Fu Panda", "Ice Age", "Encanto",
      "Doctor Strange", "Thor", "Iron Man", "Aquaman", "Wonder Woman",
      "Black Widow", "Captain America", "Venom", "Deadpool", "Wolverine",
      "Joker", "Oppenheimer", "Barbie", "Dune", "Everything Everywhere",
      "Top Gun Maverick", "The Batman", "Uncharted", "Sonic the Hedgehog",
      "Ghostbusters", "The Mummy", "Night at the Museum", "Paddington",
      "Paddington 2", "The Grand Budapest Hotel", "Parasite", "Knives Out",
      "Glass Onion", "Tenet", "The Prestige", "Memento", "Shutter Island",
      // Bollywood
      "Dilwale Dulhania Le Jayenge", "Sholay", "3 Idiots", "Dangal",
      "Mughal-E-Azam", "Deewar", "Mother India", "Lagaan", "Swades",
      "Rang De Basanti", "Dil Chahta Hai", "Zindagi Na Milegi Dobara",
      "Kabhi Khushi Kabhie Gham", "Kal Ho Na Ho", "Jab We Met",
      "Chennai Express", "PK", "Bajrangi Bhaijaan", "Sultan", "Dhoom",
      "Don", "Gangs of Wasseypur", "Devdas", "Omkara", "RRR",
      "Bahubali", "KGF", "Pushpa", "Pathaan", "Animal", "Jawan",
      "Queen", "Highway", "Andhadhun", "Article 15", "Tumhari Sulu",
      "Taare Zameen Par", "English Vinglish", "Neerja", "Pink",
    ],
  },
  {
    name: "Animals",
    words: [
      "Penguin", "Elephant", "Snake", "Monkey", "Kangaroo", "Giraffe", "Crab",
      "Eagle", "Octopus", "Frog", "Shark", "Flamingo", "Gorilla", "Butterfly",
      "Chicken", "Horse", "Dolphin", "Cat", "Dog", "Bear", "Sloth", "Panda",
      "Koala", "Cheetah", "Lion", "Tiger", "Zebra", "Hippo", "Rhino", "Crocodile",
      "Alligator", "Chameleon", "Iguana", "Parrot", "Toucan", "Pelican", "Stork",
      "Ostrich", "Emu", "Platypus", "Armadillo", "Hedgehog", "Porcupine",
      "Beaver", "Otter", "Seal", "Walrus", "Polar Bear", "Arctic Fox", "Snow Leopard",
      "Chimpanzee", "Orangutan", "Baboon", "Meerkat", "Mongoose", "Hyena",
      "Warthog", "Gazelle", "Antelope", "Bison", "Buffalo", "Moose", "Elk",
      "Reindeer", "Camel", "Llama", "Alpaca", "Donkey", "Mule", "Pony",
      "Rooster", "Turkey", "Peacock", "Owl", "Bat", "Flying Squirrel",
      "Hamster", "Guinea Pig", "Rabbit", "Ferret", "Raccoon", "Skunk",
      // More animals
      "Wolverine", "Mandrill", "Tapir", "Okapi", "Pangolin", "Aardvark",
      "Capybara", "Jaguar", "Puma", "Lynx", "Bobcat", "Ocelot",
      "Narwhal", "Beluga Whale", "Blue Whale", "Orca", "Manatee", "Dugong",
      "Stingray", "Manta Ray", "Hammerhead Shark", "Great White Shark",
      "Sea Turtle", "Leatherback Turtle", "Komodo Dragon", "Gecko",
      "Salamander", "Axolotl", "Piranha", "Clownfish", "Pufferfish",
      "Starfish", "Jellyfish", "Sea Horse", "Lobster", "Squid",
      "Praying Mantis", "Scorpion", "Tarantula", "Dragonfly", "Firefly",
      "Hummingbird", "Kiwi", "Cassowary", "Albatross", "Pelican",
      // Indian animals
      "Indian Elephant", "Bengal Tiger", "Indian Cobra", "King Cobra",
      "Indian Peacock", "Indian Rhinoceros", "Ganges River Dolphin",
      "Indian Leopard", "Nilgai", "Blackbuck", "Chinkara", "Indian Bison",
      "Gharial", "Mugger Crocodile", "Monitor Lizard", "Indian Python",
      "Macaque", "Langur", "Indian Flying Fox", "Great Hornbill",
    ],
  },
  {
    name: "Actions",
    words: [
      "Swimming", "Surfing", "Cooking", "Fishing", "Dancing", "Boxing",
      "Painting", "Driving", "Sleeping", "Skydiving", "Yoga", "Karate",
      "Singing", "Running", "Typing", "Juggling", "Sneezing", "Climbing",
      "Weightlifting", "Archery", "Skateboarding", "Snowboarding", "Skiing",
      "Rollerblading", "Hula Hooping", "Jump Roping", "Tightrope Walking",
      "Breakdancing", "Moonwalking", "Somersaulting", "Cartwheeling", "Handstanding",
      "Meditating", "Knitting", "Sewing", "Ironing", "Vacuuming", "Mopping",
      "Gardening", "Mowing", "Chopping Wood", "Hammering", "Sawing",
      "Playing Guitar", "Playing Drums", "Playing Piano", "Playing Violin",
      "Conducting", "Cheerleading", "Baton Twirling", "Synchronized Swimming",
      "Fencing", "Pole Vaulting", "Javelin Throwing", "Shot Putting", "Discus Throwing",
      "High Jumping", "Long Jumping", "Hurdles", "Rowing", "Kayaking", "Rafting",
      "Rock Climbing", "Bungee Jumping", "Paragliding", "Hang Gliding", "Zip Lining",
      // More actions
      "Texting", "Selfie Taking", "Scrolling Phone", "Video Calling",
      "Brushing Teeth", "Flossing", "Shaving", "Applying Makeup",
      "Eating Spaghetti", "Eating Sushi", "Slurping Noodles", "Cracking Eggs",
      "Chopping Onions", "Stirring a Pot", "Tasting Food", "Blowing Candles",
      "Wrapping a Gift", "Opening a Present", "Blowing Balloons",
      "Building Sandcastle", "Flying a Kite", "Walking a Dog",
      "Chasing a Butterfly", "Catching a Fish", "Rowing a Boat",
      "Paddling a Canoe", "Surfing a Wave", "Building a Snowman",
      "Making Snow Angels", "Sledding", "Ice Skating", "Roller Skating",
      "Hailing a Taxi", "Boarding a Bus", "Missing a Train",
      "Reading a Map", "Taking a Photo", "Pointing at Stars",
      "Whispering", "Yawning", "Stretching", "Tripping", "Ducking",
      // Indian actions
      "Playing Cricket", "Doing Namaste", "Applying Bindi", "Wearing Saree",
      "Doing Garba", "Playing Dhol", "Eating with Hands", "Bargaining",
      "Riding Auto Rickshaw", "Haggling at Market", "Doing Pooja",
      "Playing Kabaddi", "Doing Bhangra", "Cooking Roti", "Making Chai",
    ],
  },
  {
    name: "Celebrities",
    words: [
      "Michael Jackson", "Beyoncé", "Elvis Presley", "The Rock", "Taylor Swift",
      "Cristiano Ronaldo", "Oprah", "Arnold Schwarzenegger", "Usain Bolt",
      "Bob Marley", "Marilyn Monroe", "Elon Musk", "Muhammad Ali",
      "Freddie Mercury", "Snoop Dogg", "Lady Gaga", "Bruce Lee",
      "Charlie Chaplin", "Shakira", "Drake", "Rihanna", "Eminem", "Jay-Z",
      "Kanye West", "Nicki Minaj", "Cardi B", "Post Malone", "Ed Sheeran",
      "Justin Bieber", "Harry Styles", "Billie Eilish", "Ariana Grande",
      "Bruno Mars", "The Weeknd", "Dua Lipa", "Bad Bunny", "BTS",
      "LeBron James", "Michael Jordan", "Kobe Bryant", "Lionel Messi",
      "Serena Williams", "Tiger Woods", "Floyd Mayweather", "Conor McGregor",
      "Will Smith", "Leonardo DiCaprio", "Tom Hanks", "Meryl Streep",
      "Brad Pitt", "Angelina Jolie", "Jennifer Aniston", "Johnny Depp",
      "Ryan Reynolds", "Chris Evans", "Robert Downey Jr.", "Scarlett Johansson",
      "Zendaya", "Timothée Chalamet", "Dwayne Johnson", "Kevin Hart",
      // Indian celebrities
      "Shah Rukh Khan", "Ranveer Singh", "Deepika Padukone", "Priyanka Chopra",
      "Amitabh Bachchan", "Virat Kohli", "Sachin Tendulkar", "MS Dhoni",
      "Rohit Sharma", "Hardik Pandya", "Neeraj Chopra", "PV Sindhu",
      "Sania Mirza", "Mary Kom", "Abhinav Bindra", "Saina Nehwal",
      "Aamir Khan", "Salman Khan", "Akshay Kumar", "Hrithik Roshan",
      "Ranbir Kapoor", "Alia Bhatt", "Katrina Kaif", "Kajol",
      "Madhuri Dixit", "Rekha", "Sridevi", "Hema Malini",
      "Rajinikanth", "Kamal Haasan", "Vijay", "Prabhas",
      "Allu Arjun", "Ram Charan", "Jr. NTR", "Yash",
      "AR Rahman", "Shreya Ghoshal", "Lata Mangeshkar", "Kishore Kumar",
      "Narendra Modi", "APJ Abdul Kalam", "Ratan Tata", "Mukesh Ambani",
      // More global
      "Adele", "Sam Smith", "Lizzo", "Olivia Rodrigo", "Sabrina Carpenter",
      "Charli XCX", "Ice Spice", "Travis Scott", "SZA", "Tyler the Creator",
      "Pedro Pascal", "Sydney Sweeney", "Ana de Armas", "Florence Pugh",
      "Andrew Garfield", "Tom Holland", "Jacob Elordi", "Austin Butler",
      "Novak Djokovic", "Carlos Alcaraz", "Naomi Osaka", "Emma Raducanu",
      "Simone Biles", "Sha'Carri Richardson", "Noah Lyles",
    ],
  },
  {
    name: "Professions",
    words: [
      "Doctor", "Firefighter", "Chef", "Pilot", "Detective", "Teacher",
      "Astronaut", "Magician", "DJ", "Dentist", "Lifeguard", "Farmer",
      "Photographer", "Surgeon", "Barber", "Mechanic", "Plumber",
      "Electrician", "Waiter", "Painter", "Architect", "Engineer", "Lawyer",
      "Judge", "Police Officer", "Soldier", "Sailor", "Pirate", "Knight",
      "Ninja", "Samurai", "Cowboy", "Zookeeper", "Veterinarian", "Nurse",
      "Pharmacist", "Therapist", "Scientist", "Chemist", "Physicist",
      "Biologist", "Geologist", "Archaeologist", "Historian", "Librarian",
      "Journalist", "News Anchor", "Weather Forecaster", "Actor", "Director",
      "Producer", "Screenwriter", "Animator", "Game Developer", "Hacker",
      "Data Scientist", "Astronomer", "Marine Biologist", "Ecologist",
      "Lumberjack", "Miner", "Fisher", "Hunter", "Blacksmith", "Potter",
      // More professions
      "Influencer", "Youtuber", "Podcaster", "Streamer", "Content Creator",
      "Social Media Manager", "UX Designer", "Product Manager", "Startup Founder",
      "Venture Capitalist", "Stock Broker", "Accountant", "Auditor",
      "Real Estate Agent", "Insurance Agent", "Travel Agent", "Tour Guide",
      "Flight Attendant", "Air Traffic Controller", "Ship Captain", "Submarine Officer",
      "Food Critic", "Wine Sommelier", "Pastry Chef", "Sushi Chef", "Butcher",
      "Florist", "Taxidermist", "Embalmer", "Mortician", "Coroner",
      "Forensic Scientist", "Crime Scene Investigator", "Spy", "Secret Agent",
      "Bounty Hunter", "Mercenary", "Gladiator", "Jockey", "Bullfighter",
      "Stuntperson", "Stand-up Comedian", "Ventriloquist", "Fire Eater",
      "Circus Performer", "Trapeze Artist", "Sword Swallower", "Escape Artist",
      // Indian professions
      "Auto Rickshaw Driver", "Chai Wallah", "Dabbawaala", "Pandit",
      "Astrologer", "Ayurvedic Doctor", "Classical Dancer", "Tabla Player",
      "Sitar Player", "Cricket Coach", "Bollywood Choreographer",
      "IAS Officer", "IPS Officer", "Software Engineer at TCS",
      "Call Center Agent", "Street Food Vendor", "Paanwala",
    ],
  },
  {
    name: "Objects",
    words: [
      "Umbrella", "Scissors", "Ladder", "Guitar", "Telescope", "Microwave",
      "Trampoline", "Skateboard", "Balloon", "Chainsaw", "Vacuum Cleaner",
      "Toothbrush", "Sword", "Binoculars", "Parachute", "Blender",
      "Treadmill", "Camera", "Compass", "Piano", "Washing Machine", "Dishwasher",
      "Refrigerator", "Air Conditioner", "Lawnmower", "Pressure Washer",
      "Power Drill", "Jackhammer", "Sledgehammer", "Crowbar", "Wrench",
      "Screwdriver", "Shovel", "Pickaxe", "Hoe", "Rake", "Wheelbarrow",
      "Fire Extinguisher", "Traffic Cone", "Speed Bump", "Parking Meter",
      "Mailbox", "Vending Machine", "ATM", "Slot Machine", "Pinball Machine",
      "Arcade Machine", "Bowling Ball", "Pool Cue", "Dart", "Frisbee",
      "Boomerang", "Yo-Yo", "Slinky", "Fidget Spinner", "Rubik's Cube",
      "Magnifying Glass", "Microscope", "Stethoscope", "X-Ray Machine",
      "Wheelchair", "Crutches", "Cast", "Syringe", "Thermometer", "Scale",
      // More objects
      "Selfie Stick", "Ring Light", "Tripod", "Drone", "GoPro",
      "VR Headset", "Gaming Controller", "Mechanical Keyboard", "Fidget Cube",
      "Bluetooth Speaker", "Earbuds", "Smart Watch", "Tablet",
      "Projector", "Whiteboard", "Stapler", "Paper Shredder", "Laminator",
      "Cash Register", "Credit Card Machine", "Ticket Machine",
      "Surfboard", "Wakeboard", "Snowboard", "Snowshoes", "Ski Poles",
      "Sleeping Bag", "Tent", "Compass", "Canteen", "Backpack",
      "Life Jacket", "Snorkel", "Flippers", "Wetsuit", "Diving Tank",
      "Lightsaber", "Wand", "Staff", "Trident", "Crossbow", "Slingshot",
      "Handcuffs", "Magnifying Glass", "Blueprint", "Treasure Map",
      "Spinning Wheel", "Loom", "Pottery Wheel", "Kiln", "Anvil",
      // Indian objects
      "Dhol", "Sitar", "Tabla", "Harmonium", "Veena", "Dholak",
      "Mortar and Pestle", "Belan", "Kadhai", "Pressure Cooker",
      "Tiffin Box", "Steel Glass", "Broom", "Kolam Stencil",
      "Rangoli Plate", "Diyas", "Thali", "Lota",
      "Auto Rickshaw", "Cycle Rickshaw", "Bullock Cart", "Tonga",
    ],
  },
  {
    name: "Sports",
    words: [
      "Basketball", "Tennis", "Golf", "Wrestling", "Bowling", "Hockey",
      "Table Tennis", "Cricket", "Volleyball", "Badminton", "Fencing",
      "Gymnastics", "Figure Skating", "Baseball", "Skiing", "Surfing",
      "Boxing", "Archery", "Rugby", "Karate", "Soccer", "Football",
      "Swimming", "Diving", "Water Polo", "Polo", "Lacrosse", "Field Hockey",
      "Softball", "Curling", "Bobsled", "Luge", "Skeleton", "Biathlon",
      "Cross-Country Skiing", "Ski Jumping", "Speed Skating", "Short Track",
      "Weightlifting", "Powerlifting", "Judo", "Taekwondo",
      "Sumo", "MMA", "Muay Thai", "Brazilian Jiu-Jitsu", "Kickboxing",
      "Rowing", "Canoe", "Kayak", "Sailing", "Windsurfing", "Kitesurfing",
      "Rock Climbing", "Mountain Biking", "BMX", "Motocross", "Rally Racing",
      "Formula 1", "NASCAR", "Drag Racing", "Horse Racing", "Cycling",
      "Triathlon", "Decathlon", "Pentathlon", "Marathon", "Steeplechase",
      // More sports
      "Pickleball", "Padel", "Squash", "Racquetball", "Handball",
      "Ultimate Frisbee", "Disc Golf", "Footvolley", "Sepak Takraw",
      "Parkour", "Freerunning", "Slacklining", "Highlining",
      "Freediving", "Spearfishing", "Underwater Hockey",
      "Chess Boxing", "Axe Throwing", "Knife Throwing",
      "Bull Riding", "Barrel Racing", "Roping",
      "Drone Racing", "Esports", "Speedrunning",
      "CrossFit", "Obstacle Course Racing", "Spartan Race",
      "Arm Wrestling", "Finger Wrestling", "Thumb War",
      "Air Hockey", "Foosball", "Billiards", "Pool", "Snooker",
      "Darts", "Cornhole", "Beer Pong", "Flip Cup",
      // Indian sports
      "Kabaddi", "Kho-Kho", "Gilli-Danda", "Pittu", "Lagori",
      "Pehlwani Wrestling", "Mallakhamba", "Silambam",
      "Cricket IPL", "Pro Kabaddi League", "Badminton Premier League",
      "Polo", "Tent Pegging",
    ],
  },
  {
    name: "Food & Drink",
    words: [
      "Pizza", "Sushi", "Taco", "Burrito", "Waffle", "Donut", "Pretzel",
      "Croissant", "Smoothie", "Milkshake", "Ramen", "Dumpling", "Nachos",
      "Hot Dog", "Popcorn", "Cotton Candy", "Churro", "Crepe", "Biryani",
      "Spaghetti", "Burger", "Cheesecake", "Sandwich", "Steak", "BBQ",
      "Fried Chicken", "Fish and Chips", "Paella", "Curry", "Pho",
      "Pad Thai", "Dim Sum", "Gyoza", "Spring Roll", "Samosa", "Falafel",
      "Kebab", "Shawarma", "Banh Mi", "Poke Bowl", "Acai Bowl",
      "Ice Cream Sundae", "Banana Split", "Crème Brûlée", "Tiramisu",
      "Macarons", "Profiteroles", "Baklava", "Mochi", "Gelato", "Sorbet",
      "Champagne", "Margarita", "Mojito", "Piña Colada", "Espresso",
      "Cappuccino", "Bubble Tea", "Kombucha", "Lemonade", "Hot Chocolate",
      // More international food
      "Tacos Al Pastor", "Elote", "Guacamole", "Churros", "Empanada",
      "Poutine", "Butter Tart", "Nanaimo Bar",
      "Peking Duck", "Dim Sum", "Kung Pao Chicken", "Mapo Tofu",
      "Kimchi", "Bibimbap", "Korean BBQ", "Japchae", "Tteokbokki",
      "Hummus", "Pita", "Tzatziki", "Spanakopita", "Moussaka",
      "Wiener Schnitzel", "Pretzels", "Currywurst", "Black Forest Cake",
      "Croissant", "Baguette", "Escargot", "Bouillabaisse", "Crêpes Suzette",
      "Fish and Chips", "Shepherd's Pie", "Yorkshire Pudding", "Spotted Dick",
      "Pasta Carbonara", "Risotto", "Osso Buco", "Cannoli", "Panna Cotta",
      "Achari Chicken", "Lamb Rogan Josh", "Chicken Tikka Masala",
      // Indian food & drink
      "Butter Chicken", "Dal Makhani", "Palak Paneer", "Chole Bhature",
      "Rajma Chawal", "Pav Bhaji", "Vada Pav", "Pani Puri", "Sev Puri",
      "Bhel Puri", "Dahi Puri", "Ragda Pattice", "Misal Pav",
      "Masala Dosa", "Uttapam", "Idli Sambar", "Rava Dosa", "Set Dosa",
      "Hyderabadi Biryani", "Lucknowi Biryani", "Kolkata Biryani",
      "Paratha", "Aloo Paratha", "Methi Paratha", "Laccha Paratha",
      "Naan", "Tandoori Roti", "Kulcha", "Bhatura",
      "Gulab Jamun", "Rasgulla", "Jalebi", "Halwa", "Kheer",
      "Barfi", "Ladoo", "Peda", "Modak", "Chikki",
      "Chai", "Lassi", "Masala Chai", "Nimbu Pani", "Thandai",
      "Rooh Afza", "Sugarcane Juice", "Coconut Water",
      "Paneer Tikka", "Seekh Kebab", "Tandoori Chicken", "Malai Tikka",
      "Kachori", "Samosa Chaat", "Aloo Tikki", "Papdi Chaat",
      "Litti Chokha", "Dal Baati Churma", "Thepla", "Dhokla", "Handvo",
      "Puttu", "Appam", "Kerala Fish Curry", "Kozhikodan Halwa",
    ],
  },
  {
    name: "Places",
    words: [
      // World landmarks
      "Eiffel Tower", "Big Ben", "Colosseum", "Great Wall of China", "Taj Mahal",
      "Machu Picchu", "Pyramids of Giza", "Stonehenge", "Angkor Wat",
      "Petra", "Chichen Itza", "Easter Island", "Moai Statues",
      "Niagara Falls", "Grand Canyon", "Amazon Rainforest", "Sahara Desert",
      "Mount Everest", "Dead Sea", "Great Barrier Reef", "Galápagos Islands",
      "Northern Lights", "Victoria Falls", "Iguazu Falls",
      "Santorini", "Maldives", "Bora Bora", "Bali",
      "Times Square", "Hollywood", "Las Vegas", "Golden Gate Bridge",
      "Statue of Liberty", "Mount Rushmore", "Yellowstone National Park",
      "Disney World", "Universal Studios",
      // Indian places
      "Red Fort", "Qutub Minar", "Lotus Temple", "India Gate",
      "Gateway of India", "Charminar", "Hawa Mahal", "Amber Fort",
      "Mysore Palace", "Brihadeeswarar Temple", "Meenakshi Temple",
      "Golden Temple", "Varanasi Ghats", "Dal Lake", "Rann of Kutch",
      "Sundarbans", "Kaziranga National Park", "Jim Corbett National Park",
      "Andaman Islands", "Lakshadweep", "Coorg", "Munnar",
      "Jaisalmer", "Udaipur", "Jodhpur", "Pushkar",
      "Rishikesh", "Haridwar", "Manali", "Shimla", "Darjeeling",
      "Ooty", "Kodaikanal", "Hampi", "Gokarna", "Pondicherry",
      "Marine Drive Mumbai", "Juhu Beach", "Lalbagh Botanical Garden",
      "Cubbon Park", "Connaught Place", "Chandni Chowk", "Dilli Haat",
    ],
  },
  {
    name: "TV Shows",
    words: [
      // International
      "Game of Thrones", "Breaking Bad", "Stranger Things", "The Office",
      "Friends", "Seinfeld", "The Simpsons", "South Park", "Family Guy",
      "Brooklyn Nine-Nine", "Parks and Recreation", "Community",
      "The Wire", "The Sopranos", "Dexter", "House of Cards",
      "Narcos", "Ozark", "Mindhunter", "True Detective",
      "Black Mirror", "Westworld", "Lost", "The X-Files", "Fringe",
      "Sherlock", "Doctor Who", "Downton Abbey", "Peaky Blinders",
      "The Crown", "Killing Eve", "Fleabag", "Ted Lasso",
      "Squid Game", "Money Heist", "Dark", "Lupin",
      "Emily in Paris", "Bridgerton", "Euphoria", "Succession",
      "White Lotus", "Severance", "Abbott Elementary", "The Bear",
      "Only Murders in the Building", "Wednesday", "Yellowstone",
      "The Last of Us", "House of the Dragon", "Andor",
      // Indian TV shows
      "Taarak Mehta Ka Ooltah Chashmah", "Kapil Sharma Show",
      "Kaun Banega Crorepati", "Bigg Boss", "Splitsvilla", "Roadies",
      "Sarabhai vs Sarabhai", "Khichdi", "Office Office",
      "CID", "Crime Patrol", "Savdhaan India",
      "Mirzapur", "Sacred Games", "Delhi Crime", "Scam 1992",
      "Panchayat", "Kota Factory", "TVF Pitchers", "Aspirants",
      "Farzi", "The Family Man", "Breathe", "Special Ops",
      "Aarya", "Paatal Lok", "Jamtara", "Asur",
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
