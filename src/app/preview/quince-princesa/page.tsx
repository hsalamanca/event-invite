import { getRequestLocale } from "@/lib/i18n/locale";
import { getQuincePrincesaPreviewEvent } from "@/lib/quince-princesa-preview";
import PreviewInvite from "../quince-tiara/PreviewInvite";

export const dynamic = "force-dynamic";
export const metadata = { title: "Quince princesa preview" };

export default async function QuincePrincesaPreviewPage() {
  const locale = await getRequestLocale();
  const event = getQuincePrincesaPreviewEvent();

  return <PreviewInvite event={event} locale={locale} />;
}
