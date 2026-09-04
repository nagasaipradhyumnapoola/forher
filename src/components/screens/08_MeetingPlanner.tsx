import React, { useState } from 'react';
import { MeetingPlan, MeetVibe } from '../../types';
import { MEET_VIBES } from '../../data/vibes';
import { MapPin, Calendar, Clock, ArrowRight, Sparkles, Edit3 } from 'lucide-react';

interface Props {
  initialPlan: MeetingPlan;
  onSavePlan: (plan: MeetingPlan) => void;
}

export const MeetingPlanner: React.FC<Props> = ({ initialPlan, onSavePlan }) => {
  const currentVibeData = MEET_VIBES.find((v) => v.id === initialPlan.vibe) || MEET_VIBES[0];

  const [vibe, setVibe] = useState<MeetVibe>(initialPlan.vibe);
  const [place, setPlace] = useState<string>(
    initialPlan.place || currentVibeData.defaultPlaces[0] || 'A cozy spot'
  );
  const [customPlace, setCustomPlace] = useState<string>('');
  const [date, setDate] = useState<string>(initialPlan.date || 'This Saturday');
  const [customDate, setCustomDate] = useState<string>('');
  const [time, setTime] = useState<string>(initialPlan.time || '5:00 PM');
  const [customTime, setCustomTime] = useState<string>('');
  const [activeVibeData, setActiveVibeData] = useState(currentVibeData);

  const dateOptions = ['This Saturday', 'This Sunday', 'Next Weekend', 'Any evening'];
  const timeOptions = ['4:30 PM', '5:00 PM', '6:30 PM', '7:30 PM'];

  const handleVibeChange = (newVibe: MeetVibe) => {
    setVibe(newVibe);
    const found = MEET_VIBES.find((v) => v.id === newVibe) || MEET_VIBES[0];
    setActiveVibeData(found);
    setPlace(found.defaultPlaces[0]);
  };

  const handleCreatePlan = () => {
    const finalPlace = customPlace.trim() || place;
    const finalDate = customDate.trim() || date;
    const finalTime = customTime.trim() || time;

    onSavePlan({
      vibe,
      place: finalPlace,
      date: finalDate,
      time: finalTime
    });
  };

  return (
    <div className="screen-wrapper experience-container">
      {/* Dynamic Header */}
      <div style={{ marginBottom: '1.2rem' }}>
        <span className="badge-label">
          <Sparkles size={13} />
          {activeVibeData.accentBadge}
        </span>
      </div>

      <h1 className="display-title" style={{ fontSize: 'clamp(2.2rem, 5.2vw, 3.6rem)', marginBottom: '0.6rem' }}>
        {activeVibeData.heading}
      </h1>

      <p className="subheading" style={{ marginBottom: '2.5rem' }}>
        You choose the details. I'll make sure it's memorable.
      </p>

      {/* Main Grid: Controls + Live Preview */}
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '2.5rem',
          textAlign: 'left'
        }}
      >
        {/* Controls Column */}
        <div
          className="frosted-card"
          style={{
            padding: '1.8rem 1.8rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}
        >
          {/* Vibe Switcher Pills */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Activity Vibe
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {MEET_VIBES.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleVibeChange(v.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.84rem',
                    fontWeight: 500,
                    background: vibe === v.id ? 'var(--accent)' : 'rgba(255, 255, 255, 0.7)',
                    color: vibe === v.id ? '#ffffff' : 'var(--text-primary)',
                    border: `1px solid ${vibe === v.id ? 'var(--accent)' : 'var(--border)'}`,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {v.emoji} {v.id.charAt(0).toUpperCase() + v.id.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Place Selector */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <MapPin size={14} className="text-accent" />
              <span>Choose A Place</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
              {activeVibeData.defaultPlaces.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPlace(p);
                    setCustomPlace('');
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                    textAlign: 'left',
                    background: place === p && !customPlace ? 'var(--bg-card-selected)' : 'rgba(255, 255, 255, 0.6)',
                    border: `1px solid ${place === p && !customPlace ? 'var(--accent)' : 'var(--border)'}`,
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Or type another spot you love..."
              value={customPlace}
              onChange={(e) => {
                setCustomPlace(e.target.value);
                if (e.target.value) setPlace(e.target.value);
              }}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: '#ffffff',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Date Selector */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <Calendar size={14} className="text-accent" />
              <span>Pick A Date</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {dateOptions.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setDate(d);
                    setCustomDate('');
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.86rem',
                    background: date === d && !customDate ? 'var(--text-primary)' : 'rgba(255, 255, 255, 0.6)',
                    color: date === d && !customDate ? '#ffffff' : 'var(--text-primary)',
                    border: `1px solid ${date === d && !customDate ? 'var(--text-primary)' : 'var(--border)'}`,
                    cursor: 'pointer'
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Or a specific date (e.g. Next Friday)..."
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                if (e.target.value) setDate(e.target.value);
              }}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: '#ffffff',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Time Selector */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <Clock size={14} className="text-accent" />
              <span>Pick A Time</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {timeOptions.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTime(t);
                    setCustomTime('');
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.86rem',
                    background: time === t && !customTime ? 'var(--text-primary)' : 'rgba(255, 255, 255, 0.6)',
                    color: time === t && !customTime ? '#ffffff' : 'var(--text-primary)',
                    border: `1px solid ${time === t && !customTime ? 'var(--text-primary)' : 'var(--border)'}`,
                    cursor: 'pointer'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Or specific time (e.g. 6:00 PM)..."
              value={customTime}
              onChange={(e) => {
                setCustomTime(e.target.value);
                if (e.target.value) setTime(e.target.value);
              }}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: '#ffffff',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Live Plan Preview Ticket */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="plan-ticket" style={{ padding: '2.2rem 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <span className="badge-label" style={{ fontSize: '0.74rem', padding: '4px 10px' }}>
                LIVE PREVIEW
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                For Moksha ✨
              </span>
            </div>

            <h3 className="font-serif" style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              THE PLAN
            </h3>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.4rem' }}>
              A little date in the making.
            </p>

            <div className="ticket-divider" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.4rem' }}>{activeVibeData.emoji}</span>
                <div>
                  <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Activity</div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {activeVibeData.title.split('&')[0].split('+')[0]}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Place</div>
                  <div style={{ fontSize: '0.96rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {customPlace.trim() || place}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Date</div>
                  <div style={{ fontSize: '0.96rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {customDate.trim() || date}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Time</div>
                  <div style={{ fontSize: '0.96rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {customTime.trim() || time}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleCreatePlan}
        className="btn-accent"
        style={{ padding: '16px 44px' }}
      >
        <span>Create the plan</span>
        <ArrowRight size={18} />
      </button>
    </div>
  );
};
