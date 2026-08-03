import type { CustomQuestion, RsvpSubmission } from "./types";

export type MealCount = { option: string; count: number };

export function collectMealQuestions(
  questions: CustomQuestion[] | undefined
): CustomQuestion[] {
  return (questions ?? []).filter(
    (q) => q.type === "meal" || q.label.toLowerCase().includes("meal"),
  );
}

export function mealCountsFromRsvps(
  rsvps: RsvpSubmission[],
  questions: CustomQuestion[] | undefined,
): MealCount[] {
  const mealQs = collectMealQuestions(questions);
  const tallies = new Map<string, number>();

  for (const r of rsvps) {
    if (!r.attendance.toLowerCase().includes("attend")) continue;
    const heads = Math.max(1, r.guestCount || 1);

    let choice = r.mealChoice?.trim();
    if (!choice && mealQs[0] && r.answers) {
      const raw = r.answers[mealQs[0].id];
      choice = Array.isArray(raw) ? raw[0] : raw;
    }
    if (!choice) choice = "Unspecified";

    tallies.set(choice, (tallies.get(choice) ?? 0) + heads);
  }

  return [...tallies.entries()]
    .map(([option, count]) => ({ option, count }))
    .sort((a, b) => b.count - a.count);
}

export function dietaryCountsFromRsvps(
  rsvps: RsvpSubmission[],
): MealCount[] {
  const tallies = new Map<string, number>();
  for (const r of rsvps) {
    if (!r.attendance.toLowerCase().includes("attend")) continue;
    const raw = r.dietary?.trim();
    if (!raw) continue;
    // Split common separators so "vegetarian, nut allergy" tallies separately
    const parts = raw
      .split(/[,;/|]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const values = parts.length ? parts : [raw];
    for (const v of values) {
      const key = v.charAt(0).toUpperCase() + v.slice(1);
      tallies.set(key, (tallies.get(key) ?? 0) + 1);
    }
  }
  return [...tallies.entries()]
    .map(([option, count]) => ({ option, count }))
    .sort((a, b) => b.count - a.count);
}

export function questionAnswerCounts(
  rsvps: RsvpSubmission[],
  question: CustomQuestion,
): MealCount[] {
  const tallies = new Map<string, number>();
  for (const r of rsvps) {
    if (!r.attendance.toLowerCase().includes("attend")) continue;
    const raw = r.answers?.[question.id];
    const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
    if (values.length === 0) {
      tallies.set("Unspecified", (tallies.get("Unspecified") ?? 0) + 1);
      continue;
    }
    for (const v of values) {
      const key = String(v).trim() || "Unspecified";
      tallies.set(key, (tallies.get(key) ?? 0) + 1);
    }
  }
  return [...tallies.entries()]
    .map(([option, count]) => ({ option, count }))
    .sort((a, b) => b.count - a.count);
}
