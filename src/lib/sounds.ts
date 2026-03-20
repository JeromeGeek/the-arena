/**
 * 🔊 The Arena — Sound Effects Engine
 *
 * All sounds are synthesized via the Web Audio API.
 * Zero audio files. Works offline (PWA-friendly).
 * Sounds are short, punchy, and themed for a cyber-luxury aesthetic.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx || ctx.state === "closed") {
    ctx = new AudioContext();
  }
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  return ctx;
}

/* ─── Helpers ─── */

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.15,
  fadeOut = true,
) {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  if (fadeOut) {
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  }
  osc.connect(gain).connect(c.destination);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + duration);
}

function playNoise(duration: number, volume = 0.08) {
  const c = getCtx();
  const bufferSize = c.sampleRate * duration;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = c.createBufferSource();
  source.buffer = buffer;
  const gain = c.createGain();
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  const filter = c.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 3000;
  source.connect(filter).connect(gain).connect(c.destination);
  source.start();
}

function playChord(
  freqs: number[],
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.1,
) {
  freqs.forEach((f) => playTone(f, duration, type, volume / freqs.length));
}

function playSequence(
  notes: { freq: number; dur: number; delay: number }[],
  type: OscillatorType = "sine",
  volume = 0.12,
) {
  notes.forEach(({ freq, dur, delay }) => {
    setTimeout(() => playTone(freq, dur, type, volume), delay * 1000);
  });
}

/* ═══════════════════════════════════════════════════════════
 *  SHARED / UI SOUNDS
 * ═══════════════════════════════════════════════════════════ */

/** Subtle UI tap — for buttons, cards, selections */
export function playTap() {
  playTone(800, 0.06, "sine", 0.08);
}

/** Positive confirmation bleep */
export function playConfirm() {
  playTone(600, 0.08, "sine", 0.1);
  setTimeout(() => playTone(900, 0.12, "sine", 0.1), 60);
}

/** Soft whoosh for transitions / next */
export function playWhoosh() {
  playNoise(0.15, 0.06);
  playTone(400, 0.12, "sine", 0.04);
}

/** Error / wrong buzz */
export function playError() {
  playTone(200, 0.2, "sawtooth", 0.08);
  playTone(180, 0.25, "sawtooth", 0.06);
}

/* ═══════════════════════════════════════════════════════════
 *  CODENAMES
 * ═══════════════════════════════════════════════════════════ */

/** Card flip — short satisfying click */
export function playCardFlip() {
  playNoise(0.05, 0.1);
  playTone(1200, 0.06, "sine", 0.07);
}

/** Revealed own team card — nice hit */
export function playCorrectCard() {
  playTone(523, 0.1, "triangle", 0.12);
  setTimeout(() => playTone(659, 0.15, "triangle", 0.12), 80);
}

/** Revealed opponent card — uh oh */
export function playWrongCard() {
  playTone(300, 0.15, "square", 0.07);
  setTimeout(() => playTone(250, 0.2, "square", 0.06), 120);
}

/** Neutral bystander card */
export function playNeutralCard() {
  playTone(440, 0.12, "sine", 0.06);
}

/** Assassin card — dramatic dark hit */
export function playAssassin() {
  playTone(80, 0.6, "sawtooth", 0.15);
  playTone(100, 0.4, "square", 0.1);
  playNoise(0.3, 0.12);
  setTimeout(() => playTone(60, 0.8, "sawtooth", 0.12), 200);
}

/** End turn switch */
export function playEndTurn() {
  playTone(440, 0.08, "triangle", 0.08);
  setTimeout(() => playTone(330, 0.12, "triangle", 0.06), 100);
}

/** Team wins — ascending fanfare */
export function playTeamWins() {
  playSequence([
    { freq: 523, dur: 0.15, delay: 0 },
    { freq: 659, dur: 0.15, delay: 0.12 },
    { freq: 784, dur: 0.15, delay: 0.24 },
    { freq: 1047, dur: 0.3, delay: 0.36 },
  ], "triangle", 0.15);
}

/* ═══════════════════════════════════════════════════════════
 *  TRUTH OR DARE
 * ═══════════════════════════════════════════════════════════ */

/** Truth chosen — mysterious shimmer */
export function playTruthPick() {
  playTone(660, 0.15, "sine", 0.1);
  setTimeout(() => playTone(880, 0.2, "sine", 0.08), 100);
  setTimeout(() => playTone(1100, 0.15, "sine", 0.06), 200);
}

/** Dare chosen — bold punch */
export function playDarePick() {
  playTone(300, 0.12, "sawtooth", 0.08);
  setTimeout(() => playTone(450, 0.15, "sawtooth", 0.1), 80);
  setTimeout(() => playTone(600, 0.1, "square", 0.06), 160);
}

/** Prompt card reveals with dramatic flair */
export function playPromptReveal() {
  playNoise(0.08, 0.05);
  playTone(500, 0.15, "triangle", 0.1);
  setTimeout(() => playTone(750, 0.2, "triangle", 0.08), 100);
}

/** Next player transition — soft chime */
export function playNextPlayer() {
  playWhoosh();
  setTimeout(() => playTone(700, 0.1, "sine", 0.08), 100);
}

/* ═══════════════════════════════════════════════════════════
 *  NEVER HAVE I EVER
 * ═══════════════════════════════════════════════════════════ */

/** Player confesses "I did it" — playful pop */
export function playConfession() {
  playTone(600, 0.06, "sine", 0.1);
  setTimeout(() => playTone(800, 0.08, "sine", 0.08), 50);
}

/** Next prompt slide */
export function playNextPrompt() {
  playWhoosh();
}

/** Results reveal — triumphant */
export function playResultsReveal() {
  playSequence([
    { freq: 440, dur: 0.12, delay: 0 },
    { freq: 554, dur: 0.12, delay: 0.1 },
    { freq: 659, dur: 0.12, delay: 0.2 },
    { freq: 880, dur: 0.25, delay: 0.3 },
  ], "triangle", 0.12);
}

/* ═══════════════════════════════════════════════════════════
 *  IMPOSTER
 * ═══════════════════════════════════════════════════════════ */

/** "Tap to Reveal" — suspense reveal */
export function playRevealWord() {
  playTone(300, 0.2, "sine", 0.08);
  setTimeout(() => playTone(450, 0.25, "sine", 0.1), 150);
}

/** You are the Imposter — dramatic sting */
export function playImposterReveal() {
  playTone(150, 0.3, "sawtooth", 0.12);
  setTimeout(() => playTone(120, 0.4, "sawtooth", 0.1), 200);
  setTimeout(() => playNoise(0.15, 0.08), 100);
}

/** Crew member word reveal — safe tone */
export function playCrewReveal() {
  playTone(523, 0.12, "triangle", 0.1);
  setTimeout(() => playTone(659, 0.15, "triangle", 0.08), 80);
}

/** Vote cast — decisive thud */
export function playVoteCast() {
  playTone(200, 0.15, "square", 0.1);
  playNoise(0.08, 0.06);
}

/** Discussion starts — attention chime */
export function playDiscussionStart() {
  playTone(700, 0.1, "sine", 0.1);
  setTimeout(() => playTone(880, 0.12, "sine", 0.08), 100);
  setTimeout(() => playTone(700, 0.1, "sine", 0.06), 200);
}

/** Crew wins — celebratory */
export function playCrewWins() {
  playTeamWins();
}

/** Imposter wins — ominous victory */
export function playImposterWins() {
  playSequence([
    { freq: 300, dur: 0.2, delay: 0 },
    { freq: 250, dur: 0.2, delay: 0.15 },
    { freq: 200, dur: 0.2, delay: 0.3 },
    { freq: 150, dur: 0.4, delay: 0.45 },
  ], "sawtooth", 0.1);
}

/* ═══════════════════════════════════════════════════════════
 *  CHARADES
 * ═══════════════════════════════════════════════════════════ */

/** Timer tick — for last 5 seconds */
export function playTimerTick() {
  playTone(1000, 0.05, "sine", 0.1);
}

/** Timer critical — last 3 seconds, more urgent */
export function playTimerCritical() {
  playTone(1200, 0.06, "square", 0.1);
  setTimeout(() => playTone(1200, 0.04, "square", 0.06), 80);
}

/** Correct answer — satisfying ding */
export function playCorrectAnswer() {
  playTone(880, 0.08, "sine", 0.12);
  setTimeout(() => playTone(1100, 0.12, "sine", 0.1), 60);
}

/** Skip — soft dud */
export function playSkip() {
  playTone(300, 0.1, "triangle", 0.06);
}

/** Time's up! — buzzer horn */
export function playTimesUp() {
  playTone(400, 0.15, "sawtooth", 0.12);
  setTimeout(() => playTone(350, 0.2, "sawtooth", 0.1), 120);
  playNoise(0.2, 0.06);
}

/** Start turn — energizing */
export function playStartTurn() {
  playSequence([
    { freq: 523, dur: 0.08, delay: 0 },
    { freq: 659, dur: 0.08, delay: 0.08 },
    { freq: 784, dur: 0.12, delay: 0.16 },
  ], "triangle", 0.12);
}

/** Game over fanfare — grand */
export function playGameOverFanfare() {
  playSequence([
    { freq: 523, dur: 0.15, delay: 0 },
    { freq: 523, dur: 0.08, delay: 0.15 },
    { freq: 659, dur: 0.15, delay: 0.25 },
    { freq: 784, dur: 0.15, delay: 0.4 },
    { freq: 1047, dur: 0.4, delay: 0.55 },
  ], "triangle", 0.15);
  setTimeout(() => playChord([523, 659, 784, 1047], 0.5, "sine", 0.1), 700);
}

/* ═══════════════════════════════════════════════════════════
 *  SNAP QUIZ
 * ═══════════════════════════════════════════════════════════ */

/** New image appears — soft camera shutter click */
export function playSnapRevealStart() {
  playNoise(0.04, 0.12);
  playTone(1800, 0.04, "sine", 0.06);
  setTimeout(() => playTone(1200, 0.06, "sine", 0.05), 40);
}

/** Image fully reveals — satisfying "ta-da" shimmer */
export function playSnapFullReveal() {
  playSequence([
    { freq: 660, dur: 0.08, delay: 0 },
    { freq: 880, dur: 0.1,  delay: 0.07 },
    { freq: 1100, dur: 0.14, delay: 0.16 },
  ], "triangle", 0.1);
}

/** "Answer" button tapped — decisive buzz-in thud */
export function playSnapBuzzIn() {
  playTone(500, 0.06, "square", 0.1);
  playNoise(0.05, 0.07);
  setTimeout(() => playTone(700, 0.08, "sine", 0.08), 50);
}

/** Pass — swoosh to next team */
export function playSnapPass() {
  playNoise(0.12, 0.05);
  playTone(440, 0.08, "sine", 0.05);
  setTimeout(() => playTone(330, 0.1, "sine", 0.04), 80);
}

/** Correct answer — bright ascending ding (distinct from generic correct) */
export function playSnapCorrect() {
  playTone(659, 0.07, "triangle", 0.12);
  setTimeout(() => playTone(880, 0.09, "triangle", 0.12), 65);
  setTimeout(() => playTone(1175, 0.18, "triangle", 0.14), 140);
}

/** Wrong answer — descending thud */
export function playSnapWrong() {
  playTone(350, 0.1, "sawtooth", 0.1);
  setTimeout(() => playTone(250, 0.15, "sawtooth", 0.08), 90);
  playNoise(0.12, 0.05);
}

/** Round break — triumphant short fanfare */
export function playSnapRoundBreak() {
  playSequence([
    { freq: 523, dur: 0.1,  delay: 0 },
    { freq: 659, dur: 0.1,  delay: 0.1 },
    { freq: 784, dur: 0.1,  delay: 0.2 },
    { freq: 1047, dur: 0.3, delay: 0.32 },
  ], "triangle", 0.14);
}

/** Countdown tick (3, 2, 1) */
export function playSnapCountdownTick() {
  playTone(880, 0.05, "sine", 0.1);
}

/** Countdown "GO!" */
export function playSnapCountdownGo() {
  playTone(1047, 0.06, "sine", 0.12);
  setTimeout(() => playTone(1319, 0.1, "triangle", 0.14), 55);
}

/** Time's up beep — sharp alarm buzz when the reveal timer expires */
export function playSnapTimeUp() {
  // Three rapid descending beeps — urgent alarm feel
  playTone(880, 0.08, "square", 0.13);
  setTimeout(() => playTone(740, 0.08, "square", 0.13), 120);
  setTimeout(() => playTone(587, 0.16, "square", 0.15), 240);
  // Low noise burst underneath
  setTimeout(() => playNoise(0.12, 0.06), 0);
}
