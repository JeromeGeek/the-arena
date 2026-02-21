import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Create a proper AudioContext mock class
class MockOscillatorNode {
  type: OscillatorType = "sine";
  frequency = { value: 0, exponentialRampToValueAtTime: vi.fn() };
  connect = vi.fn().mockReturnThis();
  start = vi.fn();
  stop = vi.fn();
}

class MockGainNode {
  gain = { value: 0, exponentialRampToValueAtTime: vi.fn() };
  connect = vi.fn().mockReturnThis();
}

class MockBiquadFilterNode {
  type: BiquadFilterType = "highpass";
  frequency = { value: 0 };
  connect = vi.fn().mockReturnThis();
}

class MockAudioBufferSourceNode {
  buffer: AudioBuffer | null = null;
  connect = vi.fn().mockReturnThis();
  start = vi.fn();
}

class MockAudioContext {
  state = "running";
  currentTime = 0;
  sampleRate = 44100;
  destination = {};
  resume = vi.fn().mockResolvedValue(undefined);

  createOscillator() {
    return new MockOscillatorNode();
  }
  createGain() {
    return new MockGainNode();
  }
  createBiquadFilter() {
    return new MockBiquadFilterNode();
  }
  createBuffer(_channels: number, length: number, _sampleRate: number) {
    return { getChannelData: () => new Float32Array(length) };
  }
  createBufferSource() {
    return new MockAudioBufferSourceNode();
  }
}

vi.stubGlobal("AudioContext", MockAudioContext);

// Import after mocking
import {
  playTap,
  playConfirm,
  playWhoosh,
  playError,
  playCardFlip,
  playCorrectCard,
  playWrongCard,
  playNeutralCard,
  playAssassin,
  playEndTurn,
  playTeamWins,
  playTruthPick,
  playDarePick,
  playPromptReveal,
  playNextPlayer,
  playConfession,
  playNextPrompt,
  playResultsReveal,
  playRevealWord,
  playImposterReveal,
  playCrewReveal,
  playVoteCast,
  playDiscussionStart,
  playCrewWins,
  playImposterWins,
  playTimerTick,
  playTimerCritical,
  playCorrectAnswer,
  playSkip,
  playTimesUp,
  playStartTurn,
  playGameOverFanfare,
} from "@/lib/sounds";

describe("Sound Effects Engine", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Shared / UI Sounds", () => {
    it("playTap executes without error", () => {
      expect(() => playTap()).not.toThrow();
    });

    it("playConfirm executes without error", () => {
      expect(() => { playConfirm(); vi.advanceTimersByTime(100); }).not.toThrow();
    });

    it("playWhoosh executes without error", () => {
      expect(() => playWhoosh()).not.toThrow();
    });

    it("playError executes without error", () => {
      expect(() => playError()).not.toThrow();
    });
  });

  describe("Codenames Sounds", () => {
    it("playCardFlip executes without error", () => {
      expect(() => playCardFlip()).not.toThrow();
    });

    it("playCorrectCard executes without error", () => {
      expect(() => { playCorrectCard(); vi.advanceTimersByTime(100); }).not.toThrow();
    });

    it("playWrongCard executes without error", () => {
      expect(() => { playWrongCard(); vi.advanceTimersByTime(200); }).not.toThrow();
    });

    it("playNeutralCard executes without error", () => {
      expect(() => playNeutralCard()).not.toThrow();
    });

    it("playAssassin executes without error", () => {
      expect(() => { playAssassin(); vi.advanceTimersByTime(300); }).not.toThrow();
    });

    it("playEndTurn executes without error", () => {
      expect(() => { playEndTurn(); vi.advanceTimersByTime(200); }).not.toThrow();
    });

    it("playTeamWins executes without error", () => {
      expect(() => { playTeamWins(); vi.advanceTimersByTime(500); }).not.toThrow();
    });
  });

  describe("Truth or Dare Sounds", () => {
    it("playTruthPick executes without error", () => {
      expect(() => { playTruthPick(); vi.advanceTimersByTime(300); }).not.toThrow();
    });

    it("playDarePick executes without error", () => {
      expect(() => { playDarePick(); vi.advanceTimersByTime(300); }).not.toThrow();
    });

    it("playPromptReveal executes without error", () => {
      expect(() => { playPromptReveal(); vi.advanceTimersByTime(200); }).not.toThrow();
    });

    it("playNextPlayer executes without error", () => {
      expect(() => { playNextPlayer(); vi.advanceTimersByTime(200); }).not.toThrow();
    });
  });

  describe("Never Have I Ever Sounds", () => {
    it("playConfession executes without error", () => {
      expect(() => { playConfession(); vi.advanceTimersByTime(100); }).not.toThrow();
    });

    it("playNextPrompt executes without error", () => {
      expect(() => playNextPrompt()).not.toThrow();
    });

    it("playResultsReveal executes without error", () => {
      expect(() => { playResultsReveal(); vi.advanceTimersByTime(500); }).not.toThrow();
    });
  });

  describe("Imposter Sounds", () => {
    it("playRevealWord executes without error", () => {
      expect(() => { playRevealWord(); vi.advanceTimersByTime(300); }).not.toThrow();
    });

    it("playImposterReveal executes without error", () => {
      expect(() => { playImposterReveal(); vi.advanceTimersByTime(300); }).not.toThrow();
    });

    it("playCrewReveal executes without error", () => {
      expect(() => { playCrewReveal(); vi.advanceTimersByTime(200); }).not.toThrow();
    });

    it("playVoteCast executes without error", () => {
      expect(() => playVoteCast()).not.toThrow();
    });

    it("playDiscussionStart executes without error", () => {
      expect(() => { playDiscussionStart(); vi.advanceTimersByTime(300); }).not.toThrow();
    });

    it("playCrewWins executes without error", () => {
      expect(() => { playCrewWins(); vi.advanceTimersByTime(500); }).not.toThrow();
    });

    it("playImposterWins executes without error", () => {
      expect(() => { playImposterWins(); vi.advanceTimersByTime(600); }).not.toThrow();
    });
  });

  describe("Charades Sounds", () => {
    it("playTimerTick executes without error", () => {
      expect(() => playTimerTick()).not.toThrow();
    });

    it("playTimerCritical executes without error", () => {
      expect(() => { playTimerCritical(); vi.advanceTimersByTime(200); }).not.toThrow();
    });

    it("playCorrectAnswer executes without error", () => {
      expect(() => { playCorrectAnswer(); vi.advanceTimersByTime(200); }).not.toThrow();
    });

    it("playSkip executes without error", () => {
      expect(() => playSkip()).not.toThrow();
    });

    it("playTimesUp executes without error", () => {
      expect(() => { playTimesUp(); vi.advanceTimersByTime(200); }).not.toThrow();
    });

    it("playStartTurn executes without error", () => {
      expect(() => { playStartTurn(); vi.advanceTimersByTime(300); }).not.toThrow();
    });

    it("playGameOverFanfare executes without error", () => {
      expect(() => { playGameOverFanfare(); vi.advanceTimersByTime(1200); }).not.toThrow();
    });
  });

  describe("All exported sound functions", () => {
    const allSounds = [
      playTap, playConfirm, playWhoosh, playError,
      playCardFlip, playCorrectCard, playWrongCard, playNeutralCard, playAssassin, playEndTurn, playTeamWins,
      playTruthPick, playDarePick, playPromptReveal, playNextPlayer,
      playConfession, playNextPrompt, playResultsReveal,
      playRevealWord, playImposterReveal, playCrewReveal, playVoteCast, playDiscussionStart, playCrewWins, playImposterWins,
      playTimerTick, playTimerCritical, playCorrectAnswer, playSkip, playTimesUp, playStartTurn, playGameOverFanfare,
    ];

    it("exports 32 sound functions", () => {
      expect(allSounds).toHaveLength(32);
    });

    it("all are functions", () => {
      allSounds.forEach((fn) => {
        expect(typeof fn).toBe("function");
      });
    });
  });
});
