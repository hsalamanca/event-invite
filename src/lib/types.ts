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
};

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
  published: boolean;
  /** public = anyone with link; unlisted = same but not on demo lists */
  visibility: "public" | "unlisted";
  capacity: number | null;
  registryUrl: string | null;
  templateId: string;
  createdAt: string;
  updatedAt: string;
};

export type RsvpSubmission = {
  id: string;
  eventId: string;
  name: string;
  email: string;
  attendance: string;
  guestCount: number;
  dietary: string;
  note: string;
  createdAt: string;
};

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
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
