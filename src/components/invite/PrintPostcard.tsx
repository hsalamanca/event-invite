"use client";

import InvitePage from "@/components/invite/InvitePage";
import type { Locale } from "@/lib/i18n/config";
import type { EventRecord } from "@/lib/types";

/** Printable download that mirrors the live web invite cover. */
export default function PrintPostcard({
  event,
  locale = "en",
  inviteUrl,
  qrUrl,
}: {
  event: EventRecord;
  locale?: Locale;
  inviteUrl: string;
  qrUrl: string;
}) {
  return (
    <InvitePage
      event={event}
      locale={locale}
      printCoverOnly
      trackViews={false}
      inviteUrl={inviteUrl}
      qrUrl={qrUrl}
    />
  );
}
