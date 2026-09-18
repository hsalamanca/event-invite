import type { Metadata } from "next";
import TemplateGallery from "@/components/marketing/TemplateGallery";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getRequestLocale } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getDictionary(locale).gallery;
  return { title: t.metaTitle, description: t.support };
}

export default async function MarketplacePage() {
  const locale = await getRequestLocale();
  return <TemplateGallery locale={locale} path="/marketplace" />;
}
