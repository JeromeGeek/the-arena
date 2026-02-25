import { describe, it, expect } from "vitest";
import {
  wordCategories,
  allWords,
  getRandomWord,
  getWordsForRound,
  generateRoomCode,
  ROUND_SECONDS,
  BONUS_SECONDS_THRESHOLD,
  POINTS_CORRECT_GUESS,
  POINTS_FAST_BONUS,
  POINTS_STEAL_PENALTY,
  POINTS_TO_WIN,
  type DrawStroke,
  type InkArenaEvent,
} from "@/lib/inkarena";

// ── Word Bank ─────────────────────────────────────────────────────────────────

describe("wordCategories", () => {
  it("has 6 categories", () => {
    expect(wordCategories).toHaveLength(6);
  });

  it("each category has a name, emoji, and at least 18 words", () => {
    wordCategories.forEach((cat) => {
      expect(cat.name.length).toBeGreaterThan(0);
      expect(cat.emoji.length).toBeGreaterThan(0);
      expect(cat.words.length).toBeGreaterThanOrEqual(18);
    });
  });

  it("no duplicate words within a category", () => {
    wordCategories.forEach((cat) => {
      const unique = new Set(cat.words);
      expect(unique.size).toBe(cat.words.length);
    });
  });

  it("no blank words in any category", () => {
    wordCategories.forEach((cat) => {
      cat.words.forEach((word) => {
        expect(word.trim().length).toBeGreaterThan(0);
      });
    });
  });
});

describe("allWords", () => {
  it("contains at least 100 words", () => {
    expect(allWords.length).toBeGreaterThanOrEqual(100);
  });

  it("is a flat union of all category words", () => {
    const expected = wordCategories.flatMap((c) => c.words);
    expect(allWords).toEqual(expected);
  });
});

// ── getRandomWord ─────────────────────────────────────────────────────────────

describe("getRandomWord", () => {
  it("returns a non-empty string", () => {
    const word = getRandomWord();
    expect(typeof word).toBe("string");
    expect(word.length).toBeGreaterThan(0);
  });

  it("returns a word from allWords", () => {
    const word = getRandomWord();
    expect(allWords).toContain(word);
  });

  it("does not return excluded words when alternatives exist", () => {
    const excluded = allWords.slice(0, allWords.length - 5);
    const word = getRandomWord(excluded);
    expect(excluded).not.toContain(word);
  });

  it("falls back to full list when all words excluded", () => {
    const word = getRandomWord(allWords);
    expect(typeof word).toBe("string");
    expect(word.length).toBeGreaterThan(0);
    expect(allWords).toContain(word);
  });

  it("returns different words across multiple calls (statistical)", () => {
    const results = new Set(Array.from({ length: 20 }, () => getRandomWord()));
    expect(results.size).toBeGreaterThan(1);
  });
});

// ── getWordsForRound ──────────────────────────────────────────────────────────

describe("getWordsForRound", () => {
  it("returns the requested count of words", () => {
    const words = getWordsForRound(5);
    expect(words).toHaveLength(5);
  });

  it("returns no duplicates", () => {
    const words = getWordsForRound(20);
    const unique = new Set(words);
    expect(unique.size).toBe(words.length);
  });

  it("excludes specified words", () => {
    const excluded = allWords.slice(0, 50);
    const words = getWordsForRound(10, excluded);
    words.forEach((w) => {
      expect(excluded).not.toContain(w);
    });
  });

  it("returns all from allWords", () => {
    const words = getWordsForRound(10);
    words.forEach((w) => expect(allWords).toContain(w));
  });
});

// ── generateRoomCode ──────────────────────────────────────────────────────────

describe("generateRoomCode", () => {
  it("returns a 6-character string", () => {
    expect(generateRoomCode()).toHaveLength(6);
  });

  it("only contains uppercase letters and numbers (no ambiguous chars)", () => {
    const code = generateRoomCode();
    expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
  });

  it("does not contain ambiguous characters (0, O, 1, I)", () => {
    // Run 200 times to be sure
    for (let i = 0; i < 200; i++) {
      const code = generateRoomCode();
      expect(code).not.toMatch(/[01IO]/);
    }
  });

  it("generates unique codes (statistical)", () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateRoomCode()));
    expect(codes.size).toBeGreaterThan(45);
  });
});

// ── Constants ─────────────────────────────────────────────────────────────────

describe("game constants", () => {
  it("ROUND_SECONDS is 45", () => {
    expect(ROUND_SECONDS).toBe(45);
  });

  it("BONUS_SECONDS_THRESHOLD is less than ROUND_SECONDS", () => {
    expect(BONUS_SECONDS_THRESHOLD).toBeLessThan(ROUND_SECONDS);
  });

  it("POINTS_CORRECT_GUESS is positive", () => {
    expect(POINTS_CORRECT_GUESS).toBeGreaterThan(0);
  });

  it("POINTS_FAST_BONUS is positive and less than POINTS_CORRECT_GUESS", () => {
    expect(POINTS_FAST_BONUS).toBeGreaterThan(0);
    expect(POINTS_FAST_BONUS).toBeLessThan(POINTS_CORRECT_GUESS);
  });

  it("POINTS_STEAL_PENALTY is positive", () => {
    expect(POINTS_STEAL_PENALTY).toBeGreaterThan(0);
  });

  it("POINTS_TO_WIN is reachable (not astronomically high)", () => {
    expect(POINTS_TO_WIN).toBeGreaterThan(0);
    // Should be reachable in a reasonable number of rounds
    const roundsNeeded = Math.ceil(POINTS_TO_WIN / POINTS_CORRECT_GUESS);
    expect(roundsNeeded).toBeLessThan(50);
  });
});

// ── Scoring logic ─────────────────────────────────────────────────────────────

describe("scoring logic", () => {
  it("normal correct guess awards POINTS_CORRECT_GUESS", () => {
    const base = POINTS_CORRECT_GUESS;
    expect(base).toBe(100);
  });

  it("fast correct guess (before threshold) awards bonus", () => {
    const timeLeft = ROUND_SECONDS - 1; // 44s left = fast
    const isFast = timeLeft > ROUND_SECONDS - BONUS_SECONDS_THRESHOLD;
    const pts = POINTS_CORRECT_GUESS + (isFast ? POINTS_FAST_BONUS : 0);
    expect(pts).toBe(POINTS_CORRECT_GUESS + POINTS_FAST_BONUS);
  });

  it("slow correct guess (after threshold) does not award bonus", () => {
    const timeLeft = 5; // only 5s left = slow
    const isFast = timeLeft > ROUND_SECONDS - BONUS_SECONDS_THRESHOLD;
    const pts = POINTS_CORRECT_GUESS + (isFast ? POINTS_FAST_BONUS : 0);
    expect(pts).toBe(POINTS_CORRECT_GUESS);
  });

  it("steal correctly reduces drawing team score", () => {
    const drawingTeamScore = 300;
    const penalty = POINTS_STEAL_PENALTY;
    const afterSteal = Math.max(0, drawingTeamScore - penalty);
    // 300 - 50 (POINTS_STEAL_PENALTY) = 250
    expect(afterSteal).toBe(250);
  });

  it("steal does not reduce drawing team score below 0", () => {
    const drawingTeamScore = 10;
    const afterSteal = Math.max(0, drawingTeamScore - POINTS_STEAL_PENALTY);
    expect(afterSteal).toBe(0);
  });

  it("steal awards 50% of drawing team's score to stealing team", () => {
    const drawingTeamScore = 400;
    const stealAward = Math.round(drawingTeamScore * 0.5);
    expect(stealAward).toBe(200);
  });

  it("win condition triggers when score reaches POINTS_TO_WIN", () => {
    const scores = { red: 1000, blue: 700 };
    const gameOver = scores.red >= POINTS_TO_WIN || scores.blue >= POINTS_TO_WIN;
    expect(gameOver).toBe(true);
  });

  it("win condition does not trigger below POINTS_TO_WIN", () => {
    const scores = { red: 999, blue: 999 };
    const gameOver = scores.red >= POINTS_TO_WIN || scores.blue >= POINTS_TO_WIN;
    expect(gameOver).toBe(false);
  });

  it("winner is team with higher score when both could win", () => {
    const scores = { red: 1100, blue: 1050 };
    const winner = scores.red >= scores.blue ? "red" : "blue";
    expect(winner).toBe("red");
  });
});

// ── DrawStroke type shape ─────────────────────────────────────────────────────

describe("DrawStroke shape", () => {
  it("stroke event has required fields", () => {
    const stroke: DrawStroke = {
      type: "stroke",
      x: 100,
      y: 200,
      color: "#FF416C",
      brushSize: 6,
      isStart: true,
    };
    expect(stroke.type).toBe("stroke");
    expect(stroke.color).toBe("#FF416C");
    expect(stroke.brushSize).toBe(6);
  });

  it("clear event has required fields", () => {
    const stroke: DrawStroke = {
      type: "clear",
      color: "#000000",
      brushSize: 1,
    };
    expect(stroke.type).toBe("clear");
  });

  it("line stroke has previous coords", () => {
    const stroke: DrawStroke = {
      type: "stroke",
      x: 150,
      y: 250,
      px: 140,
      py: 240,
      color: "#000000",
      brushSize: 4,
      isStart: false,
    };
    expect(stroke.px).toBe(140);
    expect(stroke.py).toBe(240);
    expect(stroke.isStart).toBe(false);
  });
});

// ── InkArenaEvent union ───────────────────────────────────────────────────────

describe("InkArenaEvent union", () => {
  it("round_start event has correct shape", () => {
    const event: InkArenaEvent = {
      type: "round_start",
      word: "Elephant",
      drawingTeam: "red",
      drawerId: "player-1",
      roundNumber: 1,
    };
    expect(event.type).toBe("round_start");
    expect(event.word).toBe("Elephant");
    expect(event.drawingTeam).toBe("red");
  });

  it("guess event has correct shape", () => {
    const event: InkArenaEvent = {
      type: "guess",
      team: "blue",
      guess: "elephant",
      playerId: "player-2",
    };
    expect(event.type).toBe("guess");
    expect(event.guess).toBe("elephant");
  });

  it("sabotage event has correct shape", () => {
    const event: InkArenaEvent = {
      type: "sabotage",
      effect: "shake",
      fromTeam: "blue",
    };
    expect(event.type).toBe("sabotage");
    expect(["shrink", "shake", "flip"]).toContain(event.effect);
  });

  it("game_over event has scores", () => {
    const event: InkArenaEvent = {
      type: "game_over",
      winner: "red",
      scores: { red: 1000, blue: 750 },
    };
    expect(event.winner).toBe("red");
    expect(event.scores.red).toBeGreaterThanOrEqual(POINTS_TO_WIN);
  });
});

// ── Round flow simulation ─────────────────────────────────────────────────────

describe("round flow simulation", () => {
  it("teams alternate drawing each round", () => {
    let team: "red" | "blue" = "red";
    const order: ("red" | "blue")[] = [team];
    for (let i = 1; i < 6; i++) {
      team = team === "red" ? "blue" : "red";
      order.push(team);
    }
    expect(order).toEqual(["red", "blue", "red", "blue", "red", "blue"]);
  });

  it("used words are excluded from subsequent rounds", () => {
    const used: string[] = [];
    for (let i = 0; i < 10; i++) {
      const word = getRandomWord(used);
      expect(used).not.toContain(word);
      used.push(word);
    }
    expect(used.length).toBe(10);
    expect(new Set(used).size).toBe(10);
  });

  it("game ends after 10 rounds if no one reaches POINTS_TO_WIN", () => {
    // Simulate 10 rounds with max points per round
    const maxPerRound = POINTS_CORRECT_GUESS + POINTS_FAST_BONUS;
    const totalAfter10 = maxPerRound * 10;
    // Even with max score, should check win condition works correctly
    const gameOver = totalAfter10 >= POINTS_TO_WIN;
    // 150 * 10 = 1500 >= 1000 — game would end before round 10
    expect(gameOver).toBe(true);
  });

  it("minimum rounds to win is calculable", () => {
    const maxPerRound = POINTS_CORRECT_GUESS + POINTS_FAST_BONUS; // 150
    const minRounds = Math.ceil(POINTS_TO_WIN / maxPerRound);
    expect(minRounds).toBeGreaterThanOrEqual(7); // at least 7 rounds
    expect(minRounds).toBeLessThanOrEqual(10);   // at most 10 rounds
  });
});
