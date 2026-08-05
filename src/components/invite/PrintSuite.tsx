"use client";

import type { EventRecord, SeatingTable } from "@/lib/types";

export default function PrintMenu({ event }: { event: EventRecord }) {
  const mealQs = (event.rsvpFields.customQuestions ?? []).filter(
    (q) => q.type === "meal",
  );
  const options =
    mealQs[0]?.options?.filter(Boolean) ??
    ["First course", "Main", "Dessert"];

  return (
    <main className="min-h-screen bg-[#F7F2E8] px-4 py-8 text-[#1A1A1A]">
      <div className="mx-auto mb-6 flex max-w-xl flex-wrap gap-2 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md bg-[#C9A962] px-4 py-2 text-sm font-semibold text-[#0F1A2E]"
        >
          Print / Save PDF
        </button>
        <a
          href={`/e/${event.slug}`}
          className="rounded-md border border-black/20 px-4 py-2 text-sm"
        >
          Back to invite
        </a>
      </div>

      <article className="mx-auto max-w-xl border border-black/15 bg-white p-10 text-center shadow-sm">
        <p className="text-xs uppercase tracking-[0.28em] text-[#8A6B2F]">
          Menu
        </p>
        <h1
          className="mt-3 text-4xl leading-tight"
          style={{ fontFamily: `"${event.theme.fonts.display}", Georgia, serif` }}
        >
          {event.headline || event.title}
        </h1>
        <p className="mt-2 text-sm text-black/55">
          {event.dateISO} · {event.venue}
        </p>
        <ul className="mt-10 space-y-6 text-left">
          {options.map((item, i) => (
            <li key={`${item}-${i}`} className="border-t border-black/10 pt-4">
              <div className="text-xs uppercase tracking-[0.2em] text-[#8A6B2F]">
                Course {i + 1}
              </div>
              <div
                className="mt-1 text-2xl"
                style={{
                  fontFamily: `"${event.theme.fonts.display}", Georgia, serif`,
                }}
              >
                {item}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-12 text-sm text-black/50">Hosted by {event.hostName}</p>
      </article>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </main>
  );
}

export function PrintPlaceCards({
  event,
  tables,
}: {
  event: EventRecord;
  tables: SeatingTable[];
}) {
  const cards = tables.flatMap((table) =>
    table.assignments.map((a) => ({
      name: a.guestName || "Guest",
      table: table.name,
      seat: a.seatLabel || "",
    })),
  );

  return (
    <main className="min-h-screen bg-[#F7F2E8] px-4 py-8 text-[#1A1A1A]">
      <div className="mx-auto mb-6 flex max-w-5xl flex-wrap gap-2 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md bg-[#C9A962] px-4 py-2 text-sm font-semibold text-[#0F1A2E]"
        >
          Print / Save PDF
        </button>
        <a
          href={`/host/${event.slug}`}
          className="rounded-md border border-black/20 px-4 py-2 text-sm"
        >
          Back to studio
        </a>
      </div>

      {cards.length === 0 ? (
        <p className="mx-auto max-w-xl text-center text-sm text-black/60">
          No seating assignments yet. Assign guests in the seating chart, then
          return here.
        </p>
      ) : (
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c, i) => (
            <article
              key={`${c.name}-${c.table}-${i}`}
              className="flex min-h-[140px] flex-col items-center justify-center border border-black/15 bg-white p-6 text-center shadow-sm"
            >
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#8A6B2F]">
                {event.title}
              </p>
              <h2
                className="mt-2 text-2xl leading-tight"
                style={{
                  fontFamily: `"${event.theme.fonts.display}", Georgia, serif`,
                }}
              >
                {c.name}
              </h2>
              <p className="mt-3 text-sm text-black/55">
                {c.table}
                {c.seat ? ` · ${c.seat}` : ""}
              </p>
            </article>
          ))}
        </div>
      )}

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </main>
  );
}
