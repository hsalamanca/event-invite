/**
 * Canonical attendance derived from the label guests already submitted.
 * Existing RSVP rows keep their `attendance` string. Callers count "yes"
 * from this helper instead of searching for the English substring "attend".
 */

export type AttendanceStatus = "yes" | "no" | "maybe";

export type AttendanceLike = {
  attendance: string;
  status?: AttendanceStatus | null;
  guestCount?: number;
  id?: string;
};

function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const DECLINE =
  /regret|declin|lamento|no poder|cannot|cant\b|wont\b|will not|not coming|no asist|no voy|unable|not attend|no attend|rechaz|no podre|no podria/;

const YES =
  /\battend\b|attending|asistire|asistir|\basisto\b|joyfully|\bgoing\b|\byes\b|acept|confirm|con gusto|with pleasure|count me in|see you|ahi estare|alli estare/;

/** Classify a display label. Decline wins so "Can't attend" and "no poder asistir" are not a yes. */
export function attendanceStatus(label: string): AttendanceStatus {
  const text = fold(label);
  if (!text) return "maybe";
  if (DECLINE.test(text)) return "no";
  if (YES.test(text)) return "yes";
  return "maybe";
}

export function isAttendingRsvp(rsvp: AttendanceLike): boolean {
  if (rsvp.status === "yes") return true;
  if (rsvp.status === "no" || rsvp.status === "maybe") return false;
  return attendanceStatus(rsvp.attendance) === "yes";
}

export function isDecliningRsvp(rsvp: AttendanceLike): boolean {
  if (rsvp.status === "no") return true;
  if (rsvp.status === "yes" || rsvp.status === "maybe") return false;
  return attendanceStatus(rsvp.attendance) === "no";
}

export function seatsTaken(
  rsvps: AttendanceLike[],
  excludeId?: string,
): number {
  return rsvps
    .filter((rsvp) => rsvp.id !== excludeId && isAttendingRsvp(rsvp))
    .reduce((total, rsvp) => total + Math.max(1, rsvp.guestCount || 1), 0);
}

/** True when this yes-reply would pass a positive capacity. Missing capacity never blocks. */
export function exceedsCapacity(input: {
  capacity: number | null | undefined;
  rsvps: AttendanceLike[];
  nextAttendance: string;
  nextGuestCount: number;
  excludeId?: string;
}): boolean {
  if (!input.capacity || input.capacity <= 0) return false;
  if (attendanceStatus(input.nextAttendance) !== "yes") return false;
  const going = seatsTaken(input.rsvps, input.excludeId);
  const next = Math.max(1, input.nextGuestCount || 1);
  return going + next > input.capacity;
}
