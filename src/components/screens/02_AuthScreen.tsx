import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Lock, KeyRound, Sparkles } from 'lucide-react';

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
    useRef<HTMLInputElement | null>(null)
  ];

  const CORRECT_CODE = '777';

  useEffect(() => {
    // Focus first input box on load
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

    // Single digit entry
    const char = cleaned.slice(-1);
    const updated = [...digits];
    updated[index] = char;
    setDigits(updated);

    // Auto-advance to next input
    if (index < 2 && char) {
      inputRefs[index + 1].current?.focus();
    }
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
    for (let i = 0; i < pasteData.length; i++) {
      newDigits[i] = pasteData[i];
    }
    setDigits(newDigits);

    if (pasteData.length >= 3) {
      inputRefs[2].current?.focus();
    } else {
      inputRefs[pasteData.length].current?.focus();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const entered = digits.join('');

    if (entered.length < 3) {
      setError(true);
      return;
    }

    // Accepts 777, 143, 007, or if user tried a few times
    if (entered === CORRECT_CODE || entered === '143' || entered === '007' || attempts >= 2) {
      onNext();
    } else {
      setError(true);
      setAttempts((prev) => prev + 1);
      if (attempts >= 1) {
        setShowHint(true);
      }
    }
  };

  const fillHintCode = () => {
    setDigits(['7', '7', '7']);
    setError(false);
    setTimeout(() => {
      onNext();
    }, 300);
  };

  return (
    <div className="screen-wrapper experience-container">
      <div
        className={`frosted-card ${error ? 'animate-shake' : 'animate-fade-in-up'}`}
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2.8rem 2.2rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--accent-soft)',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}
        >
          <Lock size={22} />
        </div>

        <p className="badge-label" style={{ marginBottom: '1rem' }}>
          Verification
        </p>

        <h2 className="section-title" style={{ marginBottom: '0.6rem' }}>
          Before we begin...
        </h2>

        <p className="subheading" style={{ marginBottom: '2.2rem', fontSize: '1rem' }}>
          A tiny 3-digit verification first 👀
        </p>

        {/* 3-Digit Box Inputs */}
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              marginBottom: '1.8rem'
            }}
          >
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
                  width: '64px',
                  height: '74px',
                  fontSize: '2rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  textAlign: 'center',
                  borderRadius: 'var(--radius-md)',
                  background: digits[idx] ? 'var(--bg-card-selected)' : 'rgba(255, 255, 255, 0.9)',
                  border: `2px solid ${
                    error
                      ? 'var(--accent)'
                      : digits[idx]
                      ? 'var(--border-focus)'
                      : 'var(--border)'
                  }`,
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'all var(--transition-fast)',
                  boxShadow: digits[idx] ? '0 4px 12px var(--accent-glow)' : 'var(--shadow-sm)'
                }}
              />
            ))}
          </div>

          {/* Friendly Error Feedback */}
          {error && (
            <p
              className="animate-fade-in-up"
              style={{
                color: 'var(--text-accent)',
                fontSize: '0.92rem',
                fontWeight: 500,
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>That doesn't seem right 👀</span>
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '15px' }}
          >
            <span>Continue</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Hint toggle */}
        <div style={{ marginTop: '1.5rem' }}>
          {!showHint ? (
            <button
              onClick={() => setShowHint(true)}
              className="btn-ghost"
              style={{ fontSize: '0.84rem' }}
            >
              <KeyRound size={14} />
              <span>Need a hint?</span>
            </button>
          ) : (
            <div className="animate-fade-in-up" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <p style={{ marginBottom: '8px' }}>
                Hint: Lucky Angel number <strong>777</strong> ✨
              </p>
              <button
                onClick={fillHintCode}
                className="btn-ghost"
                style={{ color: 'var(--text-accent)', fontWeight: 600, textDecoration: 'underline' }}
              >
                Auto-fill 777 & Enter →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
