/** Seasonal / bundled premium theme packs ($12). */

export type ThemePack = {
  id: string;
  name: string;
  nameEs: string;
  description: string;
  templateIds: string[];
  amountCents: number;
};

export const THEME_PACKS: ThemePack[] = [
  {
    id: "wedding-season",
    name: "Wedding season pack",
    nameEs: "Pack temporada de bodas",
    description: "Elegant wedding and celebration themes.",
    templateIds: ["champagne-wedding", "watercolor-rose", "gold-confetti"],
    amountCents: 1200,
  },
  {
    id: "fiesta",
    name: "Fiesta & quince pack",
    nameEs: "Pack fiesta y quince",
    description: "Latin celebration and festive themes.",
    templateIds: ["latin-fiesta", "gold-confetti"],
    amountCents: 1200,
  },
  {
    id: "all-premium",
    name: "All premium themes",
    nameEs: "Todos los temas premium",
    description: "Unlock every premium template for this event.",
    templateIds: [
      "champagne-wedding",
      "watercolor-rose",
      "gold-confetti",
      "latin-fiesta",
      "golden-fifty",
    ],
    amountCents: 1200,
  },
];

export function getThemePack(id: string): ThemePack | undefined {
  return THEME_PACKS.find((p) => p.id === id);
}
