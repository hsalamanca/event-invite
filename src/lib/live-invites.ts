import type { EventRecord, ScheduleItem } from "./types";

export type LiveVariant = "wedding" | "party" | "baby" | "quince";

const VARIANTS: Record<string, LiveVariant> = {
  "golden-hour": "wedding",
  "confetti-hour": "party",
  "little-arrival": "baby",
};

export function liveVariant(templateId?: string | null): LiveVariant | null {
  if (!templateId) return null;
  return VARIANTS[templateId] ?? null;
}

export type CountdownStatus = "upcoming" | "today" | "past";

export type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  status: CountdownStatus;
};

/** Local instant for an invite date plus a label like "5:00 PM". */
export function eventInstant(dateISO: string, timeLabel?: string): number | null {
  const date = dateISO.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  let hours = 12;
  let minutes = 0;
  const match = timeLabel?.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (match) {
    hours = Number(match[1]);
    minutes = Number(match[2] ?? 0);
    const meridiem = match[3]?.toLowerCase();
    if (meridiem === "pm" && hours < 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;
  }
  if (hours > 23 || minutes > 59) return null;
  const stamp = new Date(
    `${date}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`,
  );
  const ms = stamp.getTime();
  return Number.isNaN(ms) ? null : ms;
}

export function countdownTo(
  dateISO: string,
  timeLabel: string | undefined,
  now: number,
): Countdown | null {
  const target = eventInstant(dateISO, timeLabel);
  if (target == null) return null;
  const diff = target - now;
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, status: "past" };
  }
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTarget = new Date(target);
  startOfTarget.setHours(0, 0, 0, 0);
  const status: CountdownStatus =
    startOfTarget.getTime() === startOfToday.getTime() ? "today" : "upcoming";
  const total = Math.floor(diff / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    status,
  };
}

export type LiveExtras = {
  schedule: ScheduleItem[];
  dressCode: string;
  whatToBring?: string;
  gifts?: string;
  balloonDigits?: string;
};

const STOCK_COPY: Record<string, string> = {
  "Cocktail attire — garden formal": "Cóctel — formal de jardín",
  "Play clothes welcome": "Ropa para jugar",
  "Soft colors, easy shoes": "Colores suaves y zapatos cómodos",
  "A swimsuit if you want the splash zone":
    "Traje de baño si quieres la zona de agua",
  "A picture book in place of a card, if you like":
    "Un libro ilustrado en vez de una tarjeta, si quieres",
  "Newborn diapers and picture books are the most welcome.":
    "Lo que más se agradece: pañales de recién nacido y libros ilustrados.",
};

export function localizeStock(value: string | undefined, locale: "en" | "es"): string {
  const text = value?.trim() ?? "";
  if (!text) return "";
  if (locale === "es") return STOCK_COPY[text] ?? text;
  const english = Object.entries(STOCK_COPY).find(([, es]) => es === text)?.[0];
  return english ?? text;
}

function placeLine(venue: string, address: string): string {
  return [venue.trim(), address.trim()].filter(Boolean).join(", ");
}

/** Starter day-of plan so a new live invite is not an empty page. */
export function liveEventExtras(
  templateId: string,
  input: { timeLabel: string; venue: string; address: string },
): LiveExtras | null {
  const variant = liveVariant(templateId);
  if (!variant) return null;
  const where = placeLine(input.venue, input.address);
  const when = input.timeLabel.trim();

  if (variant === "wedding") {
    return {
      dressCode: "Cocktail attire — garden formal",
      gifts: "Your company is the gift.",
      schedule: [
        {
          id: "ceremony",
          time: when,
          title: "Ceremony",
          titleEs: "Ceremonia",
          description: where,
        },
        {
          id: "cocktails",
          time: "",
          title: "Cocktails",
          titleEs: "Cóctel",
          description: "Right after the ceremony",
          descriptionEs: "Justo después de la ceremonia",
        },
        {
          id: "dinner",
          time: "",
          title: "Dinner",
          titleEs: "Cena",
          description: "A seated meal together",
          descriptionEs: "Cena sentados, todos juntos",
        },
        {
          id: "dancing",
          time: "",
          title: "Dancing",
          titleEs: "Baile",
          description: "Until the last song",
          descriptionEs: "Hasta la última canción",
        },
      ],
    };
  }

  if (variant === "party") {
    return {
      dressCode: "Play clothes welcome",
      whatToBring: "A swimsuit if you want the splash zone",
      balloonDigits: "7",
      schedule: [
        {
          id: "doors",
          time: when,
          title: "Doors open",
          titleEs: "Abrimos puertas",
          description: where,
        },
        {
          id: "games",
          time: "",
          title: "Games",
          titleEs: "Juegos",
          description: "Races, music, and a splash zone",
          descriptionEs: "Carreras, música y zona de agua",
        },
        {
          id: "cake",
          time: "",
          title: "Cake",
          titleEs: "Pastel",
          description: "Candles, then the sugar",
          descriptionEs: "Velas y después el azúcar",
        },
        {
          id: "pickup",
          time: "",
          title: "Pickup",
          titleEs: "Salida",
          description: "We'll send everyone home happy",
          descriptionEs: "Todos se van contentos",
        },
      ],
    };
  }

  return {
    dressCode: "Soft colors, easy shoes",
    whatToBring: "A picture book in place of a card, if you like",
    gifts: "Newborn diapers and picture books are the most welcome.",
    schedule: [
      {
        id: "welcome",
        time: when,
        title: "Welcome",
        titleEs: "Bienvenida",
        description: where,
      },
      {
        id: "games",
        time: "",
        title: "Games",
        titleEs: "Juegos",
        description: "Short, sweet, and optional",
        descriptionEs: "Cortos, dulces y opcionales",
      },
      {
        id: "lunch",
        time: "",
        title: "Lunch",
        titleEs: "Almuerzo",
        description: "Something light in the garden",
        descriptionEs: "Algo ligero en el jardín",
      },
      {
        id: "wishes",
        time: "",
        title: "Wishes",
        titleEs: "Deseos",
        description: "A book, a note, a toast",
        descriptionEs: "Un libro, una nota, un brindis",
      },
    ],
  };
}

/** Sales previews: a full guest site, not the blank starter. */
export function livePreviewOverlay(
  templateId: string,
): Partial<EventRecord> | null {
  const variant = liveVariant(templateId);
  if (!variant) return null;

  if (variant === "wedding") {
    return {
      hostName: "The Reyes and Alvarez families",
      headline: "Camila & Mateo",
      headlineEs: "Camila & Mateo",
      dateISO: "2027-06-19",
      timeLabel: "5:00 PM",
      venue: "The Garden House",
      address: "1840 Westheimer Rd, Houston, TX",
      about:
        "Camila and Mateo met on a rainy Tuesday and never quite left each other's side. On a June evening in the garden, they will promise the rest.",
      aboutEs:
        "Camila y Mateo se conocieron un martes de lluvia y ya no se soltaron. En una tarde de junio, en el jardín, se prometen el resto.",
      dressCode: "Cocktail attire — garden formal",
      hotelInfo:
        "A room block is held at Hotel ZaZa Houston under Reyes–Alvarez until May 19.",
      parking: "Valet at the garden gate, or the lot on Westheimer.",
      gifts: "Your company is the gift.",
      capacity: 140,
      schedule: [
        {
          id: "ceremony",
          time: "5:00 PM",
          title: "Ceremony",
          titleEs: "Ceremonia",
          description: "The Garden House lawn",
          descriptionEs: "Jardín de The Garden House",
        },
        {
          id: "cocktails",
          time: "6:00 PM",
          title: "Cocktails",
          titleEs: "Cóctel",
          description: "Champagne on the terrace",
          descriptionEs: "Champán en la terraza",
        },
        {
          id: "dinner",
          time: "7:00 PM",
          title: "Dinner",
          titleEs: "Cena",
          description: "A seated meal under the lights",
          descriptionEs: "Cena sentados bajo las luces",
        },
        {
          id: "dancing",
          time: "8:30 PM",
          title: "Dancing",
          titleEs: "Baile",
          description: "Until the last song",
          descriptionEs: "Hasta la última canción",
        },
      ],
      faqs: [
        {
          id: "kids",
          question: "Are children invited?",
          questionEs: "¿Van los niños?",
          answer: "Yes. There is a lawn for them during dinner.",
          answerEs: "Sí. Hay jardín para ellos durante la cena.",
        },
      ],
    };
  }

  if (variant === "party") {
    return {
      hostName: "The Vega family",
      headline: "Luna",
      headlineEs: "Luna",
      dateISO: "2026-11-07",
      timeLabel: "2:00 PM",
      venue: "Luna's backyard",
      address: "410 Bartlett St, Houston, TX",
      balloonDigits: "7",
      about:
        "Luna is turning seven and the backyard is turning into a carnival. Games, cake, and a splash zone — parents, you're invited to stay.",
      aboutEs:
        "Luna cumple siete y el patio se vuelve feria. Juegos, pastel y zona de agua — papás, quédense también.",
      dressCode: "Play clothes welcome",
      whatToBring: "A swimsuit if you want the splash zone",
      parking: "Street parking on Bartlett. The driveway stays clear.",
      capacity: 24,
      schedule: [
        {
          id: "doors",
          time: "2:00 PM",
          title: "Doors open",
          titleEs: "Abrimos puertas",
          description: "Bracelets, bubbles, and the backyard",
          descriptionEs: "Pulseras, burbujas y el patio",
        },
        {
          id: "games",
          time: "2:30 PM",
          title: "Games",
          titleEs: "Juegos",
          description: "Races, music, and a splash zone",
          descriptionEs: "Carreras, música y zona de agua",
        },
        {
          id: "cake",
          time: "4:00 PM",
          title: "Cake",
          titleEs: "Pastel",
          description: "Candles, then the sugar",
          descriptionEs: "Velas y después el azúcar",
        },
        {
          id: "pickup",
          time: "5:30 PM",
          title: "Pickup",
          titleEs: "Salida",
          description: "We'll send everyone home happy",
          descriptionEs: "Todos se van contentos",
        },
      ],
    };
  }

  return {
    hostName: "Ana Morales",
    headline: "Sofía & Andrés",
    headlineEs: "Sofía & Andrés",
    dateISO: "2026-10-17",
    timeLabel: "11:00 AM",
    venue: "The Greenhouse Cafe",
    address: "2208 Yale St, Houston, TX",
    about:
      "Sofía and Andrés are waiting on a little one this November. Come celebrate the parents-to-be, eat something sweet, and send them home with a story to read aloud.",
    aboutEs:
      "Sofía y Andrés esperan a su bebé este noviembre. Vengan a celebrar, coman algo dulce y llévense a casa una historia para leer en voz alta.",
    dressCode: "Soft colors, easy shoes",
    whatToBring: "A picture book in place of a card, if you like",
    gifts: "Newborn diapers and picture books are the most welcome.",
    parking: "The cafe lot is small. Street parking on Yale is easy.",
    capacity: 36,
    schedule: [
      {
        id: "welcome",
        time: "11:00 AM",
        title: "Welcome",
        titleEs: "Bienvenida",
        description: "Coffee, juice, and a seat in the garden",
        descriptionEs: "Café, jugo y un lugar en el jardín",
      },
      {
        id: "games",
        time: "11:30 AM",
        title: "Games",
        titleEs: "Juegos",
        description: "Short, sweet, and optional",
        descriptionEs: "Cortos, dulces y opcionales",
      },
      {
        id: "lunch",
        time: "12:30 PM",
        title: "Lunch",
        titleEs: "Almuerzo",
        description: "Something light under the glass",
        descriptionEs: "Algo ligero bajo el cristal",
      },
      {
        id: "wishes",
        time: "1:30 PM",
        title: "Wishes",
        titleEs: "Deseos",
        description: "A book, a note, a toast",
        descriptionEs: "Un libro, una nota, un brindis",
      },
    ],
  };
}
