/**
 * Server-side session logging core.
 *
 * Runs ONLY on the server (Vercel serverless functions + the Vite dev
 * middleware). It holds the GitHub token (read from process.env) and is the
 * ONLY place that touches it. Nothing here is ever bundled into the client:
 * the browser talks to this exclusively over HTTP (`/api/log`, `/api/sessions`).
 *
 * Storage model: one Markdown file per session in a PRIVATE GitHub repo at
 *   <SESSIONS_DIR>/session-<id>.md
 * The client sends the full running event list on every meaningful change and
 * the server re-renders + upserts the whole file (last-writer-wins). This keeps
 * all formatting server-side and gives a clean git history per session.
 *
 * No Supabase / Firebase / Discord / email / webhooks / analytics. No raw
 * keystrokes, no device fingerprinting — only the explicit events the client
 * chooses to report.
 */

const GH_API = 'https://api.github.com';

interface Env {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  dir: string;
  adminPassword?: string;
}

function readEnv(): Env | null {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  if (!token || !owner || !repo) return null;
  return {
    token,
    owner,
    repo,
    branch: process.env.GITHUB_BRANCH || 'main',
    dir: (process.env.SESSIONS_DIR || 'responses/sessions').replace(/^\/+|\/+$/g, ''),
    adminPassword: process.env.ADMIN_PASSWORD,
  };
}

export function isConfigured(): boolean {
  return readEnv() !== null;
}

function ghHeaders(env: Env): Record<string, string> {
  return {
    Authorization: `Bearer ${env.token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'moksha-experience-logger',
    'Content-Type': 'application/json',
  };
}

function encodePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}

function b64encode(s: string): string {
  return Buffer.from(s, 'utf-8').toString('base64');
}
function b64decode(s: string): string {
  return Buffer.from(s.replace(/\n/g, ''), 'base64').toString('utf-8');
}

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────

export interface SessionEvent {
  t: string; // ISO timestamp
  type: string;
  [k: string]: unknown;
}

export interface SessionPayload {
  sessionId: string;
  startedAt: string;
  events: SessionEvent[];
  completed: boolean;
}

// ─────────────────────────────────────────────────────────────────────────
// Sanitising untrusted client input (this endpoint is public)
// ─────────────────────────────────────────────────────────────────────────

const MAX_EVENTS = 400;
const MAX_STR = 2000;

function str(v: unknown, max = MAX_STR): string {
  if (v === null || v === undefined) return '';
  let s = String(v);
  if (s.length > max) s = s.slice(0, max) + '…';
  return s;
}

function sanitize(raw: unknown): SessionPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const sessionId = str(r.sessionId, 64);
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(sessionId)) return null;

  const rawEvents = Array.isArray(r.events) ? r.events.slice(0, MAX_EVENTS) : [];
  const events: SessionEvent[] = rawEvents.map((e) => {
    const ev = (e && typeof e === 'object' ? e : {}) as Record<string, unknown>;
    const clean: SessionEvent = {
      t: str(ev.t, 40),
      type: str(ev.type, 48).replace(/[^a-zA-Z0-9_]/g, ''),
    };
    for (const [k, v] of Object.entries(ev)) {
      if (k === 't' || k === 'type') continue;
      const key = k.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 48);
      if (!key) continue;
      if (typeof v === 'number' || typeof v === 'boolean') clean[key] = v;
      else clean[key] = str(v);
    }
    return clean;
  });

  return {
    sessionId,
    startedAt: str(r.startedAt, 40),
    events,
    completed: Boolean(r.completed),
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Markdown rendering (the human-readable session timeline)
// ─────────────────────────────────────────────────────────────────────────

const SCREEN_LABELS: Record<string, string> = {
  opening: 'Opening / intro',
  auth: 'Passcode gate',
  mystery: 'The “who made this?” guess',
  reveal: 'The confession',
  compatibility: 'Compatibility mini-game',
  love_language: 'Love-language questions',
  personalized_result: 'Personalised result',
  meeting_planner: 'Date planner',
  final: 'Final / souvenir ticket',
};

function fmtTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso || '—';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
}

function fmtFull(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso || '—';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} UTC`;
}

function eventLine(e: SessionEvent): string {
  const g = (k: string) => str((e as Record<string, unknown>)[k]);
  switch (e.type) {
    case 'start':
      return '🌸 Opened the experience';
    case 'screen':
      return `🚪 Reached: ${SCREEN_LABELS[g('screen')] || g('screen')}`;
    case 'passcode_fail':
      return `🔒 Wrong passcode${e.attempt ? ` (attempt ${g('attempt')})` : ''}`;
    case 'passcode_ok':
      return '🔓 Entered the correct passcode';
    case 'mystery_pick':
      return `🃏 Guessed who made it: “${g('label')}”`;
    case 'reveal_response':
      if (g('answer') === 'yes')
        return `🌸 Said **YES**${Number(e.dodges) > 0 ? ` (after the “no” button dodged ${g('dodges')}×)` : ''}`;
      return `🙃 Said no${Number(e.dodges) > 0 ? ` (the “no” button dodged ${g('dodges')}× first)` : ''}`;
    case 'compat_meet':
      return `☕ First-meet vibe: **${g('title')}**`;
    case 'compat_energy':
      return `✨ Energy vibe: **${g('title')}**`;
    case 'compat_music':
      return `🎧 Music vibe: **${g('title')}**`;
    case 'love_language':
      return '📝 Answered the love-language questions (see below)';
    case 'plan_change':
      return `✏️ Changed **${g('field')}**: “${g('from')}” → “${g('to')}”`;
    case 'plan_save':
      return `📍 Saved the plan — ${g('vibe')} · ${g('place')} · ${g('date')} · ${g('time')}`;
    case 'plan_copied':
      return '📋 Copied the plan to share';
    case 'complete':
      return '🎉 Reached the final screen';
    default:
      return `• ${e.type}`;
  }
}

export function renderMarkdown(s: SessionPayload): string {
  const now = new Date().toISOString();
  const screens: string[] = [];
  for (const e of s.events) {
    if (e.type === 'screen') {
      const sc = str((e as Record<string, unknown>).screen);
      if (sc && !screens.includes(sc)) screens.push(sc);
    }
  }
  const completed = s.completed || s.events.some((e) => e.type === 'complete');
  const lastPlan = [...s.events].reverse().find((e) => e.type === 'plan_save' || e.type === 'complete');
  const love = [...s.events].reverse().find((e) => e.type === 'love_language');
  const reveal = s.events.find((e) => e.type === 'reveal_response');

  const lines: string[] = [];
  lines.push(`# Session \`${s.sessionId}\``);
  lines.push('');
  lines.push(`- **Started:** ${fmtFull(s.startedAt || (s.events[0]?.t ?? now))}`);
  lines.push(`- **Last updated:** ${fmtFull(now)}`);
  lines.push(`- **Status:** ${completed ? '✅ Completed' : '⏳ In progress'}`);
  if (reveal) lines.push(`- **Answer to the ask:** ${str((reveal as Record<string, unknown>).answer) === 'yes' ? '🌸 YES' : '🙃 no'}`);
  lines.push(`- **Screens reached:** ${screens.map((sc) => SCREEN_LABELS[sc] || sc).join(' → ') || '—'}`);
  lines.push(`- **Events logged:** ${s.events.length}`);
  lines.push('');

  lines.push('## Timeline');
  lines.push('');
  if (s.events.length === 0) {
    lines.push('_No events yet._');
  } else {
    for (const e of s.events) {
      lines.push(`- \`${fmtTime(e.t)}\` ${eventLine(e)}`);
    }
  }
  lines.push('');

  if (love) {
    const l = love as Record<string, unknown>;
    lines.push('## Her words');
    lines.push('');
    lines.push('**Love language**');
    lines.push('');
    lines.push('> ' + (str(l.loveLanguage) || '_(left blank)_').replace(/\n/g, '\n> '));
    lines.push('');
    lines.push('**What makes her feel appreciated**');
    lines.push('');
    lines.push('> ' + (str(l.feltAppreciated) || '_(left blank)_').replace(/\n/g, '\n> '));
    lines.push('');
  }

  if (lastPlan) {
    const p = lastPlan as Record<string, unknown>;
    lines.push('## Final plan');
    lines.push('');
    lines.push('| Field | Value |');
    lines.push('| --- | --- |');
    lines.push(`| Activity | ${str(p.vibe) || '—'} |`);
    lines.push(`| Place | ${str(p.place) || '—'} |`);
    lines.push(`| Date | ${str(p.date) || '—'} |`);
    lines.push(`| Time | ${str(p.time) || '—'} |`);
    lines.push('');
  }

  // Structured appendix — parsed back by the /admin dashboard.
  lines.push('## Raw data');
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify({ ...s, completed, updatedAt: now }, null, 2));
  lines.push('```');
  lines.push('');

  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────
// Aggregate index — one README with every session's choices as a "set"
// ─────────────────────────────────────────────────────────────────────────

interface SessionSet {
  id: string;
  started: string;
  updated: string;
  answer: string; // 'yes' | 'no' | ''
  meet: string;
  energy: string;
  music: string;
  loveLanguage: string;
  feltAppreciated: string;
  plan: { vibe: string; place: string; date: string; time: string } | null;
  completed: boolean;
}

function summarize(s: SessionPayload): SessionSet {
  const g = (e: SessionEvent | undefined, k: string) => (e ? str((e as Record<string, unknown>)[k]) : '');
  const last = (type: string) => [...s.events].reverse().find((e) => e.type === type);
  const meet = last('compat_meet');
  const energy = last('compat_energy');
  const music = last('compat_music');
  const love = last('love_language');
  const reveal = s.events.find((e) => e.type === 'reveal_response');
  const plan = [...s.events].reverse().find((e) => e.type === 'plan_save' || e.type === 'complete');
  return {
    id: s.sessionId,
    started: s.startedAt || s.events[0]?.t || '',
    updated: new Date().toISOString(),
    answer: g(reveal, 'answer'),
    meet: g(meet, 'title'),
    energy: g(energy, 'title'),
    music: g(music, 'title'),
    loveLanguage: g(love, 'loveLanguage'),
    feltAppreciated: g(love, 'feltAppreciated'),
    plan: plan ? { vibe: g(plan, 'vibe'), place: g(plan, 'place'), date: g(plan, 'date'), time: g(plan, 'time') } : null,
    completed: s.completed || s.events.some((e) => e.type === 'complete'),
  };
}

function renderAggregate(map: Record<string, SessionSet>): string {
  const rows = Object.values(map).sort((a, b) => (b.started || '').localeCompare(a.started || ''));
  const cell = (v: string) => (v ? v.replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim() : '—');
  const lines: string[] = [];
  lines.push('# Moksha — every choice, saved 🎀');
  lines.push('');
  lines.push(`_One row per session — a full set of her choices. ${rows.length} total, newest first. Auto-updated on every action; full timelines live in [\`sessions/\`](./sessions/)._`);
  lines.push('');
  lines.push('| When (UTC) | Answer | First-meet | Energy | Music | Love language | Feels appreciated | The plan | Done |');
  lines.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const r of rows) {
    const plan = r.plan ? `${r.plan.vibe} · ${r.plan.place} · ${r.plan.date} · ${r.plan.time}` : '—';
    const ans = r.answer === 'yes' ? '🌸 yes' : r.answer === 'no' ? '🙃 no' : '—';
    lines.push(
      `| ${fmtFull(r.started)} | ${ans} | ${cell(r.meet)} | ${cell(r.energy)} | ${cell(r.music)} | ${cell(r.loveLanguage)} | ${cell(r.feltAppreciated)} | ${cell(plan)} | ${r.completed ? '✅' : '⏳'} |`,
    );
  }
  lines.push('');
  lines.push('<!-- machine-readable index — do not edit by hand -->');
  lines.push('```json');
  lines.push(JSON.stringify({ sessions: map }, null, 2));
  lines.push('```');
  lines.push('');
  return lines.join('\n');
}

function readmePath(env: Env): string {
  const parent = env.dir.includes('/') ? env.dir.slice(0, env.dir.lastIndexOf('/')) : '';
  return parent ? `${parent}/README.md` : 'README.md';
}

async function upsertAggregate(env: Env, thisSet: SessionSet): Promise<void> {
  const path = readmePath(env);
  for (let attempt = 0; attempt < 3; attempt++) {
    let map: Record<string, SessionSet> = {};
    let sha: string | null = null;
    const url = `${GH_API}/repos/${env.owner}/${env.repo}/contents/${encodePath(path)}?ref=${encodeURIComponent(env.branch)}`;
    const r = await fetch(url, { headers: ghHeaders(env) });
    if (r.status === 200) {
      const j = (await r.json()) as { sha?: string; content?: string };
      sha = j.sha ?? null;
      const content = j.content ? b64decode(j.content) : '';
      const m = content.match(/```json\s*([\s\S]*?)```/);
      if (m) {
        try {
          const parsed = JSON.parse(m[1]) as { sessions?: Record<string, SessionSet> };
          if (parsed && parsed.sessions) map = parsed.sessions;
        } catch {
          /* corrupt index — start fresh */
        }
      }
    }
    map[thisSet.id] = thisSet;
    try {
      await putFile(env, path, renderAggregate(map), `index: session ${thisSet.id}`, sha);
      return;
    } catch (e) {
      if ((e as { status?: number }).status === 409 && attempt < 2) continue;
      return; // index is best-effort; never fail the main log over it
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────
// GitHub contents API helpers
// ─────────────────────────────────────────────────────────────────────────

async function getSha(env: Env, path: string): Promise<string | null> {
  const url = `${GH_API}/repos/${env.owner}/${env.repo}/contents/${encodePath(path)}?ref=${encodeURIComponent(env.branch)}`;
  const r = await fetch(url, { headers: ghHeaders(env) });
  if (r.status === 200) {
    const j = (await r.json()) as { sha?: string };
    return j.sha ?? null;
  }
  return null; // 404 = new file
}

async function putFile(env: Env, path: string, content: string, message: string, sha: string | null) {
  const url = `${GH_API}/repos/${env.owner}/${env.repo}/contents/${encodePath(path)}`;
  const body: Record<string, unknown> = {
    message,
    content: b64encode(content),
    branch: env.branch,
  };
  if (sha) body.sha = sha;
  const r = await fetch(url, { method: 'PUT', headers: ghHeaders(env), body: JSON.stringify(body) });
  if (!r.ok) {
    const text = await r.text().catch(() => '');
    const err = new Error(`GitHub PUT ${r.status}: ${text.slice(0, 200)}`) as Error & { status?: number };
    err.status = r.status;
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Public operations
// ─────────────────────────────────────────────────────────────────────────

export async function logSession(raw: unknown): Promise<{ ok: boolean; skipped?: boolean; reason?: string; error?: string }> {
  const env = readEnv();
  if (!env) return { ok: false, skipped: true, reason: 'not_configured' };

  const s = sanitize(raw);
  if (!s) return { ok: false, skipped: true, reason: 'bad_payload' };

  const path = `${env.dir}/session-${s.sessionId}.md`;
  const md = renderMarkdown(s);
  const message = `session ${s.sessionId}: ${s.events.length} event(s)${s.completed ? ' — completed' : ''}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    const sha = await getSha(env, path);
    try {
      await putFile(env, path, md, message, sha);
      return { ok: true };
    } catch (e) {
      const status = (e as { status?: number }).status;
      if (status === 409 && attempt < 2) continue; // sha race — retry
      return { ok: false, error: (e as Error).message };
    }
  }
  return { ok: false, error: 'write_conflict' };
}

export interface AdminSession {
  name: string;
  sessionId: string;
  completed: boolean;
  startedAt: string;
  updatedAt: string;
  events: SessionEvent[];
  markdown: string;
}

export async function listSessions(
  password: unknown,
): Promise<{ ok: boolean; error?: string; sessions?: AdminSession[] }> {
  const env = readEnv();
  if (!env) return { ok: false, error: 'not_configured' };
  if (!env.adminPassword) return { ok: false, error: 'admin_disabled' };
  if (typeof password !== 'string' || password !== env.adminPassword) return { ok: false, error: 'unauthorized' };

  const dirUrl = `${GH_API}/repos/${env.owner}/${env.repo}/contents/${encodePath(env.dir)}?ref=${encodeURIComponent(env.branch)}`;
  const r = await fetch(dirUrl, { headers: ghHeaders(env) });
  if (r.status === 404) return { ok: true, sessions: [] };
  if (!r.ok) return { ok: false, error: `list_failed_${r.status}` };

  const arr = (await r.json()) as Array<{ type: string; name: string; path: string }>;
  const files = arr
    .filter((f) => f.type === 'file' && f.name.startsWith('session-') && f.name.endsWith('.md'))
    .sort((a, b) => b.name.localeCompare(a.name)) // newest first (timestamp-prefixed ids)
    .slice(0, 100);

  const sessions: AdminSession[] = [];
  for (const f of files) {
    const fr = await fetch(`${GH_API}/repos/${env.owner}/${env.repo}/contents/${encodePath(f.path)}?ref=${encodeURIComponent(env.branch)}`, {
      headers: ghHeaders(env),
    });
    if (!fr.ok) continue;
    const j = (await fr.json()) as { content?: string };
    const markdown = j.content ? b64decode(j.content) : '';
    const parsed = extractJson(markdown);
    sessions.push({
      name: f.name,
      sessionId: parsed?.sessionId || f.name.replace(/^session-|\.md$/g, ''),
      completed: Boolean(parsed?.completed),
      startedAt: parsed?.startedAt || '',
      updatedAt: parsed?.updatedAt || '',
      events: Array.isArray(parsed?.events) ? (parsed!.events as SessionEvent[]) : [],
      markdown,
    });
  }
  return { ok: true, sessions };
}

function extractJson(md: string): (Record<string, unknown> & { events?: unknown }) | null {
  const m = md.match(/```json\s*([\s\S]*?)```/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}
