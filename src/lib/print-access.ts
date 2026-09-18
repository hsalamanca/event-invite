/** Guest print menu / place-cards (and postcard) are invite surfaces — published only. */
export function canAccessGuestPrintSuite<T extends { published?: boolean }>(
  event: T | null | undefined,
): event is T & { published: true } {
  return Boolean(event?.published);
}
