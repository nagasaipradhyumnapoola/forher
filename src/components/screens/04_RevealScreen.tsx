import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Heart, Sparkles, Smile } from 'lucide-react';

interface Props {
  onNext: () => void;
}

export const RevealScreen: React.FC<Props> = ({ onNext }) => {
  const [noAttempts, setNoAttempts] = useState<number>(0);
  const [noPosition, setNoPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [noMessage, setNoMessage] = useState<string>('No');
  const [isDodging, setIsDodging] = useState<boolean>(true);

  const messages = [
    'No',
    'Are you sure? 👀',
    'Wait, think about the food! 🍜',
    'Think about it for 3 seconds... 🥺',
    'Okay okay 😭 You can actually say no.'
  ];

  const handleYes = () => {
    // Elegant subtle confetti burst
    confetti({
      particleCount: 55,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#D86C7B', '#F5C2C9', '#E0A96D', '#FFFFFF'],
      disableForReducedMotion: true
    });

    setTimeout(() => {
      onNext();
    }, 900);
  };

  const handleNoHover = () => {
    if (noAttempts >= 4) {
      // Stop dodging
      setIsDodging(false);
      return;
    }

    const nextAttempt = noAttempts + 1;
    setNoAttempts(nextAttempt);
    setNoMessage(messages[Math.min(nextAttempt, messages.length - 1)]);

    if (nextAttempt < 4) {
      // Calculate random gentle offset within reasonable bounds
      const randomX = (Math.random() - 0.5) * 220;
      const randomY = (Math.random() - 0.5) * 120;
      setNoPosition({ x: randomX, y: randomY });
    } else {
      setIsDodging(false);
      setNoPosition({ x: 0, y: 0 });
    }
  };

  const handleNoClick = () => {
    if (!isDodging || noAttempts >= 4) {
      // Gentle, respectful flow
      onNext();
    }
  };

  return (
    <div className="screen-wrapper experience-container">
      {/* Visual Header */}
      <div style={{ marginBottom: '1.2rem' }}>
        <span className="badge-label" style={{ background: 'var(--accent-soft)' }}>
          <Sparkles size={13} />
          The Truth
        </span>
      </div>

      <h2
        className="font-serif animate-fade-in-up"
        style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
          fontWeight: 400,
          lineHeight: 1.15,
          marginBottom: '0.4rem',
          color: 'var(--text-primary)'
        }}
      >
        It's me.
      </h2>

      <h1
        className="display-title animate-fade-in-up"
        style={{
          fontSize: 'clamp(2.5rem, 5.8vw, 4.4rem)',
          color: 'var(--text-accent)',
          marginBottom: '1.4rem'
        }}
      >
        I'm interested in you.
      </h1>

      {/* Sincere Explanation Card */}
      <div
        className="frosted-card animate-fade-in-up"
        style={{
          maxWidth: '560px',
          padding: '2rem 2.4rem',
          marginBottom: '2.5rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <p
          style={{
            fontSize: '1.12rem',
            lineHeight: 1.7,
            color: 'var(--text-primary)',
            marginBottom: '1rem',
            fontFamily: 'var(--font-serif)',
            fontWeight: 400
          }}
        >
          I've really enjoyed the time we've spent talking, and I wanted to put something together that was as thoughtful and genuine as you are.
        </p>

        <p
          style={{
            fontSize: '1.02rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6
          }}
        >
          I'd really like to see where this goes.
        </p>

        <div style={{ marginTop: '1.4rem', paddingTop: '1.2rem', borderTop: '1px solid var(--border-subtle)' }}>
          <p
            style={{
              fontSize: '1.18rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)'
            }}
          >
            Would you be open to that?
          </p>
        </div>
      </div>

      {/* Choice Buttons with Dodging Mechanics */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          position: 'relative',
          minHeight: '80px',
          width: '100%',
          maxWidth: '480px'
        }}
      >
        {/* YES Button */}
        <button
          onClick={handleYes}
          className="btn-accent"
          style={{
            fontSize: '1.1rem',
            padding: '15px 42px',
            boxShadow: 'var(--shadow-glow)'
          }}
        >
          <Heart size={18} fill="currentColor" />
          <span>Yes, I am</span>
        </button>

        {/* NO Button (Playfully evasive) */}
        <div
          style={{
            transform: `translate(${noPosition.x}px, ${noPosition.y}px)`,
            transition: isDodging ? 'transform 220ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
          }}
          onMouseEnter={handleNoHover}
          onTouchStart={handleNoHover}
        >
          <button
            onClick={handleNoClick}
            className="btn-secondary"
            style={{
              fontSize: '0.96rem',
              padding: '14px 26px',
              borderColor: noAttempts >= 4 ? 'var(--text-muted)' : 'var(--border)',
              color: noAttempts >= 4 ? 'var(--text-primary)' : 'var(--text-muted)'
            }}
          >
            {noAttempts >= 4 && <Smile size={16} />}
            <span>{noMessage}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
