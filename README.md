# For Moksha ✨

A one-of-one interactive love letter — a cinematic web experience that walks
Moksha from a mysterious "hey" all the way to planning a first date, built by
Pradhyumna. It looks after itself: ambient generative music, a living motion
background, a bespoke cursor, and — the important part — it **quietly records
every meaningful choice she makes into a private GitHub repo**, so you can read
exactly what she picked, typed and planned, without her having to send you
anything.

---

## 1. What she experiences

Nine screens, one continuous flow:

| # | Screen | What happens |
|---|--------|--------------|
| 1 | **Opening** | Timed cinematic lines: *"Hey, Moksha. I made something for you."* |
| 2 | **Passcode** | A playful gate — "enter the last 3 digits of your ID". Code is **`830`**. |
| 3 | **Mystery** | "Who do you think made this?" — three cards, any pick moves on. |
| 4 | **The reveal** | The confession: *"It's me. Yeah. I like you."* → **Yes / No**. The **No** button dodges the cursor, begging, until it finally gives in. |
| 5 | **Compatibility** | Three quick picks: first-meet vibe → energy → music. |
| 6 | **Love language** | Two open-ended, personal questions. |
| 7 | **Personalised result** | Her answers are synthesised into a warm, flirty read-back. |
| 8 | **Date planner** | She chooses activity, place, date and time — a live "ticket" updates as she types. |
| 9 | **Final** | Confetti, an emotional note signed *— Pradhyumna*, and a souvenir ticket. |

## 2. The craft (the "ultimate" pass)

- **Living background** — a slow aurora wash, morphing gradient blobs that
  **parallax to the pointer**, drifting sparkle particles, and occasional
  falling petals & hearts. It shifts tone with the moment (calm → warm →
  magical → celebration).
- **Bespoke cursor** — a glowing dot with a springy trailing ring that swells
  over anything clickable, a soft sparkle trail, and a **heart-burst on click**.
  Desktop only; touch and reduced-motion users are respected.
- **Generative music** — no audio files. A continuous 8-chord romantic
  progression with a sub-bass floor, a delicate music-box bell on top, stereo
  motion, a convolution-reverb "air", and a slow filter "breath". It brightens
  as the story rises. Toggle top-right; on by default.
- **Motion everywhere** — dreamy blur/scale screen transitions, sheen sweeps on
  buttons, tilt/lift cards, gradient display type.
- Every animation collapses gracefully under `prefers-reduced-motion`.

---

## 3. How her choices reach you

This is a static React app, so a browser on her phone can't write to your
repo directly — and a secret token must **never** live in client code. So the
flow is:

```
  Her browser                     Server (Vercel function / dev middleware)        GitHub
  ───────────                     ─────────────────────────────────────────        ──────
  logs a meaningful event  ──►    POST /api/log   (holds GITHUB_TOKEN)      ──►     responses/sessions/
  (selection, answer, plan)       renders the session as Markdown & upserts         session-<id>.md  (PRIVATE)
```

- One **Markdown file per session**: `responses/sessions/session-<id>.md`.
- The **whole running timeline** is re-rendered and committed on every
  meaningful event, so the file (and its git history) is always current — even
  if she closes the tab halfway. **She never has to send anything.**
- The **token stays server-side only** (an environment variable). It is never
  bundled into the client — verified: the built client contains no token and no
  `api.github.com` reference.

**What gets logged** (only deliberate, meaningful moments):

- which screens she reached, in order, with timestamps
- passcode attempts (pass/fail — not the keys)
- her "who made this?" guess
- yes / no to the ask (and how many times the No button dodged 😅)
- compatibility picks (meet vibe / energy / music)
- her love-language answers (the submitted text)
- the date plan (activity / place / date / time) and any later edits (old → new)
- completion status

**What is *not* logged:** no raw keystrokes, no mouse tracking, no IP, no
user-agent, no device fingerprint, no third-party analytics. Nothing but the
events above.

Each session file looks like this:

```markdown
# Session `20260904-2213-ab12cd`
- **Started:** 2026-09-04 22:13:04 UTC
- **Status:** ✅ Completed
- **Answer to the ask:** 💗 YES
- **Screens reached:** Opening → Passcode → … → Final

## Timeline
- `22:13:04` 🌸 Opened the experience
- `22:13:31` 🔓 Entered the correct passcode
- `22:14:02` 💗 Said **YES** (after the "no" button dodged 3×)
- `22:15:10` ☕ First-meet vibe: **Coffee & random conversations**
- `22:17:41` 📍 Saved the plan — coffee · Third Wave Coffee · This Saturday · 5 PM
- `22:18:03` 🎉 Reached the final screen

## Her words
…

## Final plan
| Field | Value |
…

## Raw data
```(json appendix the /admin dashboard parses back)```
```

---

## 4. Where you read her answers

**Option A — the private repo (primary).** Open your responses repo on GitHub
and browse `responses/sessions/`. Each file is a full, readable timeline. Git
history shows how it built up in real time.

**Option B — the `/admin` dashboard.** Visit `https://your-app.vercel.app/admin`,
enter your admin password, and see every session in one place: status, her
answer, the plan, her words, and the full expandable timeline. Nothing loads
until the correct password is supplied, and the check happens server-side.

---

## 5. Setup

### 5.1 Create the storage (once)

1. **Create a new PRIVATE GitHub repo** to hold responses, e.g.
   `moksha-responses`. (Keep it separate from this code repo so the responses
   stay private even if you make the app repo public.)
2. **Create a fine-grained Personal Access Token**
   (GitHub → Settings → Developer settings → Fine-grained tokens):
   - **Repository access:** only your `moksha-responses` repo.
   - **Permissions:** **Contents → Read and write**. Nothing else.
   - Copy the token — you'll paste it into an environment variable, never into code.

### 5.2 Environment variables

Copy `.env.example` to `.env` (for local dev) and set the same values in your
host (for production). **Never commit `.env`** — it's already git-ignored.

| Variable | Meaning |
|----------|---------|
| `GITHUB_TOKEN` | The fine-grained PAT from 5.1. **Server-side only.** |
| `GITHUB_OWNER` | Your GitHub username. |
| `GITHUB_REPO` | The private responses repo, e.g. `moksha-responses`. |
| `GITHUB_BRANCH` | Usually `main`. |
| `SESSIONS_DIR` | Folder inside that repo (default `responses/sessions`). |
| `ADMIN_PASSWORD` | Password for `/admin`. Leave empty to disable `/admin`. |

### 5.3 Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. The dev server runs the same `/api/log` and
`/api/sessions` logic as production (via a small Vite middleware), so with a
`.env` present it logs to GitHub exactly like the live site. Without a `.env`,
logging simply no-ops — the experience still runs perfectly.

### 5.4 Deploy (Vercel)

Because a secret token must live server-side, this needs a host with serverless
functions — **Vercel** is the smooth path (GitHub Pages / plain static hosts
can't keep a secret and won't work for logging).

1. Push this code repo to GitHub and **Import** it in Vercel.
2. Vercel auto-detects Vite; the `api/` folder becomes serverless functions and
   `vercel.json` routes everything else to the SPA (so `/admin` works).
3. In **Project → Settings → Environment Variables**, add all six vars from 5.2.
4. Deploy. Send Moksha the URL. Watch `responses/sessions/` fill up. 💌

---

## 6. Security & privacy notes

- The GitHub token is only ever read by the server (`api/` + the dev
  middleware). It is not, and cannot be, in the client bundle.
- Keep the responses repo **private**. `/admin` is gated by `ADMIN_PASSWORD`
  and verified server-side; leave it unset if you only ever read the repo.
- `/api/log` is public by nature (the client must call it); input is sanitised
  and capped, and session ids are restricted to `[A-Za-z0-9_-]`. It's an
  obscure, low-value endpoint for a personal project — fine here, but don't
  reuse it for anything sensitive without adding auth/rate-limiting.
- No Supabase, Firebase, Discord, email, webhooks, or analytics are used.

## 7. Customising

- **Passcode:** `CORRECT_CODE` in [`src/components/screens/02_AuthScreen.tsx`](src/components/screens/02_AuthScreen.tsx).
- **Names / copy:** the screen files in `src/components/screens/`.
- **Date vibes & suggested places:** [`src/data/vibes.ts`](src/data/vibes.ts).
- **Palette / motion:** [`src/styles/globals.css`](src/styles/globals.css).
- **Music:** the chord table in [`src/components/ambient/SoundPlayer.tsx`](src/components/ambient/SoundPlayer.tsx).

## 8. Project structure

```
api/                     Vercel serverless functions (token lives here)
  log.ts                 POST /api/log      — persist a session
  sessions.ts            POST /api/sessions — admin: list sessions
server/
  core.ts                GitHub storage + Markdown rendering (server-only)
src/
  App.tsx                Screen router + mood + auto-logging + /admin route
  utils/
    logger.ts            Client event reporter (fire-and-forget)
    mood.ts              Tiny bus: screens set mood, bg + music react
    audio.ts             Synthesised UI interaction sounds
  components/
    fx/CursorFX.tsx      Custom cursor
    ambient/             AmbientBackground + SoundPlayer (generative music)
    admin/AdminApp.tsx   The /admin dashboard
    screens/01..09       The nine experience screens
  data/vibes.ts          Date/energy/music option content
vite.config.ts           Vite + dev API middleware (mirrors the functions)
vercel.json              SPA routing for production
.env.example             Copy to .env and fill in
```

## 9. Scripts

```bash
npm run dev      # local dev at :3000 (with working /api routes)
npm run build    # type-check + production build to dist/
npm run preview  # preview the production build (no /api — use Vercel/dev for logging)
```

---

Made with a genuinely inconvenient amount of feelings. — Pradhyumna
