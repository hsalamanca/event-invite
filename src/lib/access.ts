import type { Session } from "next-auth";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import type { EventRecord } from "@/lib/types";

/** Owner of the event, or Ownvite platform admin assisting them. */
export async function canManageEvent(event: EventRecord): Promise<{
  allowed: boolean;
  isAdmin: boolean;
  session: Session | null;
}> {
  const session = (await auth()) as Session | null;
  const isAdmin = isAdminEmail(session?.user?.email);
  if (!event.ownerId) {
    return { allowed: true, isAdmin, session };
  }
  if (!session?.user?.id) {
    return { allowed: false, isAdmin, session };
  }
  const isOwner = event.ownerId === session.user.id;
  return { allowed: isOwner || isAdmin, isAdmin, session };
}
