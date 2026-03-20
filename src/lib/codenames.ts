// Codenames word pools — 200 words per difficulty
// Colors are assigned randomly each game, so the same word can be red, blue, bystander, or assassin
export const wordPools = {
  easy: [
    // Animals
    "DOG", "CAT", "FISH", "BIRD", "FROG", "BEAR", "DUCK", "LION", "WOLF", "DEER",
    "HORSE", "MOUSE", "SHEEP", "SNAKE", "TIGER", "WHALE", "EAGLE", "MONKEY", "PARROT", "RABBIT",
    // Nature
    "TREE", "FLOWER", "GRASS", "MOON", "STAR", "SUN", "RAIN", "CLOUD", "ICE", "SNOW",
    "RIVER", "LAKE", "HILL", "ROCK", "SAND", "LEAF", "SEED", "ROSE", "POND", "WAVE",
    // Home & objects
    "HOUSE", "DOOR", "WALL", "BED", "CHAIR", "TABLE", "LAMP", "CUP", "BOWL", "PLATE",
    "CLOCK", "PHONE", "SOAP", "BRUSH", "TOWEL", "SPOON", "FORK", "KNIFE", "POT", "PAN",
    // Food & drink
    "CAKE", "APPLE", "MILK", "EGG", "BREAD", "RICE", "SOUP", "JUICE", "CANDY", "PIE",
    "CHEESE", "GRAPE", "LEMON", "PEACH", "CORN", "BEAN", "HONEY", "JAM", "TOAST", "PIZZA",
    // Body & clothes
    "HAT", "SHOE", "NOSE", "EYE", "HAND", "FOOT", "HAIR", "MOUTH", "RING", "BELT",
    "COAT", "SOCK", "MASK", "BOOT", "NECK", "KNEE", "BONE", "SKIN", "NAIL", "TOOTH",
    // Things & toys
    "BALL", "BOOK", "PEN", "KEY", "DRUM", "GOLD", "FIRE", "WATER", "BABY", "BOAT",
    "KITE", "BELL", "ROPE", "FLAG", "COIN", "CARD", "GAME", "GIFT", "SIGN", "TENT",
    // Places & movement
    "PARK", "FARM", "ROAD", "CITY", "SHOP", "BANK", "POOL", "CAMP", "CAVE", "FORT",
    "BARN", "WELL", "GATE", "PATH", "DOCK", "HALL", "MINE", "NEST", "STEP", "TURN",
    // Actions & concepts
    "KING", "WISH", "SONG", "LOVE", "TRIP", "RACE", "TEAM", "RULE", "LUCK", "JOKE",
    "HERO", "COOK", "RIDE", "SWIM", "JUMP", "HIDE", "PUSH", "PULL", "SPIN", "WINK",
  ],
  medium: [
    // Espionage & mystery
    "AGENT", "SHADOW", "CIPHER", "PHANTOM", "WHISPER", "GHOST", "DECOY", "SLEEPER", "HANDLER", "COVER",
    "DOUBLE", "MOLE", "TRACE", "TARGET", "SAFEHOUSE", "CONTACT", "EXTRACT", "COVERT", "ALIAS", "SIGNAL",
    // Medieval & fantasy
    "CASTLE", "KNIGHT", "CROWN", "THRONE", "DAGGER", "FORGE", "SHIELD", "LANCE", "ARCHER", "MOAT",
    "DUNGEON", "DRAGON", "GOBLIN", "SORCERER", "POTION", "SCROLL", "RUNE", "QUEST", "ORACLE", "CHARM",
    // Nature & elements
    "STORM", "GLACIER", "EMBER", "FLINT", "FLAME", "DRIFT", "COMET", "ARCTIC", "VOLCANO", "CANYON",
    "CORAL", "MARSH", "THORN", "TIMBER", "SUMMIT", "RIDGE", "RAPIDS", "FROST", "GUST", "BLOOM",
    // Animals & creatures
    "RAVEN", "VIPER", "WOLF", "LION", "FALCON", "COBRA", "HAWK", "PANTHER", "JACKAL", "STALLION",
    "MANTIS", "HORNET", "PYTHON", "CONDOR", "RAPTOR", "BADGER", "WOLVERINE", "SCORPION", "PELICAN", "CRANE",
    // Action & skill
    "REBEL", "PILOT", "HUNTER", "RANGER", "SNIPER", "MARSHAL", "CAPTAIN", "SCOUT", "STRIKER", "WARDEN",
    "NOMAD", "OUTLAW", "RAIDER", "SMUGGLER", "TRACKER", "ENFORCER", "GUARDIAN", "CHAMPION", "RIVAL", "VETERAN",
    // Places & structures
    "HARBOR", "BRIDGE", "VAULT", "TOWER", "TEMPLE", "MARKET", "TAVERN", "DEPOT", "BUNKER", "OUTPOST",
    "RUINS", "BARRACKS", "MANOR", "CHAPEL", "BAZAAR", "CITADEL", "HAVEN", "FORTRESS", "ARENA", "GALLOWS",
    // Objects & tools
    "NEEDLE", "TORCH", "ANCHOR", "BLADE", "MIRROR", "COMPASS", "LANTERN", "PRISM", "CHISEL", "GAVEL",
    "HOURGLASS", "QUILL", "SCEPTER", "CHALICE", "GOBLET", "CANNON", "MUSKET", "BANNER", "HELM", "CREST",
    // Concepts & vibes
    "SIREN", "ECHO", "SCALE", "IRON", "JUNGLE", "MIRAGE", "FURY", "VALOR", "OMEN", "DECEIT",
    "SIEGE", "BOUNTY", "VENDETTA", "AMBUSH", "GAMBIT", "BLITZ", "CLASH", "SURGE", "RELIC", "ENIGMA",
    // Power & status
    "CHIEF", "BARON", "DUKE", "COUNT", "MONARCH", "TYRANT", "REGENT", "CONSUL", "VICEROY", "MERCHANT",
    "HERALD", "NOBLE", "SQUIRE", "VASSAL", "GUILD", "CLAN", "ORDER", "SECT", "LEGION", "PACT",
  ],
  hard: [
    // Abstract & philosophy
    "PARADIGM", "ENTROPY", "CATALYST", "NEXUS", "PARADOX", "SYNTHESIS", "SPECTRUM", "OBLIVION", "RESONANCE", "ZENITH",
    "AXIOM", "DOGMA", "NIHILISM", "UTOPIA", "DYSTOPIA", "HUBRIS", "CATHARSIS", "EPIPHANY", "ZEITGEIST", "DUALITY",
    // Science & tech
    "ALGORITHM", "QUANTUM", "BINARY", "CORTEX", "DYNAMO", "KINETIC", "OSMOSIS", "PLASMA", "QUASAR", "NEBULA",
    "ISOTOPE", "GENOME", "SYNAPSE", "PRION", "VECTOR", "CIPHER", "MATRIX", "VERTEX", "TENSOR", "PHOTON",
    // Power & structure
    "SOVEREIGN", "DOMINION", "CHRONICLE", "MONOLITH", "LABYRINTH", "MANIFOLD", "PRECIPICE", "RHETORIC", "TESTAMENT", "SUBLIMINAL",
    "HEGEMONY", "OLIGARCHY", "ANARCHY", "AUTONOMY", "THEOCRACY", "PLUTOCRACY", "MERITOCRACY", "BUREAUCRACY", "ARISTOCRACY", "TYRANNY",
    // Mystery & darkness
    "ETHEREAL", "FRACTURE", "UMBRA", "VISCERAL", "ENIGMA", "ABYSS", "ETHER", "PHANTOM", "WRAITH", "SPECTER",
    "HARBINGER", "REQUIEM", "ELEGY", "DIRGE", "LAMENT", "EPITAPH", "VIGIL", "OMEN", "PORTENT", "CRYPT",
    // Change & creation
    "GENESIS", "HORIZON", "INFLUX", "LEVERAGE", "NOMAD", "OMNISCIENT", "WARDEN", "CRUCIBLE", "CONDUIT", "FULCRUM",
    "PINNACLE", "ECHELON", "VANGUARD", "BASTION", "BULWARK", "PARAGON", "ARCHETYPE", "PANACEA", "ELIXIR", "SCHISM",
    // Rare & evocative
    "JUXTAPOSE", "SERENDIPITY", "EPHEMERAL", "SOLILOQUY", "ALLEGORY", "CRESCENDO", "CACOPHONY", "DISSONANCE", "CONSONANCE", "SYCOPHANT",
    "MAELSTROM", "QUAGMIRE", "CONUNDRUM", "DILEMMA", "ANOMALY", "ABERRATION", "DEVIATION", "DIVERGENCE", "CONVERGENCE", "AMALGAM",
    // Grand scale
    "COLOSSUS", "LEVIATHAN", "BEHEMOTH", "GOLIATH", "TITAN", "ATLAS", "PROMETHEUS", "ICARUS", "MINOTAUR", "CHIMERA",
    "HYDRA", "PHOENIX", "CERBERUS", "MEDUSA", "ORACLE", "SPHINX", "PEGASUS", "KRAKEN", "CYCLOPS", "SIREN",
    // Philosophy & society
    "STOICISM", "EMPIRICISM", "RELATIVISM", "PRAGMATISM", "ALTRUISM", "SOLIPSISM", "FATALISM", "IDEALISM", "SURREALISM", "ABSURDISM",
    "DICHOTOMY", "SYMBIOSIS", "METAMORPHOSIS", "TRANSCENDENCE", "RENAISSANCE", "EXODUS", "DIASPORA", "INQUISITION", "CRUSADE", "REFORMATION",
    // Mind & perception
    "COGNITION", "DELIRIUM", "VERTIGO", "AMNESIA", "INSOMNIA", "PSYCHE", "LUCID", "MIRAGE", "ILLUSION", "REVERIE",
    "NOSTALGIA", "DÉJÀ VU", "PREMONITION", "INTUITION", "CONSCIENCE", "OBSIDIAN", "AURORA", "SOLSTICE", "EQUINOX", "ECLIPSE",
    // Conflict & strategy
    "ATTRITION", "BRINKMANSHIP", "SUBTERFUGE", "SABOTAGE", "INSURGENCY", "ESPIONAGE", "PROPAGANDA", "SANCTIONS", "EMBARGO", "ARMISTICE",
    "STALEMATE", "CHECKMATE", "STRATAGEM", "MANEUVER", "FEINT", "FLANKING", "GARRISON", "CITADEL", "RAMPART", "SIEGE",
  ],
};

export type CardType = "red" | "blue" | "bystander" | "assassin";
export type Difficulty = "easy" | "medium" | "hard";

export interface GameCard {
  word: string;
  type: CardType;
  revealed: boolean;
}

function shuffle<T>(array: T[], random: () => number = Math.random): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateBoard(
  difficulty: Difficulty,
  random: () => number = Math.random
): { cards: GameCard[]; startingTeam: "red" | "blue" } {
  const pool = wordPools[difficulty];
  const selectedWords = shuffle(pool, random).slice(0, 20);

  // Randomly pick starting team
  const startingTeam = random() > 0.5 ? "red" : "blue";

  // Starting team gets 8 agents, other gets 7, 1 assassin, 4 bystanders = 20
  const types: CardType[] = [];
  if (startingTeam === "red") {
    types.push(...Array(8).fill("red"), ...Array(7).fill("blue"));
  } else {
    types.push(...Array(7).fill("red"), ...Array(8).fill("blue"));
  }
  types.push("assassin");
  types.push(...Array(4).fill("bystander"));

  const shuffledTypes = shuffle(types, random);

  const cards: GameCard[] = selectedWords.map((word, i) => ({
    word,
    type: shuffledTypes[i],
    revealed: false,
  }));

  return { cards, startingTeam };
}
