import React, { useState } from 'react';
import { ScreenId, AppState, CompatibilityAnswers, LoveLanguageAnswers, MeetingPlan } from './types';
import { AmbientBackground } from './components/ambient/AmbientBackground';
import { SoundPlayer } from './components/ambient/SoundPlayer';

import { OpeningScreen } from './components/screens/01_OpeningScreen';
import { AuthScreen } from './components/screens/02_AuthScreen';
import { MysteryScreen } from './components/screens/03_MysteryScreen';
import { RevealScreen } from './components/screens/04_RevealScreen';
import { CompatibilityGame } from './components/screens/05_CompatibilityGame';
import { LoveLanguageScreen } from './components/screens/06_LoveLanguageScreen';
import { PersonalizedResult } from './components/screens/07_PersonalizedResult';
import { MeetingPlanner } from './components/screens/08_MeetingPlanner';
import { FinalScreen } from './components/screens/09_FinalScreen';

export const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    currentScreen: 'opening',
    screenHistory: ['opening'],
    soundEnabled: false,
    compatibility: {
      meetVibe: 'coffee',
      energyVibe: 'cozy',
      musicVibe: 'indie'
    },
    loveLanguage: {
      loveLanguage: '',
      feltAppreciated: ''
    },
    meetingPlan: {
      vibe: 'coffee',
      place: 'A quiet aesthetic café',
      date: 'This Saturday',
      time: '5:00 PM'
    }
  });

  const navigateTo = (nextScreen: ScreenId) => {
    setAppState((prev) => ({
      ...prev,
      currentScreen: nextScreen,
      screenHistory: [...prev.screenHistory, nextScreen]
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompatibilityComplete = (answers: CompatibilityAnswers) => {
    setAppState((prev) => ({
      ...prev,
      compatibility: answers,
      meetingPlan: {
        ...prev.meetingPlan,
        vibe: answers.meetVibe || 'coffee'
      }
    }));
    navigateTo('love_language');
  };

  const handleLoveLanguageSave = (answers: LoveLanguageAnswers) => {
    setAppState((prev) => ({
      ...prev,
      loveLanguage: answers
    }));
    navigateTo('personalized_result');
  };

  const handleSavePlan = (plan: MeetingPlan) => {
    setAppState((prev) => ({
      ...prev,
      meetingPlan: plan
    }));
    navigateTo('final');
  };

  return (
    <main style={{ minHeight: '100vh', width: '100%', position: 'relative' }}>
      {/* Background ambient lighting and particle sparkles */}
      <AmbientBackground />

      {/* Optional ambient lo-fi music toggle */}
      <SoundPlayer />

      {/* Screen Router with fluid transition */}
      {appState.currentScreen === 'opening' && (
        <OpeningScreen onNext={() => navigateTo('auth')} />
      )}

      {appState.currentScreen === 'auth' && (
        <AuthScreen onNext={() => navigateTo('mystery')} />
      )}

      {appState.currentScreen === 'mystery' && (
        <MysteryScreen onNext={() => navigateTo('reveal')} />
      )}

      {appState.currentScreen === 'reveal' && (
        <RevealScreen onNext={() => navigateTo('compatibility')} />
      )}

      {appState.currentScreen === 'compatibility' && (
        <CompatibilityGame
          initialAnswers={appState.compatibility}
          onComplete={handleCompatibilityComplete}
        />
      )}

      {appState.currentScreen === 'love_language' && (
        <LoveLanguageScreen
          initialAnswers={appState.loveLanguage}
          onSave={handleLoveLanguageSave}
        />
      )}

      {appState.currentScreen === 'personalized_result' && (
        <PersonalizedResult
          compatibility={appState.compatibility}
          loveLanguage={appState.loveLanguage}
          onNext={() => navigateTo('meeting_planner')}
        />
      )}

      {appState.currentScreen === 'meeting_planner' && (
        <MeetingPlanner
          initialPlan={appState.meetingPlan}
          onSavePlan={handleSavePlan}
        />
      )}

      {appState.currentScreen === 'final' && (
        <FinalScreen
          plan={appState.meetingPlan}
          onEditPlan={() => navigateTo('meeting_planner')}
        />
      )}
    </main>
  );
};

export default App;
