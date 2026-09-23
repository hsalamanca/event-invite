import { getRequestLocale } from "@/lib/i18n/locale";
import { getQuinceTiaraPreviewEvent } from "@/lib/quince-tiara-preview";
import PreviewInvite from "./PreviewInvite";

export const dynamic = "force-dynamic";
export const metadata = { title: "Quince tiara preview" };

export default async function QuinceTiaraPreviewPage() {
  const locale = await getRequestLocale();
  const event = getQuinceTiaraPreviewEvent();

  return <PreviewInvite event={event} locale={locale} />;
}
