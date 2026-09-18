"use client";

import InvitePage from "@/components/invite/InvitePage";
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
    <InvitePage
      event={event}
      locale={locale}
      trackViews={false}
      onRsvpSubmit={async () => undefined}
    />
  );
}
