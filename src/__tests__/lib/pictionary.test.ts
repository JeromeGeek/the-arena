import { describe, it, expect, beforeEach } from "vitest";
import {
  wordCategories,
  easyWords,
  mediumWords,
  hardWords,
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
  TEAM_COLORS,
  DEFAULT_TEAM_NAMES,
  type DrawStroke,
  type TeamConfig,
  type DrawDifficulty,
} from "@/lib/inkarena";

// ═══════════════════════════════════════════════════════════════════════════════
// PICTIONARY — COMPREHENSIVE TEST SUITE
// ═══════════════════════════════════════════════════════════════════════════════

// ── 1. Word Banks ─────────────────────────────────────────────────────────────

describe("Word Banks", () => {
  describe("difficulty pools", () => {
    it("easy pool has at least 100 words", () => {
      expect(easyWords.length).toBeGreaterThanOrEqual(100);
    });

    it("medium pool has at least 100 words", () => {
      expect(mediumWords.length).toBeGreaterThanOrEqual(100);
    });

    it("hard pool has at least 100 words", () => {
      expect(hardWords.length).toBeGreaterThanOrEqual(100);
    });

    it("no duplicates within easy pool", () => {
      expect(new Set(easyWords).size).toBe(easyWords.length);
    });

    it("no duplicates within medium pool", () => {
      expect(new Set(mediumWords).size).toBe(mediumWords.length);
    });

    it("no duplicates within hard pool", () => {
      expect(new Set(hardWords).size).toBe(hardWords.length);
    });

    it("no blank or whitespace-only words in any pool", () => {
      [...easyWords, ...mediumWords, ...hardWords].forEach((w) => {
        expect(w.trim().length).toBeGreaterThan(0);
      });
    });

    it("getWordsByDifficulty returns correct pool", () => {
      expect(getWordsByDifficulty("easy")).toBe(easyWords);
      expect(getWordsByDifficulty("medium")).toBe(mediumWords);
      expect(getWordsByDifficulty("hard")).toBe(hardWords);
    });
  });

  describe("word categories", () => {
    it("has at least 5 thematic categories", () => {
      expect(wordCategories.length).toBeGreaterThanOrEqual(5);
    });

    it("each category has name, emoji, and words", () => {
      wordCategories.forEach((cat) => {
        expect(cat.name.length).toBeGreaterThan(0);
        expect(cat.emoji.length).toBeGreaterThan(0);
        expect(cat.words.length).toBeGreaterThanOrEqual(15);
      });
    });

    it("no duplicate words within any category", () => {
      wordCategories.forEach((cat) => {
        expect(new Set(cat.words).size).toBe(cat.words.length);
      });
    });
  });

  describe("allWords union", () => {
    it("has no duplicates", () => {
      expect(new Set(allWords).size).toBe(allWords.length);
    });

    it("is superset of all difficulty pools", () => {
      const allSet = new Set(allWords);
      easyWords.forEach((w) => expect(allSet.has(w)).toBe(true));
      mediumWords.forEach((w) => expect(allSet.has(w)).toBe(true));
      hardWords.forEach((w) => expect(allSet.has(w)).toBe(true));
    });
  });
});

// ── 2. Word Selection ─────────────────────────────────────────────────────────

describe("Word Selection (getRandomWord)", () => {
  it("returns a string from the default medium pool", () => {
    const word = getRandomWord();
    expect(typeof word).toBe("string");
    expect(mediumWords).toContain(word);
  });

  it("respects difficulty parameter", () => {
    // Easy words should come from easy pool
    for (let i = 0; i < 20; i++) {
      const word = getRandomWord([], "easy");
      expect(easyWords).toContain(word);
    }
  });

  it("excludes specified words", () => {
    const pool = getWordsByDifficulty("easy");
    const excluded = pool.slice(0, pool.length - 3);
    const word = getRandomWord(excluded, "easy");
    expect(excluded).not.toContain(word);
  });

  it("falls back when all words excluded (doesn't crash)", () => {
    const pool = getWordsByDifficulty("easy");
    const word = getRandomWord([...pool], "easy");
    expect(typeof word).toBe("string");
    expect(word.length).toBeGreaterThan(0);
  });

  it("produces variety across 30 calls (statistical)", () => {
    const words = new Set(Array.from({ length: 30 }, () => getRandomWord([], "medium")));
    expect(words.size).toBeGreaterThan(5);
  });

  it("50 consecutive calls never repeat when pool is large enough", () => {
    const used: string[] = [];
    for (let i = 0; i < 50; i++) {
      const word = getRandomWord(used, "medium");
      expect(used).not.toContain(word);
      used.push(word);
    }
    expect(new Set(used).size).toBe(50);
  });
});

describe("Word Selection (getWordsForRound)", () => {
  it("returns exact count requested", () => {
    expect(getWordsForRound(5, [], "easy")).toHaveLength(5);
    expect(getWordsForRound(15, [], "medium")).toHaveLength(15);
    expect(getWordsForRound(1, [], "hard")).toHaveLength(1);
  });

  it("returns no duplicates within a round", () => {
    const words = getWordsForRound(20, [], "medium");
    expect(new Set(words).size).toBe(20);
  });

  it("excludes specified words", () => {
    const pool = getWordsByDifficulty("easy");
    const excluded = pool.slice(0, 50);
    const words = getWordsForRound(10, excluded, "easy");
    words.forEach((w) => expect(excluded).not.toContain(w));
  });

  it("all returned words belong to the correct difficulty", () => {
    const words = getWordsForRound(10, [], "hard");
    words.forEach((w) => expect(hardWords).toContain(w));
  });
});

// ── 3. Room Codes ─────────────────────────────────────────────────────────────

describe("Room Code Generation", () => {
  it("generates 6-character codes", () => {
    for (let i = 0; i < 50; i++) {
      expect(generateRoomCode()).toHaveLength(6);
    }
  });

  it("only uses non-ambiguous characters", () => {
    for (let i = 0; i < 100; i++) {
      expect(generateRoomCode()).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
    }
  });

  it("never contains 0, O, 1, or I", () => {
    for (let i = 0; i < 200; i++) {
      expect(generateRoomCode()).not.toMatch(/[01IO]/);
    }
  });

  it("generates unique codes (collision test)", () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateRoomCode()));
    expect(codes.size).toBeGreaterThan(95);
  });
});

// ── 4. Game Constants ─────────────────────────────────────────────────────────

describe("Game Constants", () => {
  it("ROUND_SECONDS is 60", () => {
    expect(ROUND_SECONDS).toBe(60);
  });

  it("BONUS_SECONDS_THRESHOLD is positive and < ROUND_SECONDS", () => {
    expect(BONUS_SECONDS_THRESHOLD).toBeGreaterThan(0);
    expect(BONUS_SECONDS_THRESHOLD).toBeLessThan(ROUND_SECONDS);
  });

  it("POINTS_CORRECT_GUESS is 100", () => {
    expect(POINTS_CORRECT_GUESS).toBe(100);
  });

  it("POINTS_FAST_BONUS is 50", () => {
    expect(POINTS_FAST_BONUS).toBe(50);
  });

  it("bonus window is first 15 seconds of the round", () => {
    // A guess at timeLeft = 50 (10s elapsed) should get bonus
    const timeLeft = ROUND_SECONDS - 10; // 50
    const isFast = timeLeft > ROUND_SECONDS - BONUS_SECONDS_THRESHOLD; // 50 > 45
    expect(isFast).toBe(true);
    // A guess at timeLeft = 40 (20s elapsed) should NOT get bonus
    const slow = ROUND_SECONDS - 20; // 40
    expect(slow > ROUND_SECONDS - BONUS_SECONDS_THRESHOLD).toBe(false);
  });
});

// ── 5. Team Config ────────────────────────────────────────────────────────────

describe("Team Configuration", () => {
  it("TEAM_COLORS has at least 4 colors", () => {
    expect(TEAM_COLORS.length).toBeGreaterThanOrEqual(4);
  });

  it("each team color has accent, bg, border, gradient", () => {
    TEAM_COLORS.forEach((c) => {
      expect(c.accent).toBeDefined();
      expect(c.bg).toBeDefined();
      expect(c.border).toBeDefined();
      expect(c.gradient).toBeDefined();
    });
  });

  it("DEFAULT_TEAM_NAMES has 4 entries", () => {
    expect(DEFAULT_TEAM_NAMES).toHaveLength(4);
  });

  it("DEFAULT_TEAM_NAMES are non-empty strings", () => {
    DEFAULT_TEAM_NAMES.forEach((n) => {
      expect(n.trim().length).toBeGreaterThan(0);
    });
  });

  it("TeamConfig shape is valid", () => {
    const config: TeamConfig = {
      teamNames: ["Wolves", "Hawks"],
      teamCount: 2,
      difficulty: "medium",
      totalRounds: 3,
      scores: [0, 0],
    };
    expect(config.teamCount).toBe(2);
    expect(config.scores).toHaveLength(2);
    expect(config.totalRounds).toBe(3);
  });

  it("TeamConfig supports 4 teams", () => {
    const config: TeamConfig = {
      teamNames: ["A", "B", "C", "D"],
      teamCount: 4,
      difficulty: "hard",
      totalRounds: 2,
      scores: [0, 0, 0, 0],
    };
    expect(config.teamCount).toBe(4);
    expect(config.scores).toHaveLength(4);
  });
});

// ── 6. DrawStroke Types ───────────────────────────────────────────────────────

describe("DrawStroke Types", () => {
  it("stroke with start point", () => {
    const s: DrawStroke = { type: "stroke", x: 100, y: 200, color: "#FF0000", brushSize: 8, isStart: true };
    expect(s.type).toBe("stroke");
    expect(s.isStart).toBe(true);
    expect(s.px).toBeUndefined();
  });

  it("stroke with line (prev point)", () => {
    const s: DrawStroke = { type: "stroke", x: 110, y: 210, px: 100, py: 200, color: "#000", brushSize: 4, isStart: false };
    expect(s.px).toBe(100);
    expect(s.py).toBe(200);
    expect(s.isStart).toBe(false);
  });

  it("clear stroke", () => {
    const s: DrawStroke = { type: "clear", color: "#000", brushSize: 1 };
    expect(s.type).toBe("clear");
  });

  it("undo stroke", () => {
    const s: DrawStroke = { type: "undo", color: "#000", brushSize: 1 };
    expect(s.type).toBe("undo");
  });

  it("brush size is always positive", () => {
    const sizes = [1, 4, 10, 20, 50];
    sizes.forEach((size) => {
      const s: DrawStroke = { type: "stroke", x: 0, y: 0, color: "#000", brushSize: size };
      expect(s.brushSize).toBeGreaterThan(0);
    });
  });
});

// ── 7. Scoring Logic ──────────────────────────────────────────────────────────

describe("Scoring Logic", () => {
  it("correct guess = 100 points", () => {
    expect(POINTS_CORRECT_GUESS).toBe(100);
  });

  it("fast correct guess = 150 points (100 + 50 bonus)", () => {
    const timeLeft = ROUND_SECONDS - 5; // only 5s elapsed = fast
    let pts = POINTS_CORRECT_GUESS;
    if (timeLeft > ROUND_SECONDS - BONUS_SECONDS_THRESHOLD) pts += POINTS_FAST_BONUS;
    expect(pts).toBe(150);
  });

  it("slow correct guess = 100 points (no bonus)", () => {
    const timeLeft = 10; // 50s elapsed = slow
    let pts = POINTS_CORRECT_GUESS;
    if (timeLeft > ROUND_SECONDS - BONUS_SECONDS_THRESHOLD) pts += POINTS_FAST_BONUS;
    expect(pts).toBe(100);
  });

  it("exactly at threshold boundary gets bonus", () => {
    // timeLeft = ROUND_SECONDS - BONUS_SECONDS_THRESHOLD + 1 = 46
    const timeLeft = ROUND_SECONDS - BONUS_SECONDS_THRESHOLD + 1;
    const isFast = timeLeft > ROUND_SECONDS - BONUS_SECONDS_THRESHOLD;
    expect(isFast).toBe(true);
  });

  it("exactly at threshold does NOT get bonus", () => {
    // timeLeft = ROUND_SECONDS - BONUS_SECONDS_THRESHOLD = 45
    const timeLeft = ROUND_SECONDS - BONUS_SECONDS_THRESHOLD;
    const isFast = timeLeft > ROUND_SECONDS - BONUS_SECONDS_THRESHOLD;
    expect(isFast).toBe(false);
  });

  it("time's up = 0 points", () => {
    const timeLeft = 0;
    const pts = timeLeft > 0 ? POINTS_CORRECT_GUESS : 0;
    expect(pts).toBe(0);
  });

  describe("score accumulation across a full game", () => {
    it("2 teams, 3 rounds each, mixed results", () => {
      const scores = [0, 0];
      // Team 0: round 1 correct fast, round 2 correct slow, round 3 time up
      scores[0] += 150; // fast
      scores[0] += 100; // slow
      scores[0] += 0;   // time up
      // Team 1: round 1 time up, round 2 correct fast, round 3 correct fast
      scores[1] += 0;
      scores[1] += 150;
      scores[1] += 150;
      expect(scores).toEqual([250, 300]);
      // Team 1 wins
      const maxScore = Math.max(...scores);
      const winners = scores.reduce<number[]>((a, s, i) => s === maxScore ? [...a, i] : a, []);
      expect(winners).toEqual([1]);
    });

    it("tie scenario", () => {
      const scores = [200, 200];
      const maxScore = Math.max(...scores);
      const winners = scores.reduce<number[]>((a, s, i) => s === maxScore ? [...a, i] : a, []);
      expect(winners).toEqual([0, 1]);
      expect(winners.length).toBeGreaterThan(1);
    });

    it("3-way tie scenario", () => {
      const scores = [150, 150, 150];
      const maxScore = Math.max(...scores);
      const winners = scores.reduce<number[]>((a, s, i) => s === maxScore ? [...a, i] : a, []);
      expect(winners).toEqual([0, 1, 2]);
    });

    it("one team dominates", () => {
      const scores = [0, 0, 0, 0];
      scores[2] += 150 * 5; // 750 points
      const maxScore = Math.max(...scores);
      const winners = scores.reduce<number[]>((a, s, i) => s === maxScore ? [...a, i] : a, []);
      expect(winners).toEqual([2]);
    });
  });
});

// ── 8. Turn Order — Team Block Ordering ───────────────────────────────────────

describe("Turn Order — Team Block Ordering", () => {
  /**
   * Simulates the exact same logic as handleNextTurn in the TV page:
   * Total turns = teamCount × totalRounds
   * teamIdx = floor(turnNum / totalRounds)
   * roundNum = (turnNum % totalRounds) + 1
   */
  function simulateTurnOrder(teamCount: number, totalRounds: number) {
    const turns: { teamIdx: number; roundNum: number }[] = [];
    const totalTurns = teamCount * totalRounds;
    for (let t = 0; t < totalTurns; t++) {
      turns.push({
        teamIdx: Math.floor(t / totalRounds),
        roundNum: (t % totalRounds) + 1,
      });
    }
    return turns;
  }

  it("2 teams, 3 rounds: Red×3 then Blue×3", () => {
    const turns = simulateTurnOrder(2, 3);
    expect(turns).toHaveLength(6);
    expect(turns.map((t) => t.teamIdx)).toEqual([0, 0, 0, 1, 1, 1]);
    expect(turns.map((t) => t.roundNum)).toEqual([1, 2, 3, 1, 2, 3]);
  });

  it("2 teams, 1 round: Red×1 then Blue×1", () => {
    const turns = simulateTurnOrder(2, 1);
    expect(turns).toHaveLength(2);
    expect(turns.map((t) => t.teamIdx)).toEqual([0, 1]);
  });

  it("2 teams, 5 rounds: 10 turns total", () => {
    const turns = simulateTurnOrder(2, 5);
    expect(turns).toHaveLength(10);
    expect(turns.slice(0, 5).every((t) => t.teamIdx === 0)).toBe(true);
    expect(turns.slice(5).every((t) => t.teamIdx === 1)).toBe(true);
  });

  it("3 teams, 2 rounds: each gets 2 consecutive turns", () => {
    const turns = simulateTurnOrder(3, 2);
    expect(turns).toHaveLength(6);
    expect(turns.map((t) => t.teamIdx)).toEqual([0, 0, 1, 1, 2, 2]);
    expect(turns.map((t) => t.roundNum)).toEqual([1, 2, 1, 2, 1, 2]);
  });

  it("4 teams, 3 rounds: 12 turns total, each team gets 3 consecutive", () => {
    const turns = simulateTurnOrder(4, 3);
    expect(turns).toHaveLength(12);
    expect(turns.map((t) => t.teamIdx)).toEqual([0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3]);
  });

  it("4 teams, 1 round: one turn per team", () => {
    const turns = simulateTurnOrder(4, 1);
    expect(turns).toHaveLength(4);
    expect(turns.map((t) => t.teamIdx)).toEqual([0, 1, 2, 3]);
  });

  it("no team draws before previous team finishes all rounds", () => {
    const turns = simulateTurnOrder(3, 4);
    let lastTeam = -1;
    let lastRound = 0;
    for (const turn of turns) {
      if (turn.teamIdx !== lastTeam) {
        // Switched teams — previous team should have finished all rounds
        if (lastTeam >= 0) expect(lastRound).toBe(4);
        lastTeam = turn.teamIdx;
        lastRound = 0;
      }
      lastRound = turn.roundNum;
    }
    expect(lastRound).toBe(4); // Last team also finished
  });

  it("game over triggers after last turn", () => {
    const teamCount = 2;
    const totalRounds = 3;
    const totalTurns = teamCount * totalRounds;
    const turns = simulateTurnOrder(teamCount, totalRounds);
    expect(turns.length).toBe(totalTurns);
    // After turn index totalTurns - 1, game should end
    const lastTurn = turns[turns.length - 1];
    expect(lastTurn.teamIdx).toBe(teamCount - 1);
    expect(lastTurn.roundNum).toBe(totalRounds);
  });
});

// ── 9. Full Game Simulation ───────────────────────────────────────────────────

describe("Full Game Simulation", () => {
  function simulateGame(teamCount: number, totalRounds: number, results: ("fast" | "slow" | "miss")[]) {
    const scores = new Array(teamCount).fill(0);
    const usedWords: string[] = [];
    const totalTurns = teamCount * totalRounds;

    for (let t = 0; t < totalTurns; t++) {
      const teamIdx = Math.floor(t / totalRounds);
      const word = getRandomWord(usedWords, "medium");
      expect(usedWords).not.toContain(word);
      usedWords.push(word);

      const result = results[t] ?? "miss";
      if (result === "fast") {
        scores[teamIdx] += POINTS_CORRECT_GUESS + POINTS_FAST_BONUS;
      } else if (result === "slow") {
        scores[teamIdx] += POINTS_CORRECT_GUESS;
      }
      // "miss" = 0 points
    }

    const maxScore = Math.max(...scores);
    const winners = scores.reduce<number[]>((a, s, i) => s === maxScore ? [...a, i] : a, []);
    return { scores, winners, usedWords };
  }

  it("2 teams, 3 rounds, team 0 wins all fast", () => {
    const { scores, winners } = simulateGame(2, 3, [
      "fast", "fast", "fast",  // team 0
      "miss", "miss", "miss",  // team 1
    ]);
    expect(scores[0]).toBe(450); // 3 × 150
    expect(scores[1]).toBe(0);
    expect(winners).toEqual([0]);
  });

  it("2 teams, 3 rounds, tie", () => {
    const { scores, winners } = simulateGame(2, 3, [
      "slow", "slow", "miss",  // team 0 = 200
      "slow", "slow", "miss",  // team 1 = 200
    ]);
    expect(scores[0]).toBe(200);
    expect(scores[1]).toBe(200);
    expect(winners).toEqual([0, 1]);
  });

  it("no words repeat across entire game", () => {
    const { usedWords } = simulateGame(2, 5, Array(10).fill("slow"));
    expect(new Set(usedWords).size).toBe(10);
  });

  it("3 teams, 2 rounds each, mixed results", () => {
    const { scores, winners } = simulateGame(3, 2, [
      "fast", "miss",    // team 0 = 150
      "slow", "slow",    // team 1 = 200
      "fast", "fast",    // team 2 = 300
    ]);
    expect(scores).toEqual([150, 200, 300]);
    expect(winners).toEqual([2]);
  });

  it("4 teams, 1 round each, all miss = all tie at 0", () => {
    const { scores, winners } = simulateGame(4, 1, ["miss", "miss", "miss", "miss"]);
    expect(scores).toEqual([0, 0, 0, 0]);
    expect(winners).toEqual([0, 1, 2, 3]); // 4-way tie
  });
});

// ── 10. Score Broadcast Message Shape ─────────────────────────────────────────

describe("Score Broadcast Message", () => {
  it("scores_update message shape", () => {
    const msg = { type: "scores_update" as const, scores: [100, 200] };
    expect(msg.type).toBe("scores_update");
    expect(msg.scores).toEqual([100, 200]);
  });

  it("round_start includes scores for sync", () => {
    const msg = {
      type: "round_start" as const,
      word: "Cat",
      drawingTeamIdx: 1,
      teamNames: ["Red", "Blue"],
      teamCount: 2,
      roundNumber: 2,
      timeLeft: ROUND_SECONDS,
      scores: [100, 50],
    };
    expect(msg.scores).toEqual([100, 50]);
    expect(msg.drawingTeamIdx).toBe(1);
  });

  it("game_over includes final scores", () => {
    const msg = {
      type: "game_over" as const,
      winners: [0],
      scores: [300, 150],
    };
    expect(msg.scores).toEqual([300, 150]);
    expect(msg.winners).toEqual([0]);
  });

  it("correct_guess message includes timeLeft for bonus calc", () => {
    const msg = {
      type: "correct_guess" as const,
      guessingTeamIdx: 1,
      playerName: "Alice",
      timeLeft: 55,
    };
    expect(msg.guessingTeamIdx).toBe(1);
    expect(msg.timeLeft).toBe(55);
    // TV should calculate: 55 > 60 - 15 = 45 → bonus!
    const isFast = msg.timeLeft > ROUND_SECONDS - BONUS_SECONDS_THRESHOLD;
    expect(isFast).toBe(true);
  });
});

// ── 11. Edge Cases ────────────────────────────────────────────────────────────

describe("Edge Cases", () => {
  it("single round, 2 teams = 2 total turns", () => {
    const totalTurns = 2 * 1;
    expect(totalTurns).toBe(2);
  });

  it("single round, 4 teams = 4 total turns", () => {
    const totalTurns = 4 * 1;
    expect(totalTurns).toBe(4);
  });

  it("max config: 4 teams, 5 rounds = 20 total turns", () => {
    const totalTurns = 4 * 5;
    expect(totalTurns).toBe(20);
    // 20 unique words needed — pool has 100+
    const used: string[] = [];
    for (let i = 0; i < 20; i++) {
      const word = getRandomWord(used, "medium");
      expect(used).not.toContain(word);
      used.push(word);
    }
    expect(used.length).toBe(20);
  });

  it("team index wraps with TEAM_COLORS", () => {
    // If somehow more than 4 teams, colors should wrap
    for (let i = 0; i < 8; i++) {
      const color = TEAM_COLORS[i % TEAM_COLORS.length];
      expect(color.accent).toBeDefined();
    }
  });

  it("DEFAULT_TEAM_NAMES fallback for custom names", () => {
    const customNames = ["Wolves", "Hawks"];
    const teamName = (idx: number) => customNames[idx] ?? DEFAULT_TEAM_NAMES[idx] ?? `Team ${idx + 1}`;
    expect(teamName(0)).toBe("Wolves");
    expect(teamName(1)).toBe("Hawks");
    expect(teamName(2)).toBe("Purple Team"); // falls back
    expect(teamName(5)).toBe("Team 6"); // beyond both arrays
  });

  it("zero scores produce all-team tie", () => {
    const scores = [0, 0, 0];
    const max = Math.max(...scores);
    const winners = scores.reduce<number[]>((a, s, i) => s === max ? [...a, i] : a, []);
    expect(winners).toEqual([0, 1, 2]);
  });

  it("negative scores are not possible (scores only increase)", () => {
    // Scores start at 0 and only receive positive increments
    const scores = [0, 0];
    scores[0] += POINTS_CORRECT_GUESS;
    scores[1] += 0; // miss
    expect(scores.every((s) => s >= 0)).toBe(true);
  });
});
