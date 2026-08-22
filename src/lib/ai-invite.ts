/**
 * Parse freeform invite text into event fields.
 * Uses OpenAI when OPENAI_API_KEY is set; otherwise a deterministic heuristic.
 */

export type ParsedInvite = {
  title: string;
  hostName: string;
  headline: string;
  tagline: string;
  dateISO: string;
  timeLabel: string;
  venue: string;
  address: string;
  about: string;
  suggestedTemplateId: string;
};

const MONTHS: Record<string, string> = {
  january: "01",
  jan: "01",
  february: "02",
  feb: "02",
  march: "03",
  mar: "03",
  april: "04",
  apr: "04",
  may: "05",
  june: "06",
  jun: "06",
  july: "07",
  jul: "07",
  august: "08",
  aug: "08",
  september: "09",
  sep: "09",
  sept: "09",
  october: "10",
  oct: "10",
  november: "11",
  nov: "11",
  december: "12",
  dec: "12",
};

function heuristicParse(text: string): ParsedInvite {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const joined = text.replace(/\s+/g, " ").trim();

  let dateISO = "";
  const iso = joined.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (iso) {
    dateISO = `${iso[1]}-${iso[2]}-${iso[3]}`;
  } else {
    const m = joined.match(
      /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(20\d{2}))?/i,
    );
    if (m) {
      const month = MONTHS[m[1]!.toLowerCase()] || "01";
      const day = String(Number(m[2])).padStart(2, "0");
      const year = m[3] || String(new Date().getFullYear());
      dateISO = `${year}-${month}-${day}`;
    }
  }

  let timeLabel = "7:00 PM";
  const time = joined.match(
    /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)\b/i,
  );
  if (time) {
    const h = Number(time[1]);
    const min = time[2] || "00";
    const ap = time[3]!.replace(/\./g, "").toUpperCase().includes("A")
      ? "AM"
      : "PM";
    timeLabel = `${h}:${min} ${ap}`;
  }

  const atMatch = joined.match(
    /\bat\s+([A-Z][^,.]{2,60})(?:,\s*([^.]{5,80}))?/i,
  );
  const venue = atMatch?.[1]?.trim() || lines[2] || "";
  const address = atMatch?.[2]?.trim() || "";

  const birthday = /birthday|cumplea|turning\s+\d+/i.test(joined);
  const wedding = /wedding|marriage|bridal/i.test(joined);
  const suggestedTemplateId = wedding
    ? "champagne-wedding"
    : birthday
      ? "gold-confetti"
      : "evening";

  const title =
    lines[0]?.slice(0, 80) ||
    (birthday ? "Birthday Celebration" : wedding ? "Wedding Celebration" : "You're Invited");
  const hostName =
    joined.match(/\b(?:from|hosted by|love,)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i)?.[1] ||
    "";

  return {
    title,
    hostName,
    headline: title,
    tagline: lines.slice(1, 3).join(" — ").slice(0, 180) || "Join us for a celebration.",
    dateISO,
    timeLabel,
    venue,
    address,
    about: lines.slice(0, 8).join("\n"),
    suggestedTemplateId,
  };
}

export async function parseInviteText(text: string): Promise<ParsedInvite> {
  const trimmed = text.trim().slice(0, 4000);
  if (!trimmed) {
    throw new Error("Paste some invite details first");
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) return heuristicParse(trimmed);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Extract event invite fields as JSON with keys: title, hostName, headline, tagline, dateISO (YYYY-MM-DD or empty), timeLabel, venue, address, about, suggestedTemplateId (one of: evening, gold-confetti, champagne-wedding, garden, latin-fiesta, blue-modern).",
          },
          { role: "user", content: trimmed },
        ],
      }),
    });
    if (!res.ok) return heuristicParse(trimmed);
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return heuristicParse(trimmed);
    const parsed = JSON.parse(raw) as Partial<ParsedInvite>;
    const fallback = heuristicParse(trimmed);
    return {
      title: String(parsed.title || fallback.title).slice(0, 80),
      hostName: String(parsed.hostName || fallback.hostName).slice(0, 80),
      headline: String(parsed.headline || parsed.title || fallback.headline).slice(0, 120),
      tagline: String(parsed.tagline || fallback.tagline).slice(0, 240),
      dateISO: String(parsed.dateISO || fallback.dateISO).slice(0, 10),
      timeLabel: String(parsed.timeLabel || fallback.timeLabel).slice(0, 40),
      venue: String(parsed.venue || fallback.venue).slice(0, 120),
      address: String(parsed.address || fallback.address).slice(0, 200),
      about: String(parsed.about || fallback.about).slice(0, 2000),
      suggestedTemplateId: String(
        parsed.suggestedTemplateId || fallback.suggestedTemplateId,
      ),
    };
  } catch {
    return heuristicParse(trimmed);
  }
}
