import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { markInteracted } from '../../utils/audio';

// 8-chord lush, romantic cinematic progression in C / A minor
// Warm, emotional, soothing, and continuous
interface ChordDefinition {
  padFrequencies: number[];
  arpeggioNotes: number[];
}

const CHORDS: ChordDefinition[] = [
  // 1. Cmaj9 (warm, intimate, glowing)
  {
    padFrequencies: [130.81, 196.00, 246.94, 329.63, 392.00], // C3, G3, B3, E4, G4
    arpeggioNotes: [523.25, 587.33, 659.25, 783.99, 987.77]   // C5, D5, E5, G5, B5
  },
  // 2. Am9 (emotional, deep, tender)
  {
    padFrequencies: [110.00, 164.81, 196.00, 261.63, 329.63], // A2, E3, G3, C4, E4
    arpeggioNotes: [440.00, 493.88, 523.25, 659.25, 783.99]   // A4, B4, C5, E5, G5
  },
  // 3. Fmaj7(#11) (dreamy, floating, magical)
  {
    padFrequencies: [87.31, 130.81, 174.61, 220.00, 246.94, 329.63], // F2, C3, F3, A3, B3, E4
    arpeggioNotes: [493.88, 523.25, 659.25, 739.99, 880.00]          // B4, C5, E5, F#5, A5
  },
  // 4. Em7(11) (soft, introspective, cozy)
  {
    padFrequencies: [82.41, 123.47, 164.81, 196.00, 220.00, 293.66], // E2, B2, E3, G3, A3, D4
    arpeggioNotes: [587.33, 659.25, 783.99, 880.00, 987.77]          // D5, E5, G5, A5, B5
  },
  // 5. Dm9 (gentle yearning, sweet melody)
  {
    padFrequencies: [73.42, 110.00, 146.83, 174.61, 220.00, 261.63], // D2, A2, D3, F3, A3, C4
    arpeggioNotes: [440.00, 523.25, 587.33, 659.25, 783.99]          // A4, C5, D5, E5, G5
  },
  // 6. G7sus4(9) (hopeful swell, anticipation)
  {
    padFrequencies: [98.00, 146.83, 174.61, 220.00, 261.63, 293.66], // G2, D3, F3, A3, C4, D4
    arpeggioNotes: [587.33, 659.25, 783.99, 880.00, 1046.50]         // D5, E5, G5, A5, C6
  },
  // 7. Am7 (warm embrace)
  {
    padFrequencies: [110.00, 164.81, 220.00, 261.63, 329.63, 392.00], // A2, E3, A3, C4, E4, G4
    arpeggioNotes: [440.00, 523.25, 659.25, 783.99, 880.00]          // A4, C5, E5, G5, A5
  },
  // 8. Fmaj9 (tender resolution before repeating)
  {
    padFrequencies: [87.31, 130.81, 174.61, 196.00, 220.00, 329.63], // F2, C3, F3, G3, A3, E4
    arpeggioNotes: [523.25, 659.25, 783.99, 880.00, 1046.50]         // C5, E5, G5, A5, C6
  }
];

export const SoundPlayer: React.FC = () => {
  // Sound is ON by default
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const chordIntervalRef = useRef<number | null>(null);
  const bellIntervalRef = useRef<number | null>(null);
  const currentChordIdxRef = useRef<number>(0);
  const isMutedRef = useRef<boolean>(false);

  // Initialize the audio context and master chain
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return audioCtxRef.current;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return null;

      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Master warm lowpass filter for silky analog character
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, ctx.currentTime);
      filter.Q.setValueAtTime(0.5, ctx.currentTime);
      filterNodeRef.current = filter;

      // Master compressor to keep dynamics smooth and velvety
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-24, ctx.currentTime);
      compressor.knee.setValueAtTime(30, ctx.currentTime);
      compressor.ratio.setValueAtTime(4, ctx.currentTime);
      compressor.attack.setValueAtTime(0.05, ctx.currentTime);
      compressor.release.setValueAtTime(0.4, ctx.currentTime);

      // Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMutedRef.current ? 0.0001 : 0.38, ctx.currentTime);
      masterGainRef.current = masterGain;

      filter.connect(compressor);
      compressor.connect(masterGain);
      masterGain.connect(ctx.destination);

      return ctx;
    } catch (err) {
      console.error('Audio initialization error:', err);
      return null;
    }
  }, []);

  // Play a lush, smooth pad chord with long crossfade
  const playPadChord = useCallback((chord: ChordDefinition) => {
    const ctx = audioCtxRef.current;
    const filter = filterNodeRef.current;
    if (!ctx || !filter || ctx.state === 'closed') return;

    const now = ctx.currentTime;
    const chordDuration = 8.5; // Long, continuous duration
    const attackDuration = 3.2; // Silky slow swell
    const releaseDuration = 3.8; // Long trailing crossfade into next chord

    chord.padFrequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Sine for pure harmonics + slight detuning for analog chorus warmth
      osc.type = i === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Gentle stereo micro-detuning
      const detuneAmount = (i % 2 === 0 ? 1 : -1) * (2.5 + (i * 0.8));
      osc.detune.setValueAtTime(detuneAmount, now);

      // Voice volume balancing
      const voiceGain = i === 0 ? 0.045 : 0.038 / Math.sqrt(i + 1);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(voiceGain, now + attackDuration);
      gain.gain.setValueAtTime(voiceGain, now + chordDuration - releaseDuration);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + chordDuration);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(now);
      osc.stop(now + chordDuration + 0.1);
    });
  }, []);

  // Play a delicate, sparkling music-box bell tone
  const playDelicateBell = useCallback((notes: number[]) => {
    const ctx = audioCtxRef.current;
    const filter = filterNodeRef.current;
    if (!ctx || !filter || ctx.state === 'closed' || isMutedRef.current) return;

    const freq = notes[Math.floor(Math.random() * notes.length)];
    const now = ctx.currentTime;
    const duration = 2.4;

    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Subtle octave overtone for bell shimmer
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.022, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(filter);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + duration + 0.05);
    osc2.stop(now + duration + 0.05);
  }, []);

  // Start continuous ambient synthesis engine
  const startAmbienceEngine = useCallback(() => {
    const ctx = initAudio();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    if (chordIntervalRef.current) clearInterval(chordIntervalRef.current);
    if (bellIntervalRef.current) clearInterval(bellIntervalRef.current);

    // Trigger immediate first chord
    playPadChord(CHORDS[currentChordIdxRef.current]);

    // Chords crossfade smoothly every 6.0 seconds (overlapping by 2.5s)
    chordIntervalRef.current = window.setInterval(() => {
      currentChordIdxRef.current = (currentChordIdxRef.current + 1) % CHORDS.length;
      playPadChord(CHORDS[currentChordIdxRef.current]);
    }, 6000);

    // Delicate bell notes sparkle softly on top
    bellIntervalRef.current = window.setInterval(() => {
      if (Math.random() > 0.2) {
        const currentChord = CHORDS[currentChordIdxRef.current];
        playDelicateBell(currentChord.arpeggioNotes);
      }
    }, 2200);
  }, [initAudio, playPadChord, playDelicateBell]);

  // Handle auto-starting sound on mount & attaching first-gesture listener for browser policy
  useEffect(() => {
    isMutedRef.current = false;
    setIsPlaying(true);

    const handleFirstGesture = () => {
      markInteracted();
      const ctx = audioCtxRef.current;
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      } else if (!ctx) {
        startAmbienceEngine();
      }
    };

    // Attempt starting immediately
    startAmbienceEngine();

    // Attach passive listeners on user interaction to seamlessly satisfy autoplay policies
    window.addEventListener('click', handleFirstGesture, { passive: true });
    window.addEventListener('touchstart', handleFirstGesture, { passive: true });
    window.addEventListener('keydown', handleFirstGesture, { passive: true });
    window.addEventListener('pointerdown', handleFirstGesture, { passive: true });

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      window.removeEventListener('pointerdown', handleFirstGesture);

      if (chordIntervalRef.current) clearInterval(chordIntervalRef.current);
      if (bellIntervalRef.current) clearInterval(bellIntervalRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [startAmbienceEngine]);

  // Toggle Mute / Unmute
  const toggleSound = () => {
    markInteracted();
    const ctx = audioCtxRef.current;

    if (!ctx) {
      isMutedRef.current = false;
      setIsPlaying(true);
      startAmbienceEngine();
      return;
    }

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    if (isPlaying) {
      // Mute smoothly
      if (masterGainRef.current) {
        masterGainRef.current.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      }
      isMutedRef.current = true;
      setIsPlaying(false);
    } else {
      // Unmute smoothly
      if (masterGainRef.current) {
        masterGainRef.current.gain.linearRampToValueAtTime(0.38, ctx.currentTime + 0.4);
      }
      isMutedRef.current = false;
      setIsPlaying(true);
    }
  };

  return (
    <button
      onClick={toggleSound}
      title={isPlaying ? 'Mute soothing background melody' : 'Play soothing background melody'}
      aria-label="Toggle background ambience"
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        borderRadius: 'var(--radius-full)',
        background: isPlaying ? 'var(--bg-card-selected)' : 'var(--bg-card)',
        border: `1px solid ${isPlaying ? 'var(--border-focus)' : 'var(--border)'}`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        color: isPlaying ? 'var(--text-accent)' : 'var(--text-secondary)',
        fontSize: '0.84rem',
        fontWeight: 500,
        cursor: 'pointer',
        boxShadow: isPlaying ? '0 4px 14px var(--accent-glow)' : 'var(--shadow-sm)',
        transition: 'all var(--transition-normal)'
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
