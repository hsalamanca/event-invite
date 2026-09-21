/**
 * Re-read before and after a JSON blob write. The files stay at their current
 * paths and shapes. A concurrent writer that lands first causes a retry that
 * reapplies the mutation on the latest document.
 */
export async function commitWithRetry<T>(options: {
  read: () => Promise<T>;
  write: (next: T) => Promise<void>;
  mutate: (current: T) => T;
  persisted: (saved: T) => boolean;
  attempts?: number;
  same?: (left: T, right: T) => boolean;
}): Promise<T> {
  const attempts = options.attempts ?? 5;
  const same =
    options.same ??
    ((left: T, right: T) => JSON.stringify(left) === JSON.stringify(right));

  for (let attempt = 0; attempt < attempts; attempt++) {
    const current = await options.read();
    if (options.persisted(current)) return current;
    const next = options.mutate(current);
    const again = await options.read();
    if (!same(current, again)) continue;
    await options.write(next);
    const saved = await options.read();
    if (options.persisted(saved)) return saved;
  }

  throw new Error("Save conflicted with another update");
}
