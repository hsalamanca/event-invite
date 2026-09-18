import QRCode from "qrcode";
import PrintPostcard from "@/components/invite/PrintPostcard";
import { getRequestLocale } from "@/lib/i18n/locale";
import { getQuincePrincesaPreviewEvent } from "@/lib/quince-princesa-preview";

export const dynamic = "force-dynamic";
export const metadata = { title: "Quince princesa postcard" };

const INVITE_URL = "https://ownvite.com/preview/quince-princesa";

export default async function QuincePrincesaPrintPreviewPage() {
  const locale = await getRequestLocale();
  const event = getQuincePrincesaPreviewEvent();
  const qrUrl = await QRCode.toDataURL(INVITE_URL, {
    width: 256,
    margin: 1,
    color: { dark: "#3A2A30", light: "#FFF7F9" },
  });

  return (
    <PrintPostcard
      event={event}
      locale={locale}
      inviteUrl={INVITE_URL}
      qrUrl={qrUrl}
    />
  );
}
