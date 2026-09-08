# Google sign-in for Ownvite

Login and register show **Continue with Google** once OAuth credentials are set.

**Hugo / CoS:** live login is `https://ownvite.com`. If Vercel Production
`AUTH_URL` is `https://ownvite.app` (or www), Auth.js sends Google back to
`.app` while the PKCE cookie was set on `.com` → `InvalidCheck` /
`pkceCodeVerifier value could not be parsed`. That is an **env-only** check
(name `AUTH_URL`). Do not rotate `AUTH_SECRET` to debug this.

| Host | Canonical login host |
|------|----------------------|
| `ownvite.com` | **canonical for Hugo** |
| `www.ownvite.com` | 308 → `ownvite.com` on `/login` and other auth pages |
| `ownvite.app` | still works (app pins OAuth origin to the request host) |
| `www.ownvite.app` | 308 → `ownvite.app` on auth pages |

## 1. Create the OAuth client

1. Open [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Select (or create) a project for Ownvite.
3. **OAuth consent screen** → External (or Internal for Workspace-only).
   - App name: `Ownvite`
   - User support email: your email
   - Authorized domains: `ownvite.app`, `ownvite.com`
   - Scopes: `email`, `profile`, `openid` (default)
4. **Create credentials → OAuth client ID → Web application**
   - Name: `Ownvite Web`
   - Authorized JavaScript origins:
     - `https://ownvite.com`
     - `https://www.ownvite.com`
     - `https://ownvite.app`
     - `https://www.ownvite.app`
     - `http://localhost:3000`
   - Authorized redirect URIs:
     - `https://ownvite.com/api/auth/callback/google`
     - `https://www.ownvite.com/api/auth/callback/google`
     - `https://ownvite.app/api/auth/callback/google`
     - `https://www.ownvite.app/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google`

Copy the **Client ID** and **Client secret**.

## 2. Set environment variables

Preferred (Auth.js convention):

```bash
AUTH_GOOGLE_ID=....apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-...
```

Also accepted:

```bash
AUTH_GOOGLE_CLIENT_ID=...
AUTH_GOOGLE_CLIENT_SECRET=...
```

### Auth.js host / cookie env (Vercel Production)

| Name | Required | Notes |
|------|----------|--------|
| `AUTH_SECRET` | **Yes** | Stable random string, **≥ 32 characters**. Encrypts the PKCE verifier cookie. Must be the same across all production instances. Do not rotate mid-incident unless you accept breaking in-flight logins. Also accepted: `NEXTAUTH_SECRET` (prefer one name only). |
| `AUTH_TRUST_HOST` | Recommended `true` | Trust `Host` / `X-Forwarded-Host` on Vercel. Code also sets `trustHost: true`. |
| `AUTH_URL` | Prefer **unset**, or `https://ownvite.com` | Auth.js uses this origin for Google `redirect_uri` **instead of** the address bar. **If this is `https://ownvite.app` while Hugo signs in on `ownvite.com`, PKCE fails.** Env-only fix: set `AUTH_URL=https://ownvite.com` (origin only, no path) **or** unset it. Do not set `NEXTAUTH_URL` to a different host. This repo also pins `AUTH_URL` to the request host so `.app` login still works if left unset. |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | **Yes** for Google | Same values as the OAuth client above. |

The app pins `AUTH_URL` to the **request origin** on platform hosts so `.com` and `.app` can both complete Google sign-in. Google still needs **every** callback URI listed above.

### Vercel (production + preview)

```bash
vercel env add AUTH_GOOGLE_ID production
vercel env add AUTH_GOOGLE_SECRET production
vercel env add AUTH_SECRET production
vercel env add AUTH_TRUST_HOST production
# repeat for preview / development as needed
vercel --prod
```

Do not commit secrets. After changing `AUTH_SECRET` or Google client values, redeploy Production.

### Local

Add the same keys to `.env.local`, then restart `npm run dev`.
`AUTH_URL` may be `http://localhost:3000` locally. Leave cookies host-only (no `Domain`).

## 3. Verify

1. Open `https://ownvite.com/login` and `https://ownvite.app/login` — Google button appears above the email form.
2. `https://www.ownvite.com/login` should 308 to `https://ownvite.com/login`.
3. Complete Google consent → land on `/dashboard` (or `/events/new` from register).
4. Same Google email merges with an existing Ownvite account (email linking).
5. If Google shows a redirect-URI mismatch, add the missing callback from the list above (do not invent `/create` or `/invites`).
6. If the app shows `InvalidCheck`, the PKCE cookie was missing or could not be decrypted — confirm `AUTH_SECRET` is set, stable, and not different from `NEXTAUTH_SECRET`.
