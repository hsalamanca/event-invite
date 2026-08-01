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
