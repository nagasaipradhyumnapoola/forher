// Centralized tiny interaction sounds using Web Audio API
// All sounds are synthesized — zero external dependencies

let audioCtx: AudioContext | null = null;
let userHasInteracted = false;

function getContext(): AudioContext | null {
  if (!audioCtx) {
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === 'suspended' && userHasInteracted) {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function markInteracted() {
  userHasInteracted = true;
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
}

function playTone(
  freq: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine',
  detune: number = 0,
  attackMs: number = 8,
  releaseMs?: number
) {
  const ctx = getContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;

  const now = ctx.currentTime;
  const attack = attackMs / 1000;
  const release = (releaseMs ?? duration * 600) / 1000;

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration);
}

/* All UI sounds sit in a warm mid register (500–900 Hz) with soft attacks —
   high, bright tones read as "shrill/beepy", which is what we're avoiding. */

/** Whisper-soft tick — when the pointer lands on something interactive */
let lastHover = 0;
export function playHover() {
  const now = Date.now();
  if (now - lastHover < 70) return; // throttle so gliding across UI stays gentle
  lastHover = now;
  playTone(740, 0.05, 0.01, 'sine', 0, 8, 45);
}

/** Tiny soft click — for normal button presses (warm wooden tap) */
export function playClick() {
  playTone(523.25, 0.12, 0.045, 'sine', 0, 7, 100);
  playTone(784, 0.07, 0.018, 'sine', 0, 5, 60);
}

/** Gentle "ting" — for selecting an option */
export function playSelect() {
  playTone(587.33, 0.15, 0.045, 'sine', 0, 9, 120);
  setTimeout(() => playTone(880, 0.12, 0.026, 'sine', 0, 7, 100), 55);
}

/** Warmer transition — for moving to next section */
export function playTransition() {
  playTone(392, 0.22, 0.04, 'sine', 0, 14, 180);
  setTimeout(() => playTone(523.25, 0.2, 0.032, 'sine', 0, 12, 160), 70);
  setTimeout(() => playTone(659.25, 0.18, 0.024, 'sine', 0, 10, 140), 140);
}

/** Soft magical chime — for reveal moments */
export function playReveal() {
  playTone(392, 0.32, 0.04, 'sine', 0, 20, 260);
  setTimeout(() => playTone(523.25, 0.3, 0.036, 'sine', 4, 18, 240), 120);
  setTimeout(() => playTone(659.25, 0.28, 0.03, 'sine', -3, 16, 220), 250);
  setTimeout(() => playTone(783.99, 0.26, 0.022, 'sine', 2, 14, 200), 380);
}

/** Slightly happier chime — for YES / success */
export function playSuccess() {
  playTone(392, 0.24, 0.042, 'sine', 0, 14, 200);
  setTimeout(() => playTone(523.25, 0.22, 0.038, 'sine', 3, 12, 180), 90);
  setTimeout(() => playTone(659.25, 0.26, 0.034, 'sine', -2, 12, 200), 185);
  setTimeout(() => playTone(783.99, 0.3, 0.03, 'sine', 0, 14, 240), 300);
}

/** Gentle confirmation — for saving something */
export function playConfirm() {
  playTone(523.25, 0.16, 0.04, 'sine', 0, 9, 130);
  setTimeout(() => playTone(698.46, 0.14, 0.03, 'sine', 0, 8, 120), 80);
}
