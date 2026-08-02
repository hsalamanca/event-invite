import type { Metadata } from "next";
import DomainsGuide from "@/components/marketing/DomainsGuide";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getRequestLocale } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getDictionary(locale).domains;
  return { title: t.title, description: t.support };
}

export default async function DomainsGuidePage() {
  const locale = await getRequestLocale();
  return <DomainsGuide locale={locale} />;
}
