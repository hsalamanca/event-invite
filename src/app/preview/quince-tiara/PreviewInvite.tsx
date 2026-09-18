"use client";

import InvitePage from "@/components/invite/InvitePage";
import PreviewPriceChrome from "@/components/marketing/PreviewPriceChrome";
import type { Locale } from "@/lib/i18n/config";
import type { EventRecord } from "@/lib/types";

export default function PreviewInvite({
  event,
  locale,
}: {
  event: EventRecord;
  locale: Locale;
}) {
  return (
    <>
      <PreviewPriceChrome locale={locale} />
      <InvitePage
        event={event}
        locale={locale}
        trackViews={false}
        onRsvpSubmit={async () => undefined}
      />
    </>
  );
}
