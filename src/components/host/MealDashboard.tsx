"use client";

import type { CustomQuestion, RsvpSubmission } from "@/lib/types";
import {
  collectMealQuestions,
  dietaryCountsFromRsvps,
  mealCountsFromRsvps,
  questionAnswerCounts,
} from "@/lib/meal-stats";

export function MealDashboard({
  rsvps,
  questions,
  dietaryEnabled = true,
}: {
  rsvps: RsvpSubmission[];
  questions: CustomQuestion[];
  dietaryEnabled?: boolean;
}) {
  const mealQs = collectMealQuestions(questions);
  const meal = mealQs[0];
  const attending = rsvps.filter((r) =>
    r.attendance.toLowerCase().includes("attend"),
  );
  const seats = attending.reduce((n, r) => n + (r.guestCount || 1), 0);
  const mealCounts = mealCountsFromRsvps(rsvps, questions);
  const dietaryCounts = dietaryEnabled
    ? dietaryCountsFromRsvps(rsvps)
    : [];
  const withDietary = attending.filter((r) => r.dietary?.trim());

  return (
    <section className="scroll-mt-24 border-t border-white/10 pt-8">
      <div>
        <h2 className="font-[family-name:var(--font-cormorant)] text-2xl">
          Meal, diet & questions
        </h2>
        <p className="mt-1 text-sm text-[var(--mist)]">
          Counts from guests who said yes ({attending.length} attending
          {seats !== attending.length ? ` · ${seats} seats` : ""}).
        </p>
      </div>

      {meal ? (
        <div className="mt-5 space-y-3">
          <h3 className="text-sm font-medium text-[var(--champagne)]">
            {meal.label}
          </h3>
          <div className="flex flex-wrap gap-3">
            {mealCounts.map((row) => (
              <div
                key={row.option}
                className="min-w-[7rem] rounded-md border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <strong className="block text-xl">{row.count}</strong>
                <span className="text-sm text-[var(--mist)]">{row.option}</span>
              </div>
            ))}
          </div>
          {attending.length > 0 ? (
            <ul className="mt-2 space-y-1.5 text-sm">
              {attending.map((r) => {
                const choice =
                  r.mealChoice ||
                  (meal && r.answers?.[meal.id]
                    ? Array.isArray(r.answers[meal.id])
                      ? r.answers[meal.id]![0]
                      : r.answers[meal.id]
                    : undefined);
                return (
                  <li
                    key={r.id}
                    className="flex justify-between gap-3 border-b border-white/5 py-1.5"
                  >
                    <span>
                      {r.name}
                      {r.guestCount > 1 ? ` (+${r.guestCount - 1})` : ""}
                    </span>
                    <span className="text-[var(--mist)]">
                      {String(choice || "—")}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      ) : (
        <p className="mt-4 text-sm text-[var(--mist)]">
          Add a meal question under RSVP questions to track entrée counts.
        </p>
      )}

      {dietaryEnabled ? (
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-medium text-[var(--champagne)]">
            Dietary needs
          </h3>
          {dietaryCounts.length === 0 ? (
            <p className="text-sm text-[var(--mist)]">
              No dietary notes from attending guests yet.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-3">
                {dietaryCounts.map((row) => (
                  <div
                    key={row.option}
                    className="min-w-[7rem] rounded-md border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <strong className="block text-xl">{row.count}</strong>
                    <span className="text-sm text-[var(--mist)]">
                      {row.option}
                    </span>
                  </div>
                ))}
              </div>
              <ul className="mt-2 space-y-1.5 text-sm">
                {withDietary.map((r) => (
                  <li
                    key={r.id}
                    className="flex justify-between gap-3 border-b border-white/5 py-1.5"
                  >
                    <span>{r.name}</span>
                    <span className="text-right text-[var(--mist)]">
                      {r.dietary}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ) : null}

      {questions
        .filter((q) => q.id !== meal?.id && q.type !== "short")
        .map((q) => {
          const tallies = questionAnswerCounts(rsvps, q);
          if (!tallies.length) return null;
          return (
            <div key={q.id} className="mt-6 space-y-2">
              <h3 className="text-sm font-medium text-[var(--champagne)]">
                {q.label}
              </h3>
              <div className="flex flex-wrap gap-3">
                {tallies.map((t) => (
                  <div
                    key={t.option}
                    className="min-w-[7rem] rounded-md border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <strong className="block text-xl">{t.count}</strong>
                    <span className="text-sm text-[var(--mist)]">{t.option}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
    </section>
  );
}
