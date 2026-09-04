import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Lock, KeyRound } from 'lucide-react';
import { playClick, playTransition } from '../../utils/audio';

interface Props {
  onNext: () => void;
}

export const AuthScreen: React.FC<Props> = ({ onNext }) => {
  const [digits, setDigits] = useState<string[]>(['', '', '']);
  const [error, setError] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const inputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  const CORRECT_CODE = '777';

  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  const handleChange = (index: number, val: string) => {
    setError(false);
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned) {
      const updated = [...digits];
      updated[index] = '';
      setDigits(updated);
      return;
    }
    const char = cleaned.slice(-1);
    const updated = [...digits];
    updated[index] = char;
    setDigits(updated);
    if (index < 2 && char) inputRefs[index + 1].current?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 3);
    if (!pasteData) return;
    const newDigits = ['', '', ''];
    for (let i = 0; i < pasteData.length; i++) newDigits[i] = pasteData[i];
    setDigits(newDigits);
    if (pasteData.length >= 3) inputRefs[2].current?.focus();
    else inputRefs[pasteData.length].current?.focus();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const entered = digits.join('');
    if (entered.length < 3) {
      setError(true);
      return;
    }
    // Accepts 3 digits (her ID's last three numbers or any 3 digits)
    playTransition();
    onNext();
  };

  const fillHintCode = () => {
    playClick();
    setDigits(['0', '0', '7']);
    setError(false);
    setTimeout(() => {
      playTransition();
      onNext();
    }, 300);
  };

  return (
    <div className="screen-wrapper experience-container">
      <div
        className={`frosted-card ${error ? 'animate-shake' : 'animate-fade-in-up'}`}
        style={{ width: '100%', maxWidth: '440px', padding: '2.5rem 2rem', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}
      >
        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' }}>
          <Lock size={20} />
        </div>

        <h2 className="section-title" style={{ marginBottom: '0.4rem' }}>
          Before we begin...
        </h2>

        <p className="cursive-label" style={{ marginBottom: '1.8rem', color: 'var(--text-secondary)' }}>
          enter the last 3 digits of your ID 👀
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '1.5rem' }}>
            {[0, 1, 2].map((idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digits[idx]}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                aria-label={`Digit ${idx + 1}`}
                style={{
                  width: '60px',
                  height: '70px',
                  fontSize: '1.8rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  textAlign: 'center',
                  borderRadius: 'var(--radius-md)',
                  background: digits[idx] ? 'var(--bg-card-selected)' : 'rgba(255, 255, 255, 0.7)',
                  border: `2px solid ${error ? 'var(--accent)' : digits[idx] ? 'var(--border-focus)' : 'var(--border)'}`,
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'all var(--transition-fast)',
                  boxShadow: digits[idx] ? '0 4px 12px var(--accent-glow)' : 'var(--shadow-sm)',
                }}
              />
            ))}
          </div>

          {error && (
            <p className="animate-fade-in-up cursive-label" style={{ color: 'var(--text-accent)', marginBottom: '1.2rem' }}>
              please enter all 3 digits 👀
            </p>
          )}

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '13px' }} onClick={() => playClick()}>
            <span>continue</span>
            <ArrowRight size={17} />
          </button>
        </form>

        <div style={{ marginTop: '1.3rem' }}>
          {!showHint ? (
            <button onClick={() => { playClick(); setShowHint(true); }} className="btn-ghost" style={{ fontSize: '0.9rem' }}>
              <KeyRound size={14} />
              <span>need a hint?</span>
            </button>
          ) : (
            <div className="animate-fade-in-up" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <p className="cursive-small" style={{ marginBottom: '6px' }}>hint: the last three numbers of your ID 🪪✨</p>
              <button onClick={fillHintCode} className="btn-ghost" style={{ color: 'var(--text-accent)', fontWeight: 600, textDecoration: 'underline' }}>
                auto-unlock →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
