import { sendEventEmail } from "@/lib/email";
import { rsvpHostNotificationHtml } from "@/lib/email-templates";
import { appBaseUrl } from "@/lib/mail";
import type { EventRecord, RsvpSubmission } from "@/lib/types";
import { findUserById } from "@/lib/users";

/** Resolve emails that should receive host RSVP alerts. */
export async function resolveRsvpNotifyRecipients(
  event: EventRecord,
): Promise<string[]> {
  const recipients = new Set<string>();

  if (event.ownerId) {
    const owner = await findUserById(event.ownerId);
    if (owner?.email) recipients.add(owner.email.trim().toLowerCase());
  }

  for (const email of event.coHostEmails ?? []) {
    if (email?.trim()) recipients.add(email.trim().toLowerCase());
  }

  // Also notify the listed contact inbox (deduped with owner/co-hosts).
  if (event.contactEmail?.trim()) {
    recipients.add(event.contactEmail.trim().toLowerCase());
  }

  return [...recipients];
}

/**
 * Email the event owner (and co-hosts) when a guest RSVPs or updates.
 * Failures are logged; they never block the RSVP response.
 */
export async function notifyHostsOfRsvp(input: {
  event: EventRecord;
  rsvp: RsvpSubmission;
  updated?: boolean;
}): Promise<void> {
  const { event, rsvp } = input;
  const updated = Boolean(input.updated);

  try {
    const recipients = await resolveRsvpNotifyRecipients(event);
    if (recipients.length === 0) {
      console.info(
        "[rsvp-notify] no host recipients for event",
        event.slug ?? event.id,
      );
      return;
    }

    const manageUrl = `${appBaseUrl()}/host/${event.slug}`;
    const subject = updated
      ? `RSVP updated: ${rsvp.name} · ${event.title}`
      : `New RSVP: ${rsvp.name} · ${event.title}`;

    const body = [
      updated
        ? `${rsvp.name} updated their RSVP for ${event.title}.`
        : `${rsvp.name} RSVP’d to ${event.title}.`,
      "",
      `Attendance: ${rsvp.attendance}`,
      `Guests: ${rsvp.guestCount}`,
      `Email: ${rsvp.email}`,
      rsvp.mealChoice ? `Meal: ${rsvp.mealChoice}` : null,
      rsvp.dietary?.trim() ? `Dietary: ${rsvp.dietary.trim()}` : null,
      rsvp.note?.trim() ? `Note: ${rsvp.note.trim()}` : null,
      "",
      `Manage guests: ${manageUrl}`,
      "",
      "— Ownvite",
    ]
      .filter((line) => line != null)
      .join("\n");

    const html = rsvpHostNotificationHtml({
      eventTitle: event.title,
      guestName: rsvp.name,
      guestEmail: rsvp.email,
      attendance: rsvp.attendance,
      guestCount: rsvp.guestCount,
      dietary: rsvp.dietary,
      note: rsvp.note,
      mealChoice: rsvp.mealChoice,
      updated,
      manageUrl,
    });

    await Promise.all(
      recipients.map((to) =>
        sendEventEmail({
          eventId: event.id,
          type: "rsvp_notification",
          to,
          subject,
          body,
          html,
        }),
      ),
    );
  } catch (err) {
    console.error("[rsvp-notify] failed", err);
  }
}
