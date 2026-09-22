import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildEventFromTemplate } from "./templates";
import {
  countdownTo,
  eventInstant,
  liveEventExtras,
  livePreviewOverlay,
  liveVariant,
  localizeStock,
} from "./live-invites";

describe("live invites", () => {
  it("keeps afternoon times in the afternoon", () => {
    const target = eventInstant("2026-09-22", "5:00 PM");
    assert.equal(target, new Date(2026, 8, 22, 17, 0, 0, 0).getTime());
  });

  it("counts down until the celebration and stops after it", () => {
    const upcoming = countdownTo(
      "2027-06-19",
      "5:00 PM",
      new Date(2026, 8, 22, 12, 0, 0, 0).getTime(),
    );
    assert.ok(upcoming);
    assert.equal(upcoming.status, "upcoming");
    assert.ok(upcoming.days > 200);

    const past = countdownTo(
      "2020-01-01",
      "1:00 PM",
      new Date(2026, 8, 22, 12, 0, 0, 0).getTime(),
    );
    assert.deepEqual(past, {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      status: "past",
    });
    assert.equal(countdownTo("soon", "5:00 PM", Date.now()), null);
  });

  it("marks the celebration day", () => {
    const today = countdownTo(
      "2026-09-22",
      "5:00 PM",
      new Date(2026, 8, 22, 9, 0, 0, 0).getTime(),
    );
    assert.equal(today?.status, "today");
    assert.equal(today?.hours, 8);
  });

  it("seeds a day-of plan without touching other templates", () => {
    assert.equal(liveVariant("golden-hour"), "wedding");
    assert.equal(liveVariant("evening"), null);
    const wedding = liveEventExtras("golden-hour", {
      timeLabel: "4:00 PM",
      venue: "The lawn",
      address: "Houston",
    });
    assert.equal(wedding?.schedule[0]?.time, "4:00 PM");
    assert.equal(wedding?.schedule.length, 4);
    assert.equal(liveEventExtras("evening", { timeLabel: "", venue: "", address: "" }), null);
    assert.equal(
      localizeStock("Play clothes welcome", "es"),
      "Ropa para jugar",
    );
  });

  it("does not rewrite quince schedules or the stationery hero", () => {
    assert.equal(liveVariant("quince-princesa"), null);
    assert.equal(liveVariant("quince-tiara"), null);
    assert.equal(
      liveEventExtras("quince-princesa", {
        timeLabel: "4:00 PM",
        venue: "Parroquia",
        address: "El Centro",
      }),
      null,
    );
    const princesa = buildEventFromTemplate({
      templateId: "quince-princesa",
      ownerId: "owner",
      hostName: "Los Gonzalez",
      title: "Katia Gonzalez",
      slug: "katia",
      dateISO: "2027-05-15",
      timeLabel: "4:00 PM",
      venue: "Parroquia",
      address: "El Centro",
      about: "",
    });
    assert.equal(princesa.heroImage, "/templates/quince-princesa-hero.svg");
    assert.equal(princesa.schedule?.length, 2);
    assert.equal(princesa.parentsLine, "Los Gonzalez");
    const tiara = buildEventFromTemplate({
      templateId: "quince-tiara",
      ownerId: "owner",
      hostName: "Mr. & Mrs. Gonzalez",
      title: "Katia Gonzalez",
      slug: "katia-tiara",
      dateISO: "2027-06-13",
      timeLabel: "1:00 PM",
      venue: "",
      address: "",
      about: "",
    });
    assert.equal(tiara.heroImage, "/templates/quince-tiara-hero.svg");
    assert.equal(tiara.schedule?.[0]?.title, "Mass");
    assert.equal(tiara.schedule?.[1]?.title, "Lunch");
  });

  it("builds a live wedding that keeps the photo as the page background", () => {
    const event = buildEventFromTemplate({
      templateId: "golden-hour",
      ownerId: "owner",
      hostName: "The families",
      title: "Camila and Mateo",
      slug: "camila-mateo",
      dateISO: "2027-06-19",
      timeLabel: "5:00 PM",
      venue: "The Garden House",
      address: "Houston, TX",
      about: "",
    });
    assert.equal(event.templateId, "golden-hour");
    assert.match(event.heroImage, /images\.unsplash\.com/);
    assert.equal(event.schedule?.length, 4);
    assert.equal(event.dressCode, "Cocktail attire — garden formal");
    const preview = livePreviewOverlay("little-arrival");
    assert.equal(preview?.dateISO, "2026-10-17");
    assert.equal(livePreviewOverlay("evening"), null);
  });
});
