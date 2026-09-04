import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { markInteracted } from '../../utils/audio';
import { onMood, currentMood, type Mood } from '../../utils/mood';

// Continuous, lush, romantic cinematic progression (C / A-minor colour).
// Pads crossfade slowly; a delicate music-box bell sparkles on top; a soft
// sub-bass grounds each chord; a convolution reverb gives it air; a slow LFO
// breathes the filter; and the whole thing brightens with the app mood.

interface ChordDefinition {
  padFrequencies: number[];
  arpeggioNotes: number[];
  root: number;
}

const CHORDS: ChordDefinition[] = [
  { padFrequencies: [130.81, 196.0, 246.94, 329.63, 392.0], arpeggioNotes: [523.25, 587.33, 659.25, 783.99, 987.77], root: 65.41 },
  { padFrequencies: [110.0, 164.81, 196.0, 261.63, 329.63], arpeggioNotes: [440.0, 493.88, 523.25, 659.25, 783.99], root: 55.0 },
  { padFrequencies: [87.31, 130.81, 174.61, 220.0, 246.94, 329.63], arpeggioNotes: [493.88, 523.25, 659.25, 739.99, 880.0], root: 43.65 },
  { padFrequencies: [82.41, 123.47, 164.81, 196.0, 220.0, 293.66], arpeggioNotes: [587.33, 659.25, 783.99, 880.0, 987.77], root: 41.2 },
  { padFrequencies: [73.42, 110.0, 146.83, 174.61, 220.0, 261.63], arpeggioNotes: [440.0, 523.25, 587.33, 659.25, 783.99], root: 36.71 },
  { padFrequencies: [98.0, 146.83, 174.61, 220.0, 261.63, 293.66], arpeggioNotes: [587.33, 659.25, 783.99, 880.0, 1046.5], root: 49.0 },
  { padFrequencies: [110.0, 164.81, 220.0, 261.63, 329.63, 392.0], arpeggioNotes: [440.0, 523.25, 659.25, 783.99, 880.0], root: 55.0 },
  { padFrequencies: [87.31, 130.81, 174.61, 196.0, 220.0, 329.63], arpeggioNotes: [523.25, 659.25, 783.99, 880.0, 1046.5], root: 43.65 },
];

const MOOD_FILTER: Record<Mood, number> = { calm: 1250, warm: 1500, magical: 1900, celebration: 2400 };
const MOOD_LEVEL: Record<Mood, number> = { calm: 0.42, warm: 0.46, magical: 0.5, celebration: 0.55 };

function makeImpulse(ctx: AudioContext, seconds = 2.8, decay = 2.6): AudioBuffer {
  const rate = ctx.sampleRate;
  const len = Math.floor(rate * seconds);
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

export const SoundPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const chordTimer = useRef<number | null>(null);
  const bellTimer = useRef<number | null>(null);
  const idxRef = useRef<number>(0);
  const mutedRef = useRef<boolean>(false);
  const moodRef = useRef<Mood>(currentMood());

  const initAudio = useCallback(() => {
    // Reuse only a live context; a closed one (StrictMode remount / prior cleanup) must be rebuilt.
    if (ctxRef.current && ctxRef.current.state !== 'closed') return ctxRef.current;
    ctxRef.current = null;
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      const ctx = new AC();
      ctxRef.current = ctx;
      const now = ctx.currentTime;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(MOOD_FILTER[moodRef.current], now);
      filter.Q.setValueAtTime(0.6, now);
      filterRef.current = filter;

      // slow "breathing" of the cutoff
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.06, now);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(180, now);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      lfoRef.current = lfo;

      // reverb send
      const convolver = ctx.createConvolver();
      convolver.buffer = makeImpulse(ctx);
      const wet = ctx.createGain();
      wet.gain.setValueAtTime(0.32, now);
      const dry = ctx.createGain();
      dry.gain.setValueAtTime(0.85, now);

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-24, now);
      compressor.knee.setValueAtTime(30, now);
      compressor.ratio.setValueAtTime(4, now);
      compressor.attack.setValueAtTime(0.05, now);
      compressor.release.setValueAtTime(0.4, now);

      const master = ctx.createGain();
      master.gain.setValueAtTime(mutedRef.current ? 0.0001 : MOOD_LEVEL[moodRef.current], now);
      masterRef.current = master;

      filter.connect(dry);
      filter.connect(convolver);
      convolver.connect(wet);
      dry.connect(compressor);
      wet.connect(compressor);
      compressor.connect(master);
      master.connect(ctx.destination);

      return ctx;
    } catch (err) {
      console.error('Audio init error:', err);
      return null;
    }
  }, []);

  const playPadChord = useCallback((chord: ChordDefinition) => {
    const ctx = ctxRef.current;
    const filter = filterRef.current;
    if (!ctx || !filter || ctx.state === 'closed') return;
    const now = ctx.currentTime;
    const dur = 8.5;
    const attack = 3.2;
    const release = 3.8;

    chord.padFrequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      osc.type = i === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime((i % 2 === 0 ? 1 : -1) * (2.5 + i * 0.8), now);
      const voiceGain = i === 0 ? 0.045 : 0.038 / Math.sqrt(i + 1);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(voiceGain, now + attack);
      gain.gain.setValueAtTime(voiceGain, now + dur - release);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(gain);
      if (panner) {
        panner.pan.setValueAtTime(Math.max(-0.7, Math.min(0.7, (i - chord.padFrequencies.length / 2) * 0.28)), now);
        gain.connect(panner);
        panner.connect(filter);
      } else {
        gain.connect(filter);
      }
      osc.start(now);
      osc.stop(now + dur + 0.1);
    });

    // soft sub-bass grounding
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(chord.root, now);
    subGain.gain.setValueAtTime(0.0001, now);
    subGain.gain.linearRampToValueAtTime(0.05, now + attack);
    subGain.gain.setValueAtTime(0.05, now + dur - release);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    sub.connect(subGain);
    subGain.connect(filter);
    sub.start(now);
    sub.stop(now + dur + 0.1);
  }, []);

  const playBell = useCallback((notes: number[]) => {
    const ctx = ctxRef.current;
    const filter = filterRef.current;
    if (!ctx || !filter || ctx.state === 'closed' || mutedRef.current) return;
    const freq = notes[Math.floor(Math.random() * notes.length)];
    const now = ctx.currentTime;
    const dur = 2.4;
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.022, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain);
    osc2.connect(gain);
    if (panner) {
      panner.pan.setValueAtTime((Math.random() - 0.5) * 1.2, now);
      gain.connect(panner);
      panner.connect(filter);
    } else {
      gain.connect(filter);
    }
    osc.start(now);
    osc2.start(now);
    osc.stop(now + dur + 0.05);
    osc2.stop(now + dur + 0.05);
  }, []);

  const startEngine = useCallback(() => {
    const ctx = initAudio();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    if (chordTimer.current) clearInterval(chordTimer.current);
    if (bellTimer.current) clearInterval(bellTimer.current);

    playPadChord(CHORDS[idxRef.current]);
    chordTimer.current = window.setInterval(() => {
      idxRef.current = (idxRef.current + 1) % CHORDS.length;
      playPadChord(CHORDS[idxRef.current]);
    }, 6000);
    bellTimer.current = window.setInterval(() => {
      if (Math.random() > 0.2) playBell(CHORDS[idxRef.current].arpeggioNotes);
    }, 2200);
  }, [initAudio, playPadChord, playBell]);

  // React to mood → shift brightness + level smoothly.
  useEffect(() => {
    const off = onMood((m) => {
      moodRef.current = m;
      const ctx = ctxRef.current;
      if (!ctx) return;
      const now = ctx.currentTime;
      if (filterRef.current) filterRef.current.frequency.linearRampToValueAtTime(MOOD_FILTER[m], now + 1.2);
      if (masterRef.current && !mutedRef.current) masterRef.current.gain.linearRampToValueAtTime(MOOD_LEVEL[m], now + 1.2);
    });
    return off;
  }, []);

  useEffect(() => {
    mutedRef.current = false;
    setIsPlaying(true);

    const handleFirstGesture = () => {
      markInteracted();
      const ctx = ctxRef.current;
      if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
      else if (!ctx) startEngine();
    };

    startEngine();
    window.addEventListener('click', handleFirstGesture, { passive: true });
    window.addEventListener('touchstart', handleFirstGesture, { passive: true });
    window.addEventListener('keydown', handleFirstGesture, { passive: true });
    window.addEventListener('pointerdown', handleFirstGesture, { passive: true });

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      window.removeEventListener('pointerdown', handleFirstGesture);
      if (chordTimer.current) clearInterval(chordTimer.current);
      if (bellTimer.current) clearInterval(bellTimer.current);
      const dying = ctxRef.current;
      ctxRef.current = null;
      masterRef.current = null;
      filterRef.current = null;
      lfoRef.current = null;
      if (dying && dying.state !== 'closed') dying.close().catch(() => {});
    };
  }, [startEngine]);

  const toggleSound = () => {
    markInteracted();
    const ctx = ctxRef.current;
    if (!ctx) {
      mutedRef.current = false;
      setIsPlaying(true);
      startEngine();
      return;
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    if (isPlaying) {
      if (masterRef.current) masterRef.current.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      mutedRef.current = true;
      setIsPlaying(false);
    } else {
      if (masterRef.current) masterRef.current.gain.linearRampToValueAtTime(MOOD_LEVEL[moodRef.current], ctx.currentTime + 0.4);
      mutedRef.current = false;
      setIsPlaying(true);
    }
  };

  return (
    <button
      onClick={toggleSound}
      data-cursor="hover"
      title={isPlaying ? 'Mute the music' : 'Play the music'}
      aria-label="Toggle background music"
      className="sound-toggle"
      style={{
        position: 'fixed',
        top: '22px',
        right: '22px',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        borderRadius: 'var(--radius-full)',
        background: isPlaying ? 'var(--bg-card-selected)' : 'var(--bg-card)',
        border: `1px solid ${isPlaying ? 'var(--border-focus)' : 'var(--border)'}`,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        color: isPlaying ? 'var(--text-accent)' : 'var(--text-secondary)',
        fontSize: '0.84rem',
        fontWeight: 500,
        cursor: 'pointer',
        boxShadow: isPlaying ? '0 4px 14px var(--accent-glow)' : 'var(--shadow-sm)',
        transition: 'all var(--transition-normal)',
      }}
    >
      {isPlaying ? (
        <>
          <Volume2 size={16} className="animate-pulse" />
          <span className="font-cursive" style={{ fontSize: '1.05rem', fontWeight: 600 }}>Music On</span>
        </>
      ) : (
        <>
          <VolumeX size={16} />
          <span>Muted</span>
        </>
      )}
    </button>
  );
};
