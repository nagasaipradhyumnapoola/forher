/**
 * Client-side event reporter.
 *
 * Collects the "meaningful moments" of a run (selections, answers, submitted
 * notes, plan, completion) and ships the full running list to `/api/log`,
 * which persists it server-side to a private GitHub repo. Fire-and-forget:
 * every failure is swallowed so logging can never break the experience.
 *
 * Deliberately does NOT capture raw keystrokes, mouse movement, IP, user-agent
 * or any device fingerprint — only the events screens explicitly report.
 */

interface Ev {
  t: string;
  type: string;
  [k: string]: unknown;
}

const SID_KEY = 'moksha_session_id';
const EV_KEY = 'moksha_events';
const START_KEY = 'moksha_started_at';
const DEBOUNCE_MS = 700;

// Events that should be sent immediately rather than debounced.
const IMPORTANT = new Set(['start', 'passcode_ok', 'reveal_response', 'plan_save', 'plan_change', 'complete']);

function safeGet(k: string): string | null {
  try {
    return window.localStorage.getItem(k);
  } catch {
    return null;
  }
}
function safeSet(k: string, v: string): void {
  try {
    window.localStorage.setItem(k, v);
  } catch {
    /* ignore (private mode etc.) */
  }
}

function makeSessionId(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  const ts = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  let rnd = '';
  try {
    rnd = crypto.randomUUID().replace(/-/g, '').slice(0, 6);
  } catch {
    rnd = Math.random().toString(36).slice(2, 8);
  }
  return `${ts}-${rnd}`;
}

function getSessionId(): string {
  let id = safeGet(SID_KEY);
  if (!id || !/^[A-Za-z0-9_-]{1,64}$/.test(id)) {
    id = makeSessionId();
    safeSet(SID_KEY, id);
  }
  return id;
}

function loadEvents(): Ev[] {
  const raw = safeGet(EV_KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

const sessionId = getSessionId();
let startedAt = safeGet(START_KEY) || new Date().toISOString();
safeSet(START_KEY, startedAt);
let events: Ev[] = loadEvents();
let completed = events.some((e) => e.type === 'complete');

let timer: ReturnType<typeof setTimeout> | null = null;
let inflight = false;
let pending = false;

function persistLocal(): void {
  safeSet(EV_KEY, JSON.stringify(events.slice(-400)));
}

function payload() {
  return { sessionId, startedAt, events: events.slice(-400), completed };
}

async function flush(): Promise<void> {
  if (inflight) {
    pending = true;
    return;
  }
  inflight = true;
  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload()),
      keepalive: true,
    });
  } catch {
    /* offline / not configured — ignore */
  } finally {
    inflight = false;
    if (pending) {
      pending = false;
      void flush();
    }
  }
}

function scheduleFlush(immediate: boolean): void {
  if (immediate) {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    void flush();
    return;
  }
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void flush();
  }, DEBOUNCE_MS);
}

/** True if an event of this type was already recorded this session. */
export function hasEvent(type: string): boolean {
  return events.some((e) => e.type === type);
}

/** Log only if this type hasn't been recorded yet (survives refresh + StrictMode). */
export function logOnce(type: string, data?: Record<string, unknown>): void {
  if (hasEvent(type)) return;
  logEvent(type, data);
}

/** Record a meaningful event and schedule a send. Safe to call anywhere. */
export function logEvent(type: string, data?: Record<string, unknown>): void {
  try {
    if (type === 'complete') completed = true;
    events.push({ t: new Date().toISOString(), type, ...(data || {}) });
    persistLocal();
    scheduleFlush(IMPORTANT.has(type));
  } catch {
    /* never throw from logging */
  }
}

// Best-effort final flush when the tab closes / backgrounds.
function beaconFlush(): void {
  try {
    const blob = new Blob([JSON.stringify(payload())], { type: 'application/json' });
    if (navigator.sendBeacon && navigator.sendBeacon('/api/log', blob)) return;
  } catch {
    /* fall through */
  }
  void flush();
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', beaconFlush);
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') beaconFlush();
  });
}
