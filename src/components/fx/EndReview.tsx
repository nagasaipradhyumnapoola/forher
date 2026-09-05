import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, Check } from 'lucide-react';
import { playClick, playConfirm } from '../../utils/audio';
import { logEvent } from '../../utils/logger';

/**
 * Her closing word at the end of the experience — whatever she actually thinks,
 * in her own words. Recorded verbatim alongside the rest of the session.
 */
export const EndReview: React.FC = () => {
  const [state, setState] = useState<'idle' | 'open' | 'sent'>('idle');
  const [text, setText] = useState('');

  const open = () => {
    playClick();
    logEvent('review_opened');
    setState('open');
  };

  const send = () => {
    playConfirm();
    logEvent('final_review', { message: text.trim() });
    setState('sent');
  };

  return (
    <>
      <button
        onClick={state === 'sent' ? undefined : open}
        className="btn-secondary"
        style={{ fontSize: '0.95rem' }}
        disabled={state === 'sent'}
      >
        {state === 'sent' ? <Check size={14} /> : <MessageCircle size={14} />}
        <span>{state === 'sent' ? 'thank you 🌸' : 'tell me what you think'}</span>
      </button>

      {state === 'open' &&
        createPortal(
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
              style={{ width: 'min(440px, 94vw)', padding: '1.6rem 1.5rem', textAlign: 'center' }}
            >
              <h3 className="section-title" style={{ fontSize: '1.55rem', marginBottom: '0.4rem' }}>
                Your honest word.
              </h3>
              <p
                className="font-sans"
                style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}
              >
                Say whatever you actually feel — yes, no, maybe, or just what you thought
                of all this. There's no wrong answer, and I'd rather have the truth.
              </p>

              <textarea
                className="journal-input"
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="write it however you want…"
                autoFocus
                style={{ marginBottom: '1rem', textAlign: 'left' }}
              />

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    playClick();
                    logEvent('review_cancelled');
                    setState('idle');
                  }}
                  className="btn-secondary"
                  style={{ fontSize: '0.95rem' }}
                >
                  <span>maybe later</span>
                </button>
                <button onClick={send} className="btn-accent" style={{ fontSize: '1.05rem', padding: '12px 26px' }}>
                  <span>send it</span>
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
