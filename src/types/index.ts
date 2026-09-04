export type ScreenId =
  | 'opening'
  | 'auth'
  | 'mystery'
  | 'reveal'
  | 'compatibility'
  | 'love_language'
  | 'personalized_result'
  | 'meeting_planner'
  | 'final';

export type MeetVibe = 'coffee' | 'zoo' | 'food' | 'walk' | 'movie' | 'random';

export interface MeetVibeOption {
  id: MeetVibe;
  emoji: string;
  title: string;
  description: string;
  heading: string;
  accentBadge: string;
  defaultPlaces: string[];
}

export type EnergyVibe = 'cozy' | 'fun' | 'calm' | 'adventurous';

export interface EnergyOption {
  id: EnergyVibe;
  emoji: string;
  title: string;
  description: string;
}

export type MusicVibe = 'indie' | 'lofi' | 'pop' | 'ambient';

export interface MusicOption {
  id: MusicVibe;
  emoji: string;
  title: string;
  description: string;
}

export interface CompatibilityAnswers {
  meetVibe: MeetVibe | null;
  energyVibe: EnergyVibe | null;
  musicVibe: MusicVibe | null;
}

export interface LoveLanguageAnswers {
  loveLanguage: string;
  feltAppreciated: string;
}

export interface MeetingPlan {
  vibe: MeetVibe;
  place: string;
  date: string;
  time: string;
  specialNote?: string;
}

export interface AppState {
  currentScreen: ScreenId;
  screenHistory: ScreenId[];
  soundEnabled: boolean;
  compatibility: CompatibilityAnswers;
  loveLanguage: LoveLanguageAnswers;
  meetingPlan: MeetingPlan;
}
