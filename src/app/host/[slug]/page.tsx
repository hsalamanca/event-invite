import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import HostStudioShell from "@/components/host/HostStudioShell";
import { canManageEvent } from "@/lib/access";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getRequestLocale } from "@/lib/i18n/locale";
import { getEventBySlug } from "@/lib/events";
import { listRsvpsByEventId } from "@/lib/rsvp-store";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: getDictionary(locale).host.customize };
}

export default async function HostEditorPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const access = await canManageEvent(event);

  if (event.ownerId) {
    if (!access.session?.user?.id) {
      redirect(`/login?callbackUrl=/host/${slug}`);
    }
    if (!access.allowed) {
      redirect("/dashboard");
    }
  }

  const rsvps = await listRsvpsByEventId(event.id);
  const locale = await getRequestLocale();
  const isOwner = Boolean(
    access.session?.user?.id && event.ownerId === access.session.user.id,
  );

  // Best-effort: ensure platform subdomains have SSL certs on the edge
  try {
    const { ensurePlatformSubdomains } = await import(
      "@/lib/platform-subdomains"
    );
    await ensurePlatformSubdomains(event.slug);
  } catch {
    /* non-blocking */
  }

  return (
    <HostStudioShell
      event={event}
      rsvps={rsvps}
      locale={locale}
      canDelete={isOwner || access.isAdmin}
      showDashboard={Boolean(access.session?.user?.id)}
    />
  );
}
