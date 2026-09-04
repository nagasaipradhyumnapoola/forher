import React, { useState } from 'react';
import { MeetingPlan, MeetVibe } from '../../types';
import { MEET_VIBES } from '../../data/vibes';
import { MapPin, Calendar, Clock, ArrowRight } from 'lucide-react';
import { playClick, playSelect, playConfirm } from '../../utils/audio';

interface Props {
  initialPlan: MeetingPlan;
  onSavePlan: (plan: MeetingPlan) => void;
}

export const MeetingPlanner: React.FC<Props> = ({ initialPlan, onSavePlan }) => {
  const [vibe, setVibe] = useState<MeetVibe>(initialPlan.vibe);
  const [place, setPlace] = useState<string>(initialPlan.place || '');
  const [date, setDate] = useState<string>(initialPlan.date || '');
  const [time, setTime] = useState<string>(initialPlan.time || '');

  const activeVibeData = MEET_VIBES.find((v) => v.id === vibe) || MEET_VIBES[0];

  const handleVibeChange = (newVibe: MeetVibe) => {
    playSelect();
    setVibe(newVibe);
    const found = MEET_VIBES.find((v) => v.id === newVibe);
    if (found && !place) setPlace(found.defaultPlaces[0]);
  };

  const handleCreatePlan = () => {
    playConfirm();
    onSavePlan({
      vibe,
      place: place || 'you decide ✨',
      date: date || 'whenever works',
      time: time || 'evening vibes',
    });
  };

  return (
    <div className="screen-wrapper experience-container">
      <h1 className="display-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)', marginBottom: '0.3rem' }}>
        {activeVibeData.heading}
      </h1>

      <p className="cursive-label" style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
        you pick the details. I'll handle the rest.
      </p>

      {/* Main Grid */}
      <div style={{ width: '100%', maxWidth: '720px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '20px', marginBottom: '2rem', textAlign: 'left' }}>
        {/* Controls */}
        <div className="frosted-card" style={{ padding: '1.6rem 1.6rem', display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
          {/* Vibe Pills */}
          <div>
            <label className="font-cursive" style={{ display: 'block', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              activity vibe
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {MEET_VIBES.map((v) => (
                <button
                  key={v.id} type="button"
                  onClick={() => handleVibeChange(v.id)}
                  style={{
                    padding: '4px 11px', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: 500,
                    background: vibe === v.id ? 'rgba(216, 108, 123, 0.15)' : 'rgba(255, 255, 255, 0.5)',
                    color: vibe === v.id ? 'var(--accent)' : 'var(--text-primary)',
                    border: `1px solid ${vibe === v.id ? 'var(--accent-border)' : 'var(--border)'}`,
                    cursor: 'pointer', transition: 'all var(--transition-fast)',
                    fontFamily: 'var(--font-cursive)',
                  }}
                >
                  {v.emoji} {v.id}
                </button>
              ))}
            </div>
          </div>

          {/* Place — Free Input */}
          <div>
            <label className="font-cursive" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              <MapPin size={14} style={{ color: 'var(--accent)' }} /> where are we going?
            </label>
            {/* Suggested places */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '6px' }}>
              {activeVibeData.defaultPlaces.slice(0, 3).map((p) => (
                <button
                  key={p} type="button"
                  onClick={() => { playClick(); setPlace(p); }}
                  style={{
                    padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem',
                    background: place === p ? 'var(--bg-card-selected)' : 'rgba(255,255,255,0.5)',
                    border: `1px solid ${place === p ? 'var(--accent)' : 'var(--border)'}`,
                    color: 'var(--text-primary)', cursor: 'pointer',
                    fontFamily: 'var(--font-cursive)',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
            <input
              type="text" value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="or type any place you love..."
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--border)', background: 'rgba(255,255,255,0.6)',
                fontSize: '0.9rem', outline: 'none', fontFamily: 'var(--font-sans)',
                transition: 'border-color var(--transition-fast)',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Date — Free Input */}
          <div>
            <label className="font-cursive" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              <Calendar size={14} style={{ color: 'var(--accent)' }} /> when are you thinking?
            </label>
            <input
              type="text" value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="whenever works for you..."
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--border)', background: 'rgba(255,255,255,0.6)',
                fontSize: '0.9rem', outline: 'none', fontFamily: 'var(--font-sans)',
                transition: 'border-color var(--transition-fast)',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Time — Free Input */}
          <div>
            <label className="font-cursive" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              <Clock size={14} style={{ color: 'var(--accent)' }} /> what time works?
            </label>
            <input
              type="text" value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="evening, 5 PM, after class..."
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--border)', background: 'rgba(255,255,255,0.6)',
                fontSize: '0.9rem', outline: 'none', fontFamily: 'var(--font-sans)',
                transition: 'border-color var(--transition-fast)',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        {/* Live Preview Ticket */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="plan-ticket" style={{ padding: '2rem 1.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="badge-label" style={{ fontSize: '0.8rem', padding: '3px 10px' }}>live preview</span>
              <span className="font-cursive" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>for Moksha ✨</span>
            </div>

            <h3 className="font-serif" style={{ fontSize: '1.7rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>the plan</h3>
            <p className="cursive-small" style={{ marginBottom: '1rem' }}>a little date in the making.</p>

            <div className="ticket-divider" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { icon: activeVibeData.emoji, label: 'Activity', value: activeVibeData.title.split('&')[0].split('+')[0].trim(), isEmoji: true },
                { icon: <MapPin size={14} />, label: 'Place', value: place || '...', isEmoji: false },
                { icon: <Calendar size={14} />, label: 'Date', value: date || '...', isEmoji: false },
                { icon: <Clock size={14} />, label: 'Time', value: time || '...', isEmoji: false },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {row.isEmoji ? (
                    <span style={{ fontSize: '1.3rem', width: '26px', textAlign: 'center' }}>{row.icon}</span>
                  ) : (
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {row.icon}
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>{row.label}</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 500, color: 'var(--text-primary)' }}>{row.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button onClick={handleCreatePlan} className="btn-accent" style={{ padding: '14px 40px' }}>
        <span>okay, let's make this happen</span>
        <ArrowRight size={17} />
      </button>
    </div>
  );
};
