import React, { useState } from 'react';
import { ArrowRight, HelpCircle, Heart, Sparkles, UserCheck } from 'lucide-react';

interface Props {
  onNext: () => void;
}

export const MysteryScreen: React.FC<Props> = ({ onNext }) => {
  const [selected, setSelected] = useState<number | null>(null);

  const choices = [
    {
      id: 1,
      icon: <Heart size={20} className="text-accent" />,
      title: 'Your secret admirer',
      subtitle: 'Someone who thinks about you a little more than usual.'
    },
    {
      id: 2,
      icon: <Sparkles size={20} className="text-accent" />,
      title: "Someone you didn't expect",
      subtitle: 'Or maybe you secretly did, just a tiny bit.'
    },
    {
      id: 3,
      icon: <UserCheck size={20} className="text-accent" />,
      title: 'A familiar face with a confession',
      subtitle: 'Ready to stop dropping subtle hints.'
    }
  ];

  const handleSelect = (idx: number) => {
    setSelected(idx);
    // Smooth transition
    setTimeout(() => {
      onNext();
    }, 450);
  };

  return (
    <div className="screen-wrapper experience-container">
      <div style={{ marginBottom: '1.5rem' }}>
        <span className="badge-label">
          <HelpCircle size={13} />
          Mystery Question
        </span>
      </div>

      <h1 className="display-title" style={{ marginBottom: '0.8rem' }}>
        I have something to tell you.
      </h1>

      <p className="subheading" style={{ marginBottom: '2.5rem' }}>
        Before I say it... who do you think put this together for you?
      </p>

      {/* Interactive Cards */}
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          marginBottom: '2.5rem'
        }}
      >
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
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                padding: '1.3rem 1.6rem',
                cursor: 'pointer'
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'var(--accent)' : 'var(--accent-soft)',
                  color: isSelected ? '#ffffff' : 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all var(--transition-fast)'
                }}
              >
                {choice.icon}
              </div>

              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontSize: '1.12rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '3px'
                  }}
                >
                  {choice.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  {choice.subtitle}
                </p>
              </div>

              <ArrowRight
                size={18}
                style={{
                  color: isSelected ? 'var(--accent)' : 'var(--text-muted)',
                  transform: isSelected ? 'translateX(4px)' : 'translateX(0)',
                  transition: 'transform var(--transition-fast)'
                }}
              />
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Pick any card to see who it is...
      </p>
    </div>
  );
};
