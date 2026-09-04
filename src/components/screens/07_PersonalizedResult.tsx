import React, { useState, useEffect } from 'react';
import { CompatibilityAnswers, LoveLanguageAnswers, MeetVibe } from '../../types';
import { MEET_VIBES, ENERGY_VIBES, MUSIC_VIBES } from '../../data/vibes';
import { ArrowRight, Flower2 } from 'lucide-react';
import { playClick, playTransition } from '../../utils/audio';

interface Props {
  compatibility: CompatibilityAnswers;
  loveLanguage: LoveLanguageAnswers;
  onNext: () => void;
}

// Per-vibe flirty personalized synthesis
const vibeSynthesis: Record<MeetVibe, { intro: string; body: string }> = {
  coffee: {
    intro: 'you picked coffee & random conversations.',
    body: "you seem like the kind of person who'd rather sit in a quiet corner talking about absolutely nothing for three hours than make forced small talk for ten minutes. honestly? I think we'd get along.",
  },
  zoo: {
    intro: 'you picked the zoo + wandering around.',
    body: "that feels extremely specific. and somehow... I like it. you seem like someone who'd point at every animal and narrate their internal monologue. I'd be laughing the entire time.",
  },
  food: {
    intro: 'you picked food + exploring somewhere new.',
    body: "you seem like someone who'd get unreasonably excited about finding a good ramen spot. and then spend the next hour talking about how life-changing the broth was. honestly, same.",
  },
  walk: {
    intro: "you picked a walk + talking about everything.",
    body: "golden hour, cool breeze, no hurry to be anywhere... you seem like someone who appreciates the quiet moments. the kind of conversations that just happen without trying.",
  },
  movie: {
    intro: 'you picked movie + excessive snacks.',
    body: "you seem like the kind of person who'd get way too invested in the plot, steal all the popcorn, and then spend an hour afterwards dissecting every scene. I am here for that.",
  },
  random: {
    intro: "you picked something completely random.",
    body: "no plan, no expectations, just figuring it out as we go. that's actually my favorite kind of energy. I think the spontaneity would make it memorable.",
  },
};

export const PersonalizedResult: React.FC<Props> = ({ compatibility, loveLanguage, onNext }) => {
  const [step, setStep] = useState(0);
  const chosenMeet = MEET_VIBES.find((v) => v.id === compatibility.meetVibe) || MEET_VIBES[0];
  const chosenEnergy = ENERGY_VIBES.find((e) => e.id === compatibility.energyVibe) || ENERGY_VIBES[0];
  const chosenMusic = MUSIC_VIBES.find((m) => m.id === compatibility.musicVibe) || MUSIC_VIBES[0];
  const synthesis = vibeSynthesis[compatibility.meetVibe || 'coffee'];

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 1600),
      setTimeout(() => setStep(3), 2600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const lineStyle = (visible: boolean): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(14px)',
    transition: 'opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)',
  });

  return (
    <div className="screen-wrapper experience-container">
      <h1 className="display-title" style={{ ...lineStyle(step >= 1), fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', marginBottom: '0.4rem' }}>
        okay...
      </h1>

      <p className="cursive-label" style={{ ...lineStyle(step >= 1), marginBottom: '2rem', fontSize: '1.3rem', color: 'var(--text-primary)' }}>
        I think I have a pretty good idea now 👀
      </p>

      {/* Reflection Card */}
      <div
        className="frosted-card"
        style={{
          ...lineStyle(step >= 2),
          width: '100%', maxWidth: '560px', padding: '2.2rem 2rem',
          textAlign: 'left', marginBottom: '2rem',
          border: '1.5px solid var(--accent-border)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(251,245,242,0.85) 100%)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Faint watermark */}
        <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', opacity: 0.035, pointerEvents: 'none' }}>
          <Flower2 size={160} />
        </div>

        {/* Vibe badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.4rem' }}>
          {[
            `${chosenMeet.emoji} ${chosenMeet.title.split('&')[0].split('+')[0].trim()}`,
            `${chosenEnergy.emoji} ${chosenEnergy.title}`,
            `${chosenMusic.emoji} ${chosenMusic.title.split('&')[0].trim()}`,
          ].map((label, i) => (
            <span key={i} style={{ fontSize: '0.8rem', fontWeight: 500, padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              {label}
            </span>
          ))}
        </div>

        <p className="font-cursive" style={{ fontSize: '1.3rem', color: 'var(--text-accent)', marginBottom: '0.8rem' }}>
          {synthesis.intro}
        </p>

        <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          {synthesis.body}
        </p>

        {loveLanguage.loveLanguage && (
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.6)', borderLeft: '3px solid var(--accent)', marginBottom: '1rem' }}>
            <p className="cursive-small" style={{ fontStyle: 'italic' }}>"{loveLanguage.loveLanguage}"</p>
          </div>
        )}

        <p className="font-cursive" style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-accent)' }}>
          I think you might actually complete the equation ✨
        </p>
      </div>

      {/* CTA */}
      <div style={{ ...lineStyle(step >= 3), pointerEvents: step >= 3 ? 'auto' : 'none' }}>
        <button onClick={() => { playClick(); playTransition(); onNext(); }} className="btn-accent" style={{ padding: '14px 36px' }}>
          <span>let's plan our meet</span>
          <ArrowRight size={17} />
        </button>
      </div>
    </div>
  );
};
