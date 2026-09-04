import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Heart, Smile } from 'lucide-react';
import { playReveal, playSuccess, playClick } from '../../utils/audio';

interface Props {
  onNext: () => void;
}

export const RevealScreen: React.FC<Props> = ({ onNext }) => {
  const [step, setStep] = useState<number>(0);
  const [yesClicked, setYesClicked] = useState<boolean>(false);
  const [yesStep, setYesStep] = useState<number>(0);
  const [noAttempts, setNoAttempts] = useState<number>(0);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [noMessage, setNoMessage] = useState('not really');
  const [isDodging, setIsDodging] = useState(true);

  const noMessages = [
    'not really',
    'are you sure? 👀',
    'wait, think about the food! 🍜',
    'think about it for 3 seconds 🥺',
    'okay okay 😭 you can actually say no.',
  ];

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 2200),
      setTimeout(() => { setStep(3); playReveal(); }, 4000),
      setTimeout(() => setStep(4), 5500),
      setTimeout(() => setStep(5), 7000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const lineStyle = (visible: boolean): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(14px)',
    transition: 'opacity 650ms cubic-bezier(0.16, 1, 0.3, 1), transform 650ms cubic-bezier(0.16, 1, 0.3, 1)',
  });

  const handleYes = () => {
    playSuccess();
    setYesClicked(true);

    confetti({
      particleCount: 45,
      spread: 55,
      origin: { y: 0.65 },
      colors: ['#D86C7B', '#F5C2C9', '#E0A96D', '#FFF'],
      disableForReducedMotion: true,
    });

    setTimeout(() => setYesStep(1), 600);
    setTimeout(() => setYesStep(2), 1800);
    setTimeout(() => setYesStep(3), 3200);
    setTimeout(() => { setYesStep(4); }, 4800);
  };

  const handleNoHover = () => {
    if (noAttempts >= 4) { setIsDodging(false); return; }
    const next = noAttempts + 1;
    setNoAttempts(next);
    setNoMessage(noMessages[Math.min(next, noMessages.length - 1)]);
    if (next < 4) {
      setNoPosition({ x: (Math.random() - 0.5) * 200, y: (Math.random() - 0.5) * 100 });
    } else {
      setIsDodging(false);
      setNoPosition({ x: 0, y: 0 });
    }
  };

  const handleNoClick = () => {
    if (!isDodging || noAttempts >= 4) {
      playClick();
      onNext();
    }
  };

  const handleContinueAfterYes = () => {
    playClick();
    onNext();
  };

  // ── YES reaction sub-screen ──
  if (yesClicked) {
    return (
      <div className="screen-wrapper experience-container">
        <div style={{ minHeight: '260px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <h2
            className="display-title"
            style={{ ...lineStyle(yesStep >= 1), fontSize: 'clamp(2.4rem, 5vw, 3.8rem)' }}
          >
            Oh.
          </h2>

          <p
            className="font-serif"
            style={{ ...lineStyle(yesStep >= 2), fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: 'var(--text-accent)' }}
          >
            well... that's pretty great.
          </p>

          <p
            className="cursive-label"
            style={{ ...lineStyle(yesStep >= 3), maxWidth: '460px' }}
          >
            I don't know exactly where this goes yet, but I'd genuinely like to find out. maybe you're the missing piece... which is mildly inconvenient because now I have to admit I like you 😭
          </p>
        </div>

        <div style={{ ...lineStyle(yesStep >= 4), marginTop: '2rem', pointerEvents: yesStep >= 4 ? 'auto' : 'none' }}>
          <button onClick={handleContinueAfterYes} className="btn-accent">
            <span>let's see how compatible we are</span>
          </button>
        </div>
      </div>
    );
  }

  // ── Main reveal ──
  return (
    <div className="screen-wrapper experience-container">
      <div style={{ minHeight: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <p
          className="cursive-label"
          style={{ ...lineStyle(step >= 1), fontSize: '1.3rem' }}
        >
          okay...
        </p>

        <p
          className="subheading"
          style={{ ...lineStyle(step >= 2), fontSize: '1.1rem' }}
        >
          I've been trying to make this unnecessarily mysterious.
        </p>

        <h1
          className="display-title"
          style={{
            ...lineStyle(step >= 3),
            fontSize: 'clamp(2.8rem, 6vw, 4.6rem)',
            color: 'var(--text-accent)',
          }}
        >
          It's me.
        </h1>

        <p
          className="font-serif"
          style={{
            ...lineStyle(step >= 4),
            fontSize: 'clamp(1.5rem, 3.2vw, 2.2rem)',
            fontWeight: 400,
          }}
        >
          Yeah. I like you.
        </p>

        <div
          className="frosted-card"
          style={{
            ...lineStyle(step >= 5),
            maxWidth: '500px', padding: '1.6rem 2rem',
            textAlign: 'center', marginTop: '0.5rem',
          }}
        >
          <p className="cursive-label" style={{ fontSize: '1.15rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            I could talk to 10 different people without thinking twice. but with you, my brain just... stops. I don't know what to say. I don't know why. so I built you a whole website instead 😭
          </p>
          <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border-subtle)' }}>
            <p className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              would you be open to seeing where this goes?
            </p>
          </div>
        </div>
      </div>

      {/* ── YES / NO ── */}
      <div
        style={{
          ...lineStyle(step >= 5),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '18px', position: 'relative', minHeight: '70px', width: '100%', maxWidth: '480px',
          marginTop: '1.5rem', pointerEvents: step >= 5 ? 'auto' : 'none',
        }}
      >
        <button onClick={handleYes} className="btn-accent" style={{ fontSize: '1.15rem', padding: '14px 38px' }}>
          <Heart size={17} fill="currentColor" />
          <span>yes, let's find out</span>
        </button>

        <div
          style={{
            transform: `translate(${noPosition.x}px, ${noPosition.y}px)`,
            transition: isDodging ? 'transform 220ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          }}
          onMouseEnter={handleNoHover}
          onTouchStart={handleNoHover}
        >
          <button onClick={handleNoClick} className="btn-secondary" style={{ fontSize: '1rem', padding: '12px 24px' }}>
            {noAttempts >= 4 && <Smile size={15} />}
            <span>{noMessage}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
