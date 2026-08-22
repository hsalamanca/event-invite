# AGENTS.md

## Cursor Cloud specific instructions

Ownvite is a single Next.js 16 (App Router, TypeScript, Tailwind, Turbopack) application — a digital invitation / RSVP platform. There is no separate backend; API routes live under `src/app/api/*` and data uses a file-backed store when no Vercel Blob token is present.

### Running the app
- Dev server: `npm run dev` (Next.js + Turbopack, serves on `http://localhost:3000`). The update script already runs `npm install`.
- Build: `npm run build` (Next.js production build; succeeds with no env vars).
- The app runs with **no environment variables**. All secrets are optional and only gate integrations: `BLOB_READ_WRITE_TOKEN` (Vercel Blob storage), `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` (Google OAuth login), `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` (billing), `RESEND_API_KEY` (email), `TWILIO_*` (SMS), `OPENAI_API_KEY` (AI invite parsing), `VERCEL_TOKEN`/`VERCEL_PROJECT_ID`/`VERCEL_TEAM_ID` (custom-domain management). Without them the app degrades gracefully (e.g. email is queued as a `preview`, Google button is hidden, RSVP list falls back to local files).

### Lint is broken in the repo (not a setup issue)
- `npm run lint` fails: Next.js 16 removed `next lint`, so `next` treats `lint` as a directory arg (`Invalid project directory ... /lint`).
- Running ESLint directly (`npx eslint .`) also fails with `TypeError: Converting circular structure to JSON` — the committed `eslint.config.mjs` uses `FlatCompat` + `eslint-config-next` which is incompatible with the installed ESLint 9 flat-config validator. This is a pre-existing code/config problem, not a dependency issue. Do not treat lint failures as an environment regression.

### Local data / state
- When `BLOB_READ_WRITE_TOKEN` is unset, dev writes go to a local fallback dir `data/.blob/` and to `data/rsvps.json`. These are runtime state — do NOT commit them (`data/rsvps.json` is tracked as `[]`; revert it with `git checkout -- data/rsvps.json` if a test writes to it). `data/.blob/` is untracked; leave it out of commits.
- The seeded demo event is `data/birthday-demo.json` → visible at `/e/h-birthday-2026`. Host studio is `/host/h-birthday-2026`.

### Smoke test / hello-world
- Visit `/e/h-birthday-2026`, fill the RSVP form, submit → success ("You're on the list"). The RSVP API is `POST /api/rsvp` (requires `eventId`, `name`, `email`).
