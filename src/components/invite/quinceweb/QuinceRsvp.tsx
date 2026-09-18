"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveLocalizedRsvpFields } from "@/lib/templates";
import type { CustomQuestion, EventRecord, RsvpAnswers } from "@/lib/types";

function daysUntil(deadline: string): number | null {
  if (!deadline) return null;
  const end = new Date(`${deadline}T23:59:59`);
  if (Number.isNaN(end.getTime())) return null;
  return Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function QuinceRsvp({
  event,
  locale,
  seatsTaken = 0,
  atCapacity = false,
  isPast = false,
  onRsvpSubmit,
}: {
  event: EventRecord;
  locale: Locale;
  seatsTaken?: number;
  atCapacity?: boolean;
  isPast?: boolean;
  onRsvpSubmit?: (payload: {
    eventId: string;
    name: string;
    email: string;
    attendance: string;
    guestCount: number;
    dietary: string;
    note: string;
    answers?: RsvpAnswers;
    mealChoice?: string;
  }) => Promise<void> | void;
}) {
  const ui = getDictionary(locale).invite;
  const rsvpFields = resolveLocalizedRsvpFields(event.rsvpFields, locale);
  const attendanceOptions = rsvpFields.attendance.options;
  const attendanceKey = attendanceOptions.join("\0");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [attendance, setAttendance] = useState(attendanceOptions[0] ?? "");
  const [guestCount, setGuestCount] = useState(1);
  const [dietary, setDietary] = useState("");
  const [note, setNote] = useState("");
  const [answers, setAnswers] = useState<RsvpAnswers>({});
  const [mealChoice, setMealChoice] = useState("");
  const [editToken, setEditToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const customQuestions = rsvpFields.customQuestions ?? [];
  const deadlineDays = daysUntil(rsvpFields.deadline);
  const deadlinePassed = deadlineDays != null && deadlineDays < 0;

  useEffect(() => {
    setAttendance((prev) =>
      attendanceOptions.includes(prev) ? prev : (attendanceOptions[0] ?? ""),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, attendanceKey]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const payload = {
      eventId: event.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      attendance,
      guestCount: rsvpFields.plusOnes.enabled
        ? Math.max(1, Number(guestCount) || 1)
        : 1,
      dietary: rsvpFields.dietary.enabled ? dietary.trim() : "",
      note: note.trim(),
      answers,
      mealChoice: mealChoice || undefined,
    };
    try {
      if (onRsvpSubmit) {
        await onRsvpSubmit(payload);
      } else {
        const res = await fetch("/api/rsvp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const body = (await res.json().catch(() => null)) as {
          error?: string;
          rsvp?: { editToken?: string };
        } | null;
        if (!res.ok) throw new Error(body?.error ?? ui.submitError);
        if (body?.rsvp?.editToken) setEditToken(body.rsvp.editToken);
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : ui.somethingWrong);
    } finally {
      setSubmitting(false);
    }
  }

  if (event.rsvpEnabled === false) return null;

  if (isPast) {
    return <p className="qw-body">{ui.pastEventPrompt}</p>;
  }

  if (success) {
    return (
      <div className="qw-rsvp-success" role="status">
        <p className="qw-body">{ui.successTitle}</p>
        <p className="qw-body">{event.thankYouMessage?.trim() || ui.successBody}</p>
        {editToken ? (
          <p className="qw-body">
            <a href={`/rsvp/${editToken}`}>{ui.updateRsvp}</a>
          </p>
        ) : null}
      </div>
    );
  }

  if (deadlinePassed) {
    return <p className="qw-body">{ui.rsvpClosed}</p>;
  }

  if (atCapacity) {
    return <p className="qw-body">{ui.eventFull}</p>;
  }

  return (
    <form className="qw-rsvp-form" onSubmit={handleSubmit} noValidate>
      {rsvpFields.prompt ? <p className="qw-body">{rsvpFields.prompt}</p> : null}
      {rsvpFields.deadline ? (
        <p className="qw-body">
          {deadlineDays === 0
            ? ui.deadlineToday
            : ui.deadlineInDays
                .replace("{days}", String(deadlineDays ?? 0))
                .replace("{date}", rsvpFields.deadline)}
        </p>
      ) : null}
      {event.capacity ? (
        <p className="qw-body">
          {ui.seatsOpen
            .replace("{open}", String(Math.max(0, event.capacity - seatsTaken)))
            .replace("{capacity}", String(event.capacity))}
        </p>
      ) : null}

      <label>
        <span>{ui.name}</span>
        <input
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label>
        <span>{ui.email}</span>
        <input
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        <span>{ui.callText}</span>
        <input
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </label>
      {rsvpFields.attendance.enabled ? (
        <label>
          <span>{ui.attendance}</span>
          <select
            value={attendance}
            onChange={(e) => setAttendance(e.target.value)}
          >
            {attendanceOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {rsvpFields.plusOnes.enabled ? (
        <label>
          <span>{rsvpFields.plusOnes.label}</span>
          <input
            type="number"
            min={1}
            max={rsvpFields.plusOnes.max}
            value={guestCount}
            onChange={(e) =>
              setGuestCount(
                Math.min(rsvpFields.plusOnes.max, Math.max(1, Number(e.target.value) || 1)),
              )
            }
          />
        </label>
      ) : null}
      {rsvpFields.dietary.enabled ? (
        <label>
          <span>{rsvpFields.dietary.label}</span>
          <input
            value={dietary}
            placeholder={rsvpFields.dietary.placeholder}
            onChange={(e) => setDietary(e.target.value)}
          />
        </label>
      ) : null}
      {customQuestions.map((q: CustomQuestion) => {
        if (q.type === "meal" || q.type === "multiple") {
          const value =
            q.type === "meal"
              ? mealChoice || String(answers[q.id] ?? "")
              : String(answers[q.id] ?? "");
          return (
            <label key={q.id}>
              <span>
                {q.label}
                {q.required ? " *" : ""}
              </span>
              <select
                required={q.required}
                value={value}
                onChange={(e) => {
                  const next = e.target.value;
                  if (q.type === "meal") {
                    setMealChoice(next);
                    setAnswers((prev) => ({ ...prev, [q.id]: next }));
                  } else {
                    setAnswers((prev) => ({ ...prev, [q.id]: next }));
                  }
                }}
              >
                <option value="">{ui.selectOption}</option>
                {(q.options ?? []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          );
        }
        return (
          <label key={q.id}>
            <span>
              {q.label}
              {q.required ? " *" : ""}
            </span>
            <input
              required={q.required}
              value={String(answers[q.id] ?? "")}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
              }
            />
          </label>
        );
      })}
      <label>
        <span>{ui.note}</span>
        <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      {error ? (
        <p className="qw-rsvp-error" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" className="qw-submit" disabled={submitting}>
        {submitting ? ui.submitting : ui.submit}
      </button>
    </form>
  );
}
