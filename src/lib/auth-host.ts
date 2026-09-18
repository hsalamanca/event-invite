/**
 * Multi-domain Auth.js helpers for ownvite.com / ownvite.app (and www).
 * Session cookies are host-only so invite subdomains (slug.ownvite.app) never
 * receive the apex session. AUTH_URL, if pinned to one origin, is overridden
 * per request on platform hosts.
 */

export const PLATFORM_AUTH_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "ownvite.com",
  "www.ownvite.com",
  "ownvite.app",
  "www.ownvite.app",
]);

/** www → apex so login starts on the same host Google should callback to. */
export const CANONICAL_AUTH_HOST: Record<string, string> = {
  "www.ownvite.com": "ownvite.com",
  "www.ownvite.app": "ownvite.app",
};

const AUTH_PAGE_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

export function normalizeHostname(
  hostHeader: string | null | undefined,
): string {
  return (
    hostHeader?.split(",")[0]?.trim().split(":")[0]?.toLowerCase() ?? ""
  );
}

export function isPlatformAuthHost(hostname: string): boolean {
  return PLATFORM_AUTH_HOSTS.has(hostname);
}

export function isAuthPagePath(pathname: string): boolean {
  return AUTH_PAGE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Host-only cookies (no Domain attribute).
 * Domain=.ownvite.app / .ownvite.com would also send the session to invite
 * hosts (slug.ownvite.app) and custom subdomains. Omit Domain so cookies stay
 * on the exact auth host.
 *
 * Apex ↔ www: cookies are not shared. Middleware 308s www → apex for document
 * navigations so login/dashboard stay on one host per TLD. Direct calls to
 * www /api/auth can still mint a www-only cookie (use the canonical host).
 */
export function cookieDomainForHost(_hostname: string): string | undefined {
  return undefined;
}

export function requestIsHttps(headers: Headers): boolean {
  const proto = headers.get("x-forwarded-proto") ?? "";
  const first = proto.split(",")[0]?.trim().toLowerCase();
  if (first === "https") return true;
  if (first === "http") return false;
  return process.env.NODE_ENV === "production";
}

export function useSecureAuthCookies(request?: Request): boolean {
  if (process.env.NODE_ENV === "production") return true;
  if (request) return requestIsHttps(request.headers);
  return false;
}

export function hostnameFromRequestOrEnv(request?: Request): string {
  if (request) {
    return normalizeHostname(
      request.headers.get("x-forwarded-host") ?? request.headers.get("host"),
    );
  }
  const envUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL;
  if (!envUrl) return "";
  try {
    return new URL(envUrl).hostname.toLowerCase();
  } catch {
    return "";
  }
}

/** Public origin for the incoming request (honors forwarded proto/host). */
export function publicOriginFromHeaders(headers: Headers): string | null {
  const forwardedHost = headers.get("x-forwarded-host") ?? headers.get("host");
  const host = forwardedHost?.split(",")[0]?.trim();
  if (!host) return null;
  const hostname = normalizeHostname(host);
  const local = hostname === "localhost" || hostname === "127.0.0.1";
  const protocol = local
    ? "http"
    : requestIsHttps(headers)
      ? "https"
      : "http";
  return `${protocol}://${host}`;
}

function apexHost(hostname: string): string {
  return hostname.replace(/^www\./, "");
}

/** AUTH_URL / NEXTAUTH_URL origin when it is a platform host. */
export function envAuthOrigin(): string | null {
  const raw = process.env.AUTH_URL || process.env.NEXTAUTH_URL;
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    if (!isPlatformAuthHost(host)) return null;
    const protocol = url.protocol === "http:" ? "http:" : "https:";
    return `${protocol}//${apexHost(host)}`;
  } catch {
    return null;
  }
}

/**
 * Send auth pages to a single host so PKCE cookies and Google redirect_uri match.
 * If AUTH_URL is set to a platform host (today: ownvite.app), .com login follows it.
 * www always collapses to apex.
 */
export function canonicalAuthRedirect(
  hostname: string,
  pathname: string,
  search: string,
): string | null {
  if (!isAuthPagePath(pathname) || !isPlatformAuthHost(hostname)) return null;
  if (hostname === "localhost" || hostname === "127.0.0.1") return null;

  const envOrigin = envAuthOrigin();
  const targetHost = envOrigin
    ? new URL(envOrigin).hostname
    : (CANONICAL_AUTH_HOST[hostname] ?? hostname);
  if (hostname === targetHost) return null;

  const origin = envOrigin ?? `https://${targetHost}`;
  // `search` should already have callbackUrl allowlisted (see middleware).
  return `${origin}${pathname}${search}`;
}

/**
 * Collapse www → apex for platform document navigations so host-only session
 * cookies still apply after login. Invite subdomains are not platform auth hosts.
 */
export function canonicalWwwRedirect(
  hostname: string,
  pathname: string,
  search: string,
): string | null {
  if (!isPlatformAuthHost(hostname)) return null;
  if (hostname === "localhost" || hostname === "127.0.0.1") return null;
  const apex = CANONICAL_AUTH_HOST[hostname];
  if (!apex) return null;
  return `https://${apex}${pathname}${search}`;
}

const cookieBase = (secure: boolean, domain?: string) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure,
  ...(domain ? { domain } : {}),
});

/**
 * Explicit Auth.js cookie names/options.
 * CSRF keeps the __Host- prefix (no Domain). Session/PKCE/state are host-only
 * so invite subdomains never receive the apex session.
 */
export function authCookies(hostname: string, secure: boolean) {
  const domain = cookieDomainForHost(hostname);
  const prefix = secure ? "__Secure-" : "";
  const shared = cookieBase(secure, domain);
  return {
    sessionToken: {
      name: `${prefix}authjs.session-token`,
      options: shared,
    },
    callbackUrl: {
      name: `${prefix}authjs.callback-url`,
      options: shared,
    },
    pkceCodeVerifier: {
      name: `${prefix}authjs.pkce.code_verifier`,
      options: { ...shared, maxAge: 60 * 15 },
    },
    state: {
      name: `${prefix}authjs.state`,
      options: { ...shared, maxAge: 60 * 15 },
    },
    nonce: {
      name: `${prefix}authjs.nonce`,
      options: { ...shared, maxAge: 60 * 15 },
    },
    csrfToken: {
      name: `${secure ? "__Host-" : ""}authjs.csrf-token`,
      options: cookieBase(secure),
    },
  };
}

export type AuthUrlSnapshot = {
  AUTH_URL: string | undefined;
  NEXTAUTH_URL: string | undefined;
};

function writeEnv(name: "AUTH_URL" | "NEXTAUTH_URL", value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

/**
 * Auth.js createActionURL prefers AUTH_URL over the request Host.
 * Pin it to this request's origin on platform hosts so Google redirect_uri
 * and the PKCE cookie host match (ownvite.com vs ownvite.app vs www).
 */
export function pinAuthUrlToRequest(request: Request): AuthUrlSnapshot {
  const snapshot: AuthUrlSnapshot = {
    AUTH_URL: process.env.AUTH_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  };
  const origin = publicOriginFromHeaders(request.headers);
  const host = normalizeHostname(
    request.headers.get("x-forwarded-host") ?? request.headers.get("host"),
  );
  if (!origin || !isPlatformAuthHost(host)) return snapshot;

  const envUrl = snapshot.AUTH_URL || snapshot.NEXTAUTH_URL;
  if (envUrl) {
    try {
      const envHost = new URL(envUrl).hostname.toLowerCase();
      if (envHost !== host) {
        console.warn("[auth] pinning OAuth origin to request host", {
          requestHost: host,
          authUrlHost: envHost,
        });
      }
    } catch {
      console.warn("[auth] AUTH_URL is not a valid URL; pinning to request host");
    }
  }

  process.env.AUTH_URL = origin;
  if (snapshot.NEXTAUTH_URL !== undefined) {
    process.env.NEXTAUTH_URL = origin;
  }
  return snapshot;
}

export function restoreAuthUrl(snapshot: AuthUrlSnapshot) {
  writeEnv("AUTH_URL", snapshot.AUTH_URL);
  writeEnv("NEXTAUTH_URL", snapshot.NEXTAUTH_URL);
}

export async function withPinnedAuthUrl<T>(
  request: Request,
  run: () => Promise<T>,
): Promise<T> {
  const snapshot = pinAuthUrlToRequest(request);
  try {
    return await run();
  } finally {
    restoreAuthUrl(snapshot);
  }
}

export function warnIfAuthSecretMissing() {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error(
      "[auth] AUTH_SECRET is missing; PKCE cookies cannot be encrypted or parsed",
    );
    return;
  }
  if (secret.length < 32) {
    console.warn("[auth] AUTH_SECRET should be at least 32 characters");
  }
}
