import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  attendanceStatus,
  exceedsCapacity,
  isAttendingRsvp,
  isDecliningRsvp,
  seatsTaken,
} from "./attendance";

describe("attendance status", () => {
  it("keeps English yes and no labels", () => {
    assert.equal(attendanceStatus("Joyfully attending"), "yes");
    assert.equal(attendanceStatus("Regretfully declining"), "no");
    assert.equal(isAttendingRsvp({ attendance: "Joyfully attending" }), true);
    assert.equal(isDecliningRsvp({ attendance: "Regretfully declining" }), true);
  });

  it("counts Spanish yes replies that do not contain 'attend'", () => {
    assert.equal(attendanceStatus("Asistiré con gusto"), "yes");
    assert.equal(attendanceStatus("Lamento no poder asistir"), "no");
    assert.equal(isAttendingRsvp({ attendance: "Asistiré con gusto" }), true);
    assert.equal(isAttendingRsvp({ attendance: "Lamento no poder asistir" }), false);
  });

  it("does not treat a decline that mentions attending as a yes", () => {
    assert.equal(attendanceStatus("Can't attend"), "no");
    assert.equal(isAttendingRsvp({ attendance: "Can't attend" }), false);
  });

  it("leaves unsure replies out of the headcount", () => {
    assert.equal(attendanceStatus("Not sure yet"), "maybe");
    assert.equal(isAttendingRsvp({ attendance: "Not sure yet" }), false);
  });

  it("trusts a stored status without rewriting the label", () => {
    assert.equal(
      isAttendingRsvp({ attendance: "Asistiré con gusto", status: "no" }),
      false,
    );
    assert.equal(
      isAttendingRsvp({ attendance: "Regretfully declining", status: "yes" }),
      true,
    );
  });
});

describe("capacity", () => {
  const rsvps = [
    { id: "en", attendance: "Joyfully attending", guestCount: 2 },
    { id: "es", attendance: "Asistiré con gusto", guestCount: 1 },
    { id: "no", attendance: "Lamento no poder asistir", guestCount: 4 },
  ];

  it("counts English and Spanish yes replies and ignores declines", () => {
    assert.equal(seatsTaken(rsvps), 3);
  });

  it("blocks another yes when the derived headcount fills the event", () => {
    assert.equal(
      exceedsCapacity({
        capacity: 3,
        rsvps,
        nextAttendance: "Joyfully attending",
        nextGuestCount: 1,
      }),
      true,
    );
    assert.equal(
      exceedsCapacity({
        capacity: 3,
        rsvps,
        nextAttendance: "Regretfully declining",
        nextGuestCount: 2,
      }),
      false,
    );
  });

  it("lets a guest replace their own yes without double counting", () => {
    assert.equal(
      exceedsCapacity({
        capacity: 3,
        rsvps,
        nextAttendance: "Asistiré con gusto",
        nextGuestCount: 1,
        excludeId: "es",
      }),
      false,
    );
  });
});
