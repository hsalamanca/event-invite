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
    signIn: string;
    signUp: string;
    dashboard: string;
    createEvent: string;
  };
  landing: {
    brand: string;
    headline: string;
    support: string;
    ctaStart: string;
    ctaDemo: string;
    ctaHow: string;
    domainTitle: string;
    domainBody: string;
    domainLink: string;
    domainUrl: string;
    craftTitle: string;
    craftBody: string;
    craftCaptions: string[];
    guestTitle: string;
    guestBody: string;
    guestSteps: string[];
    occasionsTitle: string;
    occasionsBody: string;
    occasions: string[];
    closeTitle: string;
    closeBody: string;
    closeNote: string;
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
    balloonDigits: string;
    balloonDigitsHint: string;
    date: string;
    time: string;
    venue: string;
    address: string;
    about: string;
    aboutHtmlHint: string;
    colors: string;
    fonts: string;
    display: string;
    body: string;
    livePreview: string;
    background: string;
    accentPrimary: string;
    accentSecondary: string;
    textPrimary: string;
    settings: string;
    visibility: string;
    visibilityPublic: string;
    visibilityUnlisted: string;
    capacity: string;
    capacityHint: string;
    registryUrl: string;
    published: string;
    rsvpEnabled: string;
    rsvpEnabledHint: string;
    applyTemplate: string;
    applyTemplateHint: string;
  };
  dashboard: {
    eyebrow: string;
    title: string;
    support: string;
    create: string;
    emptyTitle: string;
    emptyBody: string;
    edit: string;
    view: string;
    guests: string;
    draft: string;
    signOut: string;
  };
  create: {
    stepTemplate: string;
    stepDetails: string;
    pickTemplate: string;
    pickSupport: string;
    continue: string;
    detailsTitle: string;
    detailsSupport: string;
    title: string;
    host: string;
    slug: string;
    date: string;
    time: string;
    venue: string;
    address: string;
    about: string;
    back: string;
    create: string;
    creating: string;
    error: string;
  };
  guests: {
    title: string;
    support: string;
    exportCsv: string;
    rsvps: string;
    yes: string;
    no: string;
    headcount: string;
    manual: string;
    namePh: string;
    emailPh: string;
    add: string;
    error: string;
    colName: string;
    colEmail: string;
    colStatus: string;
    colGuests: string;
    colNote: string;
    empty: string;
    manualTag: string;
  };
  hostActions: {
    title: string;
    support: string;
    copy: string;
    copied: string;
    copyFail: string;
    calendar: string;
    duplicate: string;
    delete: string;
    deleteConfirm: string;
    error: string;
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
    editSub: string;
    editSubHint: string;
    editSubWarn: string;
    saveSub: string;
    subSaved: string;
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
    invitesYou: string;
    comicPresents: string;
    festiveParty: string;
    toyPartyInvite: string;
    splashInvite: string;
    modernCelebrate: string;
    arcadePlayer: string;
    quinceInvite: string;
    fiftyCelebrate: string;
    collageInvite: string;
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
    addToCalendar: string;
    share: string;
    copyLink: string;
    copied: string;
    downloadPostcard: string;
    guestbook: string;
    guestbookPrompt: string;
    guestbookName: string;
    guestbookMessage: string;
    guestbookSubmit: string;
    guestbookThanks: string;
    registry: string;
    registryCta: string;
    registryPrompt: string;
    guestInfo: string;
    schedule: string;
    dressCode: string;
    parking: string;
    whatToBring: string;
    stay: string;
    travel: string;
    contactHost: string;
    emailHost: string;
    callText: string;
    faq: string;
    gallery: string;
    playlist: string;
    weather: string;
    rainChance: string;
    thankYou: string;
    thankYouDefault: string;
    pastEventPrompt: string;
    deadlinePassed: string;
    deadlineToday: string;
    deadlineInDays: string;
    atCapacity: string;
    seatsOpen: string;
    eventFull: string;
    rsvpClosed: string;
    waitlistPrompt: string;
    waitlistSubmit: string;
    waitlistThanks: string;
    waitlistGuests: string;
    waitlistError: string;
    updateRsvp: string;
    selectOption: string;
    leaveNote: string;
    hostedBy: string;
    submitError: string;
    somethingWrong: string;
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
    signIn: "Sign in",
    signUp: "Sign up",
    dashboard: "Dashboard",
    createEvent: "Create event",
  },
  landing: {
    brand: "Ownvite",
    headline: "Your invitation. Your domain.",
    support:
      "Beautiful digital invites that live on the address you already own.",
    ctaStart: "Create an invitation",
    ctaDemo: "Peek a live invite",
    ctaHow: "See how it works",
    domainTitle: "Hosted on your name, not ours.",
    domainBody:
      "Guests open your domain. RSVPs, updates, and memories stay under your brand — not a disposable link.",
    domainLink: "Connect your domain",
    domainUrl: "mayraandhugo.com",
    craftTitle: "Designed like print. Delivered like the web.",
    craftBody:
      "Typography, paper texture, and layout that feel intentional — then open instantly on any phone.",
    craftCaptions: ["Dinner", "Garden", "Milestone"],
    guestTitle: "Guests arrive, respond, and you’re done.",
    guestBody:
      "A clear page. A simple RSVP. Reminders when you want them — none of the noise you don’t.",
    guestSteps: ["Open your link", "RSVP in seconds", "You’re notified"],
    occasionsTitle: "For occasions that deserve your name on them.",
    occasionsBody:
      "Weddings, private dinners, product launches, and gatherings where a generic invite link feels wrong.",
    occasions: [
      "Weddings & celebrations",
      "Intimate dinners & weekends",
      "Brand & product moments",
    ],
    closeTitle: "Put your next invitation on your domain.",
    closeBody: "Start free. Connect a domain when you’re ready.",
    closeNote: "No credit card to explore templates.",
    seePricing: "See pricing",
    footer: "Ownvite · Your event, your domain, your design",
  },
  pricing: {
    title: "Pricing",
    eyebrow: "Pricing",
    headline: "Pay for the event, not the guest list",
    support:
      "Transparent one-time event passes with custom domains — no coin packs, no ads on your guests, no per-head surprise. Premium themes from $7, or unlock everything with Pro.",
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
          "RSVP + meal questions",
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
          "All premium themes · seating chart",
          "Email blasts · private invites",
          "QR check-in + co-hosts · no footer",
        ],
        cta: "Upgrade this event",
      },
      {
        name: "Studio",
        price: "$12",
        detail: "per month · or $99/yr",
        points: [
          "5 active events",
          "Theme packs + marketplace early access",
          "SMS credits · analytics",
          "Priority support",
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
    balloonDigits: "Balloon digits",
    balloonDigitsHint: "1–2 digits for the silver number balloons (e.g. 20, 30, 5).",
    date: "Date",
    time: "Time",
    venue: "Venue",
    address: "Address",
    about: "About",
    aboutHtmlHint:
      "HTML allowed: <h1>–<h6>, <b>, <strong>, <br>, <i>, <em>, <p>. Example: <h3>Dress code</h3>Cocktail attire<br /><b>No gifts</b>",
    colors: "Colors",
    fonts: "Fonts",
    display: "Display",
    body: "Body",
    livePreview: "Live preview",
    background: "Background",
    accentPrimary: "Accent primary",
    accentSecondary: "Accent secondary",
    textPrimary: "Text primary",
    settings: "Event settings",
    visibility: "Visibility",
    visibilityPublic: "Public link",
    visibilityUnlisted: "Unlisted link",
    capacity: "Capacity (optional)",
    capacityHint: "Leave blank for unlimited",
    registryUrl: "Gift registry / wishlist URL",
    published: "Published (visible to guests)",
    rsvpEnabled: "Collect RSVPs",
    rsvpEnabledHint:
      "Turn off for announcement-only invites (no RSVP form). Guests can still leave a note.",
    applyTemplate: "Apply template look",
    applyTemplateHint:
      "Updates colors, fonts, and headlines from a template. Your uploaded photo is kept.",
  },
  dashboard: {
    eyebrow: "Your events",
    title: "Host dashboard",
    support: "Create invitations, manage guests, share links, and connect domains.",
    create: "Create event",
    emptyTitle: "No events yet",
    emptyBody:
      "Pick a template, set the date and venue, then customize fonts, colors, and your domain.",
    edit: "Customize",
    view: "View invite",
    guests: "Guests",
    draft: "Draft",
    signOut: "Sign out",
  },
  create: {
    stepTemplate: "Template",
    stepDetails: "Details",
    pickTemplate: "Choose a look",
    pickSupport:
      "19 bright, celebratory looks inspired by Evite & Canva — sunny gold, garden green, blush, Latin fiesta, and more. Change everything later.",
    continue: "Continue",
    detailsTitle: "Event details",
    detailsSupport: "Guests will see these on your invitation page.",
    title: "Event title",
    host: "Host name",
    slug: "URL slug (optional)",
    date: "Date",
    time: "Time",
    venue: "Venue",
    address: "Address",
    about: "About / note to guests",
    back: "Back",
    create: "Create invitation",
    creating: "Creating…",
    error: "Could not create event.",
  },
  guests: {
    title: "Guest list",
    support: "RSVPs plus guests you add manually — export anytime as CSV.",
    exportCsv: "Export CSV",
    rsvps: "RSVPs",
    yes: "yes",
    no: "no",
    headcount: "headcount",
    manual: "manual",
    namePh: "Guest name",
    emailPh: "Email (optional)",
    add: "Add guest",
    error: "Could not update guests.",
    colName: "Name",
    colEmail: "Email",
    colStatus: "Status",
    colGuests: "Guests",
    colNote: "Notes",
    empty: "No guests yet — share your invite link to collect RSVPs.",
    manualTag: "Added by host",
  },
  hostActions: {
    title: "Share & manage",
    support: "Copy your link, text guests, add to calendar, or duplicate this event.",
    copy: "Copy invite link",
    copied: "Copied!",
    copyFail: "Could not copy link.",
    calendar: "Download .ics",
    duplicate: "Duplicate",
    delete: "Delete event",
    deleteConfirm: "Delete this event permanently?",
    error: "Something went wrong.",
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
      "Works on both ownvite.app and ownvite.com after SSL provisions (usually a minute).",
    editSub: "Edit subdomain",
    editSubHint:
      "Choose the label for your free Ownvite links on .app and .com.",
    editSubWarn:
      "Saving renames your invite URL (/e/…) and Host studio link to match.",
    saveSub: "Save subdomain",
    subSaved: "Ownvite subdomain updated.",
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
    invitesYou: "cordially invites you to",
    comicPresents: "presents a birthday bash",
    festiveParty: "is throwing a birthday party",
    toyPartyInvite: "invites you to a toy party",
    splashInvite: "invites you to a birthday party",
    modernCelebrate: "is celebrating",
    arcadePlayer: "player one invites you",
    quinceInvite: "cordially invites you to her quinceañera",
    fiftyCelebrate: "is celebrating fifty fabulous years",
    collageInvite: "birthday of",
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
    addToCalendar: "Add to calendar",
    share: "Share",
    copyLink: "Copy link",
    copied: "Link copied",
    downloadPostcard: "Download postcard",
    guestbook: "Guestbook",
    guestbookPrompt: "Leave a note for the host",
    guestbookName: "Your name",
    guestbookMessage: "Your message",
    guestbookSubmit: "Post message",
    guestbookThanks: "Thanks for writing!",
    registry: "Gift ideas",
    registryCta: "View registry",
    registryPrompt:
      "If you’d like to celebrate with a gift, here’s where we’re registered.",
    guestInfo: "Guest info",
    schedule: "Schedule",
    dressCode: "Dress code",
    parking: "Parking",
    whatToBring: "What to bring",
    stay: "Stay",
    travel: "Travel",
    contactHost: "Contact host",
    emailHost: "Email {name}",
    callText: "Call / text",
    faq: "FAQ",
    gallery: "Gallery",
    playlist: "Playlist",
    weather: "Weather",
    rainChance: "rain chance",
    thankYou: "Thank you",
    thankYouDefault:
      "Thank you for celebrating with us. Share a memory in the guestbook below.",
    pastEventPrompt:
      "This celebration has already happened. Thanks for being part of it — leave a guestbook note below.",
    deadlinePassed: "RSVP deadline has passed.",
    deadlineToday: "RSVP by today.",
    deadlineInDays: "RSVP within {days} day(s) (by {date}).",
    atCapacity:
      "This celebration is at capacity — RSVPs are closed for new guests.",
    seatsOpen: "{open} of {capacity} seats still open.",
    eventFull:
      "This event is full. Contact the host if you need to change an existing RSVP.",
    rsvpClosed: "This RSVP form is closed.",
    waitlistPrompt:
      "Join the waitlist and we’ll reach out if a seat opens.",
    waitlistSubmit: "Join waitlist",
    waitlistThanks: "You’re on the waitlist — we’ll be in touch if a seat opens.",
    waitlistGuests: "Party size",
    waitlistError: "Could not join the waitlist",
    updateRsvp: "Update or cancel your RSVP",
    selectOption: "Select…",
    leaveNote: "Leave a note",
    hostedBy: "Hosted by {name}",
    submitError: "Unable to submit RSVP",
    somethingWrong: "Something went wrong",
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
    signIn: "Entrar",
    signUp: "Crear cuenta",
    dashboard: "Panel",
    createEvent: "Crear evento",
  },
  landing: {
    brand: "Ownvite",
    headline: "Tu invitación. Tu dominio.",
    support:
      "Invitaciones digitales hermosas que viven en la dirección que ya es tuya.",
    ctaStart: "Crear una invitación",
    ctaDemo: "Ver una invitación en vivo",
    ctaHow: "Cómo funciona",
    domainTitle: "En tu nombre, no en el nuestro.",
    domainBody:
      "Tus invitados abren tu dominio. Confirmaciones, novedades y recuerdos quedan bajo tu marca — no en un enlace genérico.",
    domainLink: "Conecta tu dominio",
    domainUrl: "mayraandhugo.com",
    craftTitle: "Diseñada como impresión. Entregada como la web.",
    craftBody:
      "Tipografía, textura de papel y composición intencional — y se abre al instante en cualquier teléfono.",
    craftCaptions: ["Cena", "Jardín", "Hito"],
    guestTitle: "Llegan, confirman, y listo.",
    guestBody:
      "Una página clara. Un RSVP simple. Recordatorios cuando quieras — sin el ruido que no necesitas.",
    guestSteps: [
      "Abren tu enlace",
      "Confirman en segundos",
      "Tú recibes aviso",
    ],
    occasionsTitle: "Para ocasiones que merecen tu nombre.",
    occasionsBody:
      "Bodas, cenas privadas, lanzamientos y encuentros donde un enlace genérico se siente mal.",
    occasions: [
      "Bodas y celebraciones",
      "Cenas íntimas y fines de semana",
      "Momentos de marca y producto",
    ],
    closeTitle: "Pon tu próxima invitación en tu dominio.",
    closeBody: "Empieza gratis. Conecta un dominio cuando quieras.",
    closeNote: "Sin tarjeta para explorar plantillas.",
    seePricing: "Ver precios",
    footer: "Ownvite · Tu evento, tu dominio, tu diseño",
  },
  pricing: {
    title: "Precios",
    eyebrow: "Precios",
    headline: "Paga por el evento, no por la lista de invitados",
    support:
      "Pases transparentes por evento con dominio propio — sin monedas, sin anuncios, sin sorpresas por persona. Temas premium desde $7, o todo incluido en Pro.",
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
          "RSVP + preguntas de menú",
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
          "Todos los temas premium · seating",
          "Emails · invitaciones privadas",
          "Check-in QR + co-hosts · sin pie",
        ],
        cta: "Mejorar este evento",
      },
      {
        name: "Studio",
        price: "$12",
        detail: "al mes · o $99/año",
        points: [
          "5 eventos activos",
          "Packs de temas + marketplace",
          "Créditos SMS · analítica",
          "Soporte prioritario",
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
    balloonDigits: "Dígitos de globos",
    balloonDigitsHint:
      "1–2 dígitos para los globos plateados de números (ej. 20, 30, 5).",
    date: "Fecha",
    time: "Hora",
    venue: "Lugar",
    address: "Dirección",
    about: "Acerca de",
    aboutHtmlHint:
      "HTML permitido: <h1>–<h6>, <b>, <strong>, <br>, <i>, <em>, <p>. Ejemplo: <h3>Código de vestimenta</h3>Cocktail<br /><b>Sin regalos</b>",
    colors: "Colores",
    fonts: "Fuentes",
    display: "Display",
    body: "Cuerpo",
    livePreview: "Vista previa en vivo",
    background: "Fondo",
    accentPrimary: "Acento principal",
    accentSecondary: "Acento secundario",
    textPrimary: "Texto principal",
    settings: "Ajustes del evento",
    visibility: "Visibilidad",
    visibilityPublic: "Enlace público",
    visibilityUnlisted: "Enlace no listado",
    capacity: "Capacidad (opcional)",
    capacityHint: "Vacío = sin límite",
    registryUrl: "URL de lista de regalos",
    published: "Publicado (visible para invitados)",
    rsvpEnabled: "Recibir confirmaciones (RSVP)",
    rsvpEnabledHint:
      "Desactívalo para invitaciones solo informativas (sin formulario RSVP). Los invitados aún pueden dejar un mensaje.",
    applyTemplate: "Aplicar look de plantilla",
    applyTemplateHint:
      "Actualiza colores, fuentes y titulares desde una plantilla. Se conserva tu foto subida.",
  },
  dashboard: {
    eyebrow: "Tus eventos",
    title: "Panel del anfitrión",
    support:
      "Crea invitaciones, gestiona invitados, comparte enlaces y conecta dominios.",
    create: "Crear evento",
    emptyTitle: "Aún no hay eventos",
    emptyBody:
      "Elige una plantilla, define fecha y lugar, y luego personaliza fuentes, colores y tu dominio.",
    edit: "Personalizar",
    view: "Ver invitación",
    guests: "Invitados",
    draft: "Borrador",
    signOut: "Salir",
  },
  create: {
    stepTemplate: "Plantilla",
    stepDetails: "Detalles",
    pickTemplate: "Elige un estilo",
    pickSupport:
      "19 looks luminosos inspirados en Evite y Canva — oro soleado, jardín, blush, fiesta latina y más. Luego puedes cambiarlo todo.",
    continue: "Continuar",
    detailsTitle: "Detalles del evento",
    detailsSupport: "Los invitados verán esto en tu página.",
    title: "Título del evento",
    host: "Nombre del anfitrión",
    slug: "Slug de URL (opcional)",
    date: "Fecha",
    time: "Hora",
    venue: "Lugar",
    address: "Dirección",
    about: "Nota para invitados",
    back: "Atrás",
    create: "Crear invitación",
    creating: "Creando…",
    error: "No se pudo crear el evento.",
  },
  guests: {
    title: "Lista de invitados",
    support:
      "RSVPs más invitados que agregues a mano — exporta CSV cuando quieras.",
    exportCsv: "Exportar CSV",
    rsvps: "RSVPs",
    yes: "sí",
    no: "no",
    headcount: "asistentes",
    manual: "manuales",
    namePh: "Nombre",
    emailPh: "Correo (opcional)",
    add: "Agregar",
    error: "No se pudo actualizar.",
    colName: "Nombre",
    colEmail: "Correo",
    colStatus: "Estado",
    colGuests: "Invitados",
    colNote: "Notas",
    empty: "Sin invitados aún — comparte tu enlace para recibir RSVPs.",
    manualTag: "Agregado por el anfitrión",
  },
  hostActions: {
    title: "Compartir y gestionar",
    support:
      "Copia el enlace, escribe a tus invitados, descarga el calendario o duplica el evento.",
    copy: "Copiar enlace",
    copied: "¡Copiado!",
    copyFail: "No se pudo copiar.",
    calendar: "Descargar .ics",
    duplicate: "Duplicar",
    delete: "Eliminar evento",
    deleteConfirm: "¿Eliminar este evento permanentemente?",
    error: "Algo salió mal.",
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
      "Funciona en ownvite.app y ownvite.com cuando el SSL termina de provisionarse (suele ser un minuto).",
    editSub: "Editar subdominio",
    editSubHint:
      "Elige la etiqueta de tus enlaces gratis de Ownvite en .app y .com.",
    editSubWarn:
      "Al guardar se renombra la URL de la invitación (/e/…) y el enlace del estudio.",
    saveSub: "Guardar subdominio",
    subSaved: "Subdominio de Ownvite actualizado.",
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
    invitesYou: "te invita cordialmente a",
    comicPresents: "presenta una fiesta de cumpleaños",
    festiveParty: "te invita a una fiesta de cumpleaños",
    toyPartyInvite: "te invita a una fiesta de juguetes",
    splashInvite: "te invita a una fiesta de cumpleaños",
    modernCelebrate: "está celebrando",
    arcadePlayer: "el jugador uno te invita",
    quinceInvite: "te invita cordialmente a su fiesta de quince años",
    fiftyCelebrate: "celebra cincuenta años fabulosos",
    collageInvite: "cumpleaños de",
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
    addToCalendar: "Agregar al calendario",
    share: "Compartir",
    copyLink: "Copiar enlace",
    copied: "Enlace copiado",
    downloadPostcard: "Descargar postal",
    guestbook: "Libro de visitas",
    guestbookPrompt: "Deja una nota para el anfitrión",
    guestbookName: "Tu nombre",
    guestbookMessage: "Tu mensaje",
    guestbookSubmit: "Publicar",
    guestbookThanks: "¡Gracias por escribir!",
    registry: "Ideas de regalo",
    registryCta: "Ver lista",
    registryPrompt:
      "Si quieres celebrar con un regalo, aquí está nuestra lista.",
    guestInfo: "Info para invitados",
    schedule: "Agenda",
    dressCode: "Código de vestimenta",
    parking: "Estacionamiento",
    whatToBring: "Qué traer",
    stay: "Alojamiento",
    travel: "Cómo llegar",
    contactHost: "Contactar al anfitrión",
    emailHost: "Escribir a {name}",
    callText: "Llamar / mensaje",
    faq: "Preguntas frecuentes",
    gallery: "Galería",
    playlist: "Playlist",
    weather: "Clima",
    rainChance: "prob. de lluvia",
    thankYou: "Gracias",
    thankYouDefault:
      "Gracias por celebrar con nosotros. Deja un recuerdo en el libro de visitas.",
    pastEventPrompt:
      "Esta celebración ya ocurrió. Gracias por ser parte — deja una nota abajo.",
    deadlinePassed: "La fecha límite de confirmación ya pasó.",
    deadlineToday: "Confirma hoy.",
    deadlineInDays: "Confirma en {days} día(s) (antes del {date}).",
    atCapacity:
      "Este evento está lleno — ya no se aceptan nuevas confirmaciones.",
    seatsOpen: "{open} de {capacity} lugares disponibles.",
    eventFull:
      "Este evento está lleno. Contacta al anfitrión si necesitas cambiar tu RSVP.",
    rsvpClosed: "Este formulario de confirmación está cerrado.",
    waitlistPrompt:
      "Únete a la lista de espera y te avisaremos si se libera un lugar.",
    waitlistSubmit: "Unirme a la lista de espera",
    waitlistThanks:
      "Estás en la lista de espera — te contactaremos si se libera un lugar.",
    waitlistGuests: "Tamaño del grupo",
    waitlistError: "No se pudo unir a la lista de espera",
    updateRsvp: "Actualizar o cancelar tu confirmación",
    selectOption: "Selecciona…",
    leaveNote: "Dejar una nota",
    hostedBy: "Organizado por {name}",
    submitError: "No se pudo enviar la confirmación",
    somethingWrong: "Algo salió mal",
  },
};

const dictionaries: Record<Locale, Dictionary> = { en, es };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? en;
}
