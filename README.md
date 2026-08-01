# Ownvite

**Host on your own domain. Design like you mean it.**

Ownvite is a digital invitation platform — Evite-class RSVPs with designer-grade customization and **custom domains** for every event.

**Live:** [ownvite.com](https://ownvite.com) · [ownvite.app](https://ownvite.app)  
**Birthday invite:** [/e/h-birthday-2026](https://ownvite.com/e/h-birthday-2026)

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
| `/api/rsvp` | RSVP collect + list |

## Product wedge

- **Custom domains** — `party.yourname.com` (BYO) or `{slug}.ownvite.app`
- **Deep customization** — fonts, palette, hero, motion, RSVP fields
- **Honest pricing** — Free / Pro Event ($29) / Studio / Agency — see `docs/MARKET_AND_MONETIZE.md`

## Docs

- [`docs/MARKET_AND_MONETIZE.md`](docs/MARKET_AND_MONETIZE.md) — GTM & pricing
- [`docs/BIRTHDAY_INVITE_BRIEF.md`](docs/BIRTHDAY_INVITE_BRIEF.md) — first-event creative direction
- [`docs/CUSTOM_DOMAINS.md`](docs/CUSTOM_DOMAINS.md) — DNS, SSL, middleware contract

## Stack

Next.js App Router · TypeScript · Tailwind · file-backed RSVP store (MVP)

## First event

The seeded demo is **H Salamanca · Birthday** (`data/birthday-demo.json`) — edit it in the host studio and share `/e/h-birthday-2026`.
