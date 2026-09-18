import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  checkInRsvpPublicFields,
  evaluateEventManageAccess,
  hostStudioDecision,
  managerDeniedStatus,
} from "./access-policy";
import { canAccessGuestPrintSuite } from "./print-access";
import { toPublicEvent } from "./public-event";
import {
  safeAuthRedirect,
  safeCallbackUrl,
  sanitizeCallbackSearch,
} from "./safe-callback-url";
import { safeHttpsUrl } from "./safe-https-url";
import type { EventRecord } from "./types";

const nullOwner = { ownerId: null as string | null, coHostEmails: [] as string[] };
const owned = {
  ownerId: "user_owner",
  coHostEmails: ["cohost@example.com"],
};

describe("canManageEvent / null ownerId", () => {
  it("denies management when ownerId is null and the caller is unauthenticated", () => {
    const decision = evaluateEventManageAccess(nullOwner, null);
    assert.equal(decision.allowed, false);
    assert.equal(managerDeniedStatus({ allowed: decision.allowed, session: null }), 401);
    assert.equal(
      hostStudioDecision({ allowed: decision.allowed, session: null }),
      "login",
    );
  });

  it("denies management when ownerId is null for a signed-in non-admin", () => {
    const session = { user: { id: "user_other", email: "guest@example.com" } };
    const decision = evaluateEventManageAccess(nullOwner, session);
    assert.equal(decision.allowed, false);
    assert.equal(managerDeniedStatus({ allowed: decision.allowed, session }), 403);
    assert.equal(hostStudioDecision({ allowed: decision.allowed, session }), "forbidden");
  });

  it("allows platform admins to manage ownerless seed demos", () => {
    const prev = process.env.ADMIN_EMAILS;
    process.env.ADMIN_EMAILS = "admin@ownvite.test";
    try {
      const session = { user: { id: "admin_1", email: "admin@ownvite.test" } };
      const decision = evaluateEventManageAccess(nullOwner, session);
      assert.equal(decision.allowed, true);
      assert.equal(decision.isAdmin, true);
      assert.equal(managerDeniedStatus({ allowed: decision.allowed, session }), null);
      assert.equal(hostStudioDecision({ allowed: decision.allowed, session }), "ok");
    } finally {
      if (prev === undefined) delete process.env.ADMIN_EMAILS;
      else process.env.ADMIN_EMAILS = prev;
    }
  });

  it("allows the real owner and matching co-host, not a random user", () => {
    const owner = { user: { id: "user_owner", email: "owner@example.com" } };
    const cohost = { user: { id: "user_co", email: "cohost@example.com" } };
    const other = { user: { id: "user_x", email: "x@example.com" } };
    assert.equal(evaluateEventManageAccess(owned, owner).allowed, true);
    assert.equal(evaluateEventManageAccess(owned, cohost).allowed, true);
    assert.equal(evaluateEventManageAccess(owned, other).allowed, false);
    assert.equal(evaluateEventManageAccess(owned, null).allowed, false);
  });
});

describe("unauth /host, export, check-in", () => {
  it("maps unauth host studio to login and APIs to 401", () => {
    const decision = evaluateEventManageAccess(nullOwner, null);
    const access = { allowed: decision.allowed, session: null };
    assert.equal(hostStudioDecision(access), "login");
    assert.equal(managerDeniedStatus(access), 401);
  });

  it("does not include editToken unless the caller is a manager", () => {
    const rsvp = {
      id: "r1",
      name: "Ada",
      email: "ada@example.com",
      attendance: "Joyfully attending",
      guestCount: 1,
      checkedIn: false,
      checkedInAt: null,
      editToken: "secret-edit-token",
    };
    const unauth = checkInRsvpPublicFields(rsvp, false);
    assert.equal("editToken" in unauth, false);
    const host = checkInRsvpPublicFields(rsvp, true);
    assert.equal(host.editToken, "secret-edit-token");
  });
});

describe("callbackUrl open redirect", () => {
  it("allows same-origin relative paths", () => {
    assert.equal(safeCallbackUrl("/dashboard"), "/dashboard");
    assert.equal(safeCallbackUrl("/host/h-birthday-2026"), "/host/h-birthday-2026");
    assert.equal(safeCallbackUrl("/events/new?x=1"), "/events/new?x=1");
  });

  it("allows explicit ownvite.com / ownvite.app apex and www hosts", () => {
    assert.equal(
      safeCallbackUrl("https://ownvite.com/dashboard"),
      "https://ownvite.com/dashboard",
    );
    assert.equal(
      safeCallbackUrl("https://www.ownvite.app/host/x"),
      "https://www.ownvite.app/host/x",
    );
  });

  it("rejects off-site, protocol-relative, and scheme abuse", () => {
    assert.equal(safeCallbackUrl("https://evil.example/phish"), "/dashboard");
    assert.equal(safeCallbackUrl("//evil.example/phish"), "/dashboard");
    assert.equal(safeCallbackUrl("https://ownvite.com.evil.example/"), "/dashboard");
    assert.equal(safeCallbackUrl("javascript:alert(1)"), "/dashboard");
    assert.equal(
      safeCallbackUrl("https://h-birthday-2026.ownvite.app/"),
      "/dashboard",
    );
  });

  it("Auth.js redirect does not treat //host as a relative path", () => {
    const base = "https://ownvite.app";
    assert.equal(safeAuthRedirect("//evil.example", base), base);
    assert.equal(
      safeAuthRedirect("/host/h-birthday-2026", base),
      "https://ownvite.app/host/h-birthday-2026",
    );
    assert.equal(
      safeAuthRedirect("https://ownvite.com/dashboard", base),
      "https://ownvite.com/dashboard",
    );
    assert.equal(safeAuthRedirect("https://evil.example", base), base);
  });

  it("strips evil callbackUrl from .app → .com auth search strings", () => {
    const cleaned = sanitizeCallbackSearch(
      "?callbackUrl=https://evil.example/phish&error=OAuthCallback",
    );
    assert.equal(cleaned.includes("evil.example"), false);
    assert.equal(cleaned.includes("callbackUrl=%2Fdashboard"), true);
  });
});

describe("registryUrl / cashFundUrl schemes", () => {
  it("accepts https and rejects javascript, data, relative, and http", () => {
    assert.equal(
      safeHttpsUrl("https://registry.example/list"),
      "https://registry.example/list",
    );
    assert.equal(safeHttpsUrl("javascript:alert(1)"), undefined);
    assert.equal(safeHttpsUrl("data:text/html,hi"), undefined);
    assert.equal(safeHttpsUrl("/relative"), undefined);
    assert.equal(safeHttpsUrl("//evil.example"), undefined);
    assert.equal(safeHttpsUrl("http://registry.example"), undefined);
  });
});

describe("print suite published gate", () => {
  it("requires published for menu / place-cards", () => {
    assert.equal(canAccessGuestPrintSuite(null), false);
    assert.equal(canAccessGuestPrintSuite({ published: false }), false);
    assert.equal(canAccessGuestPrintSuite({ published: true }), true);
  });
});

describe("public GET /api/events/[slug]", () => {
  it("strips invite password hash, co-host emails, and bad gift URLs", () => {
    const event = {
      slug: "h-birthday-2026",
      ownerId: null,
      published: true,
      invitePasswordHash: "$2a$10$not-a-real-hash",
      coHostEmails: ["secret@example.com"],
      lastEditedBy: "owner@example.com",
      registryUrl: "javascript:alert(1)",
      cashFundUrl: "https://cash.example/fund",
    } as EventRecord;
    const pub = toPublicEvent(event);
    assert.equal(pub.invitePasswordHash, null);
    assert.deepEqual(pub.coHostEmails, []);
    assert.equal(pub.lastEditedBy, null);
    assert.equal(pub.registryUrl, null);
    assert.equal(pub.cashFundUrl, "https://cash.example/fund");
  });
});
