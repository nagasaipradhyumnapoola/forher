import React from 'react';
import { CompatibilityAnswers, LoveLanguageAnswers } from '../../types';
import { MEET_VIBES, ENERGY_VIBES, MUSIC_VIBES } from '../../data/vibes';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';

interface Props {
  compatibility: CompatibilityAnswers;
  loveLanguage: LoveLanguageAnswers;
  onNext: () => void;
}

export const PersonalizedResult: React.FC<Props> = ({ compatibility, loveLanguage, onNext }) => {
  const chosenMeet = MEET_VIBES.find((v) => v.id === compatibility.meetVibe) || MEET_VIBES[0];
  const chosenEnergy = ENERGY_VIBES.find((e) => e.id === compatibility.energyVibe) || ENERGY_VIBES[0];
  const chosenMusic = MUSIC_VIBES.find((m) => m.id === compatibility.musicVibe) || MUSIC_VIBES[0];

  return (
    <div className="screen-wrapper experience-container">
      <div style={{ marginBottom: '1.2rem' }}>
        <span className="badge-label">
          <Sparkles size={13} />
          Your Connection Blueprint
        </span>
      </div>

      <h1 className="display-title" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', marginBottom: '0.6rem' }}>
        Okay...
      </h1>

      <p className="subheading" style={{ marginBottom: '2.5rem', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
        I think I've learned a few things about you. 👀
      </p>

      {/* Visually Distinct Reflection Card */}
      <div
        className="frosted-card"
        style={{
          width: '100%',
          maxWidth: '600px',
          padding: '2.6rem 2.4rem',
          textAlign: 'left',
          marginBottom: '2.5rem',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(251,245,242,0.95) 100%)',
          border: '1px solid var(--accent-border)'
        }}
      >
        {/* Subtle decorative heart watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: '-20px',
            right: '-20px',
            opacity: 0.04,
            pointerEvents: 'none'
          }}
        >
          <Heart size={200} fill="currentColor" />
        </div>

        {/* Selected Vibe Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.6rem' }}>
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)'
            }}
          >
            {chosenMeet.emoji} {chosenMeet.title.split('&')[0].split('+')[0]}
          </span>
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)'
            }}
          >
            {chosenEnergy.emoji} {chosenEnergy.title}
          </span>
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)'
            }}
          >
            {chosenMusic.emoji} {chosenMusic.title.split('&')[0]}
          </span>
        </div>

        {/* Tailored Synthesis Text */}
        <h3
          className="font-serif"
          style={{
            fontSize: '1.7rem',
            lineHeight: 1.35,
            color: 'var(--text-primary)',
            marginBottom: '1rem',
            fontWeight: 500
          }}
        >
          Someone who loves genuine moments over forced formalities.
        </h3>

        <p
          style={{
            fontSize: '1.02rem',
            lineHeight: 1.7,
            color: 'var(--text-secondary)',
            marginBottom: '1.2rem'
          }}
        >
          You appreciate good rhythm—where conversation flows effortlessly, quiet pauses feel completely natural, and little thoughtful gestures mean more than grand gestures.
        </p>

        {loveLanguage.loveLanguage && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.7)',
              borderLeft: '3px solid var(--accent)',
              marginBottom: '1rem'
            }}
          >
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              "{loveLanguage.loveLanguage}"
            </p>
          </div>
        )}

        <p
          style={{
            fontSize: '0.98rem',
            fontWeight: 500,
            color: 'var(--text-accent)'
          }}
        >
          I think we're going to have a really good time. ✨
        </p>
      </div>

      {/* CTA Button */}
      <button
        onClick={onNext}
        className="btn-accent"
        style={{ padding: '16px 40px' }}
      >
        <span>Let's plan our meet</span>
        <ArrowRight size={18} />
      </button>
    </div>
  );
};
