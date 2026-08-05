import type { EventRecord, EventTier } from "./types";

export function isPaidTier(tier: EventTier | undefined): boolean {
  return tier === "pro" || tier === "studio";
}

export function eventIsPro(event: Pick<EventRecord, "tier">): boolean {
  return isPaidTier(event.tier);
}

/** Free tier email blast soft cap per remind call. */
export const FREE_EMAIL_BLAST_CAP = 15;
/** Pro / Studio included blast size per remind call. */
export const PRO_EMAIL_BLAST_CAP = 500;
/** Emails granted by one Reminder Pack purchase. */
export const REMINDER_PACK_CREDITS = 100;
/** SMS/WhatsApp credits granted by one SMS Pack purchase. */
export const SMS_PACK_CREDITS = 50;
/** Active published events allowed on Studio. */
export const STUDIO_ACTIVE_EVENT_LIMIT = 5;

export function shouldShowOwnviteFooter(event: EventRecord): boolean {
  if (event.whiteLabel) return false;
  if (eventIsPro(event)) return false;
  return event.showOwnviteFooter !== false;
}

export function isWhiteLabel(event: EventRecord): boolean {
  return Boolean(event.whiteLabel);
}

export function emailBlastCap(event: EventRecord): number {
  if (eventIsPro(event)) return PRO_EMAIL_BLAST_CAP;
  const credits = Math.max(0, event.emailCredits ?? 0);
  // Free hosts can still use purchased reminder credits beyond the free cap.
  return Math.max(FREE_EMAIL_BLAST_CAP, credits > 0 ? credits : FREE_EMAIL_BLAST_CAP);
}

/** How many emails this blast may send (min of targets, tier cap, and credits on Free). */
export function emailBlastAllowance(
  event: EventRecord,
  targetCount: number,
): { allowance: number; useCredits: number; cap: number } {
  const cap = eventIsPro(event) ? PRO_EMAIL_BLAST_CAP : FREE_EMAIL_BLAST_CAP;
  const credits = Math.max(0, event.emailCredits ?? 0);

  if (eventIsPro(event)) {
    const allowance = Math.min(targetCount, PRO_EMAIL_BLAST_CAP);
    return { allowance, useCredits: 0, cap: PRO_EMAIL_BLAST_CAP };
  }

  // Free: first FREE_EMAIL_BLAST_CAP are included; extra need credits.
  if (targetCount <= FREE_EMAIL_BLAST_CAP) {
    return {
      allowance: targetCount,
      useCredits: 0,
      cap: FREE_EMAIL_BLAST_CAP,
    };
  }
  const extra = targetCount - FREE_EMAIL_BLAST_CAP;
  const fromCredits = Math.min(extra, credits);
  const allowance = FREE_EMAIL_BLAST_CAP + fromCredits;
  return {
    allowance,
    useCredits: fromCredits,
    cap: FREE_EMAIL_BLAST_CAP + credits,
  };
}

export function canUsePremiumTemplate(
  event: Pick<EventRecord, "tier" | "premiumTheme" | "unlockedTemplateIds">,
  templateId: string,
  templateIsPremium: boolean,
): boolean {
  if (!templateIsPremium) return true;
  if (eventIsPro(event) || event.premiumTheme) return true;
  return (event.unlockedTemplateIds ?? []).includes(templateId);
}

export function canUseCheckIn(event: Pick<EventRecord, "tier">): boolean {
  return eventIsPro(event);
}

export function canUseSeating(event: Pick<EventRecord, "tier">): boolean {
  return eventIsPro(event);
}

export function canUsePrivateInvite(
  event: Pick<EventRecord, "tier">,
): boolean {
  return eventIsPro(event);
}
