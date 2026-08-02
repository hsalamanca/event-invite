/**
 * Platform owner / support admins.
 * Set ADMIN_EMAILS (comma-separated) in Vercel env.
 * Defaults include the Ownvite owner so assist tools work out of the box.
 */
const DEFAULT_ADMIN_EMAILS = ["hsalamanca@gmail.com"];

export function getAdminEmails(): string[] {
  const fromEnv = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const merged = new Set([...DEFAULT_ADMIN_EMAILS, ...fromEnv]);
  return [...merged];
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}
