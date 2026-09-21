import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { matchApiRateLimit } from "./rate-limit";

describe("matchApiRateLimit", () => {
  it("caps the routes that were previously unlimited", () => {
    assert.ok(matchApiRateLimit("/api/ai/parse-invite", "POST"));
    assert.ok(matchApiRateLimit("/api/guests/import", "POST"));
    assert.ok(matchApiRateLimit("/api/domains/verify", "POST"));
    assert.ok(matchApiRateLimit("/api/billing/checkout", "POST"));
  });

  it("leaves RSVP reads uncapped", () => {
    assert.equal(matchApiRateLimit("/api/rsvp", "GET"), null);
  });
});
