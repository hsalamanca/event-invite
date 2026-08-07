import { NextResponse } from "next/server";
import { canManageEvent } from "@/lib/access";
import { rebindSlug } from "@/lib/domain-store";
import { getPlatformDomains } from "@/lib/dns-instructions";
import { getEventBySlug, updateEvent } from "@/lib/events";
import {
  ensurePlatformSubdomains,
  releasePlatformSubdomains,
} from "@/lib/platform-subdomains";
import { validatePlatformSubdomainLabel } from "@/lib/slug";

export const runtime = "nodejs";

/**
 * Rename the free Ownvite platform subdomain ({label}.ownvite.app / .com)
 * by updating the event slug and reprovisioning SSL hosts.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as { slug?: string; subdomain?: string };
  const currentSlug = String(data.slug ?? "").trim();
  const validated = validatePlatformSubdomainLabel(String(data.subdomain ?? ""));
  if (!currentSlug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }
  const nextSlug = validated.slug;

  const event = await getEventBySlug(currentSlug);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const access = await canManageEvent(event);
  if (!access.allowed) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { apex, app } = getPlatformDomains();
  const platformUrls = {
    path: `https://${apex}/e/${nextSlug}`,
    subdomain: `https://${nextSlug}.${app}`,
    subdomainCom: `https://${nextSlug}.${apex}`,
  };

  if (nextSlug === currentSlug) {
    // Still ensure SSL certs exist for the current label.
    const provisioned = await ensurePlatformSubdomains(nextSlug);
    return NextResponse.json({
      ok: true,
      slug: nextSlug,
      platformUrls,
      provisioned,
      unchanged: true,
    });
  }

  let updated;
  try {
    updated = await updateEvent(currentSlug, { slug: nextSlug });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update subdomain";
    return NextResponse.json({ error: message }, { status: 409 });
  }
  if (!updated) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  await rebindSlug(currentSlug, nextSlug, event.id);

  const provisioned = await ensurePlatformSubdomains(nextSlug);
  // Best-effort: free old hosts so certs/names don't linger.
  void releasePlatformSubdomains(currentSlug);

  return NextResponse.json({
    ok: true,
    slug: nextSlug,
    event: updated,
    platformUrls,
    provisioned,
  });
}
