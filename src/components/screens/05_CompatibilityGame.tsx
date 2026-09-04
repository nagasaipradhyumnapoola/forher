import React, { useState } from 'react';
import { MeetVibe, EnergyVibe, MusicVibe, CompatibilityAnswers } from '../../types';
import { MEET_VIBES, ENERGY_VIBES, MUSIC_VIBES } from '../../data/vibes';
import { Sparkles, Compass } from 'lucide-react';

interface Props {
  initialAnswers: CompatibilityAnswers;
  onComplete: (answers: CompatibilityAnswers) => void;
}

export const CompatibilityGame: React.FC<Props> = ({ initialAnswers, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<CompatibilityAnswers>(initialAnswers);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const handleSelectMeet = (vibe: MeetVibe) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    const updated = { ...answers, meetVibe: vibe };
    setAnswers(updated);

    setTimeout(() => {
      setCurrentStep(1);
      setIsTransitioning(false);
    }, 450);
  };

  const handleSelectEnergy = (energy: EnergyVibe) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    const updated = { ...answers, energyVibe: energy };
    setAnswers(updated);

    setTimeout(() => {
      setCurrentStep(2);
      setIsTransitioning(false);
    }, 450);
  };

  const handleSelectMusic = (music: MusicVibe) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    const updated = { ...answers, musicVibe: music };
    setAnswers(updated);

    setTimeout(() => {
      onComplete(updated);
    }, 550);
  };

  return (
    <div className="screen-wrapper experience-container">
      {/* Progress Dots */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '2rem'
        }}
      >
        {[0, 1, 2].map((idx) => (
          <div
            key={idx}
            style={{
              width: idx === currentStep ? '24px' : '8px',
              height: '8px',
              borderRadius: 'var(--radius-full)',
              background: idx <= currentStep ? 'var(--accent)' : 'var(--border)',
              transition: 'all var(--transition-normal)'
            }}
          />
        ))}
      </div>

      {/* Step 0: Meet Vibe */}
      {currentStep === 0 && (
        <div className="screen-wrapper" style={{ width: '100%', maxWidth: '680px' }}>
          <span className="badge-label" style={{ marginBottom: '1rem' }}>
            <Compass size={13} />
            Question 1 of 3
          </span>

          <h2 className="display-title" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', marginBottom: '0.6rem' }}>
            What sounds like your kind of first meet?
          </h2>

          <p className="subheading" style={{ marginBottom: '2.4rem' }}>
            Pick the vibe that feels most like you.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              width: '100%'
            }}
          >
            {MEET_VIBES.map((item) => {
              const isSelected = answers.meetVibe === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectMeet(item.id)}
                  className={`interactive-card ${isSelected ? 'selected' : ''}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelectMeet(item.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '110px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '1.6rem' }}>{item.emoji}</span>
                      <h3 style={{ fontSize: '1.08rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.title}
                      </h3>
                    </div>
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 1: Energy Vibe */}
      {currentStep === 1 && (
        <div className="screen-wrapper" style={{ width: '100%', maxWidth: '640px' }}>
          <span className="badge-label" style={{ marginBottom: '1rem' }}>
            <Sparkles size={13} />
            Question 2 of 3
          </span>

          <h2 className="display-title" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', marginBottom: '0.6rem' }}>
            What's the energy vibe?
          </h2>

          <p className="subheading" style={{ marginBottom: '2.4rem' }}>
            How do you imagine the mood feeling?
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
              width: '100%'
            }}
          >
            {ENERGY_VIBES.map((item) => {
              const isSelected = answers.energyVibe === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectEnergy(item.id)}
                  className={`interactive-card ${isSelected ? 'selected' : ''}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelectEnergy(item.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.6rem' }}>{item.emoji}</span>
                    <h3 style={{ fontSize: '1.08rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.title}
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Music Vibe */}
      {currentStep === 2 && (
        <div className="screen-wrapper" style={{ width: '100%', maxWidth: '640px' }}>
          <span className="badge-label" style={{ marginBottom: '1rem' }}>
            <Sparkles size={13} />
            Question 3 of 3
          </span>

          <h2 className="display-title" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', marginBottom: '0.6rem' }}>
            What's on the playlist on the way?
          </h2>

          <p className="subheading" style={{ marginBottom: '2.4rem' }}>
            The soundtrack playing in the background.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
              width: '100%'
            }}
          >
            {MUSIC_VIBES.map((item) => {
              const isSelected = answers.musicVibe === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectMusic(item.id)}
                  className={`interactive-card ${isSelected ? 'selected' : ''}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelectMusic(item.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.6rem' }}>{item.emoji}</span>
                    <h3 style={{ fontSize: '1.08rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.title}
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
