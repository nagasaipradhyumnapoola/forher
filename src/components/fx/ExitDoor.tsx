import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { playClick, playConfirm } from '../../utils/audio';
import { logEvent } from '../../utils/logger';

/**
 * A way out, available on every screen and at every moment — including after
 * she learns who made this. She can leave whenever she wants, and say whatever
 * she wants on the way out (or nothing at all). Whatever she writes is the last
 * word and is recorded exactly as typed.
 *
 * Portaled to <body> so the screen's transform/overflow can never clip it.
 */
export const ExitDoor: React.FC<{ screen: string }> = ({ screen }) => {
  const [state, setState] = useState<'idle' | 'open' | 'done'>('idle');
  const [message, setMessage] = useState('');

  const open = () => {
    playClick();
    logEvent('exit_opened', { screen });
    setState('open');
  };

  const back = () => {
    playClick();
    logEvent('exit_cancelled', { screen });
    setState('idle');
  };

  const leave = () => {
    playConfirm();
    logEvent('exit_message', { screen, message: message.trim() });
    logEvent('exit_confirmed', { screen, hadMessage: message.trim().length > 0 });
    setState('done');
  };

  // ── She left. Nothing else, just a calm close. ──
  if (state === 'done') {
    return createPortal(
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100000,
          background: '#fdf3f8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '400px' }}>
          <p className="cursive-label" style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            thank you for your time, genuinely.
          </p>
          <p className="font-script" style={{ fontSize: '1.8rem', color: 'var(--text-accent)', marginTop: '0.9rem' }}>
            — Pradhyumna
          </p>
        </div>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <>
      {/* the door — quiet, but always there */}
      {state === 'idle' && (
        <button
          onClick={open}
          aria-label="Leave"
          title="Leave"
          style={{
            position: 'fixed',
            top: '22px',
            left: '22px',
            zIndex: 70,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255,255,255,0.6)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            color: '#9a8791',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.78rem',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <X size={13} />
          <span>leave</span>
        </button>
      )}

      {state === 'open' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(60, 40, 52, 0.28)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.2rem',
          }}
        >
          <div
            className="paper-card animate-fade-in-up"
            style={{ width: 'min(430px, 94vw)', padding: '1.6rem 1.5rem', textAlign: 'center' }}
          >
            <h3 className="section-title" style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>
              You can stop here.
            </h3>
            <p className="font-sans" style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
              No explanation needed, and genuinely no hard feelings. If there's anything
              you want to say before you close this, this is the place — say it however
              you want. You can also leave it blank.
            </p>

            <textarea
              className="journal-input"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="anything you want to say to me… (optional)"
              autoFocus
              style={{ marginBottom: '1rem', textAlign: 'left' }}
            />

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={back} className="btn-secondary" style={{ fontSize: '0.95rem' }}>
                <span>never mind, go back</span>
              </button>
              <button onClick={leave} className="btn-primary" style={{ fontSize: '1rem' }}>
                <span>{message.trim() ? 'send & close' : 'just close'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body,
  );
};
