import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";
import { TEMPLATES, buildEventFromTemplate, templateCatalogImage } from "./templates";
import {
  GALLERY_ALIAS_PATHS,
  GALLERY_BIRTHDAY_SAMPLE_PATH,
  GALLERY_CANONICAL_PATH,
  GALLERY_OCCASIONS,
  GALLERY_TEMPLATE_IDS,
  PEEK_DEMO_PATH,
  galleryTemplates,
  getCatalogPreviewEvent,
  templatePreviewPath,
  templateRegisterPath,
  templateUsePath,
  templatesForOccasion,
} from "./template-gallery";

describe("public template gallery", () => {
  it("curates 6–12 catalog templates and leads with quince craft", () => {
    assert.ok(GALLERY_TEMPLATE_IDS.length >= 6);
    assert.ok(GALLERY_TEMPLATE_IDS.length <= 15);
    assert.equal(GALLERY_TEMPLATE_IDS[0], "quince-princesa");
    assert.equal(GALLERY_TEMPLATE_IDS[1], "quince-tiara");
    assert.equal(GALLERY_TEMPLATE_IDS[2], "golden-hour");
    assert.equal(GALLERY_TEMPLATE_IDS[3], "confetti-hour");
    assert.equal(GALLERY_TEMPLATE_IDS[4], "little-arrival");
    for (const id of GALLERY_TEMPLATE_IDS) {
      assert.ok(
        TEMPLATES.some((tpl) => tpl.id === id),
        `missing catalog template ${id}`,
      );
    }
    assert.equal(galleryTemplates().length, GALLERY_TEMPLATE_IDS.length);
    assert.equal(GALLERY_OCCASIONS[0]?.id, "all");
    assert.equal(GALLERY_OCCASIONS[1]?.id, "quince");
    assert.equal(
      templatesForOccasion("quince")[0]?.id,
      "quince-princesa",
    );
    assert.ok(
      templatesForOccasion("quince").every((tpl) =>
        tpl.id.startsWith("quince-"),
      ),
    );
  });

  it("maps preview and use-this to existing create/preview routes", () => {
    assert.equal(templatePreviewPath("quince-princesa"), "/preview/quince-princesa");
    assert.equal(templatePreviewPath("quince-tiara"), "/preview/quince-tiara");
    assert.equal(
      templateUsePath("quince-princesa"),
      "/events/new?template=quince-princesa",
    );
    assert.equal(
      templateRegisterPath("gold-confetti"),
      "/register?callbackUrl=%2Fevents%2Fnew%3Ftemplate%3Dgold-confetti",
    );
    assert.equal(
      templateRegisterPath("quince-princesa"),
      "/register?callbackUrl=%2Fevents%2Fnew%3Ftemplate%3Dquince-princesa",
    );
  });

  it("keeps birthday as a secondary sample and Peek on princesa", () => {
    assert.equal(PEEK_DEMO_PATH, "/preview/quince-princesa");
    assert.equal(GALLERY_BIRTHDAY_SAMPLE_PATH, "/e/h-birthday-2026");
    assert.equal(GALLERY_CANONICAL_PATH, "/marketplace");
    assert.deepEqual(GALLERY_ALIAS_PATHS, ["/templates", "/gallery", "/themes"]);
  });

  it("builds live previews from the registry (quince demos stay dedicated)", () => {
    const princesa = getCatalogPreviewEvent("quince-princesa");
    assert.equal(princesa?.templateId, "quince-princesa");
    assert.equal(princesa?.slug, "quince-princesa-demo");

    const tiara = getCatalogPreviewEvent("quince-tiara");
    assert.equal(tiara?.templateId, "quince-tiara");

    const gold = getCatalogPreviewEvent("gold-confetti");
    assert.equal(gold?.templateId, "gold-confetti");
    assert.equal(gold?.id, "preview-gold-confetti");
    assert.equal(gold?.ownerId, null);

    assert.equal(getCatalogPreviewEvent("not-a-template"), null);
  });

  it("shows real quince stills in the picker without changing invite backgrounds", () => {
    const tiara = TEMPLATES.find((tpl) => tpl.id === "quince-tiara");
    const princesa = TEMPLATES.find((tpl) => tpl.id === "quince-princesa");
    assert.ok(tiara && princesa);
    assert.equal(templateCatalogImage(tiara), "/templates/quince-tiara-card.webp");
    assert.equal(
      templateCatalogImage(princesa),
      "/templates/quince-princesa-card.webp",
    );
    assert.notEqual(tiara.thumbImage, tiara.heroImage);
    assert.notEqual(princesa.thumbImage, princesa.heroImage);
    for (const tpl of [tiara, princesa]) {
      assert.equal(
        existsSync(new URL(`../../public${tpl.thumbImage}`, import.meta.url)),
        true,
        tpl.thumbImage,
      );
    }

    const created = buildEventFromTemplate({
      templateId: "quince-princesa",
      ownerId: "owner",
      hostName: "Mr. and Mrs. Gonzalez",
      title: "Katia Gonzalez",
      slug: "katia-thumb-check",
      dateISO: "2026-10-04",
      timeLabel: "3:00 PM",
      venue: "Chapel",
      address: "1 Main",
      about: "",
    });
    assert.equal(created.heroImage, princesa.heroImage);
    assert.equal(created.heroImage?.includes("quince-princesa-card"), false);
  });
});
