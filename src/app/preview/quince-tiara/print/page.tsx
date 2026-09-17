import PrintPostcard from "@/components/invite/PrintPostcard";
import { getRequestLocale } from "@/lib/i18n/locale";
import { getQuinceTiaraPreviewEvent } from "@/lib/quince-tiara-preview";

export const dynamic = "force-dynamic";
export const metadata = { title: "Quince tiara postcard · Ownvite" };

export default async function QuinceTiaraPrintPreviewPage() {
  const locale = await getRequestLocale();
  const event = getQuinceTiaraPreviewEvent();

  return (
    <PrintPostcard
      event={event}
      locale={locale}
      inviteUrl="https://ownvite.com/preview/quince-tiara"
      qrUrl=""
    />
  );
}
