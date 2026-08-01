import type { Metadata } from "next";
import { notFound } from "next/navigation";
import InvitePage from "@/components/invite/InvitePage";
import { getEventBySlug } from "@/lib/events";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return { title: "Invitation not found" };
  return {
    title: event.title,
    description: event.tagline,
    openGraph: {
      title: event.headline,
      description: event.tagline,
      images: [{ url: event.heroImage }],
    },
  };
}

export default async function EventInvitePage({ params }: PageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event || !event.published) notFound();

  return <InvitePage event={event} />;
}
