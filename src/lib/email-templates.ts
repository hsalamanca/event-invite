export function inviteEmailHtml(input: {
  hostName: string;
  title: string;
  dateISO: string;
  timeLabel: string;
  venue: string;
  address: string;
  inviteUrl: string;
  kind: "invite" | "rsvp_reminder" | "event_reminder";
}): string {
  const lead =
    input.kind === "event_reminder"
      ? `Friendly reminder about <strong>${escapeHtml(input.title)}</strong>.`
      : input.kind === "invite"
        ? `You're invited to <strong>${escapeHtml(input.title)}</strong>.`
        : `Please RSVP for <strong>${escapeHtml(input.title)}</strong>.`;

  return `<!doctype html>
<html><body style="margin:0;background:#0F1A2E;color:#F4F0E8;font-family:Georgia,serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0F1A2E;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:520px;background:#1A2744;border:1px solid rgba(201,169,98,0.35);padding:28px;">
        <tr><td style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#C9A962;">Ownvite</td></tr>
        <tr><td style="padding-top:12px;font-size:28px;line-height:1.2;">${escapeHtml(input.title)}</td></tr>
        <tr><td style="padding-top:14px;font-size:16px;line-height:1.5;color:#C9D0DB;">${lead}</td></tr>
        <tr><td style="padding-top:18px;font-size:15px;line-height:1.6;color:#C9D0DB;">
          ${escapeHtml(input.dateISO)} · ${escapeHtml(input.timeLabel)}<br/>
          ${escapeHtml(input.venue)}<br/>
          ${escapeHtml(input.address)}
        </td></tr>
        <tr><td style="padding-top:24px;">
          <a href="${escapeAttr(input.inviteUrl)}" style="display:inline-block;background:#C9A962;color:#0F1A2E;text-decoration:none;padding:12px 18px;font-family:system-ui,sans-serif;font-size:14px;font-weight:600;">
            Open invitation
          </a>
        </td></tr>
        <tr><td style="padding-top:22px;font-size:13px;color:#9BA8BC;font-family:system-ui,sans-serif;">
          Hosted by ${escapeHtml(input.hostName)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function rsvpHostNotificationHtml(input: {
  eventTitle: string;
  guestName: string;
  guestEmail: string;
  attendance: string;
  guestCount: number;
  dietary?: string;
  note?: string;
  mealChoice?: string;
  updated: boolean;
  manageUrl: string;
}): string {
  const lead = input.updated
    ? `<strong>${escapeHtml(input.guestName)}</strong> updated their RSVP for <strong>${escapeHtml(input.eventTitle)}</strong>.`
    : `<strong>${escapeHtml(input.guestName)}</strong> RSVP’d to <strong>${escapeHtml(input.eventTitle)}</strong>.`;

  const extras = [
    input.mealChoice
      ? `<tr><td style="padding-top:8px;font-size:14px;color:#C9D0DB;">Meal: ${escapeHtml(input.mealChoice)}</td></tr>`
      : "",
    input.dietary?.trim()
      ? `<tr><td style="padding-top:8px;font-size:14px;color:#C9D0DB;">Dietary: ${escapeHtml(input.dietary.trim())}</td></tr>`
      : "",
    input.note?.trim()
      ? `<tr><td style="padding-top:8px;font-size:14px;color:#C9D0DB;">Note: ${escapeHtml(input.note.trim())}</td></tr>`
      : "",
  ]
    .filter(Boolean)
    .join("");

  return `<!doctype html>
<html><body style="margin:0;background:#0F1A2E;color:#F4F0E8;font-family:Georgia,serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0F1A2E;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:520px;background:#1A2744;border:1px solid rgba(201,169,98,0.35);padding:28px;">
        <tr><td style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#C9A962;">Ownvite</td></tr>
        <tr><td style="padding-top:12px;font-size:24px;line-height:1.25;">New RSVP</td></tr>
        <tr><td style="padding-top:14px;font-size:16px;line-height:1.5;color:#C9D0DB;">${lead}</td></tr>
        <tr><td style="padding-top:18px;font-size:15px;line-height:1.6;color:#C9D0DB;">
          ${escapeHtml(input.attendance)} · ${input.guestCount} guest${input.guestCount === 1 ? "" : "s"}<br/>
          ${escapeHtml(input.guestEmail)}
        </td></tr>
        ${extras}
        <tr><td style="padding-top:24px;">
          <a href="${escapeAttr(input.manageUrl)}" style="display:inline-block;background:#C9A962;color:#0F1A2E;text-decoration:none;padding:12px 18px;font-family:system-ui,sans-serif;font-size:14px;font-weight:600;">
            View guests
          </a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function rsvpGuestConfirmationHtml(input: {
  guestName: string;
  eventTitle: string;
  hostName: string;
  attendance: string;
  guestCount: number;
  dateISO: string;
  timeLabel: string;
  venue: string;
  address: string;
  thankYouMessage?: string;
  inviteUrl: string;
  editUrl?: string;
  updated: boolean;
}): string {
  const lead = input.updated
    ? `Your RSVP for <strong>${escapeHtml(input.eventTitle)}</strong> was updated.`
    : `Thanks, <strong>${escapeHtml(input.guestName)}</strong> — your RSVP for <strong>${escapeHtml(input.eventTitle)}</strong> is confirmed.`;

  const thanks = input.thankYouMessage?.trim()
    ? `<tr><td style="padding-top:16px;font-size:15px;line-height:1.55;color:#C9D0DB;">${escapeHtml(input.thankYouMessage.trim())}</td></tr>`
    : "";

  const editBtn = input.editUrl
    ? `<tr><td style="padding-top:12px;">
          <a href="${escapeAttr(input.editUrl)}" style="display:inline-block;border:1px solid rgba(201,169,98,0.55);color:#C9A962;text-decoration:none;padding:11px 16px;font-family:system-ui,sans-serif;font-size:14px;font-weight:600;">
            Update your RSVP
          </a>
        </td></tr>`
    : "";

  return `<!doctype html>
<html><body style="margin:0;background:#0F1A2E;color:#F4F0E8;font-family:Georgia,serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0F1A2E;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:520px;background:#1A2744;border:1px solid rgba(201,169,98,0.35);padding:28px;">
        <tr><td style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#C9A962;">Ownvite</td></tr>
        <tr><td style="padding-top:12px;font-size:24px;line-height:1.25;">RSVP confirmed</td></tr>
        <tr><td style="padding-top:14px;font-size:16px;line-height:1.5;color:#C9D0DB;">${lead}</td></tr>
        ${thanks}
        <tr><td style="padding-top:18px;font-size:15px;line-height:1.6;color:#C9D0DB;">
          ${escapeHtml(input.attendance)} · ${input.guestCount} guest${input.guestCount === 1 ? "" : "s"}<br/>
          ${escapeHtml(input.dateISO)} · ${escapeHtml(input.timeLabel)}<br/>
          ${escapeHtml(input.venue)}<br/>
          ${escapeHtml(input.address)}
        </td></tr>
        <tr><td style="padding-top:24px;">
          <a href="${escapeAttr(input.inviteUrl)}" style="display:inline-block;background:#C9A962;color:#0F1A2E;text-decoration:none;padding:12px 18px;font-family:system-ui,sans-serif;font-size:14px;font-weight:600;">
            Open invitation
          </a>
        </td></tr>
        ${editBtn}
        <tr><td style="padding-top:22px;font-size:13px;color:#9BA8BC;font-family:system-ui,sans-serif;">
          Hosted by ${escapeHtml(input.hostName)}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, "&#39;");
}
