import { getEventBySlug } from "@/lib/events";
import { stripAboutHtml } from "@/lib/sanitize-about";

export const runtime = "nodejs";

function icsEscape(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

/** Build a floating local DTSTART from dateISO + rough timeLabel parse. */
function toIcsStart(dateISO: string, timeLabel: string): string {
  const date = dateISO.replace(/-/g, "");
  const match = timeLabel.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
  let hour = 19;
  let minute = 0;
  if (match) {
    hour = Number(match[1]);
    minute = Number(match[2] ?? 0);
    const ampm = match[3]?.toUpperCase();
    if (ampm === "PM" && hour < 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
  }
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  return `${date}T${hh}${mm}00`;
}

function addHours(icsLocal: string, hours: number): string {
  const y = Number(icsLocal.slice(0, 4));
  const mo = Number(icsLocal.slice(4, 6)) - 1;
  const d = Number(icsLocal.slice(6, 8));
  const h = Number(icsLocal.slice(9, 11));
  const mi = Number(icsLocal.slice(11, 13));
  const dt = new Date(y, mo, d, h + hours, mi, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const event = await getEventBySlug(slug);
  if (!event) {
    return new Response("Not found", { status: 404 });
  }

  const start = toIcsStart(event.dateISO, event.timeLabel);
  const end = addHours(start, 3);
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
  const uid = `${event.slug}@ownvite.app`;
  const location = [event.venue, event.address].filter(Boolean).join(", ");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ownvite//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${icsEscape(event.title)}`,
    `DESCRIPTION:${icsEscape(stripAboutHtml(event.about || event.tagline))}`,
    `LOCATION:${icsEscape(location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return new Response(`${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}.ics"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
