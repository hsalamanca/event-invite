import { NextResponse, type NextRequest } from "next/server";

/**
 * Host-based routing stub for custom domains.
 * MVP: rewrites known demo custom domain and `{slug}.localhost` to `/e/{slug}`.
 * Full DNS/SSL verification lands later — see docs/CUSTOM_DOMAINS.md.
 */
const DOMAIN_TO_SLUG: Record<string, string> = {
  "h-birthday.ownvite.app": "h-birthday-2026",
  "party.hsalamanca.com": "h-birthday-2026",
};

export function middleware(request: NextRequest) {
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

  const mappedSlug = DOMAIN_TO_SLUG[hostname];
  if (mappedSlug && !pathname.startsWith(`/e/${mappedSlug}`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? `/e/${mappedSlug}` : pathname;
    if (pathname === "/") {
      return NextResponse.rewrite(url);
    }
  }

  if (hostname.endsWith(".localhost") && pathname === "/") {
    const slug = hostname.replace(/\.localhost$/, "");
    if (slug && !slug.includes(".")) {
      const url = request.nextUrl.clone();
      url.pathname = `/e/${slug}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
