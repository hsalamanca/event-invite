import { NextResponse, type NextRequest } from "next/server";

/**
 * Host-based routing for custom domains + {slug}.ownvite.app
 * Domain map is loaded from the domains API (Blob-backed registry).
 */

const PLATFORM_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "ownvite.com",
  "www.ownvite.com",
  "ownvite.app",
  "www.ownvite.app",
]);

type DomainMapResponse = {
  map?: Record<string, string>;
};

async function loadDomainMap(request: NextRequest): Promise<Record<string, string>> {
  try {
    const url = new URL("/api/domains/map", request.url);
    const res = await fetch(url.toString(), {
      headers: { "x-ownvite-middleware": "1" },
    });
    if (!res.ok) return {};
    const data = (await res.json()) as DomainMapResponse;
    return data.map ?? {};
  } catch {
    return {};
  }
}

export async function middleware(request: NextRequest) {
  const hostHeader = request.headers.get("host") ?? "";
  const hostname = hostHeader.split(":")[0]?.toLowerCase() ?? "";
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Platform apex: marketing + path invites — no rewrite
  if (!hostname || PLATFORM_HOSTS.has(hostname)) {
    return NextResponse.next();
  }

  // {slug}.ownvite.app → /e/{slug}
  if (hostname.endsWith(".ownvite.app") || hostname.endsWith(".ownvite.com")) {
    const suffix = hostname.endsWith(".ownvite.app")
      ? ".ownvite.app"
      : ".ownvite.com";
    const slug = hostname.slice(0, -suffix.length);
    if (slug && !slug.includes(".") && slug !== "www") {
      if (pathname === "/" || pathname === "") {
        const url = request.nextUrl.clone();
        url.pathname = `/e/${slug}`;
        return NextResponse.rewrite(url);
      }
    }
  }

  // Local convenience: {slug}.localhost
  if (hostname.endsWith(".localhost") && (pathname === "/" || pathname === "")) {
    const slug = hostname.replace(/\.localhost$/, "");
    if (slug && !slug.includes(".")) {
      const url = request.nextUrl.clone();
      url.pathname = `/e/${slug}`;
      return NextResponse.rewrite(url);
    }
  }

  // BYO custom domain → /e/{slug}
  const map = await loadDomainMap(request);
  const slug = map[hostname];
  if (slug && (pathname === "/" || pathname === "")) {
    const url = request.nextUrl.clone();
    url.pathname = `/e/${slug}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
