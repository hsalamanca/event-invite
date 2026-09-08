# Google sign-in for Ownvite

Login and register show **Continue with Google** once OAuth credentials are set.

**Hugo / CoS:** live login is `https://ownvite.com`. Production `AUTH_URL` is
`https://ownvite.app`, so Auth.js used to send Google back to `.app` while the
PKCE cookie was set on `.com` → `InvalidCheck` / `pkceCodeVerifier value could
not be parsed`. Do not rotate `AUTH_SECRET` to debug this.

The app now:

1. Pins OAuth origin to the **request host** so `.com` and `.app` can both complete Google sign-in.
2. Redirects auth pages (`/login`, `/register`, …) to the `AUTH_URL` host when that env is set (today: `.app`), so Google’s existing callback URIs keep working immediately.
3. Collapses `www` → apex.

| Host | What happens |
|------|----------------|
| `ownvite.com` / `www.ownvite.com` | Auth pages 308 → `AUTH_URL` host (currently `ownvite.app`) |
| `ownvite.app` | Canonical while `AUTH_URL` is `.app` |
| `www.ownvite.app` | 308 → `ownvite.app` |

To make `ownvite.com` the login host without a redirect: set Production `AUTH_URL` to `https://ownvite.com` **or unset it**, and add the `.com` Google callback URIs below.

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
| `AUTH_URL` | Prefer **unset**, or `https://ownvite.com` | Auth.js uses this origin for Google `redirect_uri` **instead of** the address bar. **If this is `https://ownvite.app` while Hugo signs in on `ownvite.com`, PKCE fails** unless the app redirects or pins origin (both are in code now). Env-only improvement: set `AUTH_URL=https://ownvite.com` (origin only, no path) **or** unset it. Do not set `NEXTAUTH_URL` to a different host. |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | **Yes** for Google | Same values as the OAuth client above. |

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

1. Open `https://ownvite.com/login` — should 308 to `https://ownvite.app/login` while Production `AUTH_URL` is `.app`.
2. `https://www.ownvite.app/login` should 308 to `https://ownvite.app/login`.
3. Complete Google consent → land on `/dashboard` (or `/events/new` from register).
4. Same Google email merges with an existing Ownvite account (email linking).
5. If Google shows a redirect-URI mismatch, add the missing callback from the list above (do not invent `/create` or `/invites`).
6. If the app shows `InvalidCheck`, the PKCE cookie was missing or could not be decrypted — confirm `AUTH_SECRET` is set, stable, and not different from `NEXTAUTH_SECRET`.
