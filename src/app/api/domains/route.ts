import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  buildDnsInstructions,
  getPlatformDomains,
  isPlatformDomain,
  isValidHostname,
  normalizeDomain,
} from "@/lib/dns-instructions";
import {
  getBindingBySlug,
  removeBinding,
  upsertBinding,
} from "@/lib/domain-store";
import { getEventBySlug, updateEvent } from "@/lib/events";
import {
  addDomainToProject,
  removeDomainFromProject,
} from "@/lib/vercel-domains";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }
  const binding = await getBindingBySlug(slug);
  const event = await getEventBySlug(slug);
  const { apex, app } = getPlatformDomains();
  return NextResponse.json({
    binding: binding ?? null,
    eventDomain: event?.customDomain ?? null,
    platformUrls: event
      ? {
          path: `https://${apex}/e/${slug}`,
          subdomain: `https://${slug}.${app}`,
          subdomainCom: `https://${slug}.${apex}`,
          label: slug,
          appSuffix: `.${app}`,
          comSuffix: `.${apex}`,
        }
      : null,
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as { slug?: string; domain?: string };
  const slug = String(data.slug ?? "").trim();
  const domain = normalizeDomain(String(data.domain ?? ""));

  if (!slug || !domain) {
    return NextResponse.json(
      { error: "slug and domain are required" },
      { status: 400 }
    );
  }
  if (!isValidHostname(domain)) {
    return NextResponse.json(
      { error: "Enter a valid hostname like party.yourdomain.com" },
      { status: 400 }
    );
  }
  if (isPlatformDomain(domain) && !domain.endsWith(".ownvite.app")) {
    return NextResponse.json(
      {
        error:
          "That domain belongs to Ownvite. Use a subdomain on your own domain, or your free {slug}.ownvite.app link.",
      },
      { status: 400 }
    );
  }

  const event = await getEventBySlug(slug);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const { canManageEvent } = await import("@/lib/access");
  const access = await canManageEvent(event);
  if (!access.allowed) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { eventIsPro } = await import("@/lib/tier");
  const isFreePlatformSub =
    domain.endsWith(".ownvite.app") || domain.endsWith(".ownvite.com");
  if (!eventIsPro(event) && !access.isAdmin && !isFreePlatformSub) {
    return NextResponse.json(
      {
        error:
          "Custom domains are included with Pro Event ($29). Upgrade in Host studio, or use your free {slug}.ownvite.app link.",
        upgradeRequired: true,
      },
      { status: 402 },
    );
  }

  const existing = await getBindingBySlug(slug);
  if (existing && existing.domain !== domain) {
    await removeDomainFromProject(existing.domain);
    await removeBinding(existing.domain);
  }

  const dns = buildDnsInstructions(domain);
  const added = await addDomainToProject(domain);
  if (!added.ok) {
    return NextResponse.json(
      {
        error: added.error ?? "Could not register domain with Ownvite hosting",
        dns,
      },
      { status: 502 }
    );
  }

  const binding = await upsertBinding({
    domain,
    slug,
    eventId: event.id,
    status: added.domain?.verified ? "active" : "pending_dns",
    connectedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    vercelVerified: Boolean(added.domain?.verified),
    error: null,
    dns,
  });

  await updateEvent(slug, { customDomain: domain });

  return NextResponse.json({
    ok: true,
    binding,
    vercel: added.domain ?? null,
    instructions: {
      summary:
        dns[0]?.type === "CNAME"
          ? `Create a CNAME record for “${dns[0].host}” pointing to “${dns[0].value}”.`
          : "Create the A records below for your apex domain.",
      dns,
    },
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const domainParam = searchParams.get("domain");
  if (!slug && !domainParam) {
    return NextResponse.json(
      { error: "slug or domain required" },
      { status: 400 }
    );
  }

  const binding = slug ? await getBindingBySlug(slug) : null;
  const domain = normalizeDomain(domainParam ?? binding?.domain ?? "");
  if (!domain) {
    return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  }

  await removeDomainFromProject(domain);
  await removeBinding(domain);
  if (binding || slug) {
    await updateEvent(binding?.slug ?? slug!, { customDomain: null });
  }

  return NextResponse.json({ ok: true });
}
