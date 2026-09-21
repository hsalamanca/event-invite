/**
 * Password login is blocked only when this account was issued a verification
 * token and has not used it. Older accounts with no token stay able to sign in
 * without a users.json rewrite.
 */
export function passwordLoginBlockReason(user: {
  emailVerifiedAt?: string | null;
  verifyToken?: string | null;
}): "email_not_verified" | null {
  if (user.emailVerifiedAt) return null;
  if (!user.verifyToken) return null;
  return "email_not_verified";
}

/**
 * Google proves the email. Linking onto an unverified password account drops
 * that password so a pre-created account cannot keep a back door.
 * Verified accounts keep their password.
 */
export function googleLinkUpdate(
  existing: { emailVerifiedAt?: string | null; name: string },
  googleName: string,
  now: string,
): {
  emailVerifiedAt: string;
  verifyToken: null;
  verifyTokenExpires: null;
  passwordHash: string;
  name: string;
} | null {
  if (existing.emailVerifiedAt) return null;
  return {
    emailVerifiedAt: now,
    verifyToken: null,
    verifyTokenExpires: null,
    passwordHash: "",
    name: existing.name || googleName,
  };
}
