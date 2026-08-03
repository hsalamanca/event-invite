# Ownvite

**Host on your own domain. Design like you mean it.**

Ownvite is a digital invitation platform — Evite-class RSVPs with designer-grade customization and **custom domains** for every event.

**Live:** [ownvite.com](https://ownvite.com) · [ownvite.app](https://ownvite.app)  
**Birthday invite:** [/e/h-birthday-2026](https://ownvite.com/e/h-birthday-2026)

Language is cookie-based (EN/ES switcher) — same URLs, no `/es` prefix. Legacy `/es/*` redirects and sets Spanish.

### Hero images
Hosts upload photos in Host studio (device file → Vercel Blob → `/api/media` public URL). Pasting a URL remains as a fallback.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| URL | What |
|-----|------|
| `/` | Marketing landing |
| `/e/h-birthday-2026` | Live birthday invite (H Salamanca) |
| `/host/h-birthday-2026` | Host studio — customize colors, copy, domain |
| `/pricing` | Monetization tiers |
| `/domains` | How to point your domain at Ownvite |
| `/api/rsvp` | RSVP collect + list |
| `/api/domains` | Connect / status / remove custom domains |

## Custom domains (hosts)

1. Open Host studio → **Custom domain**
2. Enter `party.yourdomain.com` → **Connect**
3. Add the CNAME Ownvite shows (`→ cname.vercel-dns.com`)
4. Click **Verify DNS** until status is **active**

Full walkthrough: [`/domains`](https://ownvite.com/domains) · [`docs/CUSTOM_DOMAIN_SETUP.md`](docs/CUSTOM_DOMAIN_SETUP.md)

**Platform wildcard (operators):** `ownvite.com` and `ownvite.app` use Vercel nameservers (`ns1/ns2.vercel-dns.com`) with active `*.domain` TLS — `{slug}.ownvite.app` / `.com` work with HTTPS. See [`docs/PLATFORM_SUBDOMAIN_SSL.md`](docs/PLATFORM_SUBDOMAIN_SSL.md).

## Product wedge

- **Custom domains** — `party.yourname.com` (BYO) or `{slug}.ownvite.app`
- **Deep customization** — fonts, palette, hero, motion, RSVP fields
- **Honest pricing** — Free / Pro Event ($29) / Studio / Agency — see `docs/MARKET_AND_MONETIZE.md`

## Docs

- [`docs/MARKET_AND_MONETIZE.md`](docs/MARKET_AND_MONETIZE.md) — GTM & pricing
- [`docs/BIRTHDAY_INVITE_BRIEF.md`](docs/BIRTHDAY_INVITE_BRIEF.md) — first-event creative direction
- [`docs/CUSTOM_DOMAIN_SETUP.md`](docs/CUSTOM_DOMAIN_SETUP.md) — host + operator DNS how-to
- [`docs/CUSTOM_DOMAINS.md`](docs/CUSTOM_DOMAINS.md) — architecture contract

## Stack

Next.js App Router · TypeScript · Tailwind · file-backed RSVP store (MVP)

## First event

The seeded demo is **H Salamanca · Birthday** (`data/birthday-demo.json`) — edit it in the host studio and share `/e/h-birthday-2026`.
