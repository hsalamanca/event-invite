import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import HostStudioShell from "@/components/host/HostStudioShell";
import { isAdminEmail } from "@/lib/admin";
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

  const session = await auth();
  const isAdmin = isAdminEmail(session?.user?.email);
  const isOwner = Boolean(
    session?.user?.id && event.ownerId === session.user.id,
  );

  if (event.ownerId) {
    if (!session?.user?.id) {
      redirect(`/login?callbackUrl=/host/${slug}`);
    }
    if (!isOwner && !isAdmin) {
      redirect("/dashboard");
    }
  }

  const rsvps = await listRsvpsByEventId(event.id);
  const locale = await getRequestLocale();

  return (
    <HostStudioShell
      event={event}
      rsvps={rsvps}
      locale={locale}
      canDelete={isOwner || isAdmin}
      showDashboard={Boolean(session?.user?.id)}
    />
  );
}
