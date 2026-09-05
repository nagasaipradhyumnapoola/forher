import React, { useState } from 'react';
import { playClick, playSelect, playTransition } from '../../utils/audio';
import { logEvent } from '../../utils/logger';

interface Props {
  onNext: () => void;
}

const CORRECT_CODE = '830';
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'];

/**
 * Deliberately plain / formal. This is the first thing she sees, and it should
 * give away nothing about what the rest of the experience is.
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

  return (
    <div className="screen-wrapper experience-container">
      <div
        className={`paper-card ${error ? 'animate-shake' : 'animate-fade-in-up'}`}
        style={{ padding: '1.6rem 1.4rem 1.4rem', width: 'min(272px, 90vw)' }}
      >
        <p
          className="font-sans"
          style={{
            textAlign: 'center',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.09em',
            textTransform: 'uppercase',
            color: '#9a8791',
            marginBottom: '0.25rem',
          }}
        >
          verification
        </p>
        <p
          className="font-sans"
          style={{ textAlign: 'center', fontSize: '0.86rem', color: '#8d7a84', marginBottom: '1.1rem' }}
        >
          enter your access code to continue
        </p>

        <div className="code-dots" style={{ marginBottom: '0.95rem' }}>
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
          className="font-sans"
          style={{
            textAlign: 'center',
            marginTop: '0.85rem',
            fontSize: '0.8rem',
            color: error ? 'var(--text-accent)' : '#9a8791',
          }}
        >
          {error ? 'incorrect code — try again' : 'hint: last 3 digits of your Reg ID'}
        </p>

        {showHint && !error && (
          <div className="animate-fade-in-up" style={{ textAlign: 'center', marginTop: '0.3rem' }}>
            <button
              onClick={() => {
                playSelect();
                setCode(CORRECT_CODE);
                setTimeout(() => submit(CORRECT_CODE), 300);
              }}
              className="btn-ghost"
              style={{ fontSize: '0.82rem', fontFamily: 'var(--font-sans)', color: '#9a8791', textDecoration: 'underline' }}
            >
              having trouble? continue anyway
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
