import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Flower2 } from 'lucide-react';
import { playReveal, playSuccess, playClick } from '../../utils/audio';
import { logEvent } from '../../utils/logger';
import { setMood } from '../../utils/mood';

interface Props {
  onNext: () => void;
}

const NO_MESSAGES = [
  'not really',
  'wait— are you sure? 👀',
  'hold on, hear me out 🥺',
  'i actually really like you though',
  'catch me first 🏃',
  'okay, one more chance? 🙈',
  'pretty please, just say yes? 🎀',
];

// approx button box, for keeping it on-screen while it flees
const BW = 230;
const BH = 48;
const MARGIN = 14;

export const RevealScreen: React.FC<Props> = ({ onNext }) => {
  const [step, setStep] = useState<number>(0);
  const [yesClicked, setYesClicked] = useState<boolean>(false);
  const [yesStep, setYesStep] = useState<number>(0);
  const [saidNo, setSaidNo] = useState<boolean>(false);
  const [noMessage, setNoMessage] = useState(NO_MESSAGES[0]);

  const noBtnRef = useRef<HTMLButtonElement | null>(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const cursor = useRef({ x: 0, y: 0 });
  const dodges = useRef(0);
  const msgIdx = useRef(0);
  const lastMsg = useRef(0);

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

  // ── Continuous "runaway No" engine — flees the cursor all over the screen ──
  useLayoutEffect(() => {
    if (step < 5 || yesClicked) return;
    const vw = () => window.innerWidth;
    const vh = () => window.innerHeight;
    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
    const randPoint = () => ({
      x: Math.random() * (vw() - BW - 2 * MARGIN) + MARGIN,
      y: Math.random() * (vh() - BH - 2 * MARGIN) + MARGIN,
    });

    // start just to the right of / below the Yes button
    const start = { x: clamp(vw() / 2 + 70, MARGIN, vw() - BW - MARGIN), y: clamp(vh() - 150, MARGIN, vh() - BH - MARGIN) };
    pos.current = { ...start };
    target.current = { ...start };
    cursor.current = { x: vw() / 2, y: vh() / 2 };
    // seed the position before paint so it never flashes at the top-left corner
    if (noBtnRef.current) noBtnRef.current.style.transform = `translate3d(${start.x}px, ${start.y}px, 0)`;

    const R = 190; // flee radius

    const fleeFrom = (cx: number, cy: number) => {
      const bcx = pos.current.x + BW / 2;
      const bcy = pos.current.y + BH / 2;
      let ang = Math.atan2(bcy - cy, bcx - cx);
      if (!isFinite(ang)) ang = Math.random() * Math.PI * 2;
      const jump = 280 + Math.random() * 140;
      let tx = cx + Math.cos(ang) * jump - BW / 2;
      let ty = cy + Math.sin(ang) * jump - BH / 2;
      tx = clamp(tx, MARGIN, vw() - BW - MARGIN);
      ty = clamp(ty, MARGIN, vh() - BH - MARGIN);
      // cornered? teleport somewhere random & far instead
      if (Math.hypot(tx + BW / 2 - cx, ty + BH / 2 - cy) < R) {
        const p = randPoint();
        tx = p.x; ty = p.y;
      }
      target.current = { x: tx, y: ty };
      const now = performance.now();
      if (now - lastMsg.current > 450) {
        lastMsg.current = now;
        msgIdx.current = (msgIdx.current + 1) % NO_MESSAGES.length;
        dodges.current += 1;
        setNoMessage(NO_MESSAGES[msgIdx.current]);
      }
    };

    const onMove = (e: MouseEvent) => { cursor.current = { x: e.clientX, y: e.clientY }; };
    const onTouch = (e: TouchEvent) => { const t = e.touches[0]; if (t) cursor.current = { x: t.clientX, y: t.clientY }; };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });

    let raf = 0;
    const tick = () => {
      const el = noBtnRef.current;
      if (!el) { raf = requestAnimationFrame(tick); return; }
      const c = cursor.current;
      const bcx = pos.current.x + BW / 2;
      const bcy = pos.current.y + BH / 2;
      const dist = Math.hypot(bcx - c.x, bcy - c.y);
      if (dist < R) {
        fleeFrom(c.x, c.y);
      } else {
        // keep wandering the whole screen even when idle
        const reached = Math.hypot(target.current.x - pos.current.x, target.current.y - pos.current.y) < 4;
        if (reached && Math.random() < 0.025) target.current = randPoint();
      }
      const ease = dist < R ? 0.3 : 0.05;
      pos.current.x += (target.current.x - pos.current.x) * ease;
      pos.current.y += (target.current.y - pos.current.y) * ease;
      el.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouch);
    };
  }, [step, yesClicked]);

  const lineStyle = (visible: boolean): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(14px)',
    transition: 'opacity 650ms cubic-bezier(0.16, 1, 0.3, 1), transform 650ms cubic-bezier(0.16, 1, 0.3, 1)',
  });

  const handleYes = () => {
    playSuccess();
    logEvent('reveal_response', { answer: 'yes', dodges: dodges.current });
    setMood('celebration');
    setYesClicked(true);
    confetti({
      particleCount: 45,
      spread: 55,
      origin: { y: 0.65 },
      colors: ['#e0709a', '#f5c2d3', '#f0a6c4', '#ffffff'],
      disableForReducedMotion: true,
    });
    setTimeout(() => setYesStep(1), 600);
    setTimeout(() => setYesStep(2), 1800);
    setTimeout(() => setYesStep(3), 3200);
    setTimeout(() => setYesStep(4), 4800);
  };

  // If she somehow catches it and really says no — the whole thing just goes blank.
  const handleNoClick = () => {
    logEvent('reveal_response', { answer: 'no', dodges: dodges.current });
    setSaidNo(true);
  };
  const handleNoPointerDown = (e: React.PointerEvent) => {
    e.preventDefault(); // slip away before the tap lands
    cursor.current = { x: e.clientX, y: e.clientY };
  };

  const handleContinueAfterYes = () => {
    playClick();
    onNext();
  };

  // ── She actually said no → nothing. A blank screen. ──
  if (saidNo) {
    return <div style={{ position: 'fixed', inset: 0, zIndex: 100000, background: '#ffffff' }} />;
  }

  // ── YES reaction sub-screen ──
  if (yesClicked) {
    return (
      <div className="screen-wrapper experience-container">
        <div style={{ minHeight: '260px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <h2 className="display-title" style={{ ...lineStyle(yesStep >= 1), fontSize: 'clamp(2.4rem, 5vw, 3.8rem)' }}>
            Oh.
          </h2>
          <p className="font-serif" style={{ ...lineStyle(yesStep >= 2), fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: 'var(--text-accent)' }}>
            well... that's pretty great.
          </p>
          <p className="cursive-label" style={{ ...lineStyle(yesStep >= 3), maxWidth: '460px' }}>
            no pressure, no rush. I just want to take it slow and actually get to know you. let's start with something low-stakes 🙂
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
        <p className="cursive-label" style={{ ...lineStyle(step >= 1), fontSize: '1.3rem' }}>
          okay...
        </p>
        <p className="subheading" style={{ ...lineStyle(step >= 2), fontSize: '1.1rem' }}>
          I've been trying to make this unnecessarily mysterious.
        </p>
        <h1 className="display-title" style={{ ...lineStyle(step >= 3), fontSize: 'clamp(2.8rem, 6vw, 4.6rem)', color: 'var(--text-accent)' }}>
          It's me.
        </h1>
        <p className="font-serif" style={{ ...lineStyle(step >= 4), fontSize: 'clamp(1.5rem, 3.2vw, 2.2rem)', fontWeight: 400 }}>
          Yeah. I like you.
        </p>

        <div className="frosted-card" style={{ ...lineStyle(step >= 5), maxWidth: '500px', padding: '1.6rem 2rem', textAlign: 'center', marginTop: '0.5rem' }}>
          <p className="cursive-label" style={{ fontSize: '1.25rem', lineHeight: 1.55, color: 'var(--text-secondary)' }}>
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

      {/* YES stays put; NO runs away across the whole screen */}
      <div style={{ ...lineStyle(step >= 5), display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70px', marginTop: '1.5rem', pointerEvents: step >= 5 ? 'auto' : 'none' }}>
        <button onClick={handleYes} className="btn-accent" style={{ fontSize: '1.15rem', padding: '14px 38px' }}>
          <Flower2 size={17} />
          <span>yes, let's find out</span>
        </button>
      </div>

      {step >= 5 && !yesClicked && (
        <button
          ref={noBtnRef}
          onClick={handleNoClick}
          onPointerDown={handleNoPointerDown}
          className="btn-secondary"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 60,
            fontSize: '1rem',
            padding: '12px 22px',
            willChange: 'transform',
            touchAction: 'none',
          }}
        >
          <span>{noMessage}</span>
        </button>
      )}
    </div>
  );
};
