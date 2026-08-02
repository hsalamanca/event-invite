import type { EventRecord, Theme } from "./types";

export type TemplateCategory =
  | "birthday"
  | "wedding"
  | "baby"
  | "dinner"
  | "brunch"
  | "party"
  | "graduation";

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
  theme: Theme;
  heroImage: string;
  headline: string;
  headlineEs: string;
  tagline: string;
  taglineEs: string;
};

const evening: Theme = {
  colors: {
    background: "#0F1A2E",
    surface: "#1A2744",
    accentPrimary: "#C9A962",
    accentSecondary: "#E07A5F",
    textPrimary: "#F4F0E8",
    textMuted: "#9BA8BC",
  },
  fonts: { display: "Cormorant Garamond", body: "Source Sans 3" },
};

const garden: Theme = {
  colors: {
    background: "#14241A",
    surface: "#1E3326",
    accentPrimary: "#C4A35A",
    accentSecondary: "#7FA38B",
    textPrimary: "#F3F0E6",
    textMuted: "#A8B5A4",
  },
  fonts: { display: "Fraunces", body: "DM Sans" },
};

const celebration: Theme = {
  colors: {
    background: "#1A1520",
    surface: "#2A2233",
    accentPrimary: "#E8B4A0",
    accentSecondary: "#C9A962",
    textPrimary: "#F7F1EA",
    textMuted: "#B8A9B5",
  },
  fonts: { display: "Cormorant Garamond", body: "Source Sans 3" },
};

/** Evite “Festive Gold Confetti” energy — champagne sparkle on deep ink */
const goldConfetti: Theme = {
  colors: {
    background: "#14110F",
    surface: "#241E1A",
    accentPrimary: "#E0C37A",
    accentSecondary: "#F2E6C8",
    textPrimary: "#FBF6EC",
    textMuted: "#B8A990",
  },
  fonts: { display: "Playfair Display", body: "Outfit" },
};

/** Evite “Olive Minimal” — quiet botanical green */
const oliveMinimal: Theme = {
  colors: {
    background: "#1C2118",
    surface: "#2A3224",
    accentPrimary: "#A8B57A",
    accentSecondary: "#D9C9A3",
    textPrimary: "#F2EFE6",
    textMuted: "#A7AB99",
  },
  fonts: { display: "Lora", body: "DM Sans" },
};

/** Canva floral / Evite Baby’s Breath — soft ivory romance */
const ivoryBloom: Theme = {
  colors: {
    background: "#2A2420",
    surface: "#3A322C",
    accentPrimary: "#E8D5C4",
    accentSecondary: "#C7A98A",
    textPrimary: "#FAF6F1",
    textMuted: "#C4B5A8",
  },
  fonts: { display: "Great Vibes", body: "Lora" },
};

/** Canva blush pastel baby shower */
const blushShower: Theme = {
  colors: {
    background: "#2B2226",
    surface: "#3A2E34",
    accentPrimary: "#E8B4C8",
    accentSecondary: "#F0D5C8",
    textPrimary: "#FFF7F9",
    textMuted: "#C9B0BA",
  },
  fonts: { display: "Cormorant Garamond", body: "Outfit" },
};

/** Evite “Modern Black & White” glam */
const blackTie: Theme = {
  colors: {
    background: "#0A0A0A",
    surface: "#1A1A1A",
    accentPrimary: "#F5F5F5",
    accentSecondary: "#A0A0A0",
    textPrimary: "#FAFAFA",
    textMuted: "#8C8C8C",
  },
  fonts: { display: "Playfair Display", body: "Outfit" },
};

/** Evite citrus / garden brunch */
const citrusBrunch: Theme = {
  colors: {
    background: "#1F2414",
    surface: "#2C331C",
    accentPrimary: "#E8B84A",
    accentSecondary: "#E07A4F",
    textPrimary: "#F7F3E8",
    textMuted: "#B5B49A",
  },
  fonts: { display: "Fraunces", body: "DM Sans" },
};

/** Canva boho / rustic sunset */
const bohoSunset: Theme = {
  colors: {
    background: "#2A1D16",
    surface: "#3B2A20",
    accentPrimary: "#D4A574",
    accentSecondary: "#8B6F5C",
    textPrimary: "#F6EDE3",
    textMuted: "#BCA490",
  },
  fonts: { display: "Lora", body: "Source Sans 3" },
};

/** Evite Gold Frame Wedding / ivory & gold */
const champagneWedding: Theme = {
  colors: {
    background: "#1A1714",
    surface: "#2B2621",
    accentPrimary: "#D4AF6A",
    accentSecondary: "#F0E6D4",
    textPrimary: "#FBF7F0",
    textMuted: "#B8AA96",
  },
  fonts: { display: "Great Vibes", body: "Cormorant Garamond" },
};

/** Retro disco / maximal celebration */
const retroGlow: Theme = {
  colors: {
    background: "#1A1024",
    surface: "#2A1A38",
    accentPrimary: "#F0A35E",
    accentSecondary: "#E85D75",
    textPrimary: "#FFF4EC",
    textMuted: "#C4A8B8",
  },
  fonts: { display: "Fraunces", body: "Outfit" },
};

/** Evite Lovely Linen / Simple Kraft */
const linenKraft: Theme = {
  colors: {
    background: "#221E1A",
    surface: "#322C26",
    accentPrimary: "#C4A882",
    accentSecondary: "#8A7A68",
    textPrimary: "#F4EDE3",
    textMuted: "#B0A090",
  },
  fonts: { display: "Lora", body: "Source Sans 3" },
};

/** Evite Birthday Balloons — playful sky celebration */
const balloonBash: Theme = {
  colors: {
    background: "#152033",
    surface: "#1E2E48",
    accentPrimary: "#7EB8E8",
    accentSecondary: "#F2A0B8",
    textPrimary: "#F5F8FC",
    textMuted: "#9AADC4",
  },
  fonts: { display: "Fraunces", body: "Outfit" },
};

/** Canva / Evite watercolor romance */
const watercolorRose: Theme = {
  colors: {
    background: "#241820",
    surface: "#342430",
    accentPrimary: "#D4A0B0",
    accentSecondary: "#E8C8B8",
    textPrimary: "#FBF4F6",
    textMuted: "#C4A8B0",
  },
  fonts: { display: "Great Vibes", body: "Lora" },
};

/** Destination / coastal */
const coastalBreeze: Theme = {
  colors: {
    background: "#122028",
    surface: "#1A2E38",
    accentPrimary: "#7EB8B0",
    accentSecondary: "#E8D4A8",
    textPrimary: "#F2F7F6",
    textMuted: "#9AB0B4",
  },
  fonts: { display: "Playfair Display", body: "DM Sans" },
};

/** Evite Tinsel Nights — NYE / holiday sparkle */
const tinselNights: Theme = {
  colors: {
    background: "#0E1420",
    surface: "#1A2438",
    accentPrimary: "#C9D4E8",
    accentSecondary: "#E0A85C",
    textPrimary: "#F4F7FC",
    textMuted: "#96A4BC",
  },
  fonts: { display: "Playfair Display", body: "Outfit" },
};

/** Evite Modern Arch Party */
const modernArch: Theme = {
  colors: {
    background: "#18161C",
    surface: "#28242E",
    accentPrimary: "#E8C4A0",
    accentSecondary: "#8A9EAE",
    textPrimary: "#F7F2EC",
    textMuted: "#A8A0A8",
  },
  fonts: { display: "Outfit", body: "DM Sans" },
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
    name: "Evening celebration",
    nameEs: "Celebración nocturna",
    description: "Ink navy + champagne — dinners, birthdays, cocktail parties.",
    descriptionEs: "Azul noche + champán — cenas, cumpleaños, cócteles.",
    inspiredBy: "Evite cocktail & dinner classics",
    inspiredByEs: "Clásicos de cóctel y cena de Evite",
    categories: ["dinner", "birthday", "party"],
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
    description: "Deep green + gold — brunches, showers, outdoor parties.",
    descriptionEs: "Verde profundo + oro — brunches, baby showers, al aire libre.",
    inspiredBy: "Evite Garden Party + Canva greenery",
    inspiredByEs: "Evite Garden Party + verdor Canva",
    categories: ["brunch", "baby", "party"],
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
    name: "Black & white glam",
    nameEs: "Glam blanco y negro",
    description: "Crisp monochrome — galas, formal birthdays, after-parties.",
    descriptionEs: "Monocromo nítido — galas, cumpleaños formales, after-parties.",
    inspiredBy: "Evite Modern Black & White",
    inspiredByEs: "Evite Modern Black & White",
    categories: ["dinner", "birthday", "party"],
    theme: blackTie,
    heroImage:
      "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1920&q=80&auto=format&fit=crop",
    headline: "Black Tie Optional",
    headlineEs: "Etiqueta opcional",
    tagline: "Sharp looks, late music, and a night that photographs well.",
    taglineEs: "Looks impecables, música hasta tarde y una noche para fotos.",
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
    theme: citrusBrunch,
    heroImage:
      "https://images.unsplash.com/photo-1496412705862-e008682476bd?w=1920&q=80&auto=format&fit=crop",
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
    theme: balloonBash,
    heroImage:
      "https://images.unsplash.com/photo-1464349153735-7db55f04b818?w=1920&q=80&auto=format&fit=crop",
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
    name: "Tinsel nights",
    nameEs: "Noches de oropel",
    description: "Cool sparkle — New Year’s, holidays, winter parties.",
    descriptionEs: "Brillo frío — Año Nuevo, fiestas y noches de invierno.",
    inspiredBy: "Evite Tinsel Nights / Gleaming Gold",
    inspiredByEs: "Evite Tinsel Nights / Gleaming Gold",
    categories: ["party", "birthday", "dinner"],
    theme: tinselNights,
    heroImage:
      "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=1920&q=80&auto=format&fit=crop",
    headline: "Sparkle Into the Night",
    headlineEs: "Brilla en la noche",
    tagline: "Midnight toasts, silver light, and a room full of cheer.",
    taglineEs: "Brindis a medianoche, luz plateada y mucha alegría.",
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
    theme: modernArch,
    heroImage:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920&q=80&auto=format&fit=crop",
    headline: "You're on the Guest List",
    headlineEs: "Estás en la lista",
    tagline: "Clean lines, warm light, and a night made for photos.",
    taglineEs: "Líneas limpias, luz cálida y una noche hecha para fotos.",
  },
];

export function getTemplate(id: string): EventTemplate {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]!;
}

export function templatesByCategory(
  category: TemplateCategory | "all",
): EventTemplate[] {
  if (category === "all") return TEMPLATES;
  return TEMPLATES.filter((t) => t.categories.includes(category));
}

export function defaultRsvpFields(deadlineISO: string) {
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
  const es = input.locale === "es";
  return {
    slug: input.slug,
    ownerId: input.ownerId,
    hostName: input.hostName,
    title: input.title,
    headline: es ? tpl.headlineEs : tpl.headline,
    tagline: es ? tpl.taglineEs : tpl.tagline,
    dateISO: input.dateISO,
    timeLabel: input.timeLabel,
    venue: input.venue,
    address: input.address,
    theme: tpl.theme,
    heroImage: tpl.heroImage,
    customDomain: null,
    rsvpFields: defaultRsvpFields(input.dateISO),
    about: input.about,
    published: true,
    visibility: "public",
    capacity: null,
    registryUrl: null,
    templateId: tpl.id,
  };
}
