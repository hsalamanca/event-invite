# Gatherly — Go-to-Market & Monetization Strategy

**One-liner:** Your event, your domain, your design — designer-grade invites without ads, coins, or per-guest math.

---

## 1. Category & Wedge

Digital invitations sit between three broken models:

| Incumbent | Model | Gap Gatherly fills |
|-----------|--------|-------------------|
| **Evite** | Free + ads; basic templates | No custom domain; customization capped; brand feels generic |
| **Paperless Post** | Coin economy; premium per design | Opaque pricing; no true custom domain; mobile-first, not web-native |
| **Greenvelope** | Per-guest pricing ($1–3+) | Cost scales with list size; domains are subpaths, not yours |
| **Partiful** | Social/casual; link-in-bio aesthetic | Not built for branded events, weddings, or corporate polish |

**The wedge:** Hosts who treat an invite as part of their personal or professional brand want a **dedicated URL** (`emma-30.gatherly.app` → `thirty.emmahart.com`) and **pixel-level control** (fonts, motion, layout, media) — not a template picker inside someone else's product chrome.

Custom domains signal seriousness (weddings, milestone birthdays, launch parties) and shareability (memorable link, no `evite.com/b/abc123`). Designer-grade customization turns the invite into a micro-site guests actually want to open.

---

## 2. Ideal Customer Profile (ICP)

### Beachhead: Birthday hosts who care about aesthetic

- **Who:** 28–45, plans 1–3 hosted events/year, active on Instagram/TikTok, spends on decor, cakes, photographers
- **Job to be done:** "Make my party feel *mine* before anyone arrives"
- **Trigger:** Milestone birthday (30/40/50), surprise party, themed kids' party
- **Why they pay:** Custom domain + no watermark = shareable pride; one-time fee beats subscription guilt

### Expansion paths (same product, different packaging)

| Segment | Domain need | Customization need | Monetization hook |
|---------|-------------|-------------------|-------------------|
| **Weddings** | Couple's domain or subdomain | Full theme match to stationery | Pro Event + print affiliate |
| **Corporate** | `event.company.com` | Brand guidelines, logo lockups | Studio / Agency tier |
| **Creators** | `launch.creatorname.com` | Video, merch links, sponsor blocks | Studio + marketplace templates |

---

## 3. Positioning

### One-liner

**Gatherly — Host on your own domain. Design like you mean it.**

### Three proof points vs. incumbents

1. **vs. Evite (ads):** No ads on your invite — ever on paid tiers. Guests see your event, not banner inventory.
2. **vs. Paperless Post (coins):** Transparent one-time event pricing. No coin math; publish once, share everywhere.
3. **vs. Greenvelope (per-guest):** Flat event pass. Invite 12 or 120 — same price. Custom domain included on Pro, not a gated upsell per head.

---

## 4. Pricing Tiers (USD)

| Tier | Price | Includes | Best for |
|------|-------|----------|----------|
| **Free** | $0 | Subdomain (`yourname.gatherly.app`), standard templates, Gatherly footer/watermark, optional non-intrusive ads | Try-before-buy, casual gatherings |
| **Pro Event** | **$29** one-time (promo launch: $19) | Custom domain + auto SSL, premium templates, no ads/watermark, RSVP + guest messaging, 500 email sends | Milestone birthdays, showers, reunions |
| **Studio** | **$12/mo** or **$99/yr** | 5 active events, all Pro features, template overrides (CSS/fonts), analytics, priority support | Frequent hosts, small businesses, creators |
| **Agency / White-label** | **$199/mo** + setup | Custom branding, client sub-accounts, bulk domains, API, revenue share on client events | Wedding planners, event agencies, venues |

**Pricing principles**

- Anchor Pro Event against Greenvelope's ~$2/guest × 30 guests ($60) — Gatherly wins on clarity.
- Studio ARPU target: hosts running quarterly events or micro-businesses.
- Agency priced on seats + active client domains, not per guest.

---

## 5. Monetization Stack

| Revenue stream | Mechanism | Notes |
|----------------|-----------|-------|
| **Event passes** | Pro Event one-time | Core conversion metric; bundle domain |
| **Custom domain add-on** | Included in Pro; à la carte **$9** on Free if user brings own DNS | Margin on SSL/hosting; partner with Cloudflare for certs |
| **Premium templates** | **$5–$15** per pack or included in Studio | Seasonal drops (holiday, wedding, corporate) |
| **Designer marketplace** | **20–30%** platform cut on third-party templates | Attracts wedding designers; quality bar via review |
| **SMS / email credits** | Bundled in tiers; overage **$0.02/email**, **$0.05/SMS** | Margin on Twilio/SendGrid; cap abuse on Free |
| **Print partnership affiliate** | **8–15%** rev share with Paper Culture, Minted, local printers | "Match your digital invite" CTA post-RSVP |

**Stack priority at launch:** Event passes → domain attach → premium templates. Marketplace and print after template quality is proven.

---

## 6. GTM — First 100 Users

### Proof before scale

1. **Founder's birthday invite** — Ship one real event on a custom domain (`turning-[age].[name].com`). Document the build (before/after vs. Evite). This is demo, case study, and dogfood in one.
2. **"Made with Gatherly" footer** — On Free tier only. Tappable, shows template + domain story. Every share is a billboard.
3. **Template loops on Instagram/TikTok** — 15–30s screen recordings: domain typing into browser → invite reveal → RSVP tap. Hashtags: `#partyinvite #customdomain #birthdayparty`. Repost user-generated loops with permission.
4. **Wedding planner partnerships** — Offer 3 planners free Agency trial + **$10/event** referral for Pro Event conversions. Planners need white-label domains for clients; one planner = dozens of events/year.
5. **Niche communities** — Facebook groups for milestone birthdays, Reddit r/weddingplanning (value-first posts, not spam), local event Facebook groups.

### Acquisition channels (ranked)

1. Organic social (template loops + founder story)
2. Planner/agency referrals
3. SEO: "custom domain birthday invite", "Evite alternative no ads"
4. Product Hunt / indie hacker launch (after 10 real events with screenshots)

### First 100 user actions

- Personal outreach to 20 aesthetic-conscious friends → ask for one real event each
- Collect 5 testimonials with domain URLs
- Publish comparison page: Gatherly vs Evite vs Paperless Post (pricing calculator)

---

## 7. Metrics

| Metric | Definition | Target (directional) |
|--------|------------|-------------------|
| **Activation** | Invite published (live URL, ≥1 section customized) | >60% of signups within 7 days of signup |
| **RSVP rate** | RSVPs ÷ unique invite page views | Benchmark 25–40%; track by template |
| **Paid conversion** | Pro Event or Studio purchases ÷ activated invites | 8–15% on birthday beachhead |
| **Custom domain attach rate** | Paid events with verified custom domain ÷ paid events | >70% (core differentiator — if low, fix DNS UX) |

**Secondary:** Time-to-publish, template NPS, referral from footer clicks, planner-sourced events %.

**North star:** Published invites on custom domains (signals product-market fit for the wedge).

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Domain setup friction** | Users abandon before publish | Default to `name.gatherly.app`; wizard for CNAME with registrar-specific screenshots; "we'll do it for you" concierge on Pro |
| **Email deliverability** | RSVPs land in spam | Dedicated sending domain, SPF/DKIM/DMARC from day one; warmup; transactional-only on Free |
| **Template quality bar** | Free tier looks cheap; hurts brand | Curate ≤10 launch templates; no user-submitted until marketplace QA; hire 1 contract designer for wedding + birthday hero sets |
| **Incumbent copy** | Evite adds domains | Move fast on customization depth + flat pricing; own "your domain" SEO |
| **Support load (DNS)** | Founders buried in tickets | In-app DNS checker, status page, async chat; Agency tier includes white-glove setup |

---

## Brand: Gatherly

**Why Gatherly:** Short, warm, event-native — not an Evite echo. Works as verb ("Gatherly it") and domain (`gatherly.app`). Implies bringing people together without locking you into a generic subdomain forever.

**Tagline options:** *Gather beautifully.* / *Your event. Your URL.*

---

*Document owner: Product/GTM. Review after first 25 paid events.*
