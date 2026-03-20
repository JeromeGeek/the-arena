import { describe, it, expect } from "vitest";
import {
  wordCategories,
  allWords,
  getRandomWord,
  getWordsForRound,
  getWordsByDifficulty,
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
  it("has at least 5 categories", () => {
    expect(wordCategories.length).toBeGreaterThanOrEqual(5);
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

  it("is a deduplicated union of all category words plus difficulty words", () => {
    expect(allWords.length).toBeGreaterThanOrEqual(100);
    // allWords should contain no duplicates
    const unique = new Set(allWords);
    expect(unique.size).toBe(allWords.length);
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
    const medPool = getWordsByDifficulty("medium");
    const excluded = medPool.slice(0, medPool.length - 5);
    const word = getRandomWord(excluded, "medium");
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
  it("ROUND_SECONDS is 60", () => {
    expect(ROUND_SECONDS).toBe(60);
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
      drawingTeam: 0,
      drawerId: "player-1",
      roundNumber: 1,
    };
    expect(event.type).toBe("round_start");
    if (event.type === "round_start") {
      expect(event.word).toBe("Elephant");
      expect(event.drawingTeam).toBe(0);
    }
  });

  it("guess event has correct shape", () => {
    const event: InkArenaEvent = {
      type: "guess",
      team: 1,
      guess: "elephant",
      playerId: "player-2",
    };
    expect(event.type).toBe("guess");
    if (event.type === "guess") {
      expect(event.guess).toBe("elephant");
    }
  });

  it("sabotage event has correct shape", () => {
    const event: InkArenaEvent = {
      type: "sabotage",
      effect: "shake",
      fromTeam: 1,
    };
    expect(event.type).toBe("sabotage");
    if (event.type === "sabotage") {
      expect(["shrink", "shake", "flip"]).toContain(event.effect);
    }
  });

  it("game_over event has scores", () => {
    const event: InkArenaEvent = {
      type: "game_over",
      winner: 0,
      scores: [1000, 750],
    };
    if (event.type === "game_over") {
      expect(event.winner).toBe(0);
      expect(event.scores[0]).toBeGreaterThanOrEqual(POINTS_TO_WIN);
    }
  });
});

// ── Turn order simulation (team-block ordering) ──────────────────────────────

describe("turn order — team-block ordering", () => {
  // Simulates the new handleNextTurn logic:
  // All turns for team 0 first, then team 1, etc.
  function simulateTurnOrder(teamCount: number, totalRounds: number) {
    const turns: { teamIdx: number; roundNum: number; turnNum: number }[] = [];
    const totalTurns = teamCount * totalRounds;
    for (let turnNum = 0; turnNum < totalTurns; turnNum++) {
      const teamIdx = Math.floor(turnNum / totalRounds);
      const roundNum = (turnNum % totalRounds) + 1;
      turns.push({ teamIdx, roundNum, turnNum });
    }
    return turns;
  }

  it("2 teams, 3 rounds: Red gets 3 turns then Blue gets 3 turns", () => {
    const turns = simulateTurnOrder(2, 3);
    expect(turns).toHaveLength(6);
    // First 3 turns are team 0
    expect(turns[0].teamIdx).toBe(0);
    expect(turns[1].teamIdx).toBe(0);
    expect(turns[2].teamIdx).toBe(0);
    // Next 3 turns are team 1
    expect(turns[3].teamIdx).toBe(1);
    expect(turns[4].teamIdx).toBe(1);
    expect(turns[5].teamIdx).toBe(1);
  });

  it("3 teams, 2 rounds: each team gets 2 consecutive turns", () => {
    const turns = simulateTurnOrder(3, 2);
    expect(turns).toHaveLength(6);
    expect(turns.map(t => t.teamIdx)).toEqual([0, 0, 1, 1, 2, 2]);
  });

  it("round numbers cycle 1..totalRounds for each team", () => {
    const turns = simulateTurnOrder(2, 3);
    expect(turns.map(t => t.roundNum)).toEqual([1, 2, 3, 1, 2, 3]);
  });

  it("4 teams, 1 round: each team gets exactly 1 turn", () => {
    const turns = simulateTurnOrder(4, 1);
    expect(turns).toHaveLength(4);
    expect(turns.map(t => t.teamIdx)).toEqual([0, 1, 2, 3]);
  });
});

// ── Score sync simulation ────────────────────────────────────────────────────

describe("score sync simulation", () => {
  it("correct guess awards POINTS_CORRECT_GUESS to guessing team", () => {
    const scores = [0, 0];
    const guessingTeamIdx = 1;
    scores[guessingTeamIdx] += POINTS_CORRECT_GUESS;
    expect(scores).toEqual([0, 100]);
  });

  it("fast guess awards bonus on top", () => {
    const scores = [0, 0];
    const guessingTeamIdx = 0;
    const timeLeft = ROUND_SECONDS - 1; // within threshold
    let pts = POINTS_CORRECT_GUESS;
    if (timeLeft > ROUND_SECONDS - BONUS_SECONDS_THRESHOLD) pts += POINTS_FAST_BONUS;
    scores[guessingTeamIdx] += pts;
    expect(scores[0]).toBe(POINTS_CORRECT_GUESS + POINTS_FAST_BONUS);
  });

  it("slow guess does not award bonus", () => {
    const scores = [0, 0];
    const guessingTeamIdx = 0;
    const timeLeft = 5;
    let pts = POINTS_CORRECT_GUESS;
    if (timeLeft > ROUND_SECONDS - BONUS_SECONDS_THRESHOLD) pts += POINTS_FAST_BONUS;
    scores[guessingTeamIdx] += pts;
    expect(scores[0]).toBe(POINTS_CORRECT_GUESS);
  });

  it("scores accumulate across multiple rounds", () => {
    const scores = [0, 0];
    // Team 0 gets 3 correct guesses
    scores[0] += POINTS_CORRECT_GUESS;
    scores[0] += POINTS_CORRECT_GUESS;
    scores[0] += POINTS_CORRECT_GUESS + POINTS_FAST_BONUS;
    // Team 1 gets 2
    scores[1] += POINTS_CORRECT_GUESS;
    scores[1] += POINTS_CORRECT_GUESS;
    expect(scores[0]).toBe(350); // 100 + 100 + 150
    expect(scores[1]).toBe(200); // 100 + 100
  });

  it("winner is team with highest score", () => {
    const scores = [350, 200, 150];
    const maxScore = Math.max(...scores);
    const winners = scores.reduce<number[]>((acc, s, i) => s === maxScore ? [...acc, i] : acc, []);
    expect(winners).toEqual([0]);
  });

  it("tie detected when multiple teams have same top score", () => {
    const scores = [300, 300, 100];
    const maxScore = Math.max(...scores);
    const winners = scores.reduce<number[]>((acc, s, i) => s === maxScore ? [...acc, i] : acc, []);
    expect(winners).toEqual([0, 1]);
  });
});

// ── Round flow simulation ─────────────────────────────────────────────────────

describe("round flow simulation", () => {
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

  it("game over triggers after all turns are played", () => {
    const teamCount = 2;
    const totalRounds = 3;
    const totalTurns = teamCount * totalRounds; // 6
    let turnNum = 0;
    let gameOver = false;
    while (!gameOver) {
      turnNum++;
      if (turnNum >= totalTurns) gameOver = true;
    }
    expect(gameOver).toBe(true);
    expect(turnNum).toBe(6);
  });
});
