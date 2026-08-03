import type { FaqItem, ScheduleItem } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";

/** Common day-of schedule titles (EN → ES). */
const SCHEDULE_TITLE_ES: Record<string, string> = {
  Arrival: "Llegada",
  Arrivals: "Llegadas",
  "Guest arrival": "Llegada de invitados",
  "Cocktail hour": "Hora del cóctel",
  Cocktails: "Cócteles",
  Ceremony: "Ceremonia",
  Reception: "Recepción",
  Dinner: "Cena",
  Lunch: "Comida",
  Brunch: "Brunch",
  "Food Service Starts": "Empieza el servicio de comida",
  "Food service starts": "Empieza el servicio de comida",
  "Food service": "Servicio de comida",
  "Dinner service": "Servicio de cena",
  Dancing: "Baile",
  Dance: "Baile",
  Cake: "Pastel",
  "Cake cutting": "Corte de pastel",
  Speeches: "Discursos",
  Toast: "Brindis",
  Toasts: "Brindis",
  "Party Ends": "Fin de la fiesta",
  "Party ends": "Fin de la fiesta",
  "End of party": "Fin de la fiesta",
  "Doors open": "Apertura de puertas",
  Photos: "Fotos",
  "Photo time": "Hora de fotos",
};

const FAQ_ES: Record<string, { question: string; answer: string }> = {
  "What's included?": {
    question: "¿Qué incluye?",
    answer: "¡Comida, refrescos de fuente y margaritas!",
  },
  "What is included?": {
    question: "¿Qué incluye?",
    answer: "¡Comida, refrescos de fuente y margaritas!",
  },
  "What should I wear?": {
    question: "¿Qué debo vestir?",
    answer: "",
  },
  "Can I bring a plus one?": {
    question: "¿Puedo llevar un acompañante?",
    answer: "",
  },
};

const FAQ_ANSWER_ES: Record<string, string> = {
  "Meal, fountain drinks and margaritas!":
    "¡Comida, refrescos de fuente y margaritas!",
};

const ABOUT_ES: Record<string, string> = {
  "Another year, another reason to gather. I'd love your company for a relaxed dinner and drinks — no gifts, just your presence.":
    "Otro año, otra razón para reunirnos. Me encantaría contar con tu compañía para una cena relajada — sin regalos, solo tu presencia.",
  "I'd love your company — no gifts, just your presence.":
    "Me encantaría contar con tu compañía — sin regalos, solo tu presencia.",
  "<h3>What to expect</h3>Dinner, dancing, and cake.<br /><b>No gifts — just your presence.</b>":
    "<h3>Qué esperar</h3>Cena, baile y pastel.<br /><b>Sin regalos — solo tu presencia.</b>",
  "Join us in celebrating\nHugo & Mayra's 50th Birthday\nWe're turning the big 5-0 and we'd love for you to celebrate with us":
    "Acompáñanos a celebrar\nel 50 cumpleaños de Hugo y Mayra\nCumplimos el gran 5-0 y nos encantaría que celebres con nosotros",
  "Join us in celebrating\nHugo & Mayra's 50th Birthday\nWe're turning the big 5-0 and we'd love for you to celebrate with us!\nFood, drinks, music, and good vibes all night.\nCome ready to celebrate 50 years of life, love, and everything in between.\n<br>\nPlease <b>RSVP</b> by SEP 5TH so we can make sure there's enough food and cake for everyone.\nLooking forward to seeing you there!\nWith love,\nHugo & Mayra":
    "Acompáñanos a celebrar\nel 50 cumpleaños de Hugo y Mayra\n¡Cumplimos el gran 5-0 y nos encantaría que celebres con nosotros!\nComida, bebidas, música y buena vibra toda la noche.\nVen listo para celebrar 50 años de vida, amor y todo lo que hay en medio.\n<br>\nPor favor <b>confirma tu asistencia (RSVP)</b> antes del 5 DE SEP para asegurarnos de que haya comida y pastel para todos.\n¡Esperamos verte allí!\nCon cariño,\nHugo y Mayra",
};

function reverseMap(map: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [en, es] of Object.entries(map)) out[es] = en;
  return out;
}

const SCHEDULE_TITLE_EN = reverseMap(SCHEDULE_TITLE_ES);

function normalizeForLookup(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ")
    .trim();
}

function lookupAboutEs(about: string): string | undefined {
  const raw = normalizeForLookup(about);
  if (ABOUT_ES[raw]) return ABOUT_ES[raw];
  for (const [en, es] of Object.entries(ABOUT_ES)) {
    if (normalizeForLookup(en) === raw) return es;
  }
  return undefined;
}

function lookupScheduleTitleEs(title: string): string | undefined {
  if (SCHEDULE_TITLE_ES[title]) return SCHEDULE_TITLE_ES[title];
  const lowered = title.trim().toLowerCase();
  for (const [en, es] of Object.entries(SCHEDULE_TITLE_ES)) {
    if (en.toLowerCase() === lowered) return es;
  }
  return undefined;
}

export function resolveLocalizedAbout(
  about: string,
  aboutEs: string | null | undefined,
  locale: Locale,
): string {
  if (locale === "es") {
    if (aboutEs?.trim()) return aboutEs;
    return lookupAboutEs(about) ?? about;
  }
  // Prefer EN about; if only Spanish stored in about, try reverse via map
  if (about?.trim()) return about;
  return aboutEs?.trim() || about;
}

export function resolveLocalizedSchedule(
  items: ScheduleItem[] | undefined,
  locale: Locale,
): ScheduleItem[] {
  return (items ?? []).map((item) => {
    if (locale === "es") {
      return {
        ...item,
        title:
          item.titleEs?.trim() ||
          lookupScheduleTitleEs(item.title) ||
          item.title,
        description:
          item.descriptionEs?.trim() || item.description || "",
      };
    }
    return {
      ...item,
      title:
        item.title?.trim() ||
        (item.titleEs ? SCHEDULE_TITLE_EN[item.titleEs] : undefined) ||
        item.titleEs ||
        "",
      description: item.description?.trim() || item.descriptionEs || "",
    };
  });
}

export function resolveLocalizedFaqs(
  items: FaqItem[] | undefined,
  locale: Locale,
): FaqItem[] {
  return (items ?? []).map((item) => {
    if (locale === "es") {
      const mapped = FAQ_ES[item.question];
      const answerMapped =
        item.answerEs?.trim() ||
        FAQ_ANSWER_ES[item.answer] ||
        (mapped?.answer ? mapped.answer : undefined) ||
        item.answer;
      return {
        ...item,
        question: item.questionEs?.trim() || mapped?.question || item.question,
        answer: answerMapped,
      };
    }
    return {
      ...item,
      question: item.question?.trim() || item.questionEs || "",
      answer: item.answer?.trim() || item.answerEs || "",
    };
  });
}

/** Suggest Spanish copy for host content (used when seeding Es fields). */
export function suggestSpanishAbout(about: string): string | undefined {
  return lookupAboutEs(about);
}

export function suggestSpanishScheduleTitle(title: string): string | undefined {
  return lookupScheduleTitleEs(title);
}

export function suggestSpanishFaq(
  question: string,
  answer: string,
): {
  question?: string;
  answer?: string;
} {
  const mapped = FAQ_ES[question];
  return {
    question: mapped?.question,
    answer: FAQ_ANSWER_ES[answer] || mapped?.answer || undefined,
  };
}
