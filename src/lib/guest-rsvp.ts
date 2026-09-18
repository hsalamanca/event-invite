/** Guest-facing RSVP JSON: confirmation only — never a privileged editToken. */
export function toGuestRsvpConfirmation(rsvp: {
  id: string;
  name: string;
  attendance: string;
  guestCount: number;
  editToken?: string | null;
  email?: string;
  phone?: string;
}): {
  id: string;
  name: string;
  attendance: string;
  guestCount: number;
} {
  return {
    id: rsvp.id,
    name: rsvp.name,
    attendance: rsvp.attendance,
    guestCount: rsvp.guestCount,
  };
}

/** Token-holder / update responses: RSVP fields without the secret itself. */
export function omitRsvpEditToken<T extends { editToken?: string | null }>(
  rsvp: T,
): Omit<T, "editToken"> {
  const { editToken: _token, ...rest } = rsvp;
  return rest;
}
