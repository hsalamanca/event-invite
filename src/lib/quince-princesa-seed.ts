import demo from "../../data/quince-princesa-demo.json";
import type { QuincePartyRole, QuinceVenueBlock } from "./types";

export const QUINCE_PRINCESA_TOKENS = {
  bg: "#FFF7F9",
  surface: "#FFE8EF",
  accent: "#B76E79",
  gold: "#C9A27A",
  text: "#3A2A30",
} as const;

export const QUINCE_PRINCESA_SEED = {
  honoreeName: demo.headline,
  title: demo.title,
  parentsLine: demo.parentsLine,
  tagline: demo.tagline,
  dateISO: demo.dateISO,
  timeLabel: demo.timeLabel,
  venue: demo.venue,
  address: demo.address,
  whatsappPhone: demo.whatsappPhone,
  dressCode: demo.dressCode,
  gifts: demo.gifts,
  padrinos: demo.padrinos as QuincePartyRole[],
  corte: demo.corte as QuincePartyRole[],
  misa: demo.misa as QuinceVenueBlock,
  recepcion: demo.recepcion as QuinceVenueBlock,
  rsvpDeadline: demo.rsvpFields.deadline,
  about: demo.about,
} as const;
