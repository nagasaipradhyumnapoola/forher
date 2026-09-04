import React, { useState } from 'react';
import { LoveLanguageAnswers } from '../../types';
import { ArrowRight } from 'lucide-react';
import { playClick, playConfirm } from '../../utils/audio';

interface Props {
  initialAnswers: LoveLanguageAnswers;
  onSave: (answers: LoveLanguageAnswers) => void;
}

export const LoveLanguageScreen: React.FC<Props> = ({ initialAnswers, onSave }) => {
  const [answers, setAnswers] = useState<LoveLanguageAnswers>(initialAnswers);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playConfirm();
    onSave(answers);
  };

  return (
    <div className="screen-wrapper experience-container">
      <h1 className="display-title" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)', marginBottom: '0.4rem' }}>
        okay, something a little more personal.
      </h1>

      <p className="cursive-label" style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
        no right or wrong answers, just whatever feels natural to you.
      </p>

      <form
        onSubmit={handleSubmit}
        className="frosted-card"
        style={{ width: '100%', maxWidth: '540px', padding: '2rem 2.2rem', textAlign: 'left', boxShadow: 'var(--shadow-lg)' }}
      >
        {/* Love Language */}
        <div style={{ marginBottom: '1.6rem' }}>
          <label className="font-cursive" style={{ display: 'block', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            what's your love language?
          </label>
          <textarea
            className="journal-input"
            rows={3}
            value={answers.loveLanguage}
            onChange={(e) => setAnswers({ ...answers, loveLanguage: e.target.value })}
            placeholder="could be words, quality time, effort, quiet company... whatever it means to you."
          />
        </div>

        {/* Appreciated */}
        <div style={{ marginBottom: '2rem' }}>
          <label className="font-cursive" style={{ display: 'block', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            and what makes you feel genuinely appreciated?
          </label>
          <textarea
            className="journal-input"
            rows={3}
            value={answers.feltAppreciated}
            onChange={(e) => setAnswers({ ...answers, feltAppreciated: e.target.value })}
            placeholder="remembering little details, being there on rough days, shared quiet laughs..."
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn-primary" onClick={() => playClick()}>
            <span>save & continue</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};
