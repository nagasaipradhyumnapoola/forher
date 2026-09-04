import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface Props {
  onNext: () => void;
}

export const OpeningScreen: React.FC<Props> = ({ onNext }) => {
  const [step, setStep] = useState<number>(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 600),   // "Hey, Moksha."
      setTimeout(() => setStep(2), 2200),  // "I made something for you."
      setTimeout(() => setStep(3), 3900),  // "And before you ask..."
      setTimeout(() => setStep(4), 5400),  // "No, you can't skip ahead. 👀"
      setTimeout(() => setStep(5), 6600),  // CTA Button
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="screen-wrapper experience-container">
      {/* Decorative subtle badge */}
      <div
        style={{
          opacity: step >= 1 ? 1 : 0,
          transform: step >= 1 ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 800ms cubic-bezier(0.16, 1, 0.3, 1)',
          marginBottom: '2rem'
        }}
      >
        <span className="badge-label">
          <Sparkles size={13} />
          A Little Interactive Experience
        </span>
      </div>

      {/* Main Sequential Titles */}
      <div style={{ minHeight: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.2rem' }}>
        {step >= 1 && (
          <h1
            className="display-title animate-fade-in-up"
            style={{ fontSize: 'clamp(2.8rem, 6vw, 4.6rem)' }}
          >
            Hey, Moksha.
          </h1>
        )}

        {step >= 2 && (
          <p
            className="subheading animate-fade-in-up"
            style={{ fontSize: 'clamp(1.15rem, 2.2vw, 1.45rem)', color: 'var(--text-primary)', fontWeight: 400 }}
          >
            I made something for you.
          </p>
        )}

        {step >= 3 && (
          <p
            className="subheading animate-fade-in-up"
            style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '1.05rem' }}
          >
            And before you ask...
          </p>
        )}

        {step >= 4 && (
          <p
            className="animate-fade-in-up"
            style={{
              fontSize: '1.15rem',
              fontWeight: 500,
              color: 'var(--text-accent)',
              background: 'var(--accent-soft)',
              padding: '6px 18px',
              borderRadius: 'var(--radius-full)',
              display: 'inline-block'
            }}
          >
            No, you can't skip ahead. 👀
          </p>
        )}
      </div>

      {/* Primary Action Button */}
      <div
        style={{
          marginTop: '3rem',
          opacity: step >= 5 ? 1 : 0,
          transform: step >= 5 ? 'translateY(0)' : 'translateY(15px)',
          transition: 'all 700ms cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: step >= 5 ? 'auto' : 'none'
        }}
      >
        <button
          onClick={onNext}
          className="btn-primary"
          aria-label="Begin experience"
        >
          <span>Let's begin</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Subtle skip-wait trigger if clicked early */}
      {step < 5 && (
        <button
          onClick={() => setStep(5)}
          className="btn-ghost"
          style={{
            position: 'absolute',
            bottom: '24px',
            opacity: 0.5,
            fontSize: '0.8rem'
          }}
        >
          tap to reveal faster
        </button>
      )}
    </div>
  );
};
