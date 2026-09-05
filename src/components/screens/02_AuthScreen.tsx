import React, { useState } from 'react';
import { playClick, playSelect, playTransition } from '../../utils/audio';
import { logEvent } from '../../utils/logger';

interface Props {
  onNext: () => void;
}

const CORRECT_CODE = '830';
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'];

/**
 * Deliberately impersonal. This is the first thing she sees and it must read as
 * an ordinary access page — no colour, no music, no decoration, nothing that
 * hints at what the rest of this is.
 */
export const AuthScreen: React.FC<Props> = ({ onNext }) => {
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const submit = (value: string) => {
    if (value === CORRECT_CODE) {
      setError(false);
      logEvent('passcode_ok');
      playTransition();
      setTimeout(onNext, 260);
    } else {
      setError(true);
      logEvent('passcode_fail', { attempt: attempts + 1 });
      setAttempts((a) => a + 1);
      if (attempts >= 1) setShowHint(true);
      setTimeout(() => {
        setCode('');
        setError(false);
      }, 650);
    }
  };

  const press = (k: string) => {
    if (error) return;
    if (k === '⌫') {
      playClick();
      setCode((c) => c.slice(0, -1));
      return;
    }
    if (k === '✓') {
      playSelect();
      if (code.length === 3) submit(code);
      return;
    }
    if (code.length >= 3) return;
    playClick();
    const next = code + k;
    setCode(next);
    if (next.length === 3) setTimeout(() => submit(next), 280);
  };

  const label: React.CSSProperties = { fontFamily: 'var(--font-sans)', color: '#667085' };

  return (
    <div className="screen-wrapper experience-container">
      <div
        className={`paper-card formal-card ${error ? 'animate-shake' : ''}`}
        style={{ padding: '1.7rem 1.5rem 1.5rem', width: 'min(280px, 90vw)' }}
      >
        <p
          style={{
            ...label,
            textAlign: 'center',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#98a2b3',
            marginBottom: '0.3rem',
          }}
        >
          verification
        </p>
        <p style={{ ...label, textAlign: 'center', fontSize: '0.88rem', color: '#475467', marginBottom: '1.2rem' }}>
          Enter your access code to continue
        </p>

        <div className="code-dots" style={{ marginBottom: '1rem' }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={`code-box ${code[i] ? 'filled' : ''}`}>
              {code[i] ? '•' : ''}
            </div>
          ))}
        </div>

        <div className="keypad">
          {KEYS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              className={`key ${k === '✓' ? 'key-accent' : ''}`}
              aria-label={k === '⌫' ? 'delete' : k === '✓' ? 'confirm' : k}
            >
              {k}
            </button>
          ))}
        </div>

        <p
          style={{
            ...label,
            textAlign: 'center',
            marginTop: '0.95rem',
            fontSize: '0.78rem',
            color: error ? '#b42318' : '#98a2b3',
          }}
        >
          {error ? 'Incorrect code. Please try again.' : 'Hint: last 3 digits of your Reg ID'}
        </p>

        {showHint && !error && (
          <div style={{ textAlign: 'center', marginTop: '0.35rem' }}>
            <button
              onClick={() => {
                playSelect();
                setCode(CORRECT_CODE);
                setTimeout(() => submit(CORRECT_CODE), 300);
              }}
              style={{
                ...label,
                background: 'none',
                border: 'none',
                fontSize: '0.78rem',
                color: '#667085',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              Having trouble? Continue anyway
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
