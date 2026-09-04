import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Flower2, HeartHandshake } from 'lucide-react';
import { playReveal, playSuccess, playClick, playSelect } from '../../utils/audio';
import { logEvent } from '../../utils/logger';
import { setMood } from '../../utils/mood';

interface Props {
  onNext: () => void;
}

// Playful compromising reasons shown directly ON the button
const COMPROMISE_BUTTON_TEXTS = [
  'wait, hear me out 🥺',
  'what if I buy you iced coffee? ☕',
  'you pick the playlist, I promise 🎶',
  'free snacks on every study date 🍪',
  'we can leave after 20 mins if boring ✌️',
  'okay, one tiny chance? 🙈',
  'pretty please? 🎀',
  'really no? (it\'s okay, click here if sure) 🤍',
];

const MAX_DODGES = COMPROMISE_BUTTON_TEXTS.length - 1; // 7 dodges before allowing "No"

export const RevealScreen: React.FC<Props> = ({ onNext }) => {
  const [step, setStep] = useState<number>(0);
  const [yesClicked, setYesClicked] = useState<boolean>(false);
  const [yesStep, setYesStep] = useState<number>(0);
  const [saidNo, setSaidNo] = useState<boolean>(false);

  // Dodge state
  const [dodges, setDodges] = useState<number>(0);
  const [noButtonPos, setNoButtonPos] = useState<{ x: number; y: number } | null>(null);
  const [buttonText, setButtonText] = useState<string>('not really');

  const noBtnRef = useRef<HTMLButtonElement | null>(null);
  const isDodgingRef = useRef<boolean>(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 1800),
      setTimeout(() => { setStep(3); playReveal(); }, 3200),
      setTimeout(() => setStep(4), 4600),
      setTimeout(() => setStep(5), 5800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Safe random coordinate generator within mobile / desktop viewport boundaries
  const calculateSafeDodgePosition = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const btnWidth = Math.min(260, vw * 0.75);
    const btnHeight = 48;

    // Safe boundaries avoiding top music player and bottom phone navigation
    const minX = 20;
    const maxX = Math.max(minX, vw - btnWidth - 20);
    const minY = 85;
    const maxY = Math.max(minY, vh - btnHeight - 90);

    let rx = Math.floor(minX + Math.random() * (maxX - minX));
    let ry = Math.floor(minY + Math.random() * (maxY - minY));

    // Ensure it jumps away noticeably from previous position
    if (noButtonPos) {
      const dist = Math.hypot(rx - noButtonPos.x, ry - noButtonPos.y);
      if (dist < 130) {
        rx = rx < vw / 2 ? Math.min(maxX, rx + 140) : Math.max(minX, rx - 140);
        ry = ry < vh / 2 ? Math.min(maxY, ry + 120) : Math.max(minY, ry - 120);
      }
    }

    return { x: rx, y: ry };
  }, [noButtonPos]);

  // Handle dodge triggered by mouse approach, hover, or mobile tap/touch
  const handleDodge = useCallback((e?: React.SyntheticEvent | MouseEvent | TouchEvent) => {
    if (yesClicked || isDodgingRef.current) return;

    // After MAX_DODGES, stop running away so she has the genuine option to say no
    if (dodges >= MAX_DODGES) {
      return;
    }

    if (e && 'preventDefault' in e) {
      e.preventDefault();
    }

    isDodgingRef.current = true;

    // Gentle haptic feedback on mobile if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(35); } catch {}
    }

    playSelect();

    const nextDodgeCount = dodges + 1;
    setDodges(nextDodgeCount);

    const nextText = COMPROMISE_BUTTON_TEXTS[Math.min(nextDodgeCount - 1, COMPROMISE_BUTTON_TEXTS.length - 1)];
    setButtonText(nextText);

    // If she reached the final option, let the button rest near the bottom center
    if (nextDodgeCount > MAX_DODGES) {
      setNoButtonPos(null);
    } else {
      const newPos = calculateSafeDodgePosition();
      setNoButtonPos(newPos);
    }

    setTimeout(() => {
      isDodgingRef.current = false;
    }, 180);
  }, [dodges, yesClicked, calculateSafeDodgePosition]);

  // Proximity check on desktop only: if cursor gets within 55px of the button, dodge
  useEffect(() => {
    if (step < 5 || yesClicked || dodges >= MAX_DODGES) return;

    const handleMouseMove = (e: MouseEvent) => {
      const btn = noBtnRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);

      if (dist < 55) {
        handleDodge(e);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [step, yesClicked, dodges, handleDodge]);

  const lineStyle = (visible: boolean): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(14px)',
    transition: 'opacity 650ms cubic-bezier(0.16, 1, 0.3, 1), transform 650ms cubic-bezier(0.16, 1, 0.3, 1)',
  });

  const handleYes = () => {
    playSuccess();
    logEvent('reveal_response', { answer: 'yes', dodges });
    setMood('celebration');
    setYesClicked(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#e0709a', '#f5c2d3', '#f0a6c4', '#ffffff'],
      disableForReducedMotion: true,
    });
    setTimeout(() => setYesStep(1), 500);
    setTimeout(() => setYesStep(2), 1600);
    setTimeout(() => setYesStep(3), 2800);
    setTimeout(() => setYesStep(4), 4200);
  };

  const handleNoClick = (e: React.MouseEvent) => {
    // If still in dodge phase, dodge
    if (dodges < MAX_DODGES) {
      e.preventDefault();
      handleDodge(e);
      return;
    }

    // If reached max dodges, she can genuinely say no gracefully
    playClick();
    logEvent('reveal_response', { answer: 'no', dodges });
    setSaidNo(true);
  };

  const handleContinueAfterYes = () => {
    playClick();
    onNext();
  };

  // Graceful, sweet rejection screen if she chooses "No" after all compromises
  if (saidNo) {
    return (
      <div className="screen-wrapper experience-container" style={{ padding: '2.5rem 1.2rem', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <HeartHandshake size={28} />
        </div>
        <h2 className="display-title" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', marginBottom: '0.8rem' }}>
          I understand 🌸
        </h2>
        <p className="cursive-label" style={{ fontSize: '1.35rem', maxWidth: '480px', margin: '0 auto 1.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Thank you for being honest with me. No awkwardness at all — I still think you're genuinely amazing. Wishing you the absolute best ✨
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-secondary"
          style={{ fontSize: '0.95rem', padding: '10px 24px', borderRadius: 'var(--radius-full)' }}
        >
          <span>start over ↺</span>
        </button>
      </div>
    );
  }

  // YES reaction sub-screen
  if (yesClicked) {
    return (
      <div className="screen-wrapper experience-container" style={{ padding: '2rem 1rem' }}>
        <div style={{ minHeight: '260px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center' }}>
          <h2 className="display-title" style={{ ...lineStyle(yesStep >= 1), fontSize: 'clamp(2.4rem, 5vw, 3.8rem)' }}>
            Oh.
          </h2>
          <p className="font-serif" style={{ ...lineStyle(yesStep >= 2), fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: 'var(--text-accent)' }}>
            well... that's pretty great.
          </p>
          <p className="cursive-label" style={{ ...lineStyle(yesStep >= 3), maxWidth: '460px', fontSize: '1.25rem', lineHeight: 1.6 }}>
            no pressure, no rush. I just want to take it slow and actually get to know you. let's start with something low-stakes 🙂
          </p>
        </div>
        <div style={{ ...lineStyle(yesStep >= 4), marginTop: '2rem', pointerEvents: yesStep >= 4 ? 'auto' : 'none' }}>
          <button onClick={handleContinueAfterYes} className="btn-accent" style={{ fontSize: '1.1rem', padding: '14px 28px' }}>
            <span>let's see how compatible we are</span>
          </button>
        </div>
      </div>
    );
  }

  // Main reveal
  return (
    <div className="screen-wrapper experience-container" style={{ padding: '2rem 1.2rem', overflowX: 'hidden' }}>
      <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.9rem', textAlign: 'center', maxWidth: '580px', width: '100%' }}>
        <p className="cursive-label" style={{ ...lineStyle(step >= 1), fontSize: '1.3rem' }}>
          okay...
        </p>
        <p className="subheading" style={{ ...lineStyle(step >= 2), fontSize: '1.05rem' }}>
          I've been trying to make this unnecessarily mysterious.
        </p>
        <h1 className="display-title" style={{ ...lineStyle(step >= 3), fontSize: 'clamp(2.8rem, 6vw, 4.4rem)', color: 'var(--text-accent)', margin: '0.2rem 0' }}>
          It's me.
        </h1>
        <p className="font-serif" style={{ ...lineStyle(step >= 4), fontSize: 'clamp(1.45rem, 3.2vw, 2.1rem)', fontWeight: 400 }}>
          Yeah. I like you.
        </p>

        <div
          className="frosted-card"
          style={{
            ...lineStyle(step >= 5),
            maxWidth: '480px',
            width: '100%',
            padding: '1.5rem 1.6rem',
            textAlign: 'center',
            marginTop: '0.6rem',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <p className="cursive-label" style={{ fontSize: '1.22rem', lineHeight: 1.55, color: 'var(--text-secondary)' }}>
            I don't expect us to figure it all out fast, or rush into anything. I just
            want to take this slow — get to know you, and actually see how compatible we are.
          </p>
          <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border-subtle)' }}>
            <p className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              would you be open to seeing where this goes?
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons: Yes & No (stationary initially, No dodges on close approach / touch with compromising reasons) */}
      <div
        style={{
          ...lineStyle(step >= 5),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          minHeight: '65px',
          marginTop: '1.8rem',
          pointerEvents: step >= 5 ? 'auto' : 'none',
          position: 'relative',
          width: '100%',
          maxWidth: '520px'
        }}
      >
        {/* YES Button — grows slightly with each dodge attempt */}
        <button
          onClick={handleYes}
          className="btn-accent"
          style={{
            fontSize: '1.12rem',
            padding: '13px 34px',
            transform: `scale(${1 + Math.min(dodges * 0.04, 0.22)})`,
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: dodges > 0 ? '0 6px 20px var(--accent-glow)' : undefined
          }}
        >
          <Flower2 size={17} />
          <span>yes, let's find out</span>
        </button>

        {/* NO Button — in-flow beside YES initially or when settled after compromises */}
        {(!noButtonPos || dodges >= MAX_DODGES) ? (
          <button
            ref={noBtnRef}
            onClick={handleNoClick}
            onPointerEnter={dodges < MAX_DODGES ? handleDodge : undefined}
            onPointerDown={dodges < MAX_DODGES ? handleDodge : undefined}
            onTouchStart={dodges < MAX_DODGES ? handleDodge : undefined}
            className="btn-secondary"
            style={{
              fontSize: '0.96rem',
              padding: '12px 20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              touchAction: 'none',
              maxWidth: 'calc(100vw - 40px)'
            }}
          >
            <span>{buttonText}</span>
          </button>
        ) : null}
      </div>

      {/* Dodged NO button in floating safe position during compromise phase */}
      {step >= 5 && !yesClicked && noButtonPos && dodges < MAX_DODGES && (
        <button
          ref={noBtnRef}
          onClick={handleNoClick}
          onPointerEnter={handleDodge}
          onPointerDown={handleDodge}
          onTouchStart={handleDodge}
          className="btn-secondary"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 90,
            fontSize: '0.96rem',
            padding: '11px 20px',
            transform: `translate3d(${noButtonPos.x}px, ${noButtonPos.y}px, 0)`,
            transition: 'transform 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
            cursor: 'pointer',
            touchAction: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            maxWidth: 'calc(100vw - 32px)'
          }}
        >
          <span>{buttonText}</span>
        </button>
      )}
    </div>
  );
};
