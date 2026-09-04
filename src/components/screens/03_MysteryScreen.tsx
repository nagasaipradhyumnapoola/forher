import React, { useState } from 'react';
import { ArrowRight, Heart, Sparkles, UserCheck } from 'lucide-react';
import { playSelect, playTransition } from '../../utils/audio';

interface Props {
  onNext: () => void;
}

export const MysteryScreen: React.FC<Props> = ({ onNext }) => {
  const [selected, setSelected] = useState<number | null>(null);

  const choices = [
    {
      id: 1,
      icon: <Heart size={18} />,
      title: 'your secret admirer',
      subtitle: 'someone who thinks about you a little more than usual.',
    },
    {
      id: 2,
      icon: <Sparkles size={18} />,
      title: "someone you didn't expect",
      subtitle: 'or maybe you secretly did, just a tiny bit.',
    },
    {
      id: 3,
      icon: <UserCheck size={18} />,
      title: 'a familiar face with a confession',
      subtitle: 'ready to stop dropping subtle hints.',
    },
  ];

  const handleSelect = (idx: number) => {
    playSelect();
    setSelected(idx);
    setTimeout(() => { playTransition(); onNext(); }, 500);
  };

  return (
    <div className="screen-wrapper experience-container">
      <h1 className="display-title" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', marginBottom: '0.5rem' }}>
        I have something to tell you.
      </h1>

      <p className="cursive-label" style={{ marginBottom: '2.2rem', color: 'var(--text-secondary)' }}>
        before I say it... who do you think put this together?
      </p>

      <div style={{ width: '100%', maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '2rem' }}>
        {choices.map((choice, idx) => {
          const isSelected = selected === idx;
          return (
            <div
              key={choice.id}
              onClick={() => handleSelect(idx)}
              className={`interactive-card ${isSelected ? 'selected' : ''}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelect(idx)}
              style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '1.2rem 1.5rem' }}
            >
              <div style={{
                width: '38px', height: '38px', borderRadius: 'var(--radius-md)',
                background: isSelected ? 'var(--accent)' : 'var(--accent-soft)',
                color: isSelected ? '#fff' : 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                transition: 'all var(--transition-fast)',
              }}>
                {choice.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 className="font-cursive" style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                  {choice.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{choice.subtitle}</p>
              </div>
              <ArrowRight size={16} style={{ color: isSelected ? 'var(--accent)' : 'var(--text-muted)', transform: isSelected ? 'translateX(4px)' : 'translateX(0)', transition: 'transform var(--transition-fast)' }} />
            </div>
          );
        })}
      </div>

      <p className="cursive-small" style={{ fontStyle: 'italic' }}>
        pick any card to find out...
      </p>
    </div>
  );
};
