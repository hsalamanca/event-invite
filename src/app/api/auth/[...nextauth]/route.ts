import type { NextRequest } from "next/server";
import { handlers } from "@/auth";
import { withPinnedAuthUrl } from "@/lib/auth-host";

/**
 * Auth.js v5 builds Google redirect_uri from AUTH_URL when that env is set.
 * Pin AUTH_URL to the request origin for this invocation so PKCE is set and
 * consumed on the same host (ownvite.com / www / ownvite.app).
 */
export async function GET(request: NextRequest) {
  return withPinnedAuthUrl(request, () => handlers.GET(request));
}

export async function POST(request: NextRequest) {
  return withPinnedAuthUrl(request, () => handlers.POST(request));
}
