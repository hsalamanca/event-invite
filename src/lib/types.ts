export type Theme = {
  colors: {
    background: string;
    surface: string;
    accentPrimary: string;
    accentSecondary: string;
    textPrimary: string;
    textMuted: string;
  };
  fonts: {
    display: string;
    body: string;
  };
};

export type CustomQuestion = {
  id: string;
  type: "short" | "multiple" | "checkbox" | "meal";
  label: string;
  options?: string[];
  required?: boolean;
};

export type RsvpFields = {
  plusOnes: {
    enabled: boolean;
    label: string;
    max: number;
  };
  dietary: {
    enabled: boolean;
    label: string;
    placeholder: string;
  };
  attendance: {
    enabled: boolean;
    options: string[];
  };
  deadline: string;
  prompt: string;
  /** Host-defined questions (meal choice, song requests, etc.) */
  customQuestions?: CustomQuestion[];
};

export type ScheduleItem = {
  id: string;
  time: string;
  title: string;
  description?: string;
  /** Optional Spanish title for locale switching */
  titleEs?: string;
  descriptionEs?: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  /** Optional Spanish copy for locale switching */
  questionEs?: string;
  answerEs?: string;
};

export type EventTier = "free" | "pro" | "studio";

export type EventRecord = {
  id: string;
  slug: string;
  ownerId: string | null;
  hostName: string;
  title: string;
  headline: string;
  tagline: string;
  dateISO: string;
  timeLabel: string;
  venue: string;
  address: string;
  theme: Theme;
  heroImage: string;
  customDomain: string | null;
  rsvpFields: RsvpFields;
  about: string;
  /** Optional Spanish about/HTML for locale switching */
  aboutEs?: string | null;
  published: boolean;
  /** public = anyone with link; unlisted = not listed; private = password */
  visibility: "public" | "unlisted" | "private";
  capacity: number | null;
  registryUrl: string | null;
  registryLabel?: string | null;
  templateId: string;
  /** Celebration extras */
  schedule?: ScheduleItem[];
  faqs?: FaqItem[];
  gallery?: string[];
  parking?: string;
  /** Optional Spanish parking note for locale switching */
  parkingEs?: string | null;
  dressCode?: string;
  whatToBring?: string;
  contactEmail?: string;
  contactPhone?: string;
  hotelInfo?: string;
  travelInfo?: string;
  spotifyUrl?: string;
  thankYouMessage?: string;
  /** bcrypt hash when visibility=private */
  invitePasswordHash?: string | null;
  coHostEmails?: string[];
  checkInEnabled?: boolean;
  showOwnviteFooter?: boolean;
  tier?: EventTier;
  premiumTheme?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RsvpAnswers = Record<string, string | string[]>;

export type RsvpSubmission = {
  id: string;
  eventId: string;
  name: string;
  email: string;
  attendance: string;
  guestCount: number;
  dietary: string;
  note: string;
  answers?: RsvpAnswers;
  mealChoice?: string;
  /** Token for guest to update/cancel their RSVP */
  editToken?: string;
  checkedIn?: boolean;
  checkedInAt?: string | null;
  createdAt: string;
  updatedAt?: string;
};

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  /** Empty for OAuth-only accounts */
  passwordHash: string;
  emailVerifiedAt?: string | null;
  verifyToken?: string | null;
  verifyTokenExpires?: string | null;
  resetToken?: string | null;
  resetTokenExpires?: string | null;
  createdAt: string;
};

export type InviteView = {
  id: string;
  eventId: string;
  /** Optional guest email if known */
  email?: string | null;
  userAgent?: string | null;
  createdAt: string;
};

export type GuestMessage = {
  id: string;
  eventId: string;
  name: string;
  body: string;
  createdAt: string;
};

export type ManualGuest = {
  id: string;
  eventId: string;
  name: string;
  email: string;
  status: "invited" | "opened" | "going" | "maybe" | "declined";
  createdAt: string;
};

export type OutboundMessage = {
  id: string;
  eventId: string;
  type: "invite" | "rsvp_reminder" | "event_reminder" | "custom";
  to: string;
  subject: string;
  body: string;
  status: "queued" | "sent" | "failed" | "preview";
  createdAt: string;
  error?: string;
};
