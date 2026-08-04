# Ownvite — Premium themes & chargeable services

Research snapshot for packaging paid features on top of Free / Pro Event / Studio (see also `MARKET_AND_MONETIZE.md`).

---

## 1. Competitor pricing (what guests already accept)

| Product | Paid model | Takeaways for Ownvite |
|---------|------------|------------------------|
| **Evite** | Premium ~$18–$100+/event by guest count; Pro ~$250/yr | Guests accept **per-event** upgrades; guest-count tiers feel punitive — Ownvite should stay **flat**. |
| **Paperless Post** | Coins / card packs; Pro subscription | Opaque coin math frustrates hosts — sell **clear SKUs** (event pass, theme pack). |
| **Greenvelope** | Per-guest + membership | Strong for weddings; Ownvite wins on **flat Pro + custom domain**. |
| **Canva** | Free + Pro; template marketplace | Theme packs + designer marketplace are familiar; keep Ownvite focused on **live RSVP sites**, not static graphics. |

**Wedge to charge for:** custom domain, no watermark, premium motion themes, email/SMS blast, co-host/check-in tooling, private password invites — not “number of guests.”

---

## 2. Premium themes (recommended SKUs)

### What “premium” means in product
Templates already flagged `premium: true` in `src/lib/templates.ts` (e.g. gold-confetti, champagne-wedding, latin-fiesta, watercolor-rose): richer art direction, celebration extras defaults, and (on Free) a soft upsell.

### Packaging options

| SKU | Price | Includes | When to sell |
|-----|-------|----------|--------------|
| **Theme unlock (single)** | **$7** | One premium template for one event | Impulse at create wizard / apply-template |
| **Seasonal pack** | **$12** | 3–5 themed designs (holiday, wedding season) | Drop calendar (Q4, spring wedding) |
| **Pro Event** | **$29** (launch $19) | All premium themes for that event + domain + no footer | Core conversion |
| **Studio** | **$12/mo** | All themes forever + 5 active events | Frequent hosts / planners |

### Implementation hooks (current codebase)
- `EventRecord.premiumTheme` / `tier` / `showOwnviteFooter`
- Template `premium` flag in create wizard (badge + soft gate)
- Billing not wired yet — treat Free as full preview; gate **remove footer + custom domain SSL attach** when Stripe lands

### Theme roadmap worth charging for
1. Wedding suite (ceremony timeline presets, hotel block copy)
2. Kids / quince / Latin fiesta motion packs
3. Corporate brand kit (logo slot, hex lock, no Ownvite chrome)
4. Designer marketplace later (20–30% cut)

---

## 3. Other services we can charge for

Priority order for launch revenue:

| Service | Suggested price | Notes |
|---------|-----------------|-------|
| **Pro Event pass** | $29 / event | Domain + premium themes + no watermark + 500 emails |
| **Custom domain (à la carte)** | $9 / event on Free | Or included in Pro |
| **Email / SMS credits** | Bundle in Pro; overage $0.02 email / $0.05 SMS | Remind + invite blast already stubbed via Resend |
| **Private password invites** | Pro feature | Already implemented (visibility + unlock cookie) |
| **Co-host seats** | Studio+ | `coHostEmails` already in data model |
| **Check-in / door list** | Pro+ | Host check-in panel |
| **CSV guest import + meal dashboard** | Pro+ | Reduces planner busywork |
| **QR code download** | Free (lead-in) / branded QR on Pro | Drive share → conversion |
| **Remove Ownvite footer** | Pro | `showOwnviteFooter` |
| **Print / stationery affiliate** | 8–15% rev share | Post-RSVP CTA |
| **Agency / white-label** | $199/mo | Planners, venues |

Lower priority / later:
- Video hero hosting overage
- Analytics export
- SMS RSVP replies
- Marketplace templates

---

## 4. Soft gates vs hard gates (ship now)

**Soft:**
- Badge “Premium” on templates
- Pricing page copy for theme packs + add-ons

**Hard (shipped):**
- Custom domain attach blocked on Free (use `{slug}.ownvite.app`; Pro unlocks BYO domain)
- Free cannot remove Ownvite footer (`showOwnviteFooter` forced true)
- Free email blasts capped at 15 recipients per send
- Clients cannot self-assign `tier` (admin + Stripe webhook only)

### Stripe checkout (implemented)

`POST /api/billing/checkout` accepts `product`:

| product | Price | Effect |
|---------|-------|--------|
| `pro_event` (default) | **$29** one-time | `tier=pro`, footer off, premium themes, check-in, seating, **500** emails/blast |
| `theme_unlock` | **$7** one-time | Adds `templateId` to `unlockedTemplateIds`, applies theme |
| `reminder_pack` | **$9** one-time | **+100** `emailCredits` on the event |
| `studio` | **$12/mo** subscription | Account `studioStatus=active`, owned events → Studio, max **5** active published events |

Webhook `POST /api/billing/webhook` handles `checkout.session.completed` + Studio subscription updates.

**Hard gates (Free):** custom domain, footer off, premium template apply, private invites, check-in enable, seating save. Free blasts = 15 included; Reminder Pack credits extend Free sends.

Env vars:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` (endpoint `/api/billing/webhook`)
- Google auth: `AUTH_GOOGLE_ID` + `AUTH_GOOGLE_SECRET` (aliases `AUTH_GOOGLE_CLIENT_ID` / `AUTH_GOOGLE_CLIENT_SECRET` also work). See `docs/GOOGLE_AUTH.md`.
- Email for verify/reset: `RESEND_API_KEY`, `EMAIL_FROM`

Without Stripe keys, upgrade falls back to `mailto:hello@ownvite.com`.

---

## 5. Messaging for pricing page

- **Headline:** Pay for the event, not the guest list  
- **Premium themes:** Designer packs from $7 — or unlock all with Pro Event  
- **Add-ons:** Domain, email blasts, private invites, check-in  
- **Agency:** White-label for planners  

See `src/components/marketing/PricingPage.tsx` and i18n `pricing` strings for user-facing copy.
