import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PreviewInvite from "@/app/preview/quince-tiara/PreviewInvite";
import { getRequestLocale } from "@/lib/i18n/locale";
import { getCatalogPreviewEvent } from "@/lib/template-gallery";
import { TEMPLATES } from "@/lib/templates";

export const dynamic = "force-dynamic";

type PreviewParams = { templateId: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<PreviewParams>;
}): Promise<Metadata> {
  const { templateId } = await params;
  const tpl = TEMPLATES.find((t) => t.id === templateId);
  if (!tpl) return { title: "Preview" };
  return { title: `${tpl.name} preview` };
}

export default async function CatalogPreviewPage({
  params,
}: {
  params: Promise<PreviewParams>;
}) {
  const { templateId } = await params;
  const locale = await getRequestLocale();
  const event = getCatalogPreviewEvent(templateId);
  if (!event) notFound();

  return (
    <div className="relative">
      <div className="absolute right-3 top-3 z-30 sm:right-5 sm:top-5">
        <LanguageSwitcher locale={locale} variant="invite" />
      </div>
      <PreviewInvite event={event} locale={locale} />
    </div>
  );
}
