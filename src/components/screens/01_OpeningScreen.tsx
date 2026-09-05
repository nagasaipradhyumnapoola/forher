import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { markInteracted, playClick, playTransition } from '../../utils/audio';
import { ScreenDecor } from '../fx/ScreenDecor';
import { Envelope, Polaroid, WashiTape, Bow } from '../fx/Stickers';

interface Props {
  onNext: () => void;
}

export const OpeningScreen: React.FC<Props> = ({ onNext }) => {
  const [step, setStep] = useState<number>(0);
  const [photoOk, setPhotoOk] = useState(true);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 2000),
      setTimeout(() => setStep(3), 3600),
      setTimeout(() => setStep(4), 5200),
      setTimeout(() => setStep(5), 6800),
      setTimeout(() => setStep(6), 8000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleBegin = () => {
    markInteracted();
    playClick();
    setTimeout(() => {
      playTransition();
      onNext();
    }, 200);
  };

  const lineStyle = (visible: boolean, delay: number = 0): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
  });

  return (
    <div className="screen-wrapper experience-container">
      <ScreenDecor variant="letter" />

      {/* Sequential Cinematic Lines */}
      <div style={{ minHeight: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.1rem' }}>

        <div style={{ ...lineStyle(step >= 1), marginBottom: '-0.2rem', position: 'relative' }}>
          <WashiTape
            width={74}
            height={22}
            rotate={-16}
            color="rgba(150,190,240,0.7)"
            className="sticker"
            style={{ top: -11, left: 12, zIndex: 16 }}
          />
          <Polaroid rotate={-3} width={150} className="open-polaroid">
            {photoOk ? (
              <img
                src="/us.jpg"
                alt=""
                onError={() => setPhotoOk(false)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 45%' }}
              />
            ) : (
              <Envelope size={90} open />
            )}
          </Polaroid>
          <Bow size={54} color="#7fb0ea" className="sticker sticker-float" style={{ top: -20, right: -18, ['--rot' as string]: '12deg' }} />
        </div>

        <h1
          className="display-title"
          style={{
            ...lineStyle(step >= 1),
            fontSize: 'clamp(2.8rem, 6vw, 4.6rem)',
          }}
        >
          Hey, Moksha.
        </h1>

        <p
          className="subheading"
          style={{
            ...lineStyle(step >= 2),
            fontSize: 'clamp(1.15rem, 2.2vw, 1.4rem)',
            color: 'var(--text-primary)',
            fontWeight: 400,
          }}
        >
          I made something for you.
        </p>

        <p
          className="font-cursive"
          style={{
            ...lineStyle(step >= 3),
            fontSize: '1.3rem',
            color: 'var(--text-secondary)',
          }}
        >
          and before you ask...
        </p>

        <p
          className="font-cursive"
          style={{
            ...lineStyle(step >= 4),
            fontSize: '1.15rem',
            fontWeight: 600,
            color: 'var(--text-accent)',
            background: 'var(--accent-soft)',
            padding: '5px 16px',
            borderRadius: 'var(--radius-full)',
          }}
        >
          No, you can't skip ahead. 👀
        </p>

        <p
          className="font-cursive"
          style={{
            ...lineStyle(step >= 5),
            fontSize: '1.15rem',
            color: 'var(--text-muted)',
            fontStyle: 'italic',
            maxWidth: '440px',
          }}
        >
          I could talk to 10 different people without thinking twice. but with you, my brain just… stops. I don't know what to say. I don't know why. so I built you a whole website instead 😭
        </p>
      </div>

      {/* CTA */}
      <div
        style={{
          marginTop: '2.5rem',
          ...lineStyle(step >= 6),
          pointerEvents: step >= 6 ? 'auto' : 'none',
        }}
      >
        <button
          onClick={handleBegin}
          className="btn-primary"
          aria-label="Begin experience"
        >
          <span>let's begin</span>
          <ArrowRight size={17} />
        </button>
      </div>

      {step < 6 && (
        <button
          onClick={() => setStep(6)}
          className="btn-ghost"
          style={{ position: 'absolute', bottom: '20px', opacity: 0.4, fontSize: '0.85rem' }}
        >
          tap to reveal faster
        </button>
      )}
    </div>
  );
};
