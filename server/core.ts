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

import { promises as fsp } from 'node:fs';
import { join as pathJoin } from 'node:path';

const GH_API = 'https://api.github.com';

// Local mirror — one markdown file with every session's full timeline, numbered.
// Written whenever the server has a writable disk (e.g. `npm run dev`); silently
// skipped on read-only serverless filesystems (there, GitHub is the store).
const LOCAL_RESPONSES_FILE = pathJoin(process.cwd(), 'server', 'responses.md');
// Machine index kept in a separate hidden file so responses.md stays purely human-readable.
const LOCAL_INDEX_FILE = pathJoin(process.cwd(), 'server', 'responses.index.json');

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
    case 'exit_opened':
      return '🚪 Opened the “leave” door';
    case 'exit_cancelled':
      return '↩️ Changed her mind and stayed';
    case 'exit_message':
      return g('message') ? `✉️ Parting words: “${g('message')}”` : '✉️ Left without writing anything';
    case 'exit_confirmed':
      return '👋 Closed the experience and left';
    case 'review_opened':
      return '💬 Opened the review box';
    case 'review_cancelled':
      return '💬 Closed the review box without sending';
    case 'final_review':
      return g('message') ? '⭐ Her review: “' + g('message') + '”' : '⭐ Sent an empty review';
    default:
      return `• ${e.type}`;
  }
}

function renderSessionBody(s: SessionPayload, includeRaw: boolean): string {
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

  // Whatever she chose to say on her way out — the last word, verbatim.
  const exitMsg = [...s.events].reverse().find((e) => e.type === 'exit_message');
  if (exitMsg) {
    const text = str((exitMsg as Record<string, unknown>).message);
    lines.push('## Before she left');
    lines.push('');
    lines.push(text ? '> ' + text.replace(/\n/g, '\n> ') : '_(she left without writing anything)_');
    lines.push('');
  }

  // Her closing word on the experience itself.
  const review = [...s.events].reverse().find((e) => e.type === 'final_review');
  if (review) {
    const rtext = str((review as Record<string, unknown>).message);
    lines.push('## Her review');
    lines.push('');
    lines.push(rtext ? '> ' + rtext.replace(/\n/g, '\n> ') : '_(sent without writing anything)_');
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

  if (includeRaw) {
    // Structured appendix — parsed back by the /admin dashboard.
    lines.push('## Raw data');
    lines.push('');
    lines.push('```json');
    lines.push(JSON.stringify({ ...s, completed, updatedAt: now }, null, 2));
    lines.push('```');
    lines.push('');
  }

  return lines.join('\n');
}

// GitHub per-session file — full block including the machine-readable Raw data.
export function renderMarkdown(s: SessionPayload): string {
  return renderSessionBody(s, true);
}

// ─────────────────────────────────────────────────────────────────────────
// Aggregate index — one README with every session's choices as a "set"
// ─────────────────────────────────────────────────────────────────────────

interface SessionSet {
  id: string;
  started: string;
  updated: string;
  completed: boolean;
  answer: string; // 'yes' | 'no' | ''
  dodges: number;
  passcode: 'ok' | 'failed' | '';
  passcodeAttempts: number;
  guess: string;
  meet: string;
  energy: string;
  music: string;
  loveLanguage: string;
  feltAppreciated: string;
  plan: { vibe: string; place: string; date: string; time: string } | null;
  changes: string[];
  copied: boolean;
  screens: string[];
}

function summarize(s: SessionPayload): SessionSet {
  const g = (e: SessionEvent | undefined, k: string) => (e ? str((e as Record<string, unknown>)[k]) : '');
  const last = (type: string) => [...s.events].reverse().find((e) => e.type === type);
  const meet = last('compat_meet');
  const energy = last('compat_energy');
  const music = last('compat_music');
  const love = last('love_language');
  const guess = last('mystery_pick');
  const reveal = s.events.find((e) => e.type === 'reveal_response');
  const plan = [...s.events].reverse().find((e) => e.type === 'plan_save' || e.type === 'complete');
  const passOk = s.events.some((e) => e.type === 'passcode_ok');
  const passFails = s.events.filter((e) => e.type === 'passcode_fail').length;
  const changes = s.events
    .filter((e) => e.type === 'plan_change')
    .map((e) => `${g(e, 'field')}: “${g(e, 'from')}” → “${g(e, 'to')}”`);
  const screens: string[] = [];
  for (const e of s.events) {
    if (e.type === 'screen') {
      const sc = str((e as Record<string, unknown>).screen);
      if (sc && !screens.includes(sc)) screens.push(sc);
    }
  }
  return {
    id: s.sessionId,
    started: s.startedAt || s.events[0]?.t || '',
    updated: new Date().toISOString(),
    completed: s.completed || s.events.some((e) => e.type === 'complete'),
    answer: g(reveal, 'answer'),
    dodges: reveal ? Number((reveal as Record<string, unknown>).dodges) || 0 : 0,
    passcode: passOk ? 'ok' : passFails > 0 ? 'failed' : '',
    passcodeAttempts: passFails,
    guess: g(guess, 'label'),
    meet: g(meet, 'title'),
    energy: g(energy, 'title'),
    music: g(music, 'title'),
    loveLanguage: g(love, 'loveLanguage'),
    feltAppreciated: g(love, 'feltAppreciated'),
    plan: plan ? { vibe: g(plan, 'vibe'), place: g(plan, 'place'), date: g(plan, 'date'), time: g(plan, 'time') } : null,
    changes,
    copied: s.events.some((e) => e.type === 'plan_copied'),
    screens,
  };
}

function renderAggregate(map: Record<string, SessionSet>): string {
  // insertion order = order sessions first appeared → stable numbering (#1 oldest)
  const rows = Object.values(map);
  const q = (v: string) => (v ? v.replace(/\n+/g, ' ').trim() : '');
  const lines: string[] = [];
  lines.push('# Moksha — every answer set 🎀');
  lines.push('');
  lines.push(
    `_One numbered entry per login (a full cycle), with everything she chose listed under it. **${rows.length}** total. Auto-updates on every action; full step-by-step timelines live in [\`sessions/\`](./sessions/)._`,
  );
  lines.push('');

  rows.forEach((r, i) => {
    const n = i + 1;
    const ans = r.answer === 'yes' ? '🌸 YES' : r.answer === 'no' ? '🙃 said no' : '— not yet';
    const pass =
      r.passcode === 'ok'
        ? `entered correctly${r.passcodeAttempts ? ` (after ${r.passcodeAttempts} wrong)` : ''}`
        : r.passcode === 'failed'
          ? `only wrong tries (${r.passcodeAttempts})`
          : '—';
    lines.push('---');
    lines.push('');
    lines.push(`## ${n} · ${fmtFull(r.started)}`);
    lines.push('');
    lines.push(`- **Session id:** \`${r.id}\``);
    lines.push(`- **Status:** ${r.completed ? '✅ completed the whole cycle' : '⏳ in progress'}`);
    lines.push(`- **Answer to the ask:** ${ans}${r.dodges ? ` (dodged the “no” button ${r.dodges}×)` : ''}`);
    lines.push(`- **Passcode:** ${pass}`);
    lines.push(`- **Guessed who made it:** ${q(r.guess) ? `“${q(r.guess)}”` : '—'}`);
    lines.push(`- **First-meet vibe:** ${q(r.meet) || '—'}`);
    lines.push(`- **Energy vibe:** ${q(r.energy) || '—'}`);
    lines.push(`- **Music vibe:** ${q(r.music) || '—'}`);
    lines.push(`- **Love language:** ${q(r.loveLanguage) ? `“${q(r.loveLanguage)}”` : '—'}`);
    lines.push(`- **What makes her feel appreciated:** ${q(r.feltAppreciated) ? `“${q(r.feltAppreciated)}”` : '—'}`);
    lines.push(
      `- **The plan:** ${r.plan ? `${q(r.plan.vibe)} · ${q(r.plan.place)} · ${q(r.plan.date)} · ${q(r.plan.time)}` : '—'}`,
    );
    if (r.changes && r.changes.length) lines.push(`- **Changed her mind:** ${r.changes.map(q).join('; ')}`);
    lines.push(`- **Copied the plan:** ${r.copied ? 'yes' : 'no'}`);
    lines.push(
      `- **Screens reached:** ${r.screens && r.screens.length ? r.screens.map((sc) => SCREEN_LABELS[sc] || sc).join(' → ') : '—'}`,
    );
    lines.push(`- **Last updated:** ${fmtFull(r.updated)}`);
    lines.push('');
  });

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
// Local file mirror — server/responses.md (full timeline per session, numbered)
// ─────────────────────────────────────────────────────────────────────────

function renderLocalResponses(index: Record<string, SessionPayload>): string {
  const entries = Object.values(index); // oldest first (order they first appeared)
  if (entries.length === 0) return '';
  // Each session is its own full block (same rich format as the GitHub per-session
  // file, minus the raw-JSON appendix), separated by a clear gap so one session's
  // record is visually distinct from the next.
  const gap = '\n\n\n<!-- ─────────────────────────────────────────── -->\n\n---\n\n\n';
  return entries.map((s) => renderSessionBody(s, false).trimEnd()).join(gap) + '\n';
}

async function writeLocalResponses(s: SessionPayload): Promise<void> {
  try {
    let index: Record<string, SessionPayload> = {};
    try {
      const raw = await fsp.readFile(LOCAL_INDEX_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as { sessions?: Record<string, SessionPayload> };
      if (parsed && parsed.sessions) index = parsed.sessions;
    } catch {
      /* index missing/corrupt — start fresh */
    }
    index[s.sessionId] = {
      sessionId: s.sessionId,
      startedAt: s.startedAt,
      events: s.events,
      completed: s.completed || s.events.some((e) => e.type === 'complete'),
    };
    // hidden machine index (for upserting) + the clean human-readable log
    await fsp.writeFile(LOCAL_INDEX_FILE, JSON.stringify({ sessions: index }, null, 2), 'utf-8');
    await fsp.writeFile(LOCAL_RESPONSES_FILE, renderLocalResponses(index), 'utf-8');
  } catch {
    /* read-only fs (serverless) or other IO error — ignore; GitHub is the store there */
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Public operations
// ─────────────────────────────────────────────────────────────────────────

export async function logSession(raw: unknown): Promise<{ ok: boolean; skipped?: boolean; reason?: string; error?: string }> {
  const s = sanitize(raw);
  if (!s) return { ok: false, skipped: true, reason: 'bad_payload' };

  // 1) Local mirror — always attempt (works under `npm run dev`; no-op on read-only fs).
  await writeLocalResponses(s);

  // 2) GitHub — persistent store for a deployed link. Skipped if not configured.
  const env = readEnv();
  if (!env) return { ok: true, reason: 'local_only' };

  const filePath = `${env.dir}/session-${s.sessionId}.md`;
  const md = renderMarkdown(s);
  const message = `session ${s.sessionId}: ${s.events.length} event(s)${s.completed ? ' — completed' : ''}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    const sha = await getSha(env, filePath);
    try {
      await putFile(env, filePath, md, message, sha);
      // also fold this session's full choice-set into the single numbered README (best-effort)
      try {
        await upsertAggregate(env, summarize(s));
      } catch {
        /* index is best-effort — never fail the main log over it */
      }
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
