import type { Session } from "next-auth";
import { auth } from "@/auth";
import {
  checkInRsvpPublicFields,
  evaluateEventManageAccess,
  hostStudioDecision,
  managerDeniedStatus,
  type EventManageTarget,
} from "@/lib/access-policy";
import type { EventRecord } from "@/lib/types";

export {
  checkInRsvpPublicFields,
  evaluateEventManageAccess,
  hostStudioDecision,
  managerDeniedStatus,
};
export type { EventManageTarget };

/** Owner, co-host, or Ownvite platform admin. Null ownerId is not world-manageable. */
export async function canManageEvent(event: EventRecord): Promise<{
  allowed: boolean;
  isAdmin: boolean;
  isCoHost: boolean;
  session: Session | null;
}> {
  const session = (await auth()) as Session | null;
  const decision = evaluateEventManageAccess(event, session);
  return { ...decision, session };
}
