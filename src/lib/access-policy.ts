import { isAdminEmail } from "./admin";

/** Minimal session shape so manage checks stay testable without Auth.js. */
export type ManageSessionLike = {
  user?: { id?: string | null; email?: string | null } | null;
} | null;

export type EventManageTarget = {
  ownerId: string | null;
  coHostEmails?: string[] | null;
};

export type ManageDecision = {
  allowed: boolean;
  isAdmin: boolean;
  isCoHost: boolean;
};

/**
 * Owner, co-host, or Ownvite platform admin.
 * Events with a null ownerId (seed demos) are not world-manageable — only admins.
 */
export function evaluateEventManageAccess(
  event: EventManageTarget,
  session: ManageSessionLike,
): ManageDecision {
  const isAdmin = isAdminEmail(session?.user?.email);
  const email = session?.user?.email?.toLowerCase() ?? "";
  const isCoHost = Boolean(
    email &&
      (event.coHostEmails ?? []).map((e) => e.toLowerCase()).includes(email),
  );

  if (!session?.user?.id) {
    return { allowed: false, isAdmin, isCoHost };
  }

  if (!event.ownerId) {
    return { allowed: isAdmin, isAdmin, isCoHost };
  }

  const isOwner = event.ownerId === session.user.id;
  return {
    allowed: isOwner || isAdmin || isCoHost,
    isAdmin,
    isCoHost,
  };
}

/** Unauthenticated → 401; signed-in but not owner/admin/co-host → 403. */
export function managerDeniedStatus(access: {
  allowed: boolean;
  session: ManageSessionLike;
}): 401 | 403 | null {
  if (access.allowed) return null;
  return access.session?.user?.id ? 403 : 401;
}

export function hostStudioDecision(access: {
  allowed: boolean;
  session: ManageSessionLike;
}): "login" | "forbidden" | "ok" {
  if (!access.session?.user?.id) return "login";
  if (!access.allowed) return "forbidden";
  return "ok";
}

export function checkInRsvpPublicFields<
  T extends {
    id: string;
    name: string;
    email: string;
    attendance: string;
    guestCount: number;
    checkedIn?: boolean;
    checkedInAt?: string | null;
    editToken?: string | null;
  },
>(
  r: T,
  includeEditToken: boolean,
): {
  id: string;
  name: string;
  email: string;
  attendance: string;
  guestCount: number;
  checkedIn: boolean;
  checkedInAt: string | null;
  editToken?: string | null;
} {
  const base = {
    id: r.id,
    name: r.name,
    email: r.email,
    attendance: r.attendance,
    guestCount: r.guestCount,
    checkedIn: Boolean(r.checkedIn),
    checkedInAt: r.checkedInAt ?? null,
  };
  if (!includeEditToken) return base;
  return { ...base, editToken: r.editToken ?? null };
}
