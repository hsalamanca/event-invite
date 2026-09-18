import type { QuincePartyRole, QuinceVenueBlock } from "./types";

export function newQuinceRoleId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizePartyRoles(raw: unknown): QuincePartyRole[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Partial<QuincePartyRole>;
      const role = String(row.role ?? "").trim();
      const name = String(row.name ?? "").trim();
      if (!role && !name) return null;
      const roleEs = String(
        "roleEs" in row && typeof row.roleEs === "string" ? row.roleEs : "",
      ).trim();
      return {
        id: String(row.id ?? "").trim() || `role_${index}`,
        role,
        name,
        ...(roleEs ? { roleEs } : {}),
      };
    })
    .filter((row): row is QuincePartyRole => row != null);
}

export function filledPartyRoles(
  roles: QuincePartyRole[] | undefined,
): QuincePartyRole[] {
  return (roles ?? []).filter((row) => row.name.trim());
}

export function normalizeVenueBlock(
  raw: unknown,
  fallback?: Partial<QuinceVenueBlock>,
): QuinceVenueBlock {
  const row =
    raw && typeof raw === "object" ? (raw as Partial<QuinceVenueBlock>) : {};
  return {
    place: String(row.place ?? fallback?.place ?? "").trim(),
    address: String(row.address ?? fallback?.address ?? "").trim(),
    time: String(row.time ?? fallback?.time ?? "").trim(),
  };
}

export function venueBlockHasContent(block?: QuinceVenueBlock | null): boolean {
  if (!block) return false;
  return Boolean(block.place || block.address || block.time);
}

export function monogramFromName(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) {
    return parts[0]!.slice(0, 3).toUpperCase();
  }
  return parts
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

/** Script the given name(s); keep the last word as a serif surname when present. */
export function splitHonoreeName(fullName: string): {
  givenName: string;
  surname: string;
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { givenName: fullName.trim(), surname: "" };
  }
  return {
    givenName: parts.slice(0, -1).join(" "),
    surname: parts[parts.length - 1]!,
  };
}

export function digitsOnlyPhone(value: string): string {
  return value.replace(/[^\d]/g, "");
}

export function whatsappHref(phone: string): string | null {
  const digits = digitsOnlyPhone(phone);
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}`;
}

export function mapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

const GENERIC_QUINCE_TITLES = new Set([
  "quinceañera",
  "quinceanera",
  "mis xv años",
  "mis xv anos",
  "quince",
  "xv años",
  "xv anos",
]);

export function isGenericQuinceTitle(title: string): boolean {
  return GENERIC_QUINCE_TITLES.has(title.trim().toLowerCase());
}
