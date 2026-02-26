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
 *  MAFIA — GODLY NARRATION
 *  Deep commanding voice + heavenly ambient pad behind it
 * ═══════════════════════════════════════════════════════════ */

let speechSupported: boolean | null = null;
let voicesLoaded = false;

function isSpeechSupported(): boolean {
  if (speechSupported !== null) return speechSupported;
  speechSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;
  return speechSupported;
}

/** Ensure voices are loaded (they load async in most browsers) */
function ensureVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!isSpeechSupported()) { resolve([]); return; }
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      voicesLoaded = true;
      resolve(voices);
      return;
    }
    const onVoices = () => {
      voicesLoaded = true;
      window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener("voiceschanged", onVoices);
    setTimeout(() => {
      window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
      resolve(window.speechSynthesis.getVoices());
    }, 2000);
  });
}

if (typeof window !== "undefined") {
  ensureVoices();
}

/* ── Heavenly ambient pad ─────────────────────────────────
   A shimmering ethereal drone using layered sine waves
   with slow LFO modulation — like light pouring through
   stained glass. Fades in/out gently.
   ─────────────────────────────────────────────────────── */
let ambientNodes: { oscs: OscillatorNode[]; gain: GainNode } | null = null;

function startHeavenlyPad() {
  const ac = getCtx();

  const master = ac.createGain();
  master.gain.setValueAtTime(0, ac.currentTime);
  master.gain.linearRampToValueAtTime(0.07, ac.currentTime + 1.0);
  master.connect(ac.destination);

  const oscs: OscillatorNode[] = [];

  // Dark minor drone: Dm (D2, A2, D3, F3) — sinister, brooding
  const freqs = [73.42, 110.0, 146.83, 174.61];

  freqs.forEach((freq, i) => {
    const osc = ac.createOscillator();
    // Mix of sine and triangle for darker texture
    osc.type = i === 0 ? "triangle" : "sine";
    osc.frequency.setValueAtTime(freq, ac.currentTime);

    // Very slow, unsettling drift
    const lfo = ac.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.08 + i * 0.03, ac.currentTime);
    const lfoGain = ac.createGain();
    lfoGain.gain.setValueAtTime(0.4, ac.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();

    const voiceGain = ac.createGain();
    // Root note louder, upper voices quieter
    voiceGain.gain.setValueAtTime(i === 0 ? 0.6 : 0.35 - i * 0.05, ac.currentTime);
    osc.connect(voiceGain);
    voiceGain.connect(master);

    osc.start();
    oscs.push(osc, lfo);
  });

  // Low ominous pulse — breathing heartbeat feel
  const pulse = ac.createOscillator();
  pulse.type = "sine";
  pulse.frequency.setValueAtTime(55, ac.currentTime); // A1 — deep sub presence
  const pulseGain = ac.createGain();
  pulseGain.gain.setValueAtTime(0, ac.currentTime);
  const pulseLfo = ac.createOscillator();
  pulseLfo.type = "sine";
  pulseLfo.frequency.setValueAtTime(0.25, ac.currentTime); // Slow throb
  const pulseLfoGain = ac.createGain();
  pulseLfoGain.gain.setValueAtTime(0.02, ac.currentTime);
  pulseLfo.connect(pulseLfoGain);
  pulseLfoGain.connect(pulseGain.gain);
  pulseLfo.start();
  pulse.connect(pulseGain);
  pulseGain.connect(master);
  pulse.start();
  oscs.push(pulse, pulseLfo);

  ambientNodes = { oscs, gain: master };
}

function stopHeavenlyPad() {
  if (!ambientNodes) return;
  const ac = getCtx();

  const { oscs, gain } = ambientNodes;
  gain.gain.linearRampToValueAtTime(0, ac.currentTime + 1.2);

  setTimeout(() => {
    oscs.forEach((o) => { try { o.stop(); } catch { /* already stopped */ } });
    try { gain.disconnect(); } catch { /* already disconnected */ }
  }, 1400);

  ambientNodes = null;
}

/** 
 * Speak with a dark, authoritative narrator voice.
 * Uses SSML-style pauses via comma/ellipsis tricks and selects
 * the best available voice on the device.
 * 
 * For best quality on macOS/iOS, enable premium voices:
 * Settings → Accessibility → Spoken Content → Voices → English → Download a premium voice
 */
export function speak(text: string, rate = 0.82, pitch = 0.9): Promise<void> {
  return new Promise(async (resolve) => {
    if (!isSpeechSupported()) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();

    const voices = voicesLoaded
      ? window.speechSynthesis.getVoices()
      : await ensureVoices();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = 1;

    const englishVoices = voices.filter((v) => v.lang.startsWith("en"));
    const pick = (pattern: RegExp) =>
      englishVoices.find((v) => pattern.test(v.name));

    // Priority: premium/enhanced (near-human) → quality standard voices
    // Explicitly avoid known robotic/novelty voices
    const AVOID = /compact|bad|bahh|boing|bell|bubble|wobble|cello|whisper|zarvox|trinoid|organ|deranged|hysterical|jester|ralph|fred|junior|grandma|grandpa|superstar|rocko|shelley|sandy|flo|reed|eddy|aman|tara|rishi|albert/i;

    const chosen =
      // macOS / iOS premium voices — near-human quality
      pick(/aaron.*premium/i) ??
      pick(/daniel.*premium/i) ??
      pick(/arthur.*premium/i) ??
      pick(/tom.*premium/i) ??
      pick(/oliver.*premium/i) ??
      pick(/liam.*premium/i) ??
      pick(/evan.*premium/i) ??
      pick(/.*premium.*male/i) ??
      pick(/premium|enhanced/i) ??
      // Chrome / Android good voices
      pick(/^google uk english male/i) ??
      pick(/^google us english/i) ??
      // Standard non-robotic male voices
      pick(/\bdaniel\b/i) ??
      pick(/\baaron\b/i) ??
      pick(/\btom\b/i) ??
      pick(/\boliver\b/i) ??
      pick(/\bliam\b/i) ??
      // Microsoft voices (Windows / Edge)
      pick(/microsoft.*(guy|david|mark|ryan)/i) ??
      // Any remaining clean English voice
      englishVoices.find((v) => !AVOID.test(v.name)) ??
      englishVoices[0] ??
      null;

    const isPremium = chosen?.name ? /premium|enhanced/i.test(chosen.name) : false;
    const isGoogle = chosen?.name ? /^google/i.test(chosen.name) : false;

    // Premium voices sound great at natural settings; 
    // Google voices need slower rate to not sound rushed;
    // Standard voices benefit from slightly lower rate + pitch
    utterance.rate  = isPremium ? 0.88 : isGoogle ? 0.80 : rate;
    utterance.pitch = isPremium ? 1.0  : isGoogle ? 0.95 : pitch;
    utterance.voice = chosen;

    let resolved = false;
    const done = () => {
      if (resolved) return;
      resolved = true;
      clearInterval(watchdog);
      resolve();
    };

    utterance.onend = done;
    utterance.onerror = done;

    window.speechSynthesis.speak(utterance);

    // Watchdog: some browsers freeze speechSynthesis mid-sentence
    const watchdog = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        done();
        return;
      }
      // Keep it alive on iOS/macOS which can suspend it
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }, 5000);
  });
}

/** Stop any ongoing narration + ambient */
export function stopSpeaking() {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
  stopHeavenlyPad();
}

/** Narrate night announcement with dark ambient drone */
export async function narrateNightAnnounce(onDone: () => void) {
  startHeavenlyPad();
  await speak("Night falls upon the town. Everyone... close your eyes. Do not open them, until you are called upon.");
  await new Promise((r) => setTimeout(r, 1000));
  stopHeavenlyPad();
  onDone();
}

/** Narrate the privacy wall for a specific role */
export async function narratePrivacyWall(
  role: "mafia" | "doctor" | "detective",
  onReady: () => void
) {
  startHeavenlyPad();
  const lines: Record<string, string> = {
    mafia:     "Mafia. Open your eyes. Look around the table. Silently... choose your target for tonight. You have a few moments.",
    doctor:    "Doctor. Open your eyes. Someone in this town is in danger tonight. Think carefully... who will you protect?",
    detective: "Detective. Open your eyes. You may investigate one player tonight. Trust your instincts. Choose wisely.",
  };
  await speak(lines[role]);
  await new Promise((r) => setTimeout(r, 500));
  stopHeavenlyPad();
  onReady();
}

/** Narrate "close your eyes" after a night action */
export async function narrateNightDone(role: "mafia" | "doctor" | "detective") {
  startHeavenlyPad();
  const lines: Record<string, string> = {
    mafia:     "Mafia... close your eyes. Return to the darkness. Your deed... is done.",
    doctor:    "Doctor... close your eyes. You have done what you can. Rest now, and hope it was enough.",
    detective: "Detective... close your eyes. Hold that knowledge close. Tell no one, until the time is right.",
  };
  await speak(lines[role]);
  await new Promise((r) => setTimeout(r, 600));
  stopHeavenlyPad();
}

/** Narrate "everyone open your eyes" */
export async function narrateWakeUp() {
  startHeavenlyPad();
  await speak("Everyone... open your eyes. A new day has dawned upon the town. But I am afraid... not everyone made it through the night.");
  await new Promise((r) => setTimeout(r, 400));
  stopHeavenlyPad();
}
