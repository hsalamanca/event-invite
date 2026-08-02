/**
 * Allow organizers to use a small set of HTML tags in the About section.
 * Allowed: h1–h6, b, strong, br, i, em, p
 * Everything else is escaped. Attributes are stripped.
 */

const ALLOWED_TAGS = new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "b",
  "strong",
  "br",
  "i",
  "em",
  "p",
]);

function escapeText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Strip tags for plain-text contexts (ICS, meta, etc.). */
export function stripAboutHtml(input: string): string {
  return input
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\/\s*h[1-6]\s*>/gi, "\n")
    .replace(/<\/\s*p\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Sanitize About HTML for safe rendering.
 * Plain text (no tags) keeps newlines as <br>.
 */
export function sanitizeAboutHtml(input: string): string {
  const raw = (input ?? "").trim();
  if (!raw) return "";

  // Fast path: no angle brackets → escape + preserve line breaks
  if (!/[<>]/.test(raw)) {
    return escapeText(raw).replace(/\r\n|\r|\n/g, "<br />");
  }

  const tokenRe =
    /<!--[\s\S]*?-->|<\/?\s*([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>|[^<]+|</g;
  let out = "";
  let match: RegExpExecArray | null;

  while ((match = tokenRe.exec(raw)) !== null) {
    const token = match[0];

    if (token.startsWith("<!--")) continue;

    if (token.startsWith("<")) {
      const tagMatch = token.match(/^<\/?\s*([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>$/);
      if (!tagMatch) {
        out += escapeText(token);
        continue;
      }
      const name = tagMatch[1]!.toLowerCase();
      if (!ALLOWED_TAGS.has(name)) {
        out += escapeText(token);
        continue;
      }
      const closing = /^<\//.test(token);
      if (name === "br") {
        out += "<br />";
        continue;
      }
      out += closing ? `</${name}>` : `<${name}>`;
      continue;
    }

    out += escapeText(token);
  }

  return out;
}
