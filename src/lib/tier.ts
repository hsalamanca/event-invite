import type { EventRecord, EventTier } from "./types";

export function isPaidTier(tier: EventTier | undefined): boolean {
  return tier === "pro" || tier === "studio";
}

export function eventIsPro(event: Pick<EventRecord, "tier">): boolean {
  return isPaidTier(event.tier);
}

/** Free tier email blast soft cap per remind call / day is enforced in remind route. */
export const FREE_EMAIL_BLAST_CAP = 15;

export function shouldShowOwnviteFooter(event: EventRecord): boolean {
  if (eventIsPro(event)) return false;
  return event.showOwnviteFooter !== false;
}
