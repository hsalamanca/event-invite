/**
 * A verification email is sent for new accounts, but it does not lock the
 * password. Otherwise Create account signs the host out until they open the
 * inbox, and Google is the only way into a new account.
 * Older accounts with no token were already able to sign in.
 */
export function passwordLoginBlockReason(_user: {
  emailVerifiedAt?: string | null;
  verifyToken?: string | null;
}): "email_not_verified" | null {
  return null;
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
