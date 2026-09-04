import React, { useState } from 'react';
import { LoveLanguageAnswers } from '../../types';
import { BookOpen, ArrowRight, Heart } from 'lucide-react';

interface Props {
  initialAnswers: LoveLanguageAnswers;
  onSave: (answers: LoveLanguageAnswers) => void;
}

export const LoveLanguageScreen: React.FC<Props> = ({ initialAnswers, onSave }) => {
  const [answers, setAnswers] = useState<LoveLanguageAnswers>(initialAnswers);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(answers);
  };

  return (
    <div className="screen-wrapper experience-container">
      <div style={{ marginBottom: '1.2rem' }}>
        <span className="badge-label">
          <BookOpen size={13} />
          Personal Journal
        </span>
      </div>

      <h1 className="display-title" style={{ fontSize: 'clamp(2.1rem, 4.8vw, 3.2rem)', marginBottom: '0.5rem' }}>
        Okay, something a little more personal.
      </h1>

      <p className="subheading" style={{ marginBottom: '2.2rem' }}>
        No right or wrong answers, just whatever feels natural to you.
      </p>

      {/* Journal Styled Form */}
      <form
        onSubmit={handleSubmit}
        className="frosted-card"
        style={{
          width: '100%',
          maxWidth: '580px',
          padding: '2.2rem 2.4rem',
          textAlign: 'left',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Field 1 */}
        <div style={{ marginBottom: '1.8rem' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '1.12rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '0.6rem',
              fontFamily: 'var(--font-serif)'
            }}
          >
            <Heart size={16} className="text-accent" />
            <span>What's your love language?</span>
          </label>
          <textarea
            className="journal-input"
            rows={3}
            value={answers.loveLanguage}
            onChange={(e) => setAnswers({ ...answers, loveLanguage: e.target.value })}
            placeholder="Could be words, quality time, thoughtful efforts, quiet company... whatever it means to you."
          />
        </div>

        {/* Field 2 */}
        <div style={{ marginBottom: '2.2rem' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '1.12rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '0.6rem',
              fontFamily: 'var(--font-serif)'
            }}
          >
            <SparklesIcon size={16} />
            <span>And what makes you feel genuinely appreciated?</span>
          </label>
          <textarea
            className="journal-input"
            rows={3}
            value={answers.feltAppreciated}
            onChange={(e) => setAnswers({ ...answers, feltAppreciated: e.target.value })}
            placeholder="Remembering little details, being there on rough days, shared quiet laughs..."
          />
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '13px 32px' }}
          >
            <span>Save & Continue</span>
            <ArrowRight size={17} />
          </button>
        </div>
      </form>
    </div>
  );
};

const SparklesIcon = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color: 'var(--accent)' }}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);
