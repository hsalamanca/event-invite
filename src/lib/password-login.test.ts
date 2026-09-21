import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { googleLinkUpdate, passwordLoginBlockReason } from "./password-login";

describe("password login verification", () => {
  it("allows legacy accounts that were never sent a verify token", () => {
    assert.equal(
      passwordLoginBlockReason({ emailVerifiedAt: null, verifyToken: null }),
      null,
    );
  });

  it("allows verified accounts", () => {
    assert.equal(
      passwordLoginBlockReason({
        emailVerifiedAt: "2026-01-01T00:00:00.000Z",
        verifyToken: null,
      }),
      null,
    );
  });

  it("blocks a new registration until the email is verified", () => {
    assert.equal(
      passwordLoginBlockReason({
        emailVerifiedAt: null,
        verifyToken: "hashed-token",
      }),
      "email_not_verified",
    );
  });
});

describe("google link", () => {
  it("clears the password on an unverified account", () => {
    const patch = googleLinkUpdate(
      { emailVerifiedAt: null, name: "" },
      "Ada Lovelace",
      "2026-09-21T00:00:00.000Z",
    );
    assert.equal(patch?.passwordHash, "");
    assert.equal(patch?.emailVerifiedAt, "2026-09-21T00:00:00.000Z");
    assert.equal(patch?.name, "Ada Lovelace");
  });

  it("leaves a verified password account unchanged", () => {
    assert.equal(
      googleLinkUpdate(
        { emailVerifiedAt: "2026-01-01T00:00:00.000Z", name: "Ada" },
        "Ada Lovelace",
        "2026-09-21T00:00:00.000Z",
      ),
      null,
    );
  });
});
