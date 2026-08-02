import type { Metadata } from "next";
import PricingPageView from "@/components/marketing/PricingPage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getRequestLocale } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getDictionary(locale).pricing;
  return { title: t.title, description: t.support };
}

export default async function PricingPage() {
  const locale = await getRequestLocale();
  return <PricingPageView locale={locale} />;
}
