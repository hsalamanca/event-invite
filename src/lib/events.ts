/**
 * Event access layer — Blob-backed (see event-store.ts).
 * Kept as a stable import path for existing routes/components.
 */
export {
  listAllEvents as listEvents,
  getEventBySlug,
  getEventById,
  getEventByDomain,
  listEventsByOwner,
  createEvent,
  updateEvent,
  deleteEvent,
  adminDeleteEvent,
} from "./event-store";
