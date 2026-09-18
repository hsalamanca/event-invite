import { safeHttpsUrl } from "./safe-https-url";
import type { EventRecord } from "./types";

/** Fields hosts need that must never appear on unauthenticated event JSON. */
export function toPublicEvent(event: EventRecord): EventRecord {
  return {
    ...event,
    invitePasswordHash: null,
    coHostEmails: [],
    lastEditedBy: null,
    registryUrl: safeHttpsUrl(event.registryUrl) ?? null,
    cashFundUrl: event.cashFundUrl
      ? (safeHttpsUrl(event.cashFundUrl) ?? "")
      : event.cashFundUrl,
  };
}
