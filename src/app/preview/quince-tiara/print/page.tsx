import QRCode from "qrcode";
import PrintPostcard from "@/components/invite/PrintPostcard";
import { getRequestLocale } from "@/lib/i18n/locale";
import { getQuinceTiaraPreviewEvent } from "@/lib/quince-tiara-preview";

export const dynamic = "force-dynamic";
export const metadata = { title: "Quince tiara postcard · Ownvite" };

const INVITE_URL = "https://ownvite.com/preview/quince-tiara";

export default async function QuinceTiaraPrintPreviewPage() {
  const locale = await getRequestLocale();
  const event = getQuinceTiaraPreviewEvent();
  const qrUrl = await QRCode.toDataURL(INVITE_URL, {
    width: 256,
    margin: 1,
    color: { dark: "#6B5E52", light: "#FFFCFA" },
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
