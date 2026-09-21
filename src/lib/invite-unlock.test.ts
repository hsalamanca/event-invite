import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  signUnlockSlug,
  unlockCookieGrants,
  withUnlockedSlug,
} from "./invite-unlock";

const secret = "test-auth-secret";

describe("invite unlock cookie", () => {
  it("rejects a raw slug cookie", () => {
    assert.equal(unlockCookieGrants("h-birthday-2026", "h-birthday-2026", secret), false);
  });

  it("accepts only the signed slug", () => {
    const cookie = signUnlockSlug("h-birthday-2026", secret);
    assert.equal(unlockCookieGrants(cookie, "h-birthday-2026", secret), true);
    assert.equal(unlockCookieGrants(cookie, "other-party", secret), false);
  });

  it("rejects a signature from a different secret", () => {
    const cookie = signUnlockSlug("h-birthday-2026", "other-secret");
    assert.equal(unlockCookieGrants(cookie, "h-birthday-2026", secret), false);
  });

  it("keeps previously signed slugs and drops unsigned ones", () => {
    const first = signUnlockSlug("first-party", secret);
    const combined = withUnlockedSlug(`${first},plain-slug`, "second-party", secret);
    assert.equal(unlockCookieGrants(combined, "first-party", secret), true);
    assert.equal(unlockCookieGrants(combined, "second-party", secret), true);
    assert.equal(unlockCookieGrants(combined, "plain-slug", secret), false);
  });
});
