import React, { useState } from 'react';

/**
 * /admin — private dashboard. Posts a password to /api/sessions (verified
 * server-side against ADMIN_PASSWORD), then renders every stored session's
 * timeline parsed from its GitHub markdown file. No data is fetched until a
 * correct password is supplied; the token never reaches this page.
 */

interface Ev {
  t: string;
  type: string;
  [k: string]: unknown;
}
interface Session {
  name: string;
  sessionId: string;
  completed: boolean;
  startedAt: string;
  updatedAt: string;
  events: Ev[];
  markdown: string;
}

const SCREEN_LABELS: Record<string, string> = {
  opening: 'Opening',
  auth: 'Passcode',
  mystery: 'Who-made-this guess',
  reveal: 'The confession',
  compatibility: 'Compatibility game',
  love_language: 'Love-language',
  personalized_result: 'Personalised result',
  meeting_planner: 'Date planner',
  final: 'Final screen',
};

const g = (e: Ev, k: string) => (e[k] === undefined || e[k] === null ? '' : String(e[k]));

function line(e: Ev): string {
  switch (e.type) {
    case 'start': return '🌸 Opened the experience';
    case 'screen': return `🚪 ${SCREEN_LABELS[g(e, 'screen')] || g(e, 'screen')}`;
    case 'passcode_fail': return `🔒 Wrong passcode${e.attempt ? ` (attempt ${g(e, 'attempt')})` : ''}`;
    case 'passcode_ok': return '🔓 Entered the correct passcode';
    case 'mystery_pick': return `🃏 Guessed: “${g(e, 'label')}”`;
    case 'reveal_response':
      return g(e, 'answer') === 'yes'
        ? `🌸 Said YES${Number(e.dodges) > 0 ? ` (no-button dodged ${g(e, 'dodges')}×)` : ''}`
        : `🙃 Said no${Number(e.dodges) > 0 ? ` (dodged ${g(e, 'dodges')}× first)` : ''}`;
    case 'compat_meet': return `☕ First-meet: ${g(e, 'title')}`;
    case 'compat_energy': return `✨ Energy: ${g(e, 'title')}`;
    case 'compat_music': return `🎧 Music: ${g(e, 'title')}`;
    case 'love_language': return '📝 Answered love-language questions';
    case 'plan_change': return `✏️ Changed ${g(e, 'field')}: “${g(e, 'from')}” → “${g(e, 'to')}”`;
    case 'plan_save': return `📍 Saved plan — ${g(e, 'vibe')} · ${g(e, 'place')} · ${g(e, 'date')} · ${g(e, 'time')}`;
    case 'plan_copied': return '📋 Copied the plan';
    case 'complete': return '🎉 Reached the final screen';
    default: return `• ${e.type}`;
  }
}

const fmt = (iso: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString();
};
const clock = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : d.toLocaleTimeString();
};

const wrap: React.CSSProperties = {
  maxWidth: '860px',
  margin: '0 auto',
  padding: '2.5rem 1.5rem 4rem',
  position: 'relative',
  zIndex: 10,
};

export const AdminApp: React.FC = () => {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'ok'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const load = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const r = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const j = await r.json();
      if (!j.ok) {
        setStatus('error');
        setErrorMsg(
          j.error === 'unauthorized' ? 'Wrong password.'
          : j.error === 'admin_disabled' ? 'Admin is disabled (ADMIN_PASSWORD not set).'
          : j.error === 'not_configured' ? 'Server storage is not configured yet.'
          : j.error || 'Something went wrong.',
        );
        return;
      }
      setSessions(j.sessions || []);
      setStatus('ok');
    } catch {
      setStatus('error');
      setErrorMsg('Network error — is the server / dev API running?');
    }
  };

  if (status !== 'ok') {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <form onSubmit={load} className="frosted-card" style={{ width: '100%', maxWidth: '400px', padding: '2.2rem 2rem', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
          <h1 className="section-title" style={{ marginBottom: '0.3rem' }}>Session dashboard</h1>
          <p className="cursive-label" style={{ marginBottom: '1.6rem', color: 'var(--text-secondary)' }}>private — enter the admin password</p>
          <input
            type="password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            placeholder="admin password"
            autoFocus
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border)', background: 'rgba(255,255,255,0.7)',
              fontSize: '1rem', outline: 'none', marginBottom: '1rem', fontFamily: 'var(--font-sans)',
            }}
          />
          <button type="submit" className="btn-accent" style={{ width: '100%', justifyContent: 'center' }} disabled={status === 'loading'}>
            <span>{status === 'loading' ? 'loading…' : 'open dashboard'}</span>
          </button>
          {status === 'error' && (
            <p style={{ marginTop: '1rem', color: 'var(--text-accent)', fontSize: '0.9rem' }}>{errorMsg}</p>
          )}
        </form>
      </main>
    );
  }

  return (
    <main style={wrap}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '1.6rem' }}>
        <h1 className="section-title">Sessions <span style={{ color: 'var(--text-muted)', fontSize: '0.6em' }}>({sessions.length})</span></h1>
        <button onClick={() => load()} className="btn-secondary">refresh</button>
      </div>

      {sessions.length === 0 && (
        <p className="cursive-label" style={{ color: 'var(--text-secondary)' }}>No sessions logged yet.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {sessions.map((s) => {
          const reveal = s.events.find((e) => e.type === 'reveal_response');
          const love = [...s.events].reverse().find((e) => e.type === 'love_language');
          const plan = [...s.events].reverse().find((e) => e.type === 'plan_save' || e.type === 'complete');
          const screens = s.events.filter((e) => e.type === 'screen').map((e) => g(e, 'screen'));
          const uniqueScreens = Array.from(new Set(screens));
          const isOpen = open[s.name];
          return (
            <div key={s.name} className="frosted-card" style={{ padding: '1.4rem 1.5rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{s.sessionId}</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {reveal && (
                    <span style={{ fontSize: '0.78rem', padding: '2px 10px', borderRadius: 'var(--radius-full)', background: g(reveal, 'answer') === 'yes' ? 'var(--accent-soft)' : 'rgba(0,0,0,0.05)', color: g(reveal, 'answer') === 'yes' ? 'var(--text-accent)' : 'var(--text-secondary)' }}>
                      {g(reveal, 'answer') === 'yes' ? '🌸 said yes' : '🙃 said no'}
                    </span>
                  )}
                  <span style={{ fontSize: '0.78rem', padding: '2px 10px', borderRadius: 'var(--radius-full)', background: s.completed ? 'var(--success-soft)' : 'rgba(0,0,0,0.05)', color: s.completed ? 'var(--success)' : 'var(--text-secondary)' }}>
                    {s.completed ? '✅ completed' : '⏳ in progress'}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                started {fmt(s.startedAt)} · {s.events.length} events · reached {uniqueScreens.length}/9 screens
              </div>

              {plan && (
                <div style={{ marginTop: '10px', fontSize: '0.9rem' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Plan:</strong>{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>{g(plan, 'vibe')} · {g(plan, 'place')} · {g(plan, 'date')} · {g(plan, 'time')}</span>
                </div>
              )}

              {love && (g(love, 'loveLanguage') || g(love, 'feltAppreciated')) && (
                <div style={{ marginTop: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)', borderLeft: '3px solid var(--accent)', paddingLeft: '10px' }}>
                  {g(love, 'loveLanguage') && <div><em>love language:</em> {g(love, 'loveLanguage')}</div>}
                  {g(love, 'feltAppreciated') && <div><em>appreciated:</em> {g(love, 'feltAppreciated')}</div>}
                </div>
              )}

              <button onClick={() => setOpen((o) => ({ ...o, [s.name]: !o[s.name] }))} className="btn-ghost" style={{ marginTop: '10px', paddingLeft: 0 }}>
                {isOpen ? '▾ hide timeline' : '▸ show full timeline'}
              </button>

              {isOpen && (
                <div style={{ marginTop: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  {s.events.map((e, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '0.86rem', padding: '3px 0' }}>
                      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', minWidth: '78px' }}>{clock(e.t)}</span>
                      <span style={{ color: 'var(--text-primary)' }}>{line(e)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
};

export default AdminApp;
