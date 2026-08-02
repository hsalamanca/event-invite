import type { Session } from "next-auth";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import type { EventRecord } from "@/lib/types";

/** Owner, co-host, or Ownvite platform admin. */
export async function canManageEvent(event: EventRecord): Promise<{
  allowed: boolean;
  isAdmin: boolean;
  isCoHost: boolean;
  session: Session | null;
}> {
  const session = (await auth()) as Session | null;
  const isAdmin = isAdminEmail(session?.user?.email);
  const email = session?.user?.email?.toLowerCase() ?? "";
  const isCoHost = Boolean(
    email && (event.coHostEmails ?? []).map((e) => e.toLowerCase()).includes(email),
  );

  if (!event.ownerId) {
    return { allowed: true, isAdmin, isCoHost, session };
  }
  if (!session?.user?.id) {
    return { allowed: false, isAdmin, isCoHost, session };
  }
  const isOwner = event.ownerId === session.user.id;
  return {
    allowed: isOwner || isAdmin || isCoHost,
    isAdmin,
    isCoHost,
    session,
  };
}
