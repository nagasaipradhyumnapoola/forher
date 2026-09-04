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

/** Whisper-soft tick — when the pointer lands on something interactive */
let lastHover = 0;
export function playHover() {
  const now = Date.now();
  if (now - lastHover < 55) return; // throttle so gliding across UI stays gentle
  lastHover = now;
  playTone(2300, 0.035, 0.022, 'sine', 0, 1);
}

/** Tiny soft click — for normal button presses */
export function playClick() {
  playTone(1850, 0.07, 0.09, 'sine', 0, 2);
  playTone(1240, 0.05, 0.05, 'triangle', 0, 1);
}

/** Tiny "ting" — for selecting an option */
export function playSelect() {
  playTone(1400, 0.11, 0.1, 'sine', 0, 5);
  setTimeout(() => playTone(2100, 0.09, 0.06, 'sine', 0, 3), 42);
}

/** Warmer transition — for moving to next section */
export function playTransition() {
  playTone(880, 0.15, 0.06, 'sine', 0, 10);
  setTimeout(() => playTone(1100, 0.12, 0.05, 'sine', 0, 8), 60);
  setTimeout(() => playTone(1320, 0.1, 0.04, 'sine', 0, 6), 120);
}

/** Soft magical chime — for reveal moments */
export function playReveal() {
  playTone(660, 0.25, 0.06, 'sine', 0, 15);
  setTimeout(() => playTone(880, 0.22, 0.055, 'sine', 5, 12), 100);
  setTimeout(() => playTone(1320, 0.2, 0.05, 'sine', -3, 10), 220);
  setTimeout(() => playTone(1760, 0.18, 0.035, 'sine', 2, 8), 340);
}

/** Slightly happier chime — for YES / success */
export function playSuccess() {
  playTone(523, 0.18, 0.065, 'sine', 0, 10);
  setTimeout(() => playTone(659, 0.16, 0.06, 'sine', 3, 8), 80);
  setTimeout(() => playTone(784, 0.2, 0.055, 'sine', -2, 8), 170);
  setTimeout(() => playTone(1047, 0.25, 0.05, 'sine', 0, 10), 280);
}

/** Gentle confirmation — for saving something */
export function playConfirm() {
  playTone(700, 0.12, 0.06, 'sine', 0, 6);
  setTimeout(() => playTone(880, 0.1, 0.05, 'sine', 0, 5), 70);
}
