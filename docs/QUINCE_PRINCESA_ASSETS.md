# Princesa slice assets (Katia / KXZ)

**Tokens (§2A):** bg `#FFF7F9` · surface `#FFE8EF` · accent `#B76E79` · gold `#C9A27A` · text `#3A2A30`

Guest files live under `public/templates/quince-princesa/`. Print/Ink masters are not committed.

## Prefer SVG for seals
- `seal-monogram-kxz.svg` — ring + KXZ + tiny crown (primary envelope seal)
- `seal-crown.svg` — crown-only seal (custom monograms)
- `petal-sprite.svg` — single petal for CSS particles

## PNG (true RGBA)
- `seal-monogram-kxz.png` — wax-seal look with KXZ
- `seal-crown.png` — ornate crown
- `petals-scatter.png` — loose petals + glitter
- `petals-drift.png` — top-weighted hero drift strip
- `petal-single.png` — one petal sprite
- `tiara-pink-glitter.png` — reused from quince-tiara

## Motion
- Envelope seal: SVG; open ~1.2s; `prefers-reduced-motion` → instant opacity crossfade
- Petals: particle from `petal-sprite` / `petal-single`; or static `petals-drift` at low opacity
- Corner weight: reuse `/templates/quince-tiara/` florals if needed

## Print companion
Keep `quince-tiara` as the print/share card. Mini-web does not replace the stationery layout.
