import type { Locale } from "./config";

export type Dictionary = {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    domains: string;
    pricing: string;
    openInvite: string;
    customize: string;
    language: string;
  };
  landing: {
    brand: string;
    headline1: string;
    headline2: string;
    support: string;
    ctaInvite: string;
    ctaCustomize: string;
    previewEyebrow: string;
    previewHeadline: string;
    previewMeta: string;
    features: { title: string; body: string }[];
    compareTitle: string;
    compareBody: string;
    seePricing: string;
    footer: string;
  };
  pricing: {
    title: string;
    eyebrow: string;
    headline: string;
    support: string;
    seeDemo: string;
    mostPopular: string;
    agency: string;
    tiers: {
      name: string;
      price: string;
      detail: string;
      points: string[];
      cta: string;
    }[];
  };
  domains: {
    title: string;
    eyebrow: string;
    headline: string;
    support: string;
    openStudio: string;
    steps: { title: string; body: string }[];
    cheatSheet: string;
    cheatIntro: string;
    subdomainTitle: string;
    subdomainExample: string;
    apexTitle: string;
    apexExample: string;
    registrarTitle: string;
    registrarTips: string[];
    freeTitle: string;
    freeIntro: string;
    freePath: string;
    freeSub: string;
    tryTitle: string;
    tryBody: string;
    tryCta: string;
  };
  host: {
    studio: string;
    customize: string;
    viewInvite: string;
    rsvps: string;
    yes: string;
    save: string;
    saving: string;
    saved: string;
    content: string;
    hostName: string;
    title: string;
    headline: string;
    tagline: string;
    date: string;
    time: string;
    venue: string;
    address: string;
    about: string;
    colors: string;
    fonts: string;
    display: string;
    body: string;
    livePreview: string;
    background: string;
    accentPrimary: string;
    accentSecondary: string;
    textPrimary: string;
  };
  upload: {
    title: string;
    hint: string;
    upload: string;
    uploading: string;
    orUrl: string;
    urlPlaceholder: string;
  };
  domainConnect: {
    title: string;
    intro: string;
    alwaysWorks: string;
    freeSub: string;
    subHint: string;
    yourDomain: string;
    connect: string;
    update: string;
    working: string;
    status: string;
    dnsTitle: string;
    dnsIntro: string;
    type: string;
    host: string;
    value: string;
    tips: string[];
    verify: string;
    remove: string;
    more: string;
  };
  invite: {
    rsvp: string;
    details: string;
    date: string;
    time: string;
    venue: string;
    address: string;
    about: string;
    openMap: string;
    name: string;
    email: string;
    attendance: string;
    guests: string;
    dietary: string;
    note: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successBody: string;
  };
};

const en: Dictionary = {
  meta: {
    title: "Ownvite — Host on your own domain",
    description:
      "Designer-grade digital invitations with deep customization and custom domains.",
  },
  nav: {
    domains: "Domains",
    pricing: "Pricing",
    openInvite: "Open birthday invite",
    customize: "Customize it",
    language: "ES",
  },
  landing: {
    brand: "Ownvite",
    headline1: "Host on your own domain.",
    headline2: "Design like you mean it.",
    support:
      "Digital invitations with deep customization and custom domains — starting with H Salamanca's birthday as the first live proof.",
    ctaInvite: "View the birthday invite",
    ctaCustomize: "Customize it",
    previewEyebrow: "H Salamanca · Birthday",
    previewHeadline: "A Night to Celebrate",
    previewMeta: "Saturday, September 12 · Open invite →",
    features: [
      {
        title: "Your domain",
        body: "Share party.yourname.com — point a CNAME at Ownvite and guests never see our chrome.",
      },
      {
        title: "Pixel control",
        body: "Fonts, colors, hero media, motion, and copy — tuned live before you send.",
      },
      {
        title: "Honest pricing",
        body: "One event pass. Invite twelve or one-twenty. No coins, no guest-count math.",
      },
    ],
    compareTitle: "Built to beat ads, coins, and per-guest fees",
    compareBody:
      "Evite puts ads on your guests. Paperless Post hides cost in coins. Greenvelope charges by headcount. Ownvite ships a branded micro-site on your domain — flat event pricing.",
    seePricing: "See pricing →",
    footer: "Ownvite · Your event, your domain, your design",
  },
  pricing: {
    title: "Pricing",
    eyebrow: "Pricing",
    headline: "Pay for the event, not the guest list",
    support:
      "Transparent one-time event passes with custom domains — no coin packs, no ads on your guests, no per-head surprise.",
    seeDemo: "See demo invite →",
    mostPopular: "Most popular",
    agency: "Agency / white-label from $199/mo —",
    tiers: [
      {
        name: "Free",
        price: "$0",
        detail: "Forever",
        points: [
          "Subdomain on ownvite.app",
          "Standard templates",
          "RSVP collection",
          "Ownvite footer",
        ],
        cta: "Start free",
      },
      {
        name: "Pro Event",
        price: "$29",
        detail: "One-time · launch $19",
        points: [
          "Custom domain + SSL",
          "No ads or watermark",
          "Premium themes & motion",
          "Guest messaging · 500 emails",
        ],
        cta: "Upgrade this event",
      },
      {
        name: "Studio",
        price: "$12",
        detail: "per month · or $99/yr",
        points: [
          "5 active events",
          "All Pro features",
          "Font & CSS overrides",
          "Analytics & priority support",
        ],
        cta: "Talk to us",
      },
    ],
  },
  domains: {
    title: "Connect a custom domain",
    eyebrow: "Custom domains",
    headline: "Point your domain at Ownvite",
    support:
      "Guests should see your hostname — not a long path under someone else's brand. Ownvite terminates SSL and routes the host to your event invite.",
    openStudio: "Open host studio →",
    steps: [
      {
        title: "1. Open Host studio",
        body: "Go to your event’s customize page and find Custom domain. Enter a hostname you control — we recommend a subdomain like party.yourname.com.",
      },
      {
        title: "2. Click Connect",
        body: "Ownvite registers the hostname on our hosting edge and shows the exact DNS records to create. SSL is issued automatically once DNS is correct.",
      },
      {
        title: "3. Add DNS at your registrar",
        body: "In Namecheap, Cloudflare, GoDaddy, etc., open DNS for the parent domain and add the records Ownvite displays. Then click Verify DNS.",
      },
      {
        title: "4. Share your link",
        body: "When status is active, guests open https://your-hostname — same invite as /e/your-slug, with your brand in the URL bar.",
      },
    ],
    cheatSheet: "DNS cheat sheet",
    cheatIntro:
      "Exact hosts appear in Host studio after you connect. These are the Ownvite targets:",
    subdomainTitle: "Subdomain (recommended)",
    subdomainExample: "Example: party.yourdomain.com",
    apexTitle: "Apex / root domain",
    apexExample: "Example: yourdomain.com (prefer a subdomain when you can)",
    registrarTitle: "Registrar tips",
    registrarTips: [
      "Namecheap: Domain List → Manage → Advanced DNS → Add new record.",
      "Cloudflare: DNS → Records. Gray-cloud (DNS only) is fine while verifying.",
      "GoDaddy: DNS → Manage DNS → Add. Remove conflicting records on the same host.",
      "TTL: Automatic or 300 seconds while testing.",
    ],
    freeTitle: "Free Ownvite URLs (no custom domain)",
    freeIntro: "Every event also gets:",
    freePath: "Path: https://ownvite.com/e/your-slug",
    freeSub: "Subdomain: https://your-slug.ownvite.app",
    tryTitle: "Try it on the birthday demo",
    tryBody:
      "Connect a domain you own to the sample event and walk through Verify DNS end-to-end.",
    tryCta: "Open host studio",
  },
  host: {
    studio: "Host studio",
    customize: "Customize invite",
    viewInvite: "View invite",
    rsvps: "RSVPs",
    yes: "yes",
    save: "Save",
    saving: "Saving…",
    saved: "Saved",
    content: "Content",
    hostName: "Host name",
    title: "Title",
    headline: "Headline",
    tagline: "Tagline",
    date: "Date",
    time: "Time",
    venue: "Venue",
    address: "Address",
    about: "About",
    colors: "Colors",
    fonts: "Fonts",
    display: "Display",
    body: "Body",
    livePreview: "Live preview",
    background: "Background",
    accentPrimary: "Accent primary",
    accentSecondary: "Accent secondary",
    textPrimary: "Text primary",
  },
  upload: {
    title: "Hero image",
    hint: "Upload a photo from your device (JPG, PNG, WEBP · max 8MB). Best way — no URL hunting.",
    upload: "Upload image",
    uploading: "Uploading…",
    orUrl: "Or paste an image URL",
    urlPlaceholder: "https://…",
  },
  domainConnect: {
    title: "Custom domain",
    intro:
      "Point your own hostname at Ownvite so guests open party.yourdomain.com instead of an Ownvite path.",
    alwaysWorks: "Always works (no DNS)",
    freeSub: "Free Ownvite subdomain",
    subHint:
      "Subdomain requires a * CNAME on ownvite.app (platform DNS). Path link works today.",
    yourDomain: "Your domain",
    connect: "Connect",
    update: "Update",
    working: "Working…",
    status: "Status",
    dnsTitle: "DNS records to add",
    dnsIntro:
      "At your registrar (Namecheap, Cloudflare, GoDaddy…), open DNS settings and add:",
    type: "Type",
    host: "Host / Name",
    value: "Value / Points to",
    tips: [
      "TTL: Automatic or 5 minutes while testing.",
      "Remove conflicting A/AAAA/CNAME records for the same host.",
      "Apex domains need A records; prefer a subdomain like party. when you can.",
      "Propagation is often minutes; can take up to 24–48 hours.",
    ],
    verify: "Verify DNS",
    remove: "Remove domain",
    more: "Full guide:",
  },
  invite: {
    rsvp: "RSVP",
    details: "Details",
    date: "Date",
    time: "Time",
    venue: "Venue",
    address: "Address",
    about: "About",
    openMap: "Open in Maps",
    name: "Name",
    email: "Email",
    attendance: "Attendance",
    guests: "Guest count",
    dietary: "Dietary restrictions",
    note: "Note for the host",
    submit: "Send RSVP",
    submitting: "Sending…",
    successTitle: "You're on the list",
    successBody: "Thanks — we've recorded your response.",
  },
};

const es: Dictionary = {
  meta: {
    title: "Ownvite — Tu evento, tu dominio",
    description:
      "Invitaciones digitales con personalización profunda y dominios propios.",
  },
  nav: {
    domains: "Dominios",
    pricing: "Precios",
    openInvite: "Ver invitación",
    customize: "Personalizar",
    language: "EN",
  },
  landing: {
    brand: "Ownvite",
    headline1: "Tu evento en tu propio dominio.",
    headline2: "Diseña con intención.",
    support:
      "Invitaciones digitales con personalización profunda y dominios personalizados — empezando con el cumpleaños de H Salamanca como primera prueba en vivo.",
    ctaInvite: "Ver la invitación de cumpleaños",
    ctaCustomize: "Personalizarla",
    previewEyebrow: "H Salamanca · Cumpleaños",
    previewHeadline: "Una noche para celebrar",
    previewMeta: "Sábado 12 de septiembre · Abrir invitación →",
    features: [
      {
        title: "Tu dominio",
        body: "Comparte fiesta.tunombre.com — apunta un CNAME a Ownvite y tus invitados no ven nuestra marca.",
      },
      {
        title: "Control total",
        body: "Fuentes, colores, imagen hero, animación y textos — ajústalos en vivo antes de enviar.",
      },
      {
        title: "Precio claro",
        body: "Un pago por evento. Invita a doce o a ciento veinte. Sin monedas ni cobros por invitado.",
      },
    ],
    compareTitle: "Hecho para superar anuncios, monedas y cobros por persona",
    compareBody:
      "Evite pone anuncios a tus invitados. Paperless Post esconde el costo en monedas. Greenvelope cobra por cabeza. Ownvite publica un micro-sitio con tu marca en tu dominio — precio fijo por evento.",
    seePricing: "Ver precios →",
    footer: "Ownvite · Tu evento, tu dominio, tu diseño",
  },
  pricing: {
    title: "Precios",
    eyebrow: "Precios",
    headline: "Paga por el evento, no por la lista de invitados",
    support:
      "Pases transparentes por evento con dominio propio — sin monedas, sin anuncios para tus invitados, sin sorpresas por persona.",
    seeDemo: "Ver invitación demo →",
    mostPopular: "Más popular",
    agency: "Agencia / marca blanca desde $199/mes —",
    tiers: [
      {
        name: "Gratis",
        price: "$0",
        detail: "Para siempre",
        points: [
          "Subdominio en ownvite.app",
          "Plantillas estándar",
          "Recolección de RSVP",
          "Pie de Ownvite",
        ],
        cta: "Empezar gratis",
      },
      {
        name: "Pro Evento",
        price: "$29",
        detail: "Pago único · lanzamiento $19",
        points: [
          "Dominio propio + SSL",
          "Sin anuncios ni marca de agua",
          "Temas premium y motion",
          "Mensajes a invitados · 500 emails",
        ],
        cta: "Mejorar este evento",
      },
      {
        name: "Studio",
        price: "$12",
        detail: "al mes · o $99/año",
        points: [
          "5 eventos activos",
          "Todo lo de Pro",
          "Overrides de fuentes y CSS",
          "Analítica y soporte prioritario",
        ],
        cta: "Hablemos",
      },
    ],
  },
  domains: {
    title: "Conecta un dominio propio",
    eyebrow: "Dominios personalizados",
    headline: "Apunta tu dominio a Ownvite",
    support:
      "Tus invitados deben ver tu hostname — no una ruta larga bajo la marca de otro. Ownvite emite el SSL y enruta el host a tu invitación.",
    openStudio: "Abrir estudio del anfitrión →",
    steps: [
      {
        title: "1. Abre el estudio",
        body: "Ve a la página de personalización y busca Dominio personalizado. Usa un hostname que controles — recomendamos un subdominio como fiesta.tunombre.com.",
      },
      {
        title: "2. Pulsa Conectar",
        body: "Ownvite registra el hostname en nuestro edge y muestra los registros DNS exactos. El SSL se emite solo cuando el DNS está bien.",
      },
      {
        title: "3. Agrega el DNS en tu registrador",
        body: "En Namecheap, Cloudflare, GoDaddy, etc., abre el DNS del dominio padre y crea los registros que muestra Ownvite. Luego pulsa Verificar DNS.",
      },
      {
        title: "4. Comparte tu enlace",
        body: "Cuando el estado sea activo, los invitados abren https://tu-hostname — la misma invitación que /e/tu-slug, con tu marca en la barra de dirección.",
      },
    ],
    cheatSheet: "Guía rápida de DNS",
    cheatIntro:
      "Los hosts exactos aparecen en el estudio tras conectar. Estos son los destinos de Ownvite:",
    subdomainTitle: "Subdominio (recomendado)",
    subdomainExample: "Ejemplo: fiesta.tudominio.com",
    apexTitle: "Dominio raíz (apex)",
    apexExample: "Ejemplo: tudominio.com (mejor un subdominio si puedes)",
    registrarTitle: "Consejos por registrador",
    registrarTips: [
      "Namecheap: Domain List → Manage → Advanced DNS → Add new record.",
      "Cloudflare: DNS → Records. Nube gris (solo DNS) sirve mientras verificas.",
      "GoDaddy: DNS → Manage DNS → Add. Elimina registros en conflicto en el mismo host.",
      "TTL: Automático o 300 segundos mientras pruebas.",
    ],
    freeTitle: "URLs gratis de Ownvite (sin dominio propio)",
    freeIntro: "Cada evento también tiene:",
    freePath: "Ruta: https://ownvite.com/e/tu-slug",
    freeSub: "Subdominio: https://tu-slug.ownvite.app",
    tryTitle: "Pruébalo en el demo de cumpleaños",
    tryBody:
      "Conecta un dominio tuyo al evento de muestra y completa Verificar DNS de punta a punta.",
    tryCta: "Abrir estudio del anfitrión",
  },
  host: {
    studio: "Estudio del anfitrión",
    customize: "Personalizar invitación",
    viewInvite: "Ver invitación",
    rsvps: "RSVPs",
    yes: "sí",
    save: "Guardar",
    saving: "Guardando…",
    saved: "Guardado",
    content: "Contenido",
    hostName: "Nombre del anfitrión",
    title: "Título",
    headline: "Titular",
    tagline: "Frase de apoyo",
    date: "Fecha",
    time: "Hora",
    venue: "Lugar",
    address: "Dirección",
    about: "Acerca de",
    colors: "Colores",
    fonts: "Fuentes",
    display: "Display",
    body: "Cuerpo",
    livePreview: "Vista previa en vivo",
    background: "Fondo",
    accentPrimary: "Acento principal",
    accentSecondary: "Acento secundario",
    textPrimary: "Texto principal",
  },
  upload: {
    title: "Imagen principal",
    hint: "Sube una foto desde tu dispositivo (JPG, PNG, WEBP · máx. 8MB). La mejor opción — sin buscar URLs.",
    upload: "Subir imagen",
    uploading: "Subiendo…",
    orUrl: "O pega la URL de una imagen",
    urlPlaceholder: "https://…",
  },
  domainConnect: {
    title: "Dominio personalizado",
    intro:
      "Apunta tu propio hostname a Ownvite para que los invitados abran fiesta.tudominio.com en lugar de una ruta de Ownvite.",
    alwaysWorks: "Siempre funciona (sin DNS)",
    freeSub: "Subdominio gratis de Ownvite",
    subHint:
      "El subdominio requiere un CNAME * en ownvite.app (DNS de la plataforma). El enlace por ruta ya funciona.",
    yourDomain: "Tu dominio",
    connect: "Conectar",
    update: "Actualizar",
    working: "Trabajando…",
    status: "Estado",
    dnsTitle: "Registros DNS a agregar",
    dnsIntro:
      "En tu registrador (Namecheap, Cloudflare, GoDaddy…), abre la configuración DNS y agrega:",
    type: "Tipo",
    host: "Host / Nombre",
    value: "Valor / Apunta a",
    tips: [
      "TTL: Automático o 5 minutos mientras pruebas.",
      "Elimina registros A/AAAA/CNAME en conflicto para el mismo host.",
      "Los dominios raíz necesitan registros A; preferimos un subdominio como fiesta.",
      "La propagación suele ser minutos; a veces hasta 24–48 horas.",
    ],
    verify: "Verificar DNS",
    remove: "Quitar dominio",
    more: "Guía completa:",
  },
  invite: {
    rsvp: "Confirmar",
    details: "Detalles",
    date: "Fecha",
    time: "Hora",
    venue: "Lugar",
    address: "Dirección",
    about: "Acerca de",
    openMap: "Abrir en Maps",
    name: "Nombre",
    email: "Correo",
    attendance: "Asistencia",
    guests: "Número de invitados",
    dietary: "Restricciones alimentarias",
    note: "Nota para el anfitrión",
    submit: "Enviar confirmación",
    submitting: "Enviando…",
    successTitle: "Estás en la lista",
    successBody: "Gracias — registramos tu respuesta.",
  },
};

const dictionaries: Record<Locale, Dictionary> = { en, es };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? en;
}
