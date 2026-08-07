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

import type { GalleryLayout } from "./gallery";

export type EventTier = "free" | "pro" | "studio";

export type SeatingAssignment = {
  rsvpId: string;
  guestName?: string;
  seatLabel?: string;
};

export type SeatingTable = {
  id: string;
  name: string;
  seats: number;
  assignments: SeatingAssignment[];
};

export type EventRecord = {
  id: string;
  slug: string;
  ownerId: string | null;
  hostName: string;
  title: string;
  headline: string;
  tagline: string;
  /** Optional Spanish headline for locale switching */
  headlineEs?: string | null;
  /** Optional Spanish tagline (HTML allowed) for locale switching */
  taglineEs?: string | null;
  dateISO: string;
  timeLabel: string;
  venue: string;
  address: string;
  theme: Theme;
  heroImage: string;
  /** Optional looping hero video (mp4/webm URL); falls back to heroImage */
  heroVideoUrl?: string | null;
  /** Cover motion accent kit */
  motionKit?: "none" | "sparkle" | "float" | "parallax" | "pulse";
  /** Collage templates: 1–2 digit age/milestone for number balloons */
  balloonDigits?: string | null;
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
  /** How gallery photos are shaped/arranged on the invite */
  galleryLayout?: GalleryLayout;
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
  /** Template ids unlocked via $7 theme purchase (Free) */
  unlockedTemplateIds?: string[];
  /** Purchased reminder email credits (Free overage / packs) */
  emailCredits?: number;
  /** Purchased SMS / WhatsApp reminder credits */
  smsCredits?: number;
  /** Pro seating chart tables */
  seatingTables?: SeatingTable[];
  /** Guest photo album enabled on invite */
  albumEnabled?: boolean;
  /** When false, invite is announcement-only (no RSVP form/CTA) */
  rsvpEnabled?: boolean;
  /** Cash fund / Venmo / Zelle style link */
  cashFundUrl?: string | null;
  cashFundLabel?: string | null;
  /** Optional cash fund goal / raised (host-reported or pledges) */
  cashFundGoal?: number | null;
  cashFundRaised?: number | null;
  /** Registry / cash-fund click counts */
  registryClicks?: number;
  cashFundClicks?: number;
  /** Show print/stationery affiliate CTA after RSVP */
  printAffiliateEnabled?: boolean;
  /** Guests can look up their table on the invite */
  guestSeatingEnabled?: boolean;
  /** Require privacy/SMS consent checkbox on RSVP */
  rsvpConsentRequired?: boolean;
  /** Soft collab presence */
  lastEditedBy?: string | null;
  lastEditedAt?: string | null;
  /** Hide Ownvite branding on invite + guest emails (Agency / white-label) */
  whiteLabel?: boolean;
  /** Agency client workspace this event belongs to */
  clientId?: string | null;
  /** Unlocked seasonal pack ids */
  unlockedPackIds?: string[];
  createdAt: string;
  updatedAt: string;
};

export type RsvpAnswers = Record<string, string | string[]>;

export type RsvpSubmission = {
  id: string;
  eventId: string;
  name: string;
  email: string;
  /** Optional mobile for SMS / WhatsApp reminders */
  phone?: string;
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
  /** Studio subscription */
  studioStatus?: "active" | "canceled" | null;
  studioStripeCustomerId?: string | null;
  studioStripeSubscriptionId?: string | null;
  studioActiveUntil?: string | null;
  /** Agency / white-label subscription */
  agencyStatus?: "active" | "canceled" | null;
  agencyStripeSubscriptionId?: string | null;
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

export type WaitlistEntry = {
  id: string;
  eventId: string;
  name: string;
  email: string;
  guestCount: number;
  note: string;
  createdAt: string;
};

export type ManualGuest = {
  id: string;
  eventId: string;
  name: string;
  email: string;
  /** E.164 preferred for SMS / WhatsApp */
  phone?: string;
  status: "invited" | "opened" | "going" | "maybe" | "declined";
  createdAt: string;
};

export type GuestPhoto = {
  id: string;
  eventId: string;
  name: string;
  caption: string;
  url: string;
  /** pending until host approves */
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export type OutboundMessage = {
  id: string;
  eventId: string;
  type:
    | "invite"
    | "rsvp_reminder"
    | "event_reminder"
    | "rsvp_notification"
    | "rsvp_confirmation"
    | "sms_reminder"
    | "whatsapp_reminder"
    | "custom";
  to: string;
  subject: string;
  body: string;
  status: "queued" | "sent" | "failed" | "preview";
  createdAt: string;
  error?: string;
  /** Blast campaign this message belongs to */
  blastId?: string;
  channel?: "email" | "sms" | "whatsapp";
  /** Opaque token for open/click tracking pixels */
  trackingToken?: string;
  openedAt?: string | null;
  clickedAt?: string | null;
  scheduledFor?: string | null;
};

/** Account-level reusable guest CRM contact */
export type GuestBookContact = {
  id: string;
  ownerId: string;
  name: string;
  email: string;
  phone?: string;
  dietary?: string;
  householdName?: string;
  notes?: string;
  tags?: string[];
  history: GuestBookHistoryEntry[];
  createdAt: string;
  updatedAt: string;
};

export type GuestBookHistoryEntry = {
  eventId: string;
  eventTitle: string;
  eventSlug?: string;
  attendance?: string;
  dietary?: string;
  mealChoice?: string;
  guestCount?: number;
  at: string;
};

/** Agency planner client workspace */
export type AgencyClient = {
  id: string;
  agencyOwnerId: string;
  name: string;
  email: string;
  notes?: string;
  createdAt: string;
};

/** Invite / reminder blast batch for delivery inbox */
export type BlastCampaign = {
  id: string;
  eventId: string;
  type: OutboundMessage["type"];
  channel: "email" | "sms" | "whatsapp";
  subject: string;
  status: "sent" | "scheduled" | "sending";
  scheduledFor?: string | null;
  recipientCount: number;
  createdAt: string;
};

export type GiftPledge = {
  id: string;
  eventId: string;
  name: string;
  email: string;
  kind: "registry" | "cash";
  amount?: number;
  note: string;
  createdAt: string;
};

export type ThankYouItem = {
  id: string;
  eventId: string;
  guestName: string;
  email: string;
  note: string;
  status: "todo" | "sent";
  createdAt: string;
  sentAt?: string | null;
};

export type MarketplaceListing = {
  id: string;
  authorId: string;
  authorName: string;
  templateId: string;
  title: string;
  description: string;
  priceCents: number;
  previewImage: string;
  status: "pending" | "published" | "rejected";
  createdAt: string;
};

export type CollabPresence = {
  eventId: string;
  userId: string;
  name: string;
  at: string;
};
