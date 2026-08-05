import type { EventRecord, Theme } from "./types";
import {
  resolveLocalizedAbout,
  resolveLocalizedHeadline,
  resolveLocalizedTagline,
} from "@/lib/i18n/event-content";

export type TemplateCategory =
  | "birthday"
  | "wedding"
  | "baby"
  | "dinner"
  | "brunch"
  | "party"
  | "graduation";

/** Visual composition for the guest-facing invitation card */
export type InviteLayout =
  | "classic"
  | "foil"
  | "script"
  | "botanical"
  | "party"
  | "minimal"
  | "arch"
  | "fiesta"
  | "coastal"
  | "kraft"
  | "glam"
  | "comic"
  | "festive"
  | "toybox"
  | "azure"
  | "arcade"
  | "quince"
  | "fifty"
  | "splash";

export type EventTemplate = {
  id: string;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  /** Evite/Canva-style inspiration note (internal + UI “inspired by”) */
  inspiredBy: string;
  inspiredByEs: string;
  categories: TemplateCategory[];
  /** How the invite card is composed for guests */
  layout: InviteLayout;
  theme: Theme;
  heroImage: string;
  headline: string;
  headlineEs: string;
  tagline: string;
  taglineEs: string;
  /** Locked on Free — unlock with Pro Event / Studio */
  premium?: boolean;
};

/** Bright champagne cocktail — sunny celebration, not a nightclub */
const evening: Theme = {
  colors: {
    background: "#FFF9F0",
    surface: "#FFF1DE",
    accentPrimary: "#E8A317",
    accentSecondary: "#FF6B4A",
    textPrimary: "#2C2118",
    textMuted: "#7A6554",
  },
  fonts: { display: "Cormorant Garamond", body: "Source Sans 3" },
};

const garden: Theme = {
  colors: {
    background: "#F3FAF4",
    surface: "#E4F4E8",
    accentPrimary: "#2F9E6B",
    accentSecondary: "#F0B429",
    textPrimary: "#1C3A28",
    textMuted: "#5A7A64",
  },
  fonts: { display: "Fraunces", body: "DM Sans" },
};

const celebration: Theme = {
  colors: {
    background: "#FFF5F8",
    surface: "#FFE8EF",
    accentPrimary: "#F25C8A",
    accentSecondary: "#FFB347",
    textPrimary: "#3A1F2B",
    textMuted: "#8A5A6C",
  },
  fonts: { display: "Cormorant Garamond", body: "Source Sans 3" },
};

/** Evite “Festive Gold Confetti” — sunny gold on bright white */
const goldConfetti: Theme = {
  colors: {
    background: "#FFFCF7",
    surface: "#FFF4D6",
    accentPrimary: "#E6A800",
    accentSecondary: "#FF5C7A",
    textPrimary: "#2A2416",
    textMuted: "#7A6A40",
  },
  fonts: { display: "Playfair Display", body: "Outfit" },
};

/** Evite “Olive Minimal” — fresh botanical on soft mint */
const oliveMinimal: Theme = {
  colors: {
    background: "#F7FAF2",
    surface: "#EAF3DE",
    accentPrimary: "#6B9A3E",
    accentSecondary: "#E0A84A",
    textPrimary: "#243018",
    textMuted: "#6A7A58",
  },
  fonts: { display: "Lora", body: "DM Sans" },
};

/** Canva floral / Evite Baby’s Breath — airy ivory romance */
const ivoryBloom: Theme = {
  colors: {
    background: "#FFFBFA",
    surface: "#FFF0EE",
    accentPrimary: "#E8919A",
    accentSecondary: "#F0C96A",
    textPrimary: "#3A2826",
    textMuted: "#8A6A66",
  },
  fonts: { display: "Great Vibes", body: "Lora" },
};

/** Canva blush pastel baby shower */
const blushShower: Theme = {
  colors: {
    background: "#FFF7FA",
    surface: "#FFEAF2",
    accentPrimary: "#F48FB1",
    accentSecondary: "#80DEEA",
    textPrimary: "#4A2A38",
    textMuted: "#8A6070",
  },
  fonts: { display: "Cormorant Garamond", body: "Outfit" },
};

/** Clean modern glam — bright white with charcoal accents */
const blackTie: Theme = {
  colors: {
    background: "#FFFFFF",
    surface: "#F3F4F6",
    accentPrimary: "#111827",
    accentSecondary: "#EC4899",
    textPrimary: "#111827",
    textMuted: "#6B7280",
  },
  fonts: { display: "Playfair Display", body: "Outfit" },
};

/** Evite citrus / garden brunch — lemonade bright */
const citrusBrunch: Theme = {
  colors: {
    background: "#FFFCEB",
    surface: "#FFF3C4",
    accentPrimary: "#F5A623",
    accentSecondary: "#FF6F3C",
    textPrimary: "#3A2A10",
    textMuted: "#8A6A30",
  },
  fonts: { display: "Fraunces", body: "DM Sans" },
};

/** Canva boho — warm peach sunshine */
const bohoSunset: Theme = {
  colors: {
    background: "#FFF6EF",
    surface: "#FFE4D2",
    accentPrimary: "#E07A45",
    accentSecondary: "#F2B705",
    textPrimary: "#3A2418",
    textMuted: "#8A6048",
  },
  fonts: { display: "Lora", body: "Source Sans 3" },
};

/** Evite Gold Frame Wedding — luminous ivory & gold */
const champagneWedding: Theme = {
  colors: {
    background: "#FFFAF5",
    surface: "#FFF0DC",
    accentPrimary: "#D4A017",
    accentSecondary: "#E8919A",
    textPrimary: "#3A2E1E",
    textMuted: "#8A7458",
  },
  fonts: { display: "Great Vibes", body: "Cormorant Garamond" },
};

/** Retro party — bright coral & sunny orange (no dark purple) */
const retroGlow: Theme = {
  colors: {
    background: "#FFF8F2",
    surface: "#FFE8D6",
    accentPrimary: "#FF5A36",
    accentSecondary: "#FFB703",
    textPrimary: "#3A1E14",
    textMuted: "#8A5540",
  },
  fonts: { display: "Fraunces", body: "Outfit" },
};

/** Canva Red & Yellow Funky Comic — pop-art birthday bash */
const funkyComic: Theme = {
  colors: {
    background: "#FFE566",
    surface: "#FFF8E7",
    accentPrimary: "#E30613",
    accentSecondary: "#FF8A00",
    textPrimary: "#111111",
    textMuted: "#4A3A2A",
  },
  fonts: { display: "Bangers", body: "Outfit" },
};

/** Canva Multicolored Festive Birthday — rainbow balloons & confetti */
const festiveRainbow: Theme = {
  colors: {
    background: "#FFF4EC",
    surface: "#FFFFFF",
    accentPrimary: "#FF4D8D",
    accentSecondary: "#FFD23F",
    textPrimary: "#2A1848",
    textMuted: "#6E5A7A",
  },
  fonts: { display: "Fredoka", body: "Outfit" },
};

/** Canva blue & yellow illustrated kids toy party invitation */
const toyParty: Theme = {
  colors: {
    background: "#DFF1FF",
    surface: "#FFFDF7",
    accentPrimary: "#2F6FE0",
    accentSecondary: "#FFD400",
    textPrimary: "#1C3A6E",
    textMuted: "#5A7399",
  },
  fonts: { display: "Baloo 2", body: "Outfit" },
};

/** Canva illustrated kids birthday — red, sky blue (celeste), and yellow */
const rojoCeleste: Theme = {
  colors: {
    background: "#FFF6EB",
    surface: "#FFFFFF",
    accentPrimary: "#E53935",
    accentSecondary: "#4FC3F7",
    textPrimary: "#1A2744",
    textMuted: "#5A6B88",
  },
  fonts: { display: "Fredoka", body: "Outfit" },
};

/** Canva Blue Modern Birthday — sleek cobalt celebration (dark cover, light body) */
const blueModern: Theme = {
  colors: {
    background: "#0B1F3A",
    surface: "#FFFFFF",
    accentPrimary: "#2B6FFF",
    accentSecondary: "#7EC8FF",
    textPrimary: "#0B1F3A",
    textMuted: "#5B6F8C",
  },
  fonts: { display: "Space Grotesk", body: "Outfit" },
};

/** Blue modern Canva look, tailored for quinceañera — cobalt + champagne */
const quinceAzul: Theme = {
  colors: {
    background: "#0B1F3A",
    surface: "#FFFFFF",
    accentPrimary: "#2B6FFF",
    accentSecondary: "#D4AF37",
    textPrimary: "#0B1F3A",
    textMuted: "#5B6F8C",
  },
  fonts: { display: "Playfair Display", body: "Outfit" },
};

/** Canva-inspired 50th — sunny champagne & coral (joyful milestone) */
const goldenFifty: Theme = {
  colors: {
    background: "#FFF6E8",
    surface: "#FFFEF9",
    accentPrimary: "#E8A317",
    accentSecondary: "#FF7A59",
    textPrimary: "#3A2A14",
    textMuted: "#8A7355",
  },
  fonts: { display: "Playfair Display", body: "Outfit" },
};

/** Canva Colorful Kids Video Game Birthday — neon arcade party */
const gameOn: Theme = {
  colors: {
    background: "#16082F",
    surface: "#FFFFFF",
    accentPrimary: "#FF3D9A",
    accentSecondary: "#00E5FF",
    textPrimary: "#1A0A3C",
    textMuted: "#5C4E78",
  },
  fonts: { display: "Press Start 2P", body: "Outfit" },
};

/** Evite Lovely Linen — airy natural neutrals */
const linenKraft: Theme = {
  colors: {
    background: "#FAF7F2",
    surface: "#F0E8DC",
    accentPrimary: "#C4894B",
    accentSecondary: "#7EB8A8",
    textPrimary: "#3A3228",
    textMuted: "#7A6E60",
  },
  fonts: { display: "Lora", body: "Source Sans 3" },
};

/** Evite Birthday Balloons — playful sky celebration */
const balloonBash: Theme = {
  colors: {
    background: "#F3F9FF",
    surface: "#E3F1FF",
    accentPrimary: "#3B9EFF",
    accentSecondary: "#FF6BA8",
    textPrimary: "#1A2A44",
    textMuted: "#5A6E8A",
  },
  fonts: { display: "Fraunces", body: "Outfit" },
};

/** Canva / Evite watercolor romance — soft rose light */
const watercolorRose: Theme = {
  colors: {
    background: "#FFF8FA",
    surface: "#FFE9F0",
    accentPrimary: "#E86A8C",
    accentSecondary: "#F2C14E",
    textPrimary: "#3A2430",
    textMuted: "#8A6070",
  },
  fonts: { display: "Great Vibes", body: "Lora" },
};

/** Destination / coastal — bright sea glass */
const coastalBreeze: Theme = {
  colors: {
    background: "#F2FBFA",
    surface: "#DDF4F1",
    accentPrimary: "#1A9B8E",
    accentSecondary: "#F0B429",
    textPrimary: "#16363A",
    textMuted: "#4A7074",
  },
  fonts: { display: "Playfair Display", body: "DM Sans" },
};

/** Holiday sparkle — bright winter celebration */
const tinselNights: Theme = {
  colors: {
    background: "#F7FBFF",
    surface: "#E8F2FF",
    accentPrimary: "#3B82F6",
    accentSecondary: "#F59E0B",
    textPrimary: "#1E2A44",
    textMuted: "#5A6A88",
  },
  fonts: { display: "Playfair Display", body: "Outfit" },
};

/** Evite Modern Arch Party — clean peach editorial */
const modernArch: Theme = {
  colors: {
    background: "#FFF9F6",
    surface: "#FFEDE4",
    accentPrimary: "#F07850",
    accentSecondary: "#3DB8A0",
    textPrimary: "#2E221C",
    textMuted: "#7A6458",
  },
  fonts: { display: "Outfit", body: "DM Sans" },
};

/**
 * Latin celebration — marigold + turquoise on sunny cream.
 * For quinceañeras, bodas, bautizos, fiestas familiares.
 */
const latinFiesta: Theme = {
  colors: {
    background: "#FFF8EC",
    surface: "#FFE9C2",
    accentPrimary: "#F0A010",
    accentSecondary: "#12A89A",
    textPrimary: "#3A2410",
    textMuted: "#8A6438",
  },
  fonts: { display: "Playfair Display", body: "Source Sans 3" },
};

export const TEMPLATE_CATEGORIES: {
  id: TemplateCategory | "all";
  label: string;
  labelEs: string;
}[] = [
  { id: "all", label: "All", labelEs: "Todas" },
  { id: "birthday", label: "Birthday", labelEs: "Cumpleaños" },
  { id: "wedding", label: "Wedding", labelEs: "Boda" },
  { id: "baby", label: "Baby", labelEs: "Bebé" },
  { id: "dinner", label: "Dinner", labelEs: "Cena" },
  { id: "brunch", label: "Brunch", labelEs: "Brunch" },
  { id: "party", label: "Party", labelEs: "Fiesta" },
  { id: "graduation", label: "Graduation", labelEs: "Graduación" },
];

export const TEMPLATES: EventTemplate[] = [
  {
    id: "evening",
    name: "Champagne toast",
    nameEs: "Brindis champán",
    description: "Sunny champagne + coral — dinners, birthdays, cocktail parties.",
    descriptionEs: "Champán soleado + coral — cenas, cumpleaños, cócteles.",
    inspiredBy: "Evite cocktail & dinner classics",
    inspiredByEs: "Clásicos de cóctel y cena de Evite",
    categories: ["dinner", "birthday", "party"],
    layout: "foil",
    theme: evening,
    heroImage:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&q=80&auto=format&fit=crop",
    headline: "A Night to Celebrate",
    headlineEs: "Una noche para celebrar",
    tagline: "An evening of good food, close friends, and a little dancing.",
    taglineEs: "Una noche de buena comida, amigos cercanos y un poco de baile.",
  },
  {
    id: "gold-confetti",
    name: "Gold confetti",
    nameEs: "Confeti dorado",
    description: "Festive metallic sparkle — milestone birthdays and big nights out.",
    descriptionEs: "Brillo metálico festivo — cumpleaños hito y grandes noches.",
    inspiredBy: "Evite Festive Gold Confetti",
    inspiredByEs: "Evite Festive Gold Confetti",
    categories: ["birthday", "party", "graduation"],
    layout: "party",
    premium: true,
    theme: goldConfetti,
    heroImage:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1920&q=80&auto=format&fit=crop",
    headline: "Let the Confetti Fly",
    headlineEs: "Que vuele el confeti",
    tagline: "Dress up, show up, and celebrate like you mean it.",
    taglineEs: "Vístete, llega y celebra de verdad.",
  },
  {
    id: "garden",
    name: "Garden gathering",
    nameEs: "Encuentro en el jardín",
    description: "Fresh green + sunshine gold — brunches, showers, outdoor parties.",
    descriptionEs: "Verde fresco + oro soleado — brunches, baby showers, al aire libre.",
    inspiredBy: "Evite Garden Party + Canva greenery",
    inspiredByEs: "Evite Garden Party + verdor Canva",
    categories: ["brunch", "baby", "party"],
    layout: "botanical",
    theme: garden,
    heroImage:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1920&q=80&auto=format&fit=crop",
    headline: "Gather in the Garden",
    headlineEs: "Reunión en el jardín",
    tagline: "Sunshine, shared plates, and easy conversation.",
    taglineEs: "Sol, platos para compartir y conversación sencilla.",
  },
  {
    id: "olive-minimal",
    name: "Olive minimal",
    nameEs: "Olivo minimalista",
    description: "Quiet botanical greens — modern dinners and intimate gatherings.",
    descriptionEs: "Verdes botánicos suaves — cenas modernas y encuentros íntimos.",
    inspiredBy: "Evite Olive Minimal",
    inspiredByEs: "Evite Olive Minimal",
    categories: ["dinner", "wedding", "brunch"],
    layout: "minimal",
    theme: oliveMinimal,
    heroImage:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80&auto=format&fit=crop",
    headline: "An Intimate Evening",
    headlineEs: "Una noche íntima",
    tagline: "Simple details, good company, and a table worth gathering around.",
    taglineEs: "Detalles simples, buena compañía y una mesa para reunirse.",
  },
  {
    id: "ivory-bloom",
    name: "Ivory bloom",
    nameEs: "Flor de marfil",
    description: "Soft ivory florals — weddings, showers, and romantic evenings.",
    descriptionEs: "Florales marfil — bodas, showers y noches románticas.",
    inspiredBy: "Canva floral wedding + Evite Baby’s Breath",
    inspiredByEs: "Boda floral Canva + Baby’s Breath de Evite",
    categories: ["wedding", "baby", "brunch"],
    layout: "script",
    theme: ivoryBloom,
    heroImage:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1920&q=80&auto=format&fit=crop",
    headline: "Together with Family & Friends",
    headlineEs: "Juntos con familia y amigos",
    tagline: "A celebration of love, lightly held and beautifully shared.",
    taglineEs: "Una celebración del amor, suave y compartida.",
  },
  {
    id: "champagne-wedding",
    name: "Champagne wedding",
    nameEs: "Boda champán",
    description: "Ivory & gold formal — ceremonies, receptions, vow renewals.",
    descriptionEs: "Marfil y oro formal — ceremonias, recepciones, renovación de votos.",
    inspiredBy: "Evite Gold Frame Wedding / Ivory & Gold",
    inspiredByEs: "Evite Gold Frame Wedding / Ivory & Gold",
    categories: ["wedding", "dinner"],
    layout: "foil",
    premium: true,
    theme: champagneWedding,
    heroImage:
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1920&q=80&auto=format&fit=crop",
    headline: "We Invite You to Celebrate",
    headlineEs: "Te invitamos a celebrar",
    tagline: "Join us for vows, toasts, and a night of champagne joy.",
    taglineEs: "Acompáñanos en votos, brindis y una noche de alegría.",
  },
  {
    id: "blush-shower",
    name: "Blush shower",
    nameEs: "Shower en blush",
    description: "Soft blush pastels — baby showers, sprinkles, sip & sees.",
    descriptionEs: "Pasteles blush — baby showers, sprinkles y sip & see.",
    inspiredBy: "Canva blush baby + Evite pastel bows",
    inspiredByEs: "Bebé blush Canva + lazos pastel Evite",
    categories: ["baby", "brunch", "party"],
    layout: "script",
    theme: blushShower,
    heroImage:
      "https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=1920&q=80&auto=format&fit=crop",
    headline: "A Little One is on the Way",
    headlineEs: "Un bebé está en camino",
    tagline: "Please join us for sweets, stories, and baby love.",
    taglineEs: "Acompáñanos a celebrar con dulces, historias y cariño.",
  },
  {
    id: "black-tie",
    name: "Modern glam",
    nameEs: "Glam moderno",
    description: "Bright white + pink pop — galas, formal birthdays, chic parties.",
    descriptionEs: "Blanco brillante + toque rosa — galas, cumpleaños formales, fiestas chic.",
    inspiredBy: "Evite Modern Black & White (light remix)",
    inspiredByEs: "Evite Modern Black & White (versión clara)",
    categories: ["dinner", "birthday", "party"],
    layout: "glam",
    theme: blackTie,
    heroImage:
      "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1920&q=80&auto=format&fit=crop",
    headline: "Dress to Celebrate",
    headlineEs: "Vístete para celebrar",
    tagline: "Sharp looks, great music, and a night that photographs well.",
    taglineEs: "Looks impecables, buena música y una noche para fotos.",
  },
  {
    id: "citrus-brunch",
    name: "Citrus brunch",
    nameEs: "Brunch cítrico",
    description: "Sunny citrus tones — daytime parties, bridal brunch, showers.",
    descriptionEs: "Tonos cítricos — fiestas de día, brunch nupcial, showers.",
    inspiredBy: "Evite Citrus / Garden Party",
    inspiredByEs: "Evite Citrus / Garden Party",
    categories: ["brunch", "wedding", "baby"],
    layout: "botanical",
    theme: citrusBrunch,
    heroImage:
      "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=1920&q=80&auto=format&fit=crop",
    headline: "Brunch is Served",
    headlineEs: "El brunch está listo",
    tagline: "Fresh juice, warm light, and a table full of friends.",
    taglineEs: "Jugo fresco, luz cálida y una mesa llena de amigos.",
  },
  {
    id: "boho-sunset",
    name: "Boho sunset",
    nameEs: "Atardecer boho",
    description: "Warm terracotta dusk — outdoor weddings, engagement parties.",
    descriptionEs: "Atardecer terracota — bodas al aire libre, compromisos.",
    inspiredBy: "Canva boho rustic + Evite earthy",
    inspiredByEs: "Boho rústico Canva + earthy Evite",
    categories: ["wedding", "party", "brunch"],
    layout: "kraft",
    theme: bohoSunset,
    heroImage:
      "https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=1920&q=80&auto=format&fit=crop",
    headline: "Under Open Skies",
    headlineEs: "Bajo cielo abierto",
    tagline: "Golden hour vows, wildflowers, and barefoot dancing.",
    taglineEs: "Votos al atardecer, flores silvestres y baile descalzo.",
  },
  {
    id: "milestone",
    name: "Milestone moment",
    nameEs: "Momento especial",
    description: "Warm dusk tones — anniversaries, graduations, launches.",
    descriptionEs: "Tonos de atardecer — aniversarios, graduaciones, lanzamientos.",
    inspiredBy: "Canva modern celebration",
    inspiredByEs: "Celebración moderna Canva",
    categories: ["graduation", "birthday", "party"],
    layout: "classic",
    theme: celebration,
    heroImage:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1920&q=80&auto=format&fit=crop",
    headline: "Here's to the Next Chapter",
    headlineEs: "Por el próximo capítulo",
    tagline: "Join us to mark a moment worth remembering.",
    taglineEs: "Acompáñanos a celebrar un momento memorable.",
  },
  {
    id: "retro-glow",
    name: "Retro glow",
    nameEs: "Brillo retro",
    description: "70s warmth + neon punch — dance parties and birthday bashes.",
    descriptionEs: "Calidez 70s + neón — fiestas y cumpleaños con baile.",
    inspiredBy: "Evite Retro / maximal celebration",
    inspiredByEs: "Evite Retro / celebración maximalista",
    categories: ["party", "birthday"],
    layout: "party",
    theme: retroGlow,
    heroImage:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&q=80&auto=format&fit=crop",
    headline: "Dance Like It's Forever",
    headlineEs: "Baila como si fuera para siempre",
    tagline: "Lights low, volume up, and zero small talk required.",
    taglineEs: "Luces bajas, volumen alto y cero conversaciones forzadas.",
  },
  {
    id: "linen-kraft",
    name: "Linen kraft",
    nameEs: "Lino kraft",
    description: "Textured neutrals — casual dinners, housewarmings, picnics.",
    descriptionEs: "Neutrales texturizados — cenas casuales, mudanzas, picnic.",
    inspiredBy: "Evite Lovely Linen / Simple Kraft",
    inspiredByEs: "Evite Lovely Linen / Simple Kraft",
    categories: ["dinner", "brunch", "party"],
    layout: "kraft",
    theme: linenKraft,
    heroImage:
      "https://images.unsplash.com/photo-1478144592103-25e218a04891?w=1920&q=80&auto=format&fit=crop",
    headline: "Come As You Are",
    headlineEs: "Ven como eres",
    tagline: "Soft light, shared plates, and an easy evening at home.",
    taglineEs: "Luz suave, platos para compartir y una noche fácil en casa.",
  },
  {
    id: "balloon-bash",
    name: "Balloon bash",
    nameEs: "Fiesta de globos",
    description: "Sky blue + candy pink — kids’ birthdays and joyful parties.",
    descriptionEs: "Azul cielo + rosa — cumpleaños infantiles y fiestas alegres.",
    inspiredBy: "Evite Birthday Balloons / Pastel Balloons",
    inspiredByEs: "Evite Birthday Balloons / Pastel Balloons",
    categories: ["birthday", "party", "baby"],
    layout: "party",
    theme: balloonBash,
    heroImage:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1920&q=80&auto=format&fit=crop",
    headline: "You're Invited to the Party",
    headlineEs: "Estás invitado a la fiesta",
    tagline: "Cake, balloons, and enough joy to fill the room.",
    taglineEs: "Pastel, globos y alegría para llenar la sala.",
  },
  {
    id: "watercolor-rose",
    name: "Watercolor rose",
    nameEs: "Rosa acuarela",
    description: "Painted florals — bridal showers, anniversaries, soft weddings.",
    descriptionEs: "Florales pintados — bridal showers, aniversarios, bodas suaves.",
    inspiredBy: "Evite Basic Watercolor + Canva floral",
    inspiredByEs: "Evite Basic Watercolor + floral Canva",
    categories: ["wedding", "baby", "brunch"],
    layout: "script",
    premium: true,
    theme: watercolorRose,
    heroImage:
      "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=1920&q=80&auto=format&fit=crop",
    headline: "With Love & Soft Blooms",
    headlineEs: "Con amor y flores suaves",
    tagline: "A gentle gathering for something beautiful beginning.",
    taglineEs: "Un encuentro suave para algo hermoso que comienza.",
  },
  {
    id: "coastal-breeze",
    name: "Coastal breeze",
    nameEs: "Brisa costera",
    description: "Sea glass + sand — destination weddings, beach weekends.",
    descriptionEs: "Vidrio de mar + arena — bodas destino, fines de semana playa.",
    inspiredBy: "Evite Nautical / Travel & Destination",
    inspiredByEs: "Evite Nautical / Travel & Destination",
    categories: ["wedding", "party", "brunch"],
    layout: "coastal",
    theme: coastalBreeze,
    heroImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80&auto=format&fit=crop",
    headline: "By the Water's Edge",
    headlineEs: "Junto al agua",
    tagline: "Salt air, bare feet, and a toast at golden hour.",
    taglineEs: "Aire salado, pies descalzos y un brindis al atardecer.",
  },
  {
    id: "tinsel-nights",
    name: "Holiday sparkle",
    nameEs: "Brillo festivo",
    description: "Bright blue + gold sparkle — New Year’s, holidays, winter parties.",
    descriptionEs: "Azul brillante + oro — Año Nuevo, fiestas y celebraciones de invierno.",
    inspiredBy: "Evite Tinsel Nights (bright remix)",
    inspiredByEs: "Evite Tinsel Nights (versión luminosa)",
    categories: ["party", "birthday", "dinner"],
    layout: "foil",
    theme: tinselNights,
    heroImage:
      "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=1920&q=80&auto=format&fit=crop",
    headline: "Let's Sparkle Together",
    headlineEs: "Brillemos juntos",
    tagline: "Toasts, bright cheer, and a room full of joy.",
    taglineEs: "Brindis, alegría y una sala llena de fiesta.",
  },
  {
    id: "modern-arch",
    name: "Modern arch",
    nameEs: "Arco moderno",
    description: "Editorial arches — stylish parties, launches, photo-forward events.",
    descriptionEs: "Arcos editoriales — fiestas con estilo, lanzamientos, eventos foto.",
    inspiredBy: "Evite Modern Arch Party",
    inspiredByEs: "Evite Modern Arch Party",
    categories: ["party", "birthday", "graduation"],
    layout: "arch",
    theme: modernArch,
    heroImage:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920&q=80&auto=format&fit=crop",
    headline: "You're on the Guest List",
    headlineEs: "Estás en la lista",
    tagline: "Clean lines, warm light, and a night made for photos.",
    taglineEs: "Líneas limpias, luz cálida y una noche hecha para fotos.",
  },
  {
    id: "latin-fiesta",
    name: "Latin fiesta",
    nameEs: "Fiesta latina",
    description:
      "Sunny marigold + turquoise — quinceañeras, bodas, bautizos, and family celebrations.",
    descriptionEs:
      "Cempasúchil soleado + turquesa — quinceañeras, bodas, bautizos y fiestas familiares.",
    inspiredBy: "Latin American celebration / Canva fiesta & quince",
    inspiredByEs: "Celebración latinoamericana / Canva fiesta y quince",
    categories: ["birthday", "wedding", "party", "baby"],
    layout: "fiesta",
    premium: true,
    theme: latinFiesta,
    heroImage:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1920&q=80&auto=format&fit=crop",
    headline: "Una Noche para Celebrar",
    headlineEs: "Una Noche para Celebrar",
    tagline:
      "Música, familia, y el sabor de estar juntos — you're invited.",
    taglineEs:
      "Música, familia y el sabor de estar juntos — estás invitado.",
  },
  {
    id: "funky-comic",
    name: "Funky comic",
    nameEs: "Cómic funky",
    description:
      "Red + yellow pop-art comic — kids’ birthdays, superhero parties, high-energy bashes.",
    descriptionEs:
      "Cómic pop rojo + amarillo — cumpleaños infantiles, fiestas de superhéroes.",
    inspiredBy: "Canva Red and Yellow Funky Comic Birthday Invitation",
    inspiredByEs: "Canva invitación cómic funky rojo y amarillo",
    categories: ["birthday", "party", "baby"],
    layout: "comic",
    theme: funkyComic,
    heroImage:
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1920&q=80&auto=format&fit=crop",
    headline: "You're Invited!",
    headlineEs: "¡Estás invitado!",
    tagline: "Cake, games, and comic-book levels of fun — suit up and show up!",
    taglineEs: "Pastel, juegos y diversión de cómic — ¡ponte el traje y llega!",
  },
  {
    id: "festive-rainbow",
    name: "Festive rainbow",
    nameEs: "Arcoíris festivo",
    description:
      "Multicolor balloons and confetti — bright kids’ birthdays and feel-good party invites.",
    descriptionEs:
      "Globos multicolor y confeti — cumpleaños infantiles y fiestas alegres.",
    inspiredBy: "Canva Multicolored Festive Birthday Party Invitation",
    inspiredByEs: "Canva invitación de cumpleaños festiva multicolor",
    categories: ["birthday", "party", "baby"],
    layout: "festive",
    theme: festiveRainbow,
    heroImage:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1920&q=80&auto=format&fit=crop",
    headline: "Let's Party!",
    headlineEs: "¡A celebrar!",
    tagline: "Balloons, cake, and all the colors — come celebrate with us!",
    taglineEs: "Globos, pastel y todos los colores — ¡ven a celebrar con nosotros!",
  },
  {
    id: "toy-party",
    name: "Toy party",
    nameEs: "Fiesta de juguetes",
    description:
      "Blue + yellow illustrated toybox — kids’ birthdays, playdates, and classroom parties.",
    descriptionEs:
      "Caja de juguetes ilustrada azul + amarillo — cumpleaños infantiles y fiestas de juegos.",
    inspiredBy:
      "Canva Invitación vertical fiesta infantil juguete azul amarillo ilustrado",
    inspiredByEs:
      "Canva invitación vertical fiesta infantil juguete azul amarillo ilustrado",
    categories: ["birthday", "party", "baby"],
    layout: "toybox",
    theme: toyParty,
    heroImage:
      "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=1920&q=80&auto=format&fit=crop",
    headline: "Come Play!",
    headlineEs: "¡Ven a jugar!",
    tagline: "Blocks, toys, cake, and giggles — join our little celebration!",
    taglineEs: "Bloques, juguetes, pastel y risas — ¡únete a nuestra fiesta!",
  },
  {
    id: "rojo-celeste",
    name: "Rojo & celeste",
    nameEs: "Rojo y celeste",
    description:
      "Illustrated kids birthday in red, sky blue, and sunny yellow — playful vertical party invites.",
    descriptionEs:
      "Cumpleaños infantil ilustrado en rojo, celeste y amarillo — invites verticales llenos de juego.",
    inspiredBy:
      "Canva Invitación vertical cumpleaños infantil ilustrado rojo celeste y amarillo",
    inspiredByEs:
      "Canva Invitación vertical cumpleaños infantil ilustrado rojo celeste y amarillo",
    categories: ["birthday", "party", "baby"],
    layout: "splash",
    theme: rojoCeleste,
    heroImage:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1920&q=80&auto=format&fit=crop",
    headline: "Let's Celebrate!",
    headlineEs: "¡A celebrar!",
    tagline: "Cake, balloons, and lots of giggles — come join the party!",
    taglineEs: "Pastel, globos y muchas risas — ¡ven a la fiesta!",
  },
  {
    id: "blue-modern",
    name: "Blue modern",
    nameEs: "Azul moderno",
    description:
      "Sleek cobalt + ice blue — modern adult birthdays, milestone nights, clean digital invites.",
    descriptionEs:
      "Cobalto elegante + azul hielo — cumpleaños adultos, hitos y invites digitales limpios.",
    inspiredBy: "Canva Blue Modern Birthday Party Invitation",
    inspiredByEs: "Canva invitación de cumpleaños azul moderna",
    categories: ["birthday", "party", "dinner"],
    layout: "azure",
    theme: blueModern,
    heroImage:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&q=80&auto=format&fit=crop",
    headline: "Join the Celebration",
    headlineEs: "Únete a la celebración",
    tagline: "A modern night of friends, music, and cake — you’re invited.",
    taglineEs: "Una noche moderna de amigos, música y pastel — estás invitado.",
  },
  {
    id: "game-on",
    name: "Game on",
    nameEs: "Nivel gamer",
    description:
      "Neon arcade video-game party — kids’ birthdays, controller cake, pixel fun.",
    descriptionEs:
      "Fiesta arcade neón — cumpleaños infantiles, pastel gamer y diversión pixel.",
    inspiredBy: "Canva Colorful Kids Video Game Birthday Party Invitation",
    inspiredByEs:
      "Canva invitación de cumpleaños infantil videojuego colorida",
    categories: ["birthday", "party", "baby"],
    layout: "arcade",
    theme: gameOn,
    heroImage:
      "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1920&q=80&auto=format&fit=crop",
    headline: "LEVEL UP!",
    headlineEs: "¡LEVEL UP!",
    tagline: "Controllers ready, snacks loaded — press start and join the party!",
    taglineEs:
      "Mandos listos, snacks cargados — ¡presiona start y únete a la fiesta!",
  },
  {
    id: "quince-azul",
    name: "Quince azul",
    nameEs: "Quinceañera azul",
    description:
      "Modern cobalt + champagne gold — quinceañeras with a sleek blue digital look.",
    descriptionEs:
      "Cobalto moderno + dorado champagne — quinceañeras con look azul elegante.",
    inspiredBy: "Canva Blue Modern Birthday Party Invitation (quinceañera)",
    inspiredByEs:
      "Canva invitación azul moderna (adaptada para quinceañera)",
    categories: ["birthday", "party"],
    layout: "quince",
    premium: true,
    theme: quinceAzul,
    heroImage:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80&auto=format&fit=crop",
    headline: "Mis XV Años",
    headlineEs: "Mis XV Años",
    tagline:
      "An evening of family, music, and a night to remember — you’re invited to celebrate fifteen.",
    taglineEs:
      "Una noche de familia, música y recuerdos — estás invitado a celebrar mis quince.",
  },
  {
    id: "golden-fifty",
    name: "Golden fifty",
    nameEs: "Cincuenta dorado",
    description:
      "Sunny champagne & coral — joyful 50th birthdays, milestone dinners, and warm celebrations.",
    descriptionEs:
      "Champán soleado y coral — cumpleaños 50 alegres, cenas especiales y celebraciones cálidas.",
    inspiredBy: "Canva 50th birthday invitations (bright champagne celebration)",
    inspiredByEs: "Canva invitaciones 50 años (celebración champán luminosa)",
    categories: ["birthday", "party", "dinner"],
    layout: "fifty",
    premium: true,
    theme: goldenFifty,
    heroImage:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920&q=80&auto=format&fit=crop",
    headline: "Fifty & Fabulous",
    headlineEs: "Cincuenta y fabuloso",
    tagline:
      "Half a century of stories — join us for champagne, cake, and a night to toast!",
    taglineEs:
      "Medio siglo de historias — ¡acompáñanos a brindar con champán y pastel!",
  },
];


export function resolveInviteLayout(templateId?: string | null): InviteLayout {
  if (!templateId) return "classic";
  return getTemplate(templateId).layout;
}

/**
 * Localize stock template headline/tagline by visitor locale.
 * Prefer event.headlineEs / taglineEs, then phrase maps, then template stock pairs.
 * Custom host-edited copy without a Spanish field/map is left as-is.
 */
const STOCK_ABOUT = {
  en: "Another year, another reason to gather. I'd love your company for a relaxed dinner and drinks — no gifts, just your presence.",
  es: "Otro año, otra razón para reunirnos. Me encantaría contar con tu compañía para una cena relajada — sin regalos, solo tu presencia.",
} as const;

export function resolveLocalizedInviteCopy(
  event: {
    headline: string;
    tagline: string;
    headlineEs?: string | null;
    taglineEs?: string | null;
    about?: string;
    aboutEs?: string | null;
    templateId?: string | null;
  },
  locale: "en" | "es",
): { headline: string; tagline: string; about: string } {
  const tpl = getTemplate(event.templateId || "evening");
  const headlineIsStock =
    event.headline === tpl.headline || event.headline === tpl.headlineEs;
  const taglineIsStock =
    event.tagline === tpl.tagline || event.tagline === tpl.taglineEs;
  const aboutRaw = event.about ?? "";
  const aboutIsStock =
    aboutRaw === STOCK_ABOUT.en || aboutRaw === STOCK_ABOUT.es;

  const headline = headlineIsStock
    ? locale === "es"
      ? tpl.headlineEs
      : tpl.headline
    : resolveLocalizedHeadline(event.headline, event.headlineEs, locale);

  const tagline = taglineIsStock
    ? locale === "es"
      ? tpl.taglineEs
      : tpl.tagline
    : resolveLocalizedTagline(event.tagline, event.taglineEs, locale);

  const about = aboutIsStock
    ? locale === "es"
      ? STOCK_ABOUT.es
      : STOCK_ABOUT.en
    : resolveLocalizedAbout(aboutRaw, event.aboutEs, locale);

  return { headline, tagline, about };
}

export function getTemplate(id: string): EventTemplate {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]!;
}

/** Remap retired/404 Unsplash stock heroes to working replacements. */
const BROKEN_HERO_REMAP: Record<string, string> = {
  "https://images.unsplash.com/photo-1496412705862-e008682476bd?w=1920&q=80&auto=format&fit=crop":
    "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=1920&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1464349153735-7db55f04b818?w=1920&q=80&auto=format&fit=crop":
    "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1920&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1464349153735-7db819ff493e?w=1920&q=80&auto=format&fit=crop":
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920&q=80&auto=format&fit=crop",
};

export function remapBrokenHeroImage(url: string | null | undefined): string {
  if (!url) return "";
  if (BROKEN_HERO_REMAP[url]) return BROKEN_HERO_REMAP[url]!;
  // Also match without query string
  const base = url.split("?")[0] ?? url;
  for (const [broken, fixed] of Object.entries(BROKEN_HERO_REMAP)) {
    if ((broken.split("?")[0] ?? broken) === base) return fixed;
  }
  return url;
}

export function templatesByCategory(
  category: TemplateCategory | "all",
): EventTemplate[] {
  if (category === "all") return TEMPLATES;
  return TEMPLATES.filter((t) => t.categories.includes(category));
}

const LATIN_TEMPLATE_IDS = new Set([
  "latin-fiesta",
  "watercolor-rose",
  "champagne-wedding",
  "toy-party",
  "rojo-celeste",
  "quince-azul",
]);

export function defaultRsvpFields(
  deadlineISO: string,
  opts?: { locale?: "en" | "es"; templateId?: string },
) {
  const preferEs =
    opts?.locale === "es" ||
    (opts?.templateId ? LATIN_TEMPLATE_IDS.has(opts.templateId) : false);

  if (preferEs) {
    return {
      plusOnes: { enabled: true, label: "Número de invitados", max: 2 },
      dietary: {
        enabled: true,
        label: "Restricciones alimentarias o alergias",
        placeholder: "Vegetariano, sin gluten, etc.",
      },
      attendance: {
        enabled: true,
        options: ["Asistiré con gusto", "Lamento no poder asistir"],
      },
      deadline: deadlineISO,
      prompt: "Por favor confirma para reservarte un lugar.",
      customQuestions: [
        {
          id: "meal",
          type: "meal" as const,
          label: "Preferencia de platillo",
          options: [
            "Pollo",
            "Pescado",
            "Vegetariano",
            "Vegano",
            "Menú infantil",
          ],
          required: false,
        },
      ],
    };
  }

  return {
    plusOnes: { enabled: true, label: "Guest count", max: 2 },
    dietary: {
      enabled: true,
      label: "Dietary restrictions or allergies",
      placeholder: "Vegetarian, gluten-free, etc.",
    },
    attendance: {
      enabled: true,
      options: ["Joyfully attending", "Regretfully declining"],
    },
    deadline: deadlineISO,
    prompt: "Kindly respond so we can save you a seat.",
    customQuestions: [
      {
        id: "meal",
        type: "meal" as const,
        label: "Meal preference",
        options: ["Chicken", "Fish", "Vegetarian", "Vegan", "Kids meal"],
        required: false,
      },
    ],
  };
}

/** Localize stock RSVP field labels/options/prompt by visitor locale. */
export function resolveLocalizedRsvpFields(
  fields: EventRecord["rsvpFields"],
  locale: "en" | "es",
): EventRecord["rsvpFields"] {
  const en = defaultRsvpFields(fields.deadline || "", { locale: "en" });
  const es = defaultRsvpFields(fields.deadline || "", { locale: "es" });
  const pick = locale === "es" ? es : en;

  const plusLabel =
    fields.plusOnes.label === en.plusOnes.label ||
    fields.plusOnes.label === es.plusOnes.label
      ? pick.plusOnes.label
      : fields.plusOnes.label;

  const dietaryLabel =
    fields.dietary.label === en.dietary.label ||
    fields.dietary.label === es.dietary.label
      ? pick.dietary.label
      : fields.dietary.label;

  const dietaryPlaceholder =
    fields.dietary.placeholder === en.dietary.placeholder ||
    fields.dietary.placeholder === es.dietary.placeholder
      ? pick.dietary.placeholder
      : fields.dietary.placeholder;

  const attendanceOptions = fields.attendance.options.map((opt) => {
    const idxEn = en.attendance.options.indexOf(opt);
    if (idxEn >= 0) return pick.attendance.options[idxEn] ?? opt;
    const idxEs = es.attendance.options.indexOf(opt);
    if (idxEs >= 0) return pick.attendance.options[idxEs] ?? opt;
    return opt;
  });

  const stockPromptsEn = new Set([
    en.prompt,
    "Kindly respond by September 5 so we can save you a seat.",
  ]);
  const stockPromptsEs = new Set([
    es.prompt,
    "Por favor confirma para reservarte un lugar.",
  ]);
  const prompt =
    stockPromptsEn.has(fields.prompt) || stockPromptsEs.has(fields.prompt)
      ? pick.prompt
      : fields.prompt;

  const customQuestions = (fields.customQuestions ?? []).map((q) => {
    const enMeal = en.customQuestions?.[0];
    const esMeal = es.customQuestions?.[0];
    if (
      q.type === "meal" &&
      enMeal &&
      esMeal &&
      (q.label === enMeal.label || q.label === esMeal.label)
    ) {
      const options = (q.options ?? []).map((opt) => {
        const iEn = enMeal.options?.indexOf(opt) ?? -1;
        if (iEn >= 0) return pick.customQuestions?.[0]?.options?.[iEn] ?? opt;
        const iEs = esMeal.options?.indexOf(opt) ?? -1;
        if (iEs >= 0) return pick.customQuestions?.[0]?.options?.[iEs] ?? opt;
        return opt;
      });
      return {
        ...q,
        label: pick.customQuestions?.[0]?.label ?? q.label,
        options,
      };
    }
    return q;
  });

  return {
    ...fields,
    plusOnes: { ...fields.plusOnes, label: plusLabel },
    dietary: {
      ...fields.dietary,
      label: dietaryLabel,
      placeholder: dietaryPlaceholder,
    },
    attendance: { ...fields.attendance, options: attendanceOptions },
    prompt,
    customQuestions,
  };
}

export function buildEventFromTemplate(input: {
  templateId: string;
  ownerId: string;
  hostName: string;
  title: string;
  slug: string;
  dateISO: string;
  timeLabel: string;
  venue: string;
  address: string;
  about: string;
  locale?: "en" | "es";
}): Omit<EventRecord, "id" | "createdAt" | "updatedAt"> {
  const tpl = getTemplate(input.templateId);
  return {
    slug: input.slug,
    ownerId: input.ownerId,
    hostName: input.hostName,
    title: input.title,
    // Store English stock copy; guests see ES via resolveLocalizedInviteCopy
    headline: tpl.headline,
    tagline: tpl.tagline,
    dateISO: input.dateISO,
    timeLabel: input.timeLabel,
    venue: input.venue,
    address: input.address,
    theme: tpl.theme,
    heroImage: tpl.heroImage,
    customDomain: null,
    rsvpFields: defaultRsvpFields(input.dateISO, {
      locale: input.locale,
      templateId: tpl.id,
    }),
    about: input.about,
    published: true,
    visibility: "public",
    capacity: null,
    registryUrl: null,
    templateId: tpl.id,
    showOwnviteFooter: true,
    tier: "free",
    premiumTheme: Boolean(tpl.premium),
  };
}
