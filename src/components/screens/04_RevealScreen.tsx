import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Flower2, Sparkles } from 'lucide-react';
import { playReveal, playSuccess, playClick, playSelect } from '../../utils/audio';
import { logEvent } from '../../utils/logger';
import { setMood } from '../../utils/mood';

interface Props {
  onNext: () => void;
}

const PERSUASIVE_REASONS = [
  { buttonText: 'wait— are you sure? 👀', reason: 'reason #1: i make top tier iced coffee & cafe recommendations ☕' },
  { buttonText: 'hear me out first 🥺', reason: 'reason #2: 100% guarantee no awkward silences ✨' },
  { buttonText: 'what if we get snacks? 🍪', reason: 'reason #3: you get 100% full control of the playlist 🎶' },
  { buttonText: 'i promise im funny 😂', reason: 'reason #4: endless good vibes & genuine laugh attacks 🌸' },
  { buttonText: 'think about the lore! 📖', reason: 'reason #5: we can leave anytime if it\'s ever boring ✌️' },
  { buttonText: 'catch me first 🏃💨', reason: 'reason #6: this button is getting tired of running away 🙈' },
  { buttonText: 'okay pretty please? 🎀', reason: 'reason #7: just one low-stakes meet, you won\'t regret it 💕' },
  { buttonText: 'click yes already ✨', reason: 'final reason: you know you want to say yes 🌟' },
];

export const RevealScreen: React.FC<Props> = ({ onNext }) => {
  const [step, setStep] = useState<number>(0);
  const [yesClicked, setYesClicked] = useState<boolean>(false);
  const [yesStep, setYesStep] = useState<number>(0);
  const [saidNo, setSaidNo] = useState<boolean>(false);
  
  // Dodge state
  const [dodges, setDodges] = useState<number>(0);
  const [noButtonPos, setNoButtonPos] = useState<{ x: number; y: number } | null>(null);
  const [currentReason, setCurrentReason] = useState<string>('');
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
    const btnWidth = Math.min(220, vw * 0.7);
    const btnHeight = 48;

    // Safe boundaries avoiding top music player and bottom phone navigation
    const minX = 20;
    const maxX = Math.max(minX, vw - btnWidth - 20);
    const minY = 85;
    const maxY = Math.max(minY, vh - btnHeight - 90);

    // Pick random coordinates
    let rx = Math.floor(minX + Math.random() * (maxX - minX));
    let ry = Math.floor(minY + Math.random() * (maxY - minY));

    // If existing position exists, ensure it jumps away significantly
    if (noButtonPos) {
      const dist = Math.hypot(rx - noButtonPos.x, ry - noButtonPos.y);
      if (dist < 140) {
        rx = rx < vw / 2 ? Math.min(maxX, rx + 160) : Math.max(minX, rx - 160);
        ry = ry < vh / 2 ? Math.min(maxY, ry + 140) : Math.max(minY, ry - 140);
      }
    }

    return { x: rx, y: ry };
  }, [noButtonPos]);

  // Handle dodge triggered by mouse approach, hover, or mobile tap/touch
  const handleDodge = useCallback((e?: React.SyntheticEvent | MouseEvent | TouchEvent) => {
    if (yesClicked || isDodgingRef.current) return;
    isDodgingRef.current = true;

    if (e && 'preventDefault' in e) {
      e.preventDefault();
    }

    // Gentle haptic feedback on mobile if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(35); } catch {}
    }

    playSelect();

    const newDodges = dodges + 1;
    setDodges(newDodges);

    const reasonObj = PERSUASIVE_REASONS[(newDodges - 1) % PERSUASIVE_REASONS.length];
    setButtonText(reasonObj.buttonText);
    setCurrentReason(reasonObj.reason);

    const newPos = calculateSafeDodgePosition();
    setNoButtonPos(newPos);

    setTimeout(() => {
      isDodgingRef.current = false;
    }, 180);
  }, [dodges, yesClicked, calculateSafeDodgePosition]);

  // Proximity check on desktop only: if cursor gets within 60px of the button, dodge
  useEffect(() => {
    if (step < 5 || yesClicked) return;

    const handleMouseMove = (e: MouseEvent) => {
      const btn = noBtnRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);

      // Only dodge if cursor is strictly moving close to the button (within 55px)
      if (dist < 55) {
        handleDodge(e);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [step, yesClicked, handleDodge]);

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
    e.preventDefault();
    handleDodge(e);
  };

  const handleContinueAfterYes = () => {
    playClick();
    onNext();
  };

  // She actually said no
  if (saidNo) {
    return <div style={{ position: 'fixed', inset: 0, zIndex: 100000, background: '#ffffff' }} />;
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

      {/* Persuasive reason bubble if user attempted to click No */}
      {currentReason && step >= 5 && !yesClicked && (
        <div
          className="animate-fade-in-up font-cursive"
          style={{
            marginTop: '1.2rem',
            padding: '7px 18px',
            background: 'var(--accent-soft)',
            color: 'var(--text-accent)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--accent-border)',
            fontSize: '1.15rem',
            fontWeight: 600,
            textAlign: 'center',
            maxWidth: '92vw',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Sparkles size={15} style={{ flexShrink: 0 }} />
          <span>{currentReason}</span>
        </div>
      )}

      {/* Action Buttons: Yes & No (stationary initially, No dodges on close approach or touch) */}
      <div
        style={{
          ...lineStyle(step >= 5),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          minHeight: '65px',
          marginTop: '1.5rem',
          pointerEvents: step >= 5 ? 'auto' : 'none',
          position: 'relative',
          width: '100%',
          maxWidth: '480px'
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

        {/* NO Button — initially in-flow beside YES, jumps to safe spot only upon approach / touch */}
        {!noButtonPos ? (
          <button
            ref={noBtnRef}
            onClick={handleNoClick}
            onPointerEnter={handleDodge}
            onPointerDown={handleDodge}
            onTouchStart={handleDodge}
            className="btn-secondary"
            style={{
              fontSize: '0.98rem',
              padding: '12px 22px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              touchAction: 'none'
            }}
          >
            <span>{buttonText}</span>
          </button>
        ) : null}
      </div>

      {/* Dodged NO button in absolute / fixed position */}
      {step >= 5 && !yesClicked && noButtonPos && (
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
            fontSize: '0.98rem',
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
