/**
 * Tiny decoupled "mood" bus. Screens set the emotional tone; the ambient
 * background and the music engine listen and react — no prop drilling.
 */
export type Mood = 'calm' | 'warm' | 'magical' | 'celebration';

const KEY = '__mokshaMood';

export function setMood(m: Mood): void {
  try {
    (window as unknown as Record<string, unknown>)[KEY] = m;
    window.dispatchEvent(new CustomEvent('moksha:mood', { detail: m }));
  } catch {
    /* ignore */
  }
}

export function currentMood(): Mood {
  try {
    return ((window as unknown as Record<string, unknown>)[KEY] as Mood) || 'calm';
  } catch {
    return 'calm';
  }
}

export function onMood(cb: (m: Mood) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent).detail as Mood);
  window.addEventListener('moksha:mood', handler as EventListener);
  return () => window.removeEventListener('moksha:mood', handler as EventListener);
}
