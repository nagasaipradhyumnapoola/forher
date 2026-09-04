import React, { useState, useEffect, useRef } from 'react';
import { MeetingPlan } from '../../types';
import { MEET_VIBES } from '../../data/vibes';
import { MapPin, Calendar, Clock, Edit3, Share2, Check, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  plan: MeetingPlan;
  onEditPlan: () => void;
}

export const FinalScreen: React.FC<Props> = ({ plan, onEditPlan }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);
  const vibeData = MEET_VIBES.find((v) => v.id === plan.vibe) || MEET_VIBES[0];

  useEffect(() => {
    // Gentle celebration on mount
    confetti({
      particleCount: 40,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D86C7B', '#FAD4D8', '#E6C09C'],
      disableForReducedMotion: true
    });

    const timers = [
      setTimeout(() => setStep(1), 500),  // "Well..."
      setTimeout(() => setStep(2), 1800), // "I had no idea where..."
      setTimeout(() => setStep(3), 3200), // "But I'm glad you made it this far."
      setTimeout(() => setStep(4), 4800), // "I'm genuinely excited..."
      setTimeout(() => setStep(5), 6200), // "— Pradhyumna" + Ticket
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleCopyPlan = () => {
    const text = `✨ Our Plan ✨\nActivity: ${vibeData.emoji} ${vibeData.title}\nPlace: 📍 ${plan.place}\nDate: 📅 ${plan.date}\nTime: ⏰ ${plan.time}\n\nSee you there :) — Pradhyumna`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="screen-wrapper experience-container" style={{ paddingBottom: '4rem' }}>
      {/* Visual Badge */}
      <div style={{ marginBottom: '1.5rem' }}>
        <span className="badge-label">
          <Heart size={13} fill="currentColor" />
          The Final Note
        </span>
      </div>

      {/* Sincere Sequential Text */}
      <div
        style={{
          minHeight: '180px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        {step >= 1 && (
          <h1 className="display-title animate-fade-in-up" style={{ fontSize: 'clamp(2.4rem, 5.2vw, 3.8rem)' }}>
            Well...
          </h1>
        )}

        {step >= 2 && (
          <p className="subheading animate-fade-in-up" style={{ fontSize: '1.18rem', color: 'var(--text-primary)' }}>
            I had no idea where this little website would end up.
          </p>
        )}

        {step >= 3 && (
          <p className="subheading animate-fade-in-up" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            But I'm really glad you made it this far.
          </p>
        )}

        {step >= 4 && (
          <p
            className="animate-fade-in-up"
            style={{
              fontSize: '1.24rem',
              fontWeight: 600,
              fontFamily: 'var(--font-serif)',
              color: 'var(--text-accent)'
            }}
          >
            I'm genuinely excited to see where this goes.
          </p>
        )}

        {step >= 5 && (
          <p
            className="animate-fade-in-up"
            style={{
              fontSize: '1.35rem',
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              color: 'var(--text-primary)',
              marginTop: '0.4rem'
            }}
          >
            — Pradhyumna
          </p>
        )}
      </div>

      {/* Final Souvenir Ticket Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          opacity: step >= 5 ? 1 : 0,
          transform: step >= 5 ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 800ms cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: step >= 5 ? 'auto' : 'none'
        }}
      >
        <div className="plan-ticket" style={{ padding: '2.5rem 2.2rem', textAlign: 'left', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <span className="badge-label" style={{ fontSize: '0.74rem' }}>
              OFFICIAL SOUVENIR TICKET
            </span>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontFamily: 'var(--font-serif)' }}>
              Reserved for Moksha
            </span>
          </div>

          <h3 className="font-serif" style={{ fontSize: '2.2rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
            THE PLAN
          </h3>

          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
            Looks like we have a date.
          </p>

          <div className="ticket-divider" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '1.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '1.6rem' }}>{vibeData.emoji}</span>
              <div>
                <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Activity</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {vibeData.title}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={17} />
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Location</div>
                <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {plan.place}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={17} />
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Date</div>
                <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {plan.date}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={17} />
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Time</div>
                <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {plan.time}
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.2rem' }}>
            <p className="font-serif" style={{ fontSize: '1.4rem', color: 'var(--text-accent)', fontStyle: 'italic' }}>
              See you there :)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={onEditPlan}
            className="btn-secondary"
            style={{ fontSize: '0.9rem' }}
          >
            <Edit3 size={15} />
            <span>Change my choice</span>
          </button>

          <button
            onClick={handleCopyPlan}
            className="btn-primary"
            style={{ fontSize: '0.9rem' }}
          >
            {copied ? <Check size={15} /> : <Share2 size={15} />}
            <span>{copied ? 'Plan Copied!' : 'Copy Plan Summary'}</span>
          </button>
        </div>
      </div>

      {step < 5 && (
        <button
          onClick={() => setStep(5)}
          className="btn-ghost"
          style={{ position: 'absolute', bottom: '20px', opacity: 0.5, fontSize: '0.8rem' }}
        >
          tap to reveal final note
        </button>
      )}
    </div>
  );
};
