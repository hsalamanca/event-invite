# Birthday Invitation — Design Brief & Content Seed

**Product:** event-invite  
**Host (default):** H Salamanca  
**Occasion:** Birthday celebration  
**Audience:** Guests receiving a premium, shareable invite link  
**Goal:** A single-page invitation that feels intentional, warm, and elevated — not a template dump.

---

## 1. Creative Direction

### Atmosphere

Warm **night-celebration** — the hour when lights come on, glasses lift, and the room feels intimate without being dim or clubby. Think candlelit terrace, city skyline at dusk, or a private dining room after sunset.

### Palette

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| Background | Ink Navy | `#0F1A2E` | Page base, hero overlay gradient anchor |
| Surface | Deep Slate | `#1A2744` | Secondary sections, form fields |
| Accent primary | Champagne Gold | `#C9A962` | CTAs, dividers, key typography highlights |
| Accent secondary | Ember Coral | `#E07A5F` | Hover states, RSVP success, subtle warmth |
| Text primary | Warm Ivory | `#F4F0E8` | Headlines, body on dark |
| Text muted | Mist | `#9BA8BC` | Captions, metadata, placeholders |

**Avoid:**
- Purple gradients or violet-heavy palettes
- Cream/terracotta “newspaper editorial” or rustic farmhouse looks
- Dark-mode neon glow, cyberpunk borders, or glassmorphism clichés
- Floating pill badges, confetti overlays, or cartoon balloons on the hero

### Typography (Google Fonts)

Recommend **two curated pairs** in the product UI; default to Pair A.

#### Pair A — *Refined Evening* (default)
| Role | Font | Weight | Notes |
|------|------|--------|-------|
| Display | [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond) | 500–600 | Elegant serif; use for event title and hero headline |
| Body | [Source Sans 3](https://fonts.google.com/specimen/Source+Sans+3) | 400, 500 | Clean, readable; forms, details, RSVP copy |

#### Pair B — *Modern Warmth*
| Role | Font | Weight | Notes |
|------|------|--------|-------|
| Display | [Fraunces](https://fonts.google.com/specimen/Fraunces) | 500–600 | Expressive optical-size serif with personality |
| Body | [DM Sans](https://fonts.google.com/specimen/DM+Sans) | 400, 500 | Geometric but soft; strong on mobile |

**Do not use:** Inter, Roboto, Arial, or system-ui as primary brand fonts.

### Type scale (reference)
- Hero headline: 2.5–3.5rem (clamp), display font
- Tagline: 1.125–1.25rem, body font, muted color
- Section titles: 1.5–1.75rem, display font
- Body: 1rem / 1.6 line-height

---

## 2. Hero Composition Rules

The hero is **full-bleed** — edge-to-edge atmospheric imagery with a controlled overlay. No inset card, no boxed hero panel.

```
┌─────────────────────────────────────────────────────────────┐
│  [full-bleed hero image + gradient overlay]                 │
│                                                             │
│     EVENT INVITE          ← brand / product signal (small)  │
│                                                             │
│     A Night to Celebrate    ← one headline (display)        │
│     Join us for an evening  ← one short supporting sentence │
│     of good company.                                        │
│                                                             │
│     [ RSVP ]  [ Details ]   ← one CTA group (2 actions max) │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Required elements (in order)
1. **Brand/event name** — small, uppercase or small-caps; product wordmark or host event label (e.g. “H Salamanca · Birthday”)
2. **One headline** — emotional, not gimmicky; no puns, no “OMG you’re invited!!”
3. **One short sentence** — clarifies what, when feel; max ~12 words
4. **One CTA group** — primary “RSVP” + secondary “Details” (scroll anchor or modal)

### Prohibited on hero
- Floating badges, chips, stickers, or “Save the Date” ribbons
- Countdown timers in the hero (optional below fold only)
- Multiple headlines or stacked taglines
- Inset card with drop shadow floating over image
- Stock confetti, balloons, or emoji

### Overlay treatment
- Linear gradient: `rgba(15,26,46,0.55)` at top → `rgba(15,26,46,0.85)` at bottom
- Text always meets WCAG AA contrast on overlay (test against darkest overlay stop)

---

## 3. Page Sections (below hero)

| Section | Purpose |
|---------|---------|
| **Details** | Date, time, venue, address, dress code (optional) |
| **About** | 2–3 sentences from host; personal, not marketing copy |
| **RSVP** | Name, email, attendance, plus-ones, dietary restrictions |
| **Footer** | “Hosted by {hostName}” + subtle event-invite attribution |

Keep section count minimal. One scroll narrative: atmosphere → logistics → response.

---

## 4. Customization Knobs (Product API)

Expose these fields in the event-invite editor and persist to invite config:

| Knob | Type | Notes |
|------|------|-------|
| `theme.colors.*` | Color tokens | background, surface, accentPrimary, accentSecondary, textPrimary, textMuted |
| `theme.fonts.display` | Google Font family | Hero + section titles |
| `theme.fonts.body` | Google Font family | Body, forms, buttons |
| `headline` | string | Hero headline |
| `tagline` | string | Hero supporting line |
| `dateISO` | ISO 8601 date | e.g. `2026-09-12` |
| `timeLabel` | string | Human-readable time, e.g. “7:00 PM” |
| `venue` | string | Venue name |
| `address` | string | Full address for maps link |
| `heroImage` | URL | Full-bleed background; recommend 1920×1080+ |
| `rsvpFields` | object | Toggle plus-ones, dietary, custom questions |
| `slug` | string | Path segment, e.g. `/h-birthday-2026` |
| `customDomain` | string | Subdomain or custom domain, e.g. `hsalamanca.event-invite.app` |
| `hostName` | string | Display name; default “H Salamanca” |
| `about` | markdown/string | Host message below fold |

---

## 5. Sample Copy (Birthday — H Salamanca)

Use as editable defaults in the product demo and seed file.

| Field | Copy |
|-------|------|
| **Event title** | H Salamanca · Birthday |
| **Headline** | A Night to Celebrate |
| **Tagline** | An evening of good food, close friends, and a little dancing. |
| **Date** | Saturday, September 12 |
| **Time** | 7:00 PM |
| **Venue** | The Terrace at Meridian |
| **Address** | 428 Westlake Avenue, Seattle, WA 98109 |
| **About** | Another year, another reason to gather. I’d love your company for a relaxed dinner and drinks — no gifts, just your presence. |
| **RSVP prompt** | Kindly respond by September 5 so we can save you a seat. |
| **CTA primary** | RSVP |
| **CTA secondary** | Details |

Tone: warm, confident, understated. No exclamation marks in the hero. No age jokes unless the host opts in.

---

## 6. Motion & Micro-interactions

Keep motion **intentional and slow** — nothing bouncy or arcade-like.

### 1. Fade-up reveal (page load)
- Hero content (brand label → headline → tagline → CTAs) staggers in over ~600ms total
- Each element: `opacity 0→1`, `translateY 16px→0`, easing `cubic-bezier(0.22, 1, 0.36, 1)`
- Hero image: subtle scale `1.04→1.0` over 1.2s (Ken Burns lite, not a slideshow)

### 2. Soft parallax (scroll)
- Hero background image moves at 0.3× scroll speed (max 80px travel)
- Disable or reduce on `prefers-reduced-motion: reduce`
- No parallax on text — only the background layer

### 3. RSVP success micro-interaction
- On successful submit: button label cross-fades to “You’re on the list”
- Accent shifts briefly from gold to ember coral; a thin gold underline draws left-to-right under confirmation text (300ms)
- Optional: single soft pulse on checkmark icon (scale 0.9→1, once)
- No confetti cannons, no full-screen modals unless validation errors require them

**Global rule:** Respect `prefers-reduced-motion`. Provide static fallbacks for all animations.

---

## 7. Mobile Notes

- **Hero:** Maintain full-bleed; stack CTAs vertically below 480px (`RSVP` full-width, `Details` as text link or ghost button)
- **Typography:** Use `clamp()` for headline; minimum 1.75rem on small screens
- **Touch targets:** Buttons ≥ 44×44px; form inputs ≥ 48px height
- **Images:** Serve responsive `srcset` or CSS `background-size: cover`; crop to center-weighted focal point
- **RSVP form:** Single column; sticky “Submit RSVP” optional on long forms
- **Maps:** Venue address taps through to native maps (`geo:` / Google Maps URL)
- **Performance:** Lazy-load below-fold imagery; preload hero image with `fetchpriority="high"`
- **Safe areas:** Pad hero text with `env(safe-area-inset-*)` on notched devices

---

## 8. Content Seed Reference

Demo data lives at:

```
/workspace/data/birthday-demo.json
```

Use this JSON as the canonical seed for local development, Storybook fixtures, and integration tests.

---

## 9. Success Criteria

- [ ] Hero reads as premium and calm within 2 seconds
- [ ] Palette matches ink navy / champagne gold / ember coral — no purple, no neon
- [ ] Typography uses suggested Google Font pairs, not system defaults
- [ ] All customization knobs map 1:1 to editor fields
- [ ] Mobile RSVP completable in one thumb reach without horizontal scroll
- [ ] Animations enhance, never distract; reduced-motion path works
