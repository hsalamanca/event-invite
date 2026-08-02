"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import type { CustomQuestion, EventRecord, RsvpSubmission } from "@/lib/types";

function QuestionFields({
  questions,
  answers,
  setAnswers,
  mealChoice,
  setMealChoice,
}: {
  questions: CustomQuestion[];
  answers: Record<string, string | string[]>;
  setAnswers: (next: Record<string, string | string[]>) => void;
  mealChoice: string;
  setMealChoice: (v: string) => void;
}) {
  return (
    <>
      {questions.map((q) => {
        if (q.type === "meal" || q.type === "multiple") {
          const value =
            q.type === "meal"
              ? mealChoice || String(answers[q.id] ?? "")
              : String(answers[q.id] ?? "");
          return (
            <label key={q.id} className="block space-y-1.5 text-sm">
              <span className="text-[var(--mist)]">
                {q.label}
                {q.required ? " *" : ""}
              </span>
              <select
                required={q.required}
                value={value}
                onChange={(e) => {
                  if (q.type === "meal") {
                    setMealChoice(e.target.value);
                    setAnswers({ ...answers, [q.id]: e.target.value });
                  } else {
                    setAnswers({ ...answers, [q.id]: e.target.value });
                  }
                }}
                className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2"
              >
                <option value="">Select…</option>
                {(q.options ?? []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          );
        }
        if (q.type === "checkbox") {
          const selected = Array.isArray(answers[q.id])
            ? (answers[q.id] as string[])
            : [];
          return (
            <fieldset key={q.id} className="space-y-2 text-sm">
              <legend className="text-[var(--mist)]">
                {q.label}
                {q.required ? " *" : ""}
              </legend>
              {(q.options ?? []).map((opt) => {
                const checked = selected.includes(opt);
                return (
                  <label key={opt} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const next = checked
                          ? selected.filter((x) => x !== opt)
                          : [...selected, opt];
                        setAnswers({ ...answers, [q.id]: next });
                      }}
                    />
                    {opt}
                  </label>
                );
              })}
            </fieldset>
          );
        }
        return (
          <label key={q.id} className="block space-y-1.5 text-sm">
            <span className="text-[var(--mist)]">
              {q.label}
              {q.required ? " *" : ""}
            </span>
            <input
              required={q.required}
              value={String(answers[q.id] ?? "")}
              onChange={(e) =>
                setAnswers({ ...answers, [q.id]: e.target.value })
              }
              className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2"
            />
          </label>
        );
      })}
    </>
  );
}

export default function UpdateRsvpForm({
  event,
  rsvp,
  token,
  locale = "en",
}: {
  event: EventRecord;
  rsvp: RsvpSubmission;
  token: string;
  locale?: Locale;
}) {
  const fields = event.rsvpFields;
  const [name, setName] = useState(rsvp.name);
  const [attendance, setAttendance] = useState(rsvp.attendance);
  const [guestCount, setGuestCount] = useState<number | "">(rsvp.guestCount);
  const [dietary, setDietary] = useState(rsvp.dietary);
  const [note, setNote] = useState(rsvp.note);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(
    rsvp.answers ?? {},
  );
  const [mealChoice, setMealChoice] = useState(rsvp.mealChoice ?? "");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/rsvp", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name,
          attendance,
          guestCount: Math.max(1, Number(guestCount) || 1),
          dietary,
          note,
          answers,
          mealChoice: mealChoice || undefined,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Update failed");
        return;
      }
      setDone(true);
    } catch {
      setError("Update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--ink)] px-6 py-16 text-[var(--ivory)]">
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--champagne)]">
            Update RSVP
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-cormorant)] text-3xl">
            {event.title}
          </h1>
          <p className="mt-2 text-sm text-[var(--mist)]">
            {event.dateISO} · {event.timeLabel} · {event.venue}
          </p>
        </div>

        {done ? (
          <div className="space-y-3 rounded-md border border-white/10 bg-white/[0.03] p-6">
            <p className="text-lg">Your RSVP was updated.</p>
            <Link
              href={localePath(locale, `/e/${event.slug}`)}
              className="inline-block text-[var(--champagne)] underline-offset-2 hover:underline"
            >
              Back to invite
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block space-y-1.5 text-sm">
              <span className="text-[var(--mist)]">Name</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2"
              />
            </label>
            {fields.attendance.enabled ? (
              <label className="block space-y-1.5 text-sm">
                <span className="text-[var(--mist)]">Attendance</span>
                <select
                  value={attendance}
                  onChange={(e) => setAttendance(e.target.value)}
                  className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2"
                >
                  {fields.attendance.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {fields.plusOnes.enabled ? (
              <label className="block space-y-1.5 text-sm">
                <span className="text-[var(--mist)]">{fields.plusOnes.label}</span>
                <input
                  type="number"
                  min={1}
                  max={fields.plusOnes.max}
                  value={guestCount}
                  onChange={(e) => {
                    const next = e.target.value;
                    if (next === "") {
                      setGuestCount("");
                      return;
                    }
                    const n = Number(next);
                    if (!Number.isFinite(n)) return;
                    setGuestCount(
                      Math.min(fields.plusOnes.max, Math.max(0, n)),
                    );
                  }}
                  onBlur={() => {
                    if (guestCount === "" || guestCount < 1) {
                      setGuestCount(1);
                    }
                  }}
                  className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2"
                />
              </label>
            ) : null}
            {fields.dietary.enabled ? (
              <label className="block space-y-1.5 text-sm">
                <span className="text-[var(--mist)]">{fields.dietary.label}</span>
                <input
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2"
                />
              </label>
            ) : null}
            <QuestionFields
              questions={fields.customQuestions ?? []}
              answers={answers}
              setAnswers={setAnswers}
              mealChoice={mealChoice}
              setMealChoice={setMealChoice}
            />
            <label className="block space-y-1.5 text-sm">
              <span className="text-[var(--mist)]">Note</span>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2"
              />
            </label>
            {error ? (
              <p className="text-sm text-[var(--coral)]">{error}</p>
            ) : null}
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-[var(--champagne)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)] disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save RSVP"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
