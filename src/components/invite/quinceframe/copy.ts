import { stripAboutHtml } from "@/lib/sanitize-about";
import type { ScheduleItem } from "@/lib/types";

/**
 * Quince tiara / quinceframe field mapping
 *
 * HostLine      ← event.hostName (parents) + i18n invite phrase
 * EventScript   ← i18n “Quinceañera”
 * RelationLine  ← tagline if it is a relation line; else i18n “of their daughter”
 * HonoreeName   ← localized headline (fallback: title) — placeholders only
 * DateLine      ← dateISO labels
 * MassLine      ← “Mass at” + schedule misa item or venue/address + time
 * LunchBlock    ← “Celebratory Lunch at” + schedule comida/about
 * RsvpBlock     ← “Rsvp to” + contactName / at phone / by deadline
 */
export type QuinceFrameCopy = {
  hostLine: string;
  eventScript: string;
  relationLine: string;
  honoreeName: string;
  dateLine: string;
  massLabel: string;
  massDetail: string;
  lunchLabel: string;
  lunchDetail: string;
  rsvpHeader: string;
  rsvpDetail: string;
};

export type QuinceFrameCopyInput = {
  hostName: string;
  headline: string;
  title: string;
  tagline: string;
  about: string;
  dateLabel: string;
  weekdayLabel?: string;
  dateShortLabel?: string;
  timeLabel: string;
  venue: string;
  address: string;
  schedule?: ScheduleItem[];
  contactName?: string;
  contactPhone?: string;
  rsvpDeadlineLabel?: string;
  eventScript: string;
  parentsInvite: string;
  relationPrefix: string;
  massAt: string;
  lunchAt: string;
  rsvpTo: string;
  timePrep: string;
  rsvpAt?: string;
  rsvpBy?: string;
};

const MASS_KEYS = [
  "misa",
  "mass",
  "iglesia",
  "church",
  "acción de gracias",
  "accion de gracias",
];

const LUNCH_KEYS = [
  "comida",
  "lunch",
  "reception",
  "recepción",
  "recepcion",
  "banquete",
  "almuerzo",
  "almuerzo celebratorio",
];

function haystack(item: ScheduleItem): string {
  return [item.title, item.titleEs, item.description, item.descriptionEs]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function findScheduleItem(
  schedule: ScheduleItem[] | undefined,
  keys: string[],
): ScheduleItem | undefined {
  return schedule?.find((item) =>
    keys.some((key) => haystack(item).includes(key)),
  );
}

function joinLines(...parts: Array<string | undefined>): string {
  return parts
    .map((part) => (part ?? "").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

function joinDetail(...parts: Array<string | undefined>): string {
  return parts
    .map((part) => (part ?? "").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join(", ");
}

function lunchFromAbout(about: string): string {
  const plain = stripAboutHtml(about).replace(/\s+/g, " ").trim();
  if (!plain) return "";
  const sentence = plain.split(/(?<=[.!?])\s+/)[0] ?? plain;
  return sentence.length > 96 ? `${sentence.slice(0, 93).trim()}…` : sentence;
}

function isRelationTagline(tagline: string, prefix: string): boolean {
  const lower = tagline.trim().toLowerCase();
  return (
    lower.startsWith("hija de") ||
    lower.startsWith("hijo de") ||
    lower.startsWith("daughter of") ||
    lower.startsWith("of their daughter") ||
    lower.startsWith("de su hija") ||
    (Boolean(prefix) && lower.startsWith(prefix.trim().toLowerCase()))
  );
}

export function resolveQuinceFrameCopy(
  input: QuinceFrameCopyInput,
): QuinceFrameCopy {
  const parents = input.hostName.trim();
  const honoreeName = (input.headline || input.title).trim();
  const tagline = stripAboutHtml(input.tagline).trim();

  const hostLine = parents
    ? joinLines(parents, input.parentsInvite)
    : input.parentsInvite;

  const relationLine = tagline
    ? isRelationTagline(tagline, input.relationPrefix)
      ? tagline
      : tagline
    : input.relationPrefix;

  const dateLine = [input.weekdayLabel, input.dateShortLabel || input.dateLabel]
    .filter(Boolean)
    .join(", ");

  const massItem = findScheduleItem(input.schedule, MASS_KEYS);
  const lunchItem = findScheduleItem(input.schedule, LUNCH_KEYS);

  const massPlace = massItem
    ? massItem.description || joinDetail(input.venue, input.address)
    : joinDetail(input.venue, input.address);
  const massTime = massItem?.time || input.timeLabel;
  const massDetail = [massPlace, massTime]
    .filter(Boolean)
    .join(` ${input.timePrep} `);

  const lunchDetail = lunchItem
    ? joinLines(lunchItem.description, lunchItem.time ? `${input.timePrep} ${lunchItem.time}` : "")
    : lunchFromAbout(input.about);

  const contactName = input.contactName?.trim() || "";
  const contactPhone = input.contactPhone?.trim() || "";
  const deadline = input.rsvpDeadlineLabel?.trim() || "";
  const atPrep = (input.rsvpAt || input.timePrep || "at").trim();
  const byPrep = (input.rsvpBy || "by").trim();
  const rsvpDetail = joinLines(
    contactName,
    contactPhone ? `${atPrep} ${contactPhone}` : "",
    deadline ? `${byPrep} ${deadline}` : "",
  );

  return {
    hostLine,
    eventScript: input.eventScript,
    relationLine,
    honoreeName,
    dateLine,
    massLabel: input.massAt,
    massDetail,
    lunchLabel: input.lunchAt,
    lunchDetail,
    rsvpHeader: input.rsvpTo,
    rsvpDetail,
  };
}
