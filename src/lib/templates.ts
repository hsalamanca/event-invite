import type { EventRecord, Theme } from "./types";

export type EventTemplate = {
  id: string;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
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

export const TEMPLATES: EventTemplate[] = [
  {
    id: "evening",
    name: "Evening celebration",
    nameEs: "Celebración nocturna",
    description: "Ink navy + champagne — dinners, birthdays, cocktail parties.",
    descriptionEs: "Azul noche + champán — cenas, cumpleaños, cócteles.",
    theme: evening,
    heroImage:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&q=80&auto=format&fit=crop",
    headline: "A Night to Celebrate",
    headlineEs: "Una noche para celebrar",
    tagline: "An evening of good food, close friends, and a little dancing.",
    taglineEs: "Una noche de buena comida, amigos cercanos y un poco de baile.",
  },
  {
    id: "garden",
    name: "Garden gathering",
    nameEs: "Encuentro en el jardín",
    description: "Deep green + gold — brunches, showers, outdoor parties.",
    descriptionEs: "Verde profundo + oro — brunches, baby showers, al aire libre.",
    theme: garden,
    heroImage:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1920&q=80&auto=format&fit=crop",
    headline: "Gather in the Garden",
    headlineEs: "Reunión en el jardín",
    tagline: "Sunshine, shared plates, and easy conversation.",
    taglineEs: "Sol, platos para compartir y conversación sencilla.",
  },
  {
    id: "milestone",
    name: "Milestone moment",
    nameEs: "Momento especial",
    description: "Warm dusk tones — anniversaries, graduations, launches.",
    descriptionEs: "Tonos de atardecer — aniversarios, graduaciones, lanzamientos.",
    theme: celebration,
    heroImage:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1920&q=80&auto=format&fit=crop",
    headline: "Here's to the Next Chapter",
    headlineEs: "Por el próximo capítulo",
    tagline: "Join us to mark a moment worth remembering.",
    taglineEs: "Acompáñanos a celebrar un momento memorable.",
  },
];

export function getTemplate(id: string): EventTemplate {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]!;
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
