"use client";

import type { EventRecord } from "@/lib/types";

export default function PrintCard({
  event,
  inviteUrl,
  qrUrl,
}: {
  event: EventRecord;
  inviteUrl: string;
  qrUrl: string;
}) {
  return (
    <main className="print-root min-h-screen bg-[#F7F2E8] px-4 py-8 text-[#1A1A1A]">
      <div className="mx-auto mb-6 flex max-w-xl flex-wrap gap-2 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md bg-[#C9A962] px-4 py-2 text-sm font-semibold text-[#0F1A2E]"
        >
          Print / Save PDF
        </button>
        <a
          href={qrUrl}
          download={`${event.slug}-qr.png`}
          className="rounded-md border border-black/20 px-4 py-2 text-sm"
        >
          Download QR PNG
        </a>
        <a href={`/e/${event.slug}`} className="rounded-md border border-black/20 px-4 py-2 text-sm">
          Back to invite
        </a>
      </div>

      <article className="card mx-auto grid max-w-xl gap-6 border border-black/15 bg-white p-8 shadow-sm sm:grid-cols-[1fr_auto]">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#8A6B2F]">
            Save the date
          </p>
          <h1
            className="mt-2 text-3xl leading-tight"
            style={{ fontFamily: `"${event.theme.fonts.display}", Georgia, serif` }}
          >
            {event.headline || event.title}
          </h1>
          <p className="mt-3 text-base text-black/70">{event.tagline}</p>
          <dl className="mt-6 space-y-2 text-sm">
            <div>
              <dt className="uppercase tracking-wider text-black/45">When</dt>
              <dd>
                {event.dateISO} · {event.timeLabel}
              </dd>
            </div>
            <div>
              <dt className="uppercase tracking-wider text-black/45">Where</dt>
              <dd>
                {event.venue}
                <br />
                {event.address}
              </dd>
            </div>
          </dl>
          <p className="mt-6 break-all text-xs text-black/50">{inviteUrl}</p>
          <p className="mt-2 text-sm">Hosted by {event.hostName}</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrUrl} alt="Invite QR code" width={160} height={160} />
          <span className="text-xs text-black/50">Scan to RSVP</span>
        </div>
      </article>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print-root {
            padding: 0 !important;
            background: white !important;
          }
          .card {
            box-shadow: none !important;
            border-color: #ccc !important;
            break-inside: avoid;
          }
        }
      `}</style>
    </main>
  );
}
