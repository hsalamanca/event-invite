import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bodyFont,
  heroDisplayFont,
  marqueeFont,
  paperThemeVars,
} from "./marketing-theme";
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
    assert.equal(vars["--ink"], "#3A2A30");
    assert.equal(/#0f1a2e/i.test(css), false);
    assert.equal(vars["--landing-muted"], "#5C564E");
    assert.equal(vars["--landing-soft"], "#5C564E");
    const bodyCss = JSON.stringify(bodyFont);
    const heroCss = JSON.stringify(heroDisplayFont);
    const marqueeCss = JSON.stringify(marqueeFont);
    assert.match(bodyCss, /dm-sans/i);
    assert.match(css, /dm-sans/i);
    assert.match(heroCss, /fraunces/i);
    assert.equal(/playfair/i.test(heroCss), false);
    assert.match(marqueeCss, /dm-sans/i);
    assert.equal(/space-grotesk/i.test(marqueeCss), false);
  });

  it("remaps --ink off navy on paper marketing surfaces", async () => {
    const { readFileSync } = await import("node:fs");
    const css = readFileSync("src/app/globals.css", "utf8");
    const root = css.slice(css.indexOf(":root"), css.indexOf("html:not"));
    assert.match(root, /--ink:\s*#3a2a30/i);
    assert.equal(/#0f1a2e/i.test(root), false);
    const start = css.indexOf("html:has(.paper-surface)");
    assert.ok(start >= 0);
    const block = css.slice(start, start + 280);
    assert.match(block, /--ink:\s*#3a2a30/i);
    assert.equal(/#0f1a2e/i.test(block), false);
    assert.equal(/#1a2744/i.test(block), false);
  });

  it("keeps Templates/Domains/Pricing in a 390 overflow row (no JS gate)", async () => {
    const { readFileSync } = await import("node:fs");
    const nav = readFileSync("src/components/marketing/MarketingNav.tsx", "utf8");
    assert.equal(/useState/.test(nav), false);
    assert.equal(/open \?/.test(nav), false);
    assert.match(nav, /data-marketing-phone-nav/);
    assert.match(nav, /\/marketplace/);
    assert.match(nav, /\/domains/);
    assert.match(nav, /\/pricing/);
    const landing = readFileSync(
      "src/components/marketing/LandingPage.tsx",
      "utf8",
    );
    assert.match(
      landing,
      /md:grid-cols-\[minmax\(0,0\.86fr\)_minmax\(0,1\.14fr\)\]/,
    );
  });

  it("locks Scout EN/ES hero copy, Katia demo, and Peek on princesa", () => {
    const en = getDictionary("en").landing;
    const es = getDictionary("es").landing;
    assert.equal(en.headline, "A celebration worth opening.");
    assert.equal(
      en.support,
      "Stationery-grade invites on cream paper — hosted on your domain, not ours.",
    );
    assert.equal(en.ctaStart, "Create an invitation");
    assert.equal(en.ctaDemo, "Peek a live invite");
    assert.equal(en.ctaBrowse, "Browse templates");
    assert.equal(
      en.priceLine,
      "Free to start · Pay per event · No per-guest · No ads",
    );
    assert.equal(es.headline, "Una celebración que vale la pena abrir.");
    assert.equal(
      es.support,
      "Invitaciones con calidad de papelería en papel crema — en tu dominio, no en el nuestro.",
    );
    assert.equal(es.ctaStart, "Crear una invitación");
    assert.equal(es.ctaDemo, "Ver una invitación en vivo");
    assert.equal(es.ctaBrowse, "Ver plantillas");
    assert.equal(
      es.priceLine,
      "Empieza gratis · Pagas por evento · Sin costo por invitado · Sin anuncios",
    );
    assert.equal(en.demoCredit, "Katia Gonzalez · Mis XV años");
    assert.match(en.footer, /ownvite\.app/);
    assert.equal(en.demoUrl, "katia.com");
    assert.equal(es.demoUrl, "katia.com");
    assert.equal(en.mockUrl, "yourevent.com");
    assert.equal(PEEK_DEMO_PATH, "/preview/quince-princesa");
  });

  it("points hero and filmstrip at unpacked Ink stills", () => {
    assert.match(MARQUEE.heroPhone, /01-garden/);
    assert.match(MARQUEE.envelopeClosed, /envelope-closed/);
    assert.match(MARQUEE.rsvpCard, /rsvp-card/);
    assert.match(MARQUEE.peek1, /peek-filmstrip-01/);
  });
});
