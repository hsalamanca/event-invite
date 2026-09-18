import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { paperThemeVars } from "./marketing-theme";
import { MARQUEE } from "./marquee-assets";
import { getDictionary } from "./i18n/dictionaries";
import { PEEK_DEMO_PATH } from "./template-gallery";

const NAVY = [/#0f1a2e/i, /#1a2744/i, /#0f172a/i, /navy/i];

describe("marquee marketing chrome", () => {
  it("locks Ink A cream / rose / gold and forbids navy", () => {
    const vars = paperThemeVars as Record<string, string>;
    const css = JSON.stringify(paperThemeVars);
    for (const banned of NAVY) {
      assert.equal(banned.test(css), false, `navy token leaked: ${banned}`);
    }
    assert.equal(vars["--landing-rose"], "#B76E79");
    assert.equal(vars["--landing-cta"], "#B76E79");
    assert.equal(vars["--landing-surface"], "#FFFCFA");
    assert.equal(vars["--landing-blush"], "#FFE8EF");
    assert.equal(vars["--landing-rose-gold"], "#C9A27A");
    assert.equal(vars["--landing-ink"], "#3A2A30");
  });

  it("keeps Scout price honesty, Katia demo, and Peek on princesa", () => {
    const en = getDictionary("en").landing;
    const es = getDictionary("es").landing;
    assert.match(en.priceLine, /Free to start/);
    assert.match(es.priceLine, /Gratis/);
    assert.equal(en.demoUrl, "katia.com");
    assert.equal(es.demoUrl, "katia.com");
    assert.equal(en.mockUrl, "yourevent.com");
    assert.equal(PEEK_DEMO_PATH, "/preview/quince-princesa");
    assert.equal(en.ctaDemo.toLowerCase().includes("peek"), true);
  });

  it("points hero and filmstrip at unpacked Ink stills", () => {
    assert.match(MARQUEE.heroPhone, /01-garden/);
    assert.match(MARQUEE.envelopeClosed, /envelope-closed/);
    assert.match(MARQUEE.rsvpCard, /rsvp-card/);
    assert.match(MARQUEE.peek1, /peek-filmstrip-01/);
  });
});
