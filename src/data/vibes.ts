import { MeetVibeOption, EnergyOption, MusicOption } from '../types';

export const MEET_VIBES: MeetVibeOption[] = [
  {
    id: 'coffee',
    emoji: '☕',
    title: 'Coffee & random conversations',
    description: 'A warm cozy corner, good iced latte, and talking about anything and everything.',
    heading: 'So... coffee?',
    accentBadge: 'Warm & Caffeinated',
    defaultPlaces: ['Third Wave Coffee', 'Subko Coffee Roasters', 'A quiet aesthetic café', 'Roastery Coffee House']
  },
  {
    id: 'zoo',
    emoji: '🦁',
    title: 'Zoo + wandering around',
    description: 'Walking under the trees, checking out goofy animals, and laughing at weird birds.',
    heading: 'So... zoo day?',
    accentBadge: 'Wild & Scenic',
    defaultPlaces: ['City Zoological Park', 'Botanical Garden & Safari', 'National Zoo Walk', 'Nature Sanctuary']
  },
  {
    id: 'food',
    emoji: '🍜',
    title: 'Food + exploring somewhere new',
    description: 'Hunting down the best ramen or street food spot and having questionable conversations.',
    heading: 'So... food & questionable conversations?',
    accentBadge: 'Delicious & Spontaneous',
    defaultPlaces: ['That cozy ramen/dumpling spot', 'Night street food market', 'Indie Italian bistro', 'Our favorite dessert corner']
  },
  {
    id: 'walk',
    emoji: '🌆',
    title: 'Walk + talking about everything',
    description: 'Golden hour stroll, cool evening breeze, and zero hurry to be anywhere else.',
    heading: "So... let's go for an evening walk?",
    accentBadge: 'Golden Hour & Gentle',
    defaultPlaces: ['Lakefront promenade', 'Old heritage tree-lined lane', 'Rooftop garden walkway', 'Quiet neighborhood park']
  },
  {
    id: 'movie',
    emoji: '🎬',
    title: 'Movie + excessive snacks',
    description: 'Recliner seats, oversized popcorn, and dissecting the entire plot afterwards.',
    heading: 'So... movie & snacks?',
    accentBadge: 'Cinematic & Chill',
    defaultPlaces: ['IMAX / PVR Director’s Cut', 'Open-air cinema night', 'Cozy indie screening space', 'Drive-in theatre']
  },
  {
    id: 'random',
    emoji: '🎲',
    title: 'Something completely random',
    description: 'Flip a coin, take a turn we have never taken, and figure it out as we go.',
    heading: "So... let's do something completely random?",
    accentBadge: 'Unpredictable & Fun',
    defaultPlaces: ['Arcade & bowling alley', 'Pottery / art studio session', 'Bookstore hunt + gelato', 'Mystery destination']
  }
];

export const ENERGY_VIBES: EnergyOption[] = [
  {
    id: 'cozy',
    emoji: '🕯️',
    title: 'Quiet, cozy & deep talks',
    description: 'Low-key, comfortable silence, and meaningful stories.'
  },
  {
    id: 'fun',
    emoji: '🌟',
    title: 'Fun, laughing & spontaneous',
    description: 'Inside jokes, playfully making fun of things, and bright energy.'
  },
  {
    id: 'calm',
    emoji: '🌿',
    title: 'Calm, peaceful & unhurried',
    description: 'No rushing, just being present and enjoying the moment.'
  },
  {
    id: 'adventurous',
    emoji: '⚡',
    title: 'Adventurous & trying new things',
    description: 'Exploring unvisited spots, new tastes, and memorable firsts.'
  }
];

export const MUSIC_VIBES: MusicOption[] = [
  {
    id: 'indie',
    emoji: '🎸',
    title: 'Indie & acoustic warmth',
    description: 'Phoebe Bridgers, Boygenius, Taylor Swift, subtle guitar strums.'
  },
  {
    id: 'lofi',
    emoji: '🎧',
    title: 'Lo-fi & late night beats',
    description: 'Chilled beats, moody piano chords, relaxed midnight vibes.'
  },
  {
    id: 'pop',
    emoji: '🎶',
    title: 'Classic pop & singalongs',
    description: 'Catchy hooks, window-down car jams, upbeat good mood.'
  },
  {
    id: 'ambient',
    emoji: '🌌',
    title: 'Ambient & whatever feels right',
    description: 'Atmospheric dreaminess, cinematic soundtracks, drifting melodies.'
  }
];
