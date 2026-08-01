# Gatherly

Gatherly is a single, self-contained **Next.js (App Router) + TypeScript + Tailwind** digital invitation / RSVP app. There is no separate backend, no database, and no external services — the web UI, API route handlers, and middleware all run in one Next.js process on port `3000`.

State lives in two places:
- **Events**: in-memory `Map` seeded from `data/birthday-demo.json` (`src/lib/events.ts`). Event edits are not persisted and reset on server restart.
- **RSVPs**: file-backed JSON at `data/rsvps.json` (`src/lib/rsvp-store.ts`). This file is tracked in git and should stay as `[]` in commits — runtime RSVP writes are local only.

See `README.md` for routes and standard commands (`npm run dev`, `build`, `start`).

## Cursor Cloud specific instructions

- **Run**: `npm run dev` starts everything (web + API + middleware) on `http://localhost:3000` via Turbopack. No env vars or secrets are required.
- **Build**: `npm run build` works and type-checks the project.
- **Lint is currently broken at the repo level (not an environment issue)**: the `lint` script is `next lint`, which was removed in Next 16 — it now mis-parses `lint` as a directory. Running ESLint directly (`npx eslint .`) also fails with a `Converting circular structure to JSON` error from the `@eslint/eslintrc` `FlatCompat` config against ESLint 9. Fixing this requires code/config changes (out of scope for environment setup).
- **Hello-world E2E flow** (no auth exists): open `/e/h-birthday-2026`, fill the RSVP form, and submit — this POSTs to `/api/rsvp` and appends to `data/rsvps.json`. Verify with `GET /api/rsvp?slug=h-birthday-2026`. Get the event id from `GET /api/events/h-birthday-2026` (currently `evt_bday_hsalamanca_2026`); the RSVP POST requires `eventId`, `name`, and `email`.
- **Keep `data/rsvps.json` clean**: after manual RSVP testing, run `git checkout -- data/rsvps.json` so local writes don't get committed.
- Harmless startup warnings: Next.js prints a telemetry notice and a "middleware convention is deprecated, use proxy" warning — both are expected and non-blocking.
