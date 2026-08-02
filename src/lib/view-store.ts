import { readJsonBlob, writeJsonBlob } from "./blob-json";
import type { InviteView } from "./types";

const PATH = "ownvite/invite-views.json";

type Registry = { version: 1; views: InviteView[] };

async function load(): Promise<Registry> {
  return readJsonBlob<Registry>(PATH, { version: 1, views: [] });
}

async function save(registry: Registry) {
  await writeJsonBlob(PATH, registry);
}

export async function recordInviteView(input: {
  eventId: string;
  email?: string | null;
  userAgent?: string | null;
}): Promise<InviteView> {
  const registry = await load();
  const view: InviteView = {
    id: `view_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    eventId: input.eventId,
    email: input.email?.trim().toLowerCase() || null,
    userAgent: input.userAgent?.slice(0, 200) || null,
    createdAt: new Date().toISOString(),
  };
  registry.views.push(view);
  // Cap growth per event
  const forEvent = registry.views.filter((v) => v.eventId === input.eventId);
  if (forEvent.length > 5000) {
    const drop = new Set(
      forEvent
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .slice(0, forEvent.length - 5000)
        .map((v) => v.id),
    );
    registry.views = registry.views.filter((v) => !drop.has(v.id));
  }
  await save(registry);
  return view;
}

export async function listViewsByEventId(
  eventId: string,
): Promise<InviteView[]> {
  const registry = await load();
  return registry.views
    .filter((v) => v.eventId === eventId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function summarizeViews(views: InviteView[]) {
  const total = views.length;
  const last24h = views.filter(
    (v) => Date.now() - new Date(v.createdAt).getTime() < 24 * 60 * 60 * 1000,
  ).length;
  const byDay = new Map<string, number>();
  for (const v of views) {
    const day = v.createdAt.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }
  const days = [...byDay.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 14)
    .map(([date, count]) => ({ date, count }));
  return { total, last24h, days };
}
