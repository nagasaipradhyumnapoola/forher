import React, { useState } from 'react';
import { MeetVibe, EnergyVibe, MusicVibe, CompatibilityAnswers } from '../../types';
import { MEET_VIBES, ENERGY_VIBES, MUSIC_VIBES } from '../../data/vibes';
import { playSelect, playTransition } from '../../utils/audio';
import { logEvent } from '../../utils/logger';

interface Props {
  initialAnswers: CompatibilityAnswers;
  onComplete: (answers: CompatibilityAnswers) => void;
}

export const CompatibilityGame: React.FC<Props> = ({ initialAnswers, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<CompatibilityAnswers>(initialAnswers);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const transition = (cb: () => void) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    playSelect();
    setTimeout(() => { cb(); setIsTransitioning(false); }, 500);
  };

  const handleSelectMeet = (vibe: MeetVibe) => {
    const updated = { ...answers, meetVibe: vibe };
    setAnswers(updated);
    logEvent('compat_meet', { id: vibe, title: MEET_VIBES.find((v) => v.id === vibe)?.title || vibe });
    transition(() => setCurrentStep(1));
  };

  const handleSelectEnergy = (energy: EnergyVibe) => {
    const updated = { ...answers, energyVibe: energy };
    setAnswers(updated);
    logEvent('compat_energy', { id: energy, title: ENERGY_VIBES.find((e) => e.id === energy)?.title || energy });
    transition(() => setCurrentStep(2));
  };

  const handleSelectMusic = (music: MusicVibe) => {
    const updated = { ...answers, musicVibe: music };
    setAnswers(updated);
    logEvent('compat_music', { id: music, title: MUSIC_VIBES.find((m) => m.id === music)?.title || music });
    playTransition();
    setTimeout(() => onComplete(updated), 600);
  };

  const stepTitles = [
    { title: "what sounds like your kind of first meet?", sub: "pick the vibe that feels most like you." },
    { title: "what's the energy vibe?", sub: "how do you imagine the mood feeling?" },
    { title: "what's on the playlist on the way?", sub: "the soundtrack playing in the background." },
  ];

  const renderCards = (items: { id: string; emoji: string; title: string; description: string }[], selected: string | null, onSelect: (id: any) => void) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', width: '100%' }}>
      {items.map((item) => {
        const isSelected = selected === item.id;
        return (
          <div
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`interactive-card ${isSelected ? 'selected' : ''}`}
            role="button" tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(item.id)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.4rem' }}>{item.emoji}</span>
              <h3 className="font-cursive" style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{item.description}</p>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="screen-wrapper experience-container" style={{ maxWidth: '720px' }}>
      {/* Progress dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
        {[0, 1, 2].map((idx) => (
          <div key={idx} style={{
            width: idx === currentStep ? '22px' : '8px', height: '8px',
            borderRadius: 'var(--radius-full)',
            background: idx <= currentStep ? 'var(--accent)' : 'var(--border)',
            transition: 'all var(--transition-normal)',
          }} />
        ))}
      </div>

      {/* Intro copy — only on step 0 */}
      {currentStep === 0 && (
        <p className="cursive-label" style={{ marginBottom: '0.8rem', color: 'var(--text-accent)' }}>
          before we get ahead of ourselves...
        </p>
      )}

      <h2 className="display-title" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '0.4rem' }}>
        {stepTitles[currentStep].title}
      </h2>
      <p className="subheading" style={{ marginBottom: '2rem' }}>
        {stepTitles[currentStep].sub}
      </p>

      <div key={currentStep} className="animate-fade-in-up" style={{ width: '100%' }}>
        {currentStep === 0 && renderCards(MEET_VIBES, answers.meetVibe, handleSelectMeet)}
        {currentStep === 1 && renderCards(ENERGY_VIBES, answers.energyVibe, handleSelectEnergy)}
        {currentStep === 2 && renderCards(MUSIC_VIBES, answers.musicVibe, handleSelectMusic)}
      </div>
    </div>
  );
};
