# Ownvite template: `quince-tiara` · layout `quinceframe`

**Status:** draft art direction + asset pack for Forge / Pixel  
**Canon sample:** `reference/hugo-sample.png` (Charlotte Jackson placeholder — do not lock names)  
**Product:** Ownvite (`hsalamanca/event-invite`)  
**Siblings:** `quince-azul` (layout `quince`), `quince-rosa` (layout `quincebloom`) — this is a third quince system, print-card geometric.

---

## 1. Creative direction

White stationery card with thin champagne-gold irregular geometric frame. Watercolor pink roses + gold glitter branches at **top-left** and **bottom-right** (primary). Optional TR/BL pairs included for denser variants. Pink glitter tiara centered above the type stack. Central illustration: young woman from behind in a sparkling pink ball gown, sitting between the bottom two columns (Lunch | RSVP).

Tone: romantic, formal, Latina celebration stationery — not party neon, not Canva balloon clutter.

---

## 2. Palette

| Role | Name | Hex | Notes |
|------|------|-----|-------|
| Card | Soft White | `#FFFCFA` | Page / card fill |
| Frame / gold type | Champagne Gold | `#C9A227` | Geometric stroke, ALL CAPS serif |
| Gold glitter accent | Bright Gold | `#E0B84A` | Branch sparkle |
| Script / accents | Quince Pink | `#E8A0B8` | “Quinceañera”, honoree name, Lunch/RSVP headers |
| Script deep | Rose | `#D4789A` | Name emphasis / hover |
| Foliage | Sage | `#8FA08A` | Leaves in floral assets |
| Body muted | Warm Stone | `#6B5E52` | Optional secondary body (print) |

**Avoid:** cobalt from `quince-azul`, heavy purple, neon pink, kraft paper, black-letter gothic.

---

## 3. Typography

| Role | Style | Suggested Google Fonts | Treatment |
|------|-------|------------------------|-----------|
| Parents / date / addresses | Gold serif ALL CAPS | Cormorant Garamond or Playfair Display | Tracking +0.08–0.12em; gold |
| “Quinceañera” | Pink calligraphy | Great Vibes or Pinyon Script | Large display; pink |
| Honoree name | Larger pink calligraphy | Same script family | Largest type on card |
| Lunch / RSVP headers | Smaller pink italic script | Great Vibes / italic of body | Column headers |
| Column body | Gold serif mixed case OK for addresses | Cormorant Garamond 400–500 | Compact leading |

Do not use Inter / Roboto / system-ui as brand faces.

---

## 4. Layout `quinceframe` (web + print)

**Card aspect**
- Web guest view: centered card on soft blush or white page, max-width ~420–480px mobile, ~560px desktop.
- Print: **5×7 in** portrait, **0.125 in bleed**, **0.25 in safe** inside frame.

```
┌─────────────────────────────┐
│  [floral TL]                │
│         ✦ tiara             │
│   PARENTS INVITE YOU…       │  ← gold caps
│       Quinceañera           │  ← pink script
│    OF THEIR DAUGHTER        │  ← gold caps
│      Honoree Name           │  ← pink script XL
│   Saturday, Month DD, YYYY  │  ← gold caps
│   Mass at {church}…         │  ← gold
│                             │
│  Lunch…   [gown]   RSVP…    │  ← 2-col + center gown
│  [floral BR]                │
└─────────────────────────────┘
```

Frame: thin gold irregular hex / geometric polygon — prefer SVG stroke (`svg/frame-gold-hex.svg`) for crisp scale; PNG available as raster fallback.

Gown: absolute bottom-center, behind column text or between columns; width ~45–55% of card; never crop the skirt flare. When `honoreePhotoUrl` is set (https or `/api/media` only), `HonoreePortrait` replaces the gown with a gold oval (`object-fit: cover`, `center top`). Empty / error / loading keep the Ink gown. `heroImage` stays the catalog + paper-wash atmosphere — do not reuse it for the girl.

---

## 5. Editable fields (template seed — not locked to sample)

EN defaults + ES counterparts (Ownvite already has cookie locale + `headlineEs` / `taglineEs` / `aboutEs` / schedule `titleEs`).

| Field key | EN placeholder | ES placeholder |
|-----------|----------------|----------------|
| `parentsLine` | Mr. & Mrs. {Last} invite you to celebrate the | El Sr. y la Sra. {Last} los invitan a celebrar la |
| `eventLabel` | Quinceañera | Quinceañera |
| `ofDaughter` | of their daughter | de su hija |
| `honoreeName` | {First Last} | {First Last} |
| `dateLabel` | Saturday, October 23, 2026 | Sábado, 23 de octubre de 2026 |
| `massLine` | Mass at {Church}, {City} at {time} | Misa en {Church}, {City} a las {time} |
| `lunchHeader` | Celebratory Lunch at | Almuerzo celebratorio en |
| `lunchBody` | {venue} / {city} / at {time} | {venue} / {city} / a las {time} |
| `rsvpHeader` | Rsvp to | Confirmar con |
| `rsvpBody` | {contact} / at {phone} / by {deadline} | {contact} / al {phone} / antes del {deadline} |

Sample names in Hugo’s PNG are **placeholders only**.

---

## 6. Asset pack map

Root: `/workspace/ownvite-assets/quince-tiara/`

| File | Use |
|------|-----|
| `web/tiara-pink-glitter.png` | Header icon (transparent) |
| `web/floral-corner-tl.png` | Primary top-left |
| `web/floral-corner-br.png` | Primary bottom-right |
| `web/floral-corner-tr.png` | Optional top-right |
| `web/floral-corner-bl.png` | Optional bottom-left |
| `web/gown-back-pink.png` | Center illustration |
| `web/frame-gold-hex.png` | Stroke-only raster (not used on guest) |
| `svg/frame-gold-hex.svg` | Preferred scalable frame |
| `print/*.png` | ≥2400px long-edge print masters |
| `reference/hugo-sample.png` | Visual canon |

Suggested public paths once copied into repo: `/templates/quince-tiara/{asset}.webp` (guest) with `.png` Ink/print fallback. Default guest florals are **TL+BR only**; TR/BL load only via `denseFlorals`. Print masters stay out of the guest path.

---

## 7. Motion (web)

- Soft fade-up of type stack (~500ms, stagger 60ms).
- Florals: opacity only; no bounce.
- Respect `prefers-reduced-motion`.
- No confetti.

---

## 8. Implementation notes for Forge

1. Add template id `quince-tiara`, layout `quinceframe` (new `InviteLayout` union member).
2. Theme tokens from palette table; fonts Cormorant Garamond + Great Vibes (or Pinyon Script).
3. Wire EN+ES fields like existing Latin templates (`quince-azul` / `quince-rosa`).
4. Prefer SVG frame; layer PNGs absolutely.
5. Draft PR only — no merge. Pixel polishes render.

## 9. Success criteria

- [ ] Reads as white-card stationery with gold geometric frame within 2s
- [ ] Florals TL/BR + tiara + gown match sample energy (not identical lock)
- [ ] All copy fields editable; sample names not hardcoded
- [ ] EN/ES switch works for parents / mass / lunch / RSVP strings
- [ ] Print 5×7 with bleed; web card sharp on retina
