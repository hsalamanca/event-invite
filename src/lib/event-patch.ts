/**
 * Host PATCH must not let clients reassign ownership.
 * Admin transfers use /api/admin/events/[slug] with transferOwnerId.
 */
export function stripClientEventOwnership<T extends object>(
  partial: T,
): Omit<T, "ownerId" | "transferOwnerId"> {
  const next = { ...partial } as T & {
    ownerId?: unknown;
    transferOwnerId?: unknown;
  };
  delete next.ownerId;
  delete next.transferOwnerId;
  return next;
}
