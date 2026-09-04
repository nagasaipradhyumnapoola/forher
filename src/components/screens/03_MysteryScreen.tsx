import React, { useState } from 'react';
import { playSelect, playTransition } from '../../utils/audio';
import { logEvent } from '../../utils/logger';

interface Props {
  onNext: () => void;
}

const choices = [
  {
    id: 1,
    title: 'your secret admirer',
    subtitle: 'someone who thinks about you a little more than usual.',
  },
  {
    id: 2,
    title: "someone you didn't expect",
    subtitle: 'or maybe you secretly did, just a tiny bit.',
  },
  {
    id: 3,
    title: 'a familiar face with a confession',
    subtitle: 'done dropping subtle hints, apparently.',
  },
];

export const MysteryScreen: React.FC<Props> = ({ onNext }) => {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (idx: number) => {
    playSelect();
    logEvent('mystery_pick', { label: choices[idx].title });
    setSelected(idx);
    setTimeout(() => {
      playTransition();
      onNext();
    }, 500);
  };

  return (
    <div className="screen-wrapper experience-container">
      <h1 className="display-title" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', marginBottom: '0.5rem' }}>
        I have something to tell you.
      </h1>

      <p className="cursive-label" style={{ marginBottom: '2.4rem', color: 'var(--text-secondary)' }}>
        before I say it… who do you think made this for you?
      </p>

      <div style={{ width: '100%', maxWidth: '540px', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '2rem' }}>
        {choices.map((choice, idx) => {
          const isSelected = selected === idx;
          return (
            <div
              key={choice.id}
              onClick={() => handleSelect(idx)}
              className={`note-option ${isSelected ? 'selected' : ''}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelect(idx)}
            >
              <div style={{ flex: 1, textAlign: 'left' }}>
                <h3 className="font-cursive" style={{ fontSize: '1.5rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {choice.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{choice.subtitle}</p>
              </div>
              <span className="note-arrow" aria-hidden="true">→</span>
            </div>
          );
        })}
      </div>

      <p className="cursive-small">pick whichever feels right…</p>
    </div>
  );
};
