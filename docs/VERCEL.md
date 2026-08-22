# Vercel deployments

Ownvite is deployed on Vercel via the **GitHub integration** (not a manual CLI deploy from this agent).

## How deploys work

| GitHub event | Vercel result |
|--------------|---------------|
| Push / merge to `main` | **Production** (`ownvite.com`, `ownvite.app`, and the `*.vercel.app` production URL) |
| Push to any other branch | **Preview** deployment for that branch |

So: **update `origin/main` → production updates on Vercel automatically.**

Feature branches (e.g. `cursor/*`) only create preview URLs. They do **not** change production until merged into `main`.

## Project config

- `vercel.json` — Next.js framework, `npm run build`, region `iad1`
- Framework: Next.js App Router

## Local / CLI (operators)

```bash
npx vercel login
npx vercel link          # link to the existing Ownvite project
npx vercel --prod        # optional manual production deploy
```

Required env vars (set in Vercel project settings): Auth secrets, Blob token, Stripe, etc. See `docs/GOOGLE_AUTH.md` and Host studio domain docs.

## Verify

After pushing `main`, check the Vercel dashboard → Deployments → **Production**, or:

```bash
gh api repos/hsalamanca/event-invite/deployments \
  --jq '.[] | select(.environment=="Production") | {ref,sha,created_at}' | head
```
