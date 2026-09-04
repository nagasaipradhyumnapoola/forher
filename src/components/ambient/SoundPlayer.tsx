import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export const SoundPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Gentle ambient chord notes (frequencies in Hz: Cmaj9 / Am7 / Fmaj7 progressions)
  const chordSets = [
    [261.63, 329.63, 392.0, 493.88], // C, E, G, B
    [220.0, 261.63, 329.63, 392.0],  // A, C, E, G
    [174.61, 220.0, 261.63, 329.63], // F, A, C, E
    [196.0, 246.94, 293.66, 349.23]  // G, B, D, F
  ];

  const playChord = (ctx: AudioContext, masterGain: GainNode, notes: number[]) => {
    notes.forEach((freq) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Warm slight detune for lush chorus feel
      osc.detune.setValueAtTime((Math.random() - 0.5) * 6, ctx.currentTime);

      const now = ctx.currentTime;
      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(0.045, now + 2.5);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 7.5);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 8);
    });
  };

  const toggleSound = async () => {
    if (!isPlaying) {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;

        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContextClass();
        }

        if (audioCtxRef.current.state === 'suspended') {
          await audioCtxRef.current.resume();
        }

        const ctx = audioCtxRef.current;
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.5, ctx.currentTime);
        masterGain.connect(ctx.destination);
        gainNodeRef.current = masterGain;

        let chordIndex = 0;
        playChord(ctx, masterGain, chordSets[chordIndex]);

        intervalRef.current = window.setInterval(() => {
          chordIndex = (chordIndex + 1) % chordSets.length;
          playChord(ctx, masterGain, chordSets[chordIndex]);
        }, 5500);

        setIsPlaying(true);
      } catch (err) {
        console.error('Audio initialization error:', err);
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.linearRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.8);
      }
      setTimeout(() => {
        setIsPlaying(false);
      }, 800);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

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
        padding: '8px 14px',
        borderRadius: 'var(--radius-full)',
        background: isPlaying ? 'var(--bg-card-selected)' : 'var(--bg-card)',
        border: `1px solid ${isPlaying ? 'var(--accent-border)' : 'var(--border)'}`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        color: isPlaying ? 'var(--text-accent)' : 'var(--text-secondary)',
        fontSize: '0.82rem',
        fontWeight: 500,
        cursor: 'pointer',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all var(--transition-normal)'
      }}
    >
      {isPlaying ? (
        <>
          <Volume2 size={16} className="animate-pulse" />
          <span>Sound On</span>
        </>
      ) : (
        <>
          <VolumeX size={16} />
          <span>Music</span>
        </>
      )}
    </button>
  );
};
