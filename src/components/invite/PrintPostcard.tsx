"use client";

import { sanitizeAboutHtml } from "@/lib/sanitize-about";
import type { EventRecord } from "@/lib/types";

function formatPostcardDate(dateISO: string): string {
  const d = new Date(`${dateISO}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateISO;
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function PrintPostcard({
  event,
  inviteUrl,
  qrUrl,
}: {
  event: EventRecord;
  inviteUrl: string;
  qrUrl: string;
}) {
  const accent = event.theme.colors.accentPrimary || "#C9A962";
  const ink = event.theme.colors.textPrimary || "#1A1A1A";
  const display = `"${event.theme.fonts.display}", Georgia, serif`;
  const body = `"${event.theme.fonts.body}", system-ui, sans-serif`;
  const dateLabel = formatPostcardDate(event.dateISO);
  const taglineHtml = sanitizeAboutHtml(event.tagline);

  return (
    <main className="postcard-root min-h-screen bg-[#EDE7DC] px-4 py-8 text-[#1A1A1A]">
      <div className="mx-auto mb-6 flex max-w-[7in] flex-wrap items-center gap-2 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md bg-[#C9A962] px-4 py-2 text-sm font-semibold text-[#0F1A2E]"
        >
          Print / Download PDF
        </button>
        <a
          href={qrUrl}
          download={`${event.slug}-qr.png`}
          className="rounded-md border border-black/20 bg-white/70 px-4 py-2 text-sm"
        >
          Download QR PNG
        </a>
        <a
          href={`/e/${event.slug}`}
          className="rounded-md border border-black/20 bg-white/70 px-4 py-2 text-sm"
        >
          Back to invite
        </a>
        <p className="w-full text-xs text-black/55">
          Tip: choose “Save as PDF” in the print dialog to download the postcard.
        </p>
      </div>

      <div className="postcard-sheet mx-auto">
        {/* Front — photo + title */}
        <article
          className="postcard postcard-front"
          style={{ color: ink, fontFamily: body }}
        >
          <div className="postcard-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={event.heroImage} alt="" />
            <div className="postcard-photo-veil" aria-hidden />
          </div>
          <div className="postcard-front-copy">
            <p className="postcard-eyebrow" style={{ color: accent }}>
              You&apos;re invited
            </p>
            <h1 className="postcard-title" style={{ fontFamily: display }}>
              {event.headline || event.title}
            </h1>
            {taglineHtml ? (
              <div
                className="postcard-tagline"
                dangerouslySetInnerHTML={{ __html: taglineHtml }}
              />
            ) : null}
          </div>
        </article>

        {/* Back — details + QR */}
        <article
          className="postcard postcard-back"
          style={{ color: ink, fontFamily: body }}
        >
          <div className="postcard-back-main">
            <p className="postcard-eyebrow" style={{ color: accent }}>
              Join us
            </p>
            <h2 className="postcard-back-title" style={{ fontFamily: display }}>
              {event.title}
            </h2>
            <dl className="postcard-meta">
              <div>
                <dt>When</dt>
                <dd>
                  {dateLabel}
                  {event.timeLabel ? (
                    <>
                      <br />
                      {event.timeLabel}
                    </>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt>Where</dt>
                <dd>
                  {event.venue}
                  {event.address ? (
                    <>
                      <br />
                      {event.address}
                    </>
                  ) : null}
                </dd>
              </div>
            </dl>
            <p className="postcard-host">Hosted by {event.hostName}</p>
            <p className="postcard-url">{inviteUrl}</p>
          </div>
          <aside className="postcard-qr">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="Invite QR code" width={132} height={132} />
            <span>Scan for details</span>
          </aside>
          <div className="postcard-stamp" aria-hidden>
            <span>OWNVITE</span>
          </div>
        </article>
      </div>

      <style jsx global>{`
        .postcard-sheet {
          display: grid;
          gap: 1.25rem;
          width: min(100%, 6.25in);
          margin-inline: auto;
        }

        .postcard {
          position: relative;
          width: 100%;
          aspect-ratio: 6 / 4;
          overflow: hidden;
          background: #fffefb;
          border: 1px solid rgba(26, 26, 26, 0.12);
          box-shadow: 0 18px 40px rgba(26, 26, 26, 0.1);
        }

        .postcard-front {
          display: grid;
        }

        .postcard-photo {
          position: absolute;
          inset: 0;
        }

        .postcard-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .postcard-photo-veil {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(15, 18, 24, 0.15) 0%,
            rgba(15, 18, 24, 0.55) 55%,
            rgba(15, 18, 24, 0.78) 100%
          );
        }

        .postcard-front-copy {
          position: relative;
          z-index: 1;
          align-self: end;
          padding: 0.9rem 1rem 1rem;
          color: #fffefb;
        }

        .postcard-eyebrow {
          margin: 0;
          font-size: 0.68rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-weight: 600;
        }

        .postcard-front .postcard-eyebrow {
          color: #f4e4b8 !important;
        }

        .postcard-title {
          margin: 0.35rem 0 0;
          font-size: clamp(1.55rem, 4.2vw, 2.15rem);
          line-height: 1.05;
          font-weight: 500;
        }

        .postcard-tagline {
          margin-top: 0.4rem;
          font-size: 0.88rem;
          line-height: 1.35;
          opacity: 0.9;
          max-width: 90%;
        }

        .postcard-tagline :global(p) {
          margin: 0;
        }

        .postcard-back {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 0.75rem 1rem;
          padding: 0.95rem 1rem 1rem;
          background:
            linear-gradient(
              135deg,
              #fffefb 0%,
              color-mix(in srgb, ${accent} 8%, #fffefb) 100%
            );
        }

        .postcard-back-main {
          min-width: 0;
        }

        .postcard-back-title {
          margin: 0.3rem 0 0.75rem;
          font-size: 1.35rem;
          line-height: 1.15;
          font-weight: 500;
        }

        .postcard-meta {
          margin: 0;
          display: grid;
          gap: 0.55rem;
        }

        .postcard-meta dt {
          margin: 0;
          font-size: 0.62rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(26, 26, 26, 0.5);
        }

        .postcard-meta dd {
          margin: 0.15rem 0 0;
          font-size: 0.9rem;
          line-height: 1.35;
        }

        .postcard-host {
          margin: 0.85rem 0 0;
          font-size: 0.82rem;
        }

        .postcard-url {
          margin: 0.35rem 0 0;
          font-size: 0.68rem;
          color: rgba(26, 26, 26, 0.55);
          word-break: break-all;
        }

        .postcard-qr {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          gap: 0.35rem;
          padding-top: 0.15rem;
        }

        .postcard-qr img {
          width: 4.6rem;
          height: 4.6rem;
          background: white;
          border: 1px solid rgba(26, 26, 26, 0.1);
          padding: 0.2rem;
        }

        .postcard-qr span {
          font-size: 0.62rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(26, 26, 26, 0.5);
        }

        .postcard-stamp {
          position: absolute;
          top: 0.7rem;
          right: 0.85rem;
          width: 2.4rem;
          height: 2.4rem;
          border: 1.5px dashed rgba(26, 26, 26, 0.28);
          border-radius: 0.2rem;
          display: grid;
          place-items: center;
          opacity: 0.55;
          pointer-events: none;
        }

        .postcard-stamp span {
          font-size: 0.48rem;
          letter-spacing: 0.14em;
          transform: rotate(-12deg);
        }

        @media print {
          @page {
            size: 6in 4in;
            margin: 0;
          }

          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .postcard-root {
            padding: 0 !important;
            background: white !important;
            min-height: 0 !important;
          }

          .postcard-sheet {
            width: 6in;
            gap: 0;
          }

          .postcard {
            width: 6in;
            height: 4in;
            aspect-ratio: auto;
            box-shadow: none !important;
            border: none !important;
            break-after: page;
            page-break-after: always;
          }

          .postcard-back {
            break-after: auto;
            page-break-after: auto;
          }

          .postcard-qr img {
            width: 1.35in;
            height: 1.35in;
          }
        }
      `}</style>
    </main>
  );
}
