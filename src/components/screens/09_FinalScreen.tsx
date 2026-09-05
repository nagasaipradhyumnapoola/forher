import React, { useState, useEffect } from 'react';
import { MeetingPlan } from '../../types';
import { MEET_VIBES } from '../../data/vibes';
import { MapPin, Calendar, Clock, Edit3, Share2, Check, Flower2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playReveal, playClick } from '../../utils/audio';
import { logEvent } from '../../utils/logger';
import { ScreenDecor } from '../fx/ScreenDecor';

interface Props {
  plan: MeetingPlan;
  onEditPlan: () => void;
}

export const FinalScreen: React.FC<Props> = ({ plan, onEditPlan }) => {
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(0);
  const vibeData = MEET_VIBES.find((v) => v.id === plan.vibe) || MEET_VIBES[0];

  useEffect(() => {
    confetti({
      particleCount: 35, spread: 60, origin: { y: 0.6 },
      colors: ['#e0709a', '#f5c2d3', '#f0a6c4'],
      disableForReducedMotion: true,
    });
    playReveal();

    const timers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 2000),
      setTimeout(() => setStep(3), 3500),
      setTimeout(() => setStep(4), 5200),
      setTimeout(() => setStep(5), 7000),
      setTimeout(() => setStep(6), 8500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const lineStyle = (visible: boolean): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(14px)',
    transition: 'opacity 700ms cubic-bezier(0.16, 1, 0.3, 1), transform 700ms cubic-bezier(0.16, 1, 0.3, 1)',
  });

  const handleCopy = () => {
    playClick();
    logEvent('plan_copied');
    const text = `✨ Our Plan ✨\n${vibeData.emoji} ${vibeData.title}\n📍 ${plan.place}\n📅 ${plan.date}\n⏰ ${plan.time}\n\nSee you there :) — Pradhyumna`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="screen-wrapper experience-container final-screen" style={{ paddingBottom: '3rem' }}>
      <ScreenDecor variant="ticket" />
      {/* Sequential emotional payoff */}
      <div className="final-seq" style={{ minHeight: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.9rem', marginBottom: '1.5rem' }}>
        <h1 className="display-title" style={{ ...lineStyle(step >= 1), fontSize: 'clamp(2.4rem, 5.2vw, 3.8rem)' }}>
          okay.
        </h1>

        <p className="subheading final-hide-sm" style={{ ...lineStyle(step >= 2), fontSize: '1.1rem', color: 'var(--text-primary)' }}>
          I think I'm really looking forward to this.
        </p>

        <p className="cursive-label" style={{ ...lineStyle(step >= 3), fontSize: '1.2rem', maxWidth: '460px' }}>
          one {vibeData.id === 'coffee' ? 'coffee' : vibeData.id === 'zoo' ? 'zoo day' : vibeData.id === 'food' ? 'food adventure' : vibeData.id === 'walk' ? 'evening walk' : vibeData.id === 'movie' ? 'movie night' : 'random adventure'}.
          one questionable amount of talking.
          whatever it turns into.
        </p>

        <p className="font-serif" style={{ ...lineStyle(step >= 4), fontSize: 'clamp(1.3rem, 2.8vw, 1.8rem)', color: 'var(--text-accent)', fontStyle: 'italic', maxWidth: '480px' }}>
          I don't know exactly where this goes. but I'd like to find out with you.
        </p>

        <p className="font-script" style={{ ...lineStyle(step >= 5), fontSize: '2.1rem', color: 'var(--text-accent)', marginTop: '0.4rem' }}>
          — Pradhyumna
        </p>
      </div>

      {/* Souvenir Ticket */}
      <div style={{ width: '100%', maxWidth: '480px', ...lineStyle(step >= 6), pointerEvents: step >= 6 ? 'auto' : 'none' }}>
        <div className="plan-ticket" style={{ padding: '2.2rem 2rem', textAlign: 'left', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span className="badge-label" style={{ fontSize: '0.76rem' }}>
              <Flower2 size={11} /> souvenir ticket
            </span>
            <span className="font-cursive" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              reserved for Moksha
            </span>
          </div>

          <h3 className="font-serif" style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>the plan</h3>
          <p className="cursive-small" style={{ marginBottom: '1rem' }}>looks like we have a date.</p>

          <div className="ticket-divider" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.4rem' }}>
            {[
              { icon: vibeData.emoji, label: 'Activity', value: vibeData.title, isEmoji: true },
              { icon: <MapPin size={15} />, label: 'Location', value: plan.place },
              { icon: <Calendar size={15} />, label: 'Date', value: plan.date },
              { icon: <Clock size={15} />, label: 'Time', value: plan.time },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {row.isEmoji ? (
                  <span style={{ fontSize: '1.5rem', width: '30px', textAlign: 'center' }}>{row.icon}</span>
                ) : (
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {row.icon}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>{row.label}</div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 500, color: 'var(--text-primary)' }}>{row.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <p className="font-cursive" style={{ fontSize: '1.4rem', color: 'var(--text-accent)' }}>
              see you there :)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => { playClick(); onEditPlan(); }} className="btn-secondary" style={{ fontSize: '0.95rem' }}>
            <Edit3 size={14} /> <span>change my choice</span>
          </button>
          <button onClick={handleCopy} className="btn-primary" style={{ fontSize: '0.95rem' }}>
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            <span>{copied ? 'copied!' : 'copy plan'}</span>
          </button>
        </div>

        <p className="cursive-small final-ps" style={{ marginTop: '1.6rem', lineHeight: 1.55, color: 'var(--text-secondary)', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto' }}>
          p.s. — I rewrote this way too many times. nothing felt good enough for you. so… hi 🙈
        </p>
      </div>

      {step < 6 && (
        <button onClick={() => setStep(6)} className="btn-ghost" style={{ position: 'absolute', bottom: '16px', opacity: 0.4, fontSize: '0.85rem' }}>
          tap to reveal final note
        </button>
      )}
    </div>
  );
};
