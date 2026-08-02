# Google sign-in for Ownvite

Login and register show **Continue with Google** once OAuth credentials are set.

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
     - `https://ownvite.app`
     - `https://www.ownvite.app`
     - `http://localhost:3000`
   - Authorized redirect URIs:
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

### Vercel (production + preview)

```bash
vercel env add AUTH_GOOGLE_ID production
vercel env add AUTH_GOOGLE_SECRET production
# repeat for preview / development as needed
vercel --prod
```

### Local

Add the same keys to `.env.local`, then restart `npm run dev`.

## 3. Verify

1. Open `/login` — Google button appears above the email form.
2. Complete Google consent → land on `/dashboard` (or `/events/new` from register).
3. Same Google email merges with an existing Ownvite account (email linking).
