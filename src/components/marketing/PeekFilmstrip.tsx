import Link from "next/link";
import { MARQUEE } from "@/lib/marquee-assets";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { displayFont } from "@/lib/marketing-theme";
import { PEEK_DEMO_PATH } from "@/lib/template-gallery";

export default function PeekFilmstrip({
  locale = "en",
  title,
  captions,
  peekLabel,
}: {
  locale?: Locale;
  title: string;
  captions: string[];
  peekLabel: string;
}) {
  const frames = [
    {
      src: MARQUEE.envelopeClosed,
      alt: locale === "es" ? "Sobre lacrado KG, Katia Gonzalez" : "KG wax-seal envelope for Katia Gonzalez",
      caption: captions[0] ?? "Envelope",
      landscape: true,
    },
    {
      src: MARQUEE.peek1,
      alt: locale === "es" ? "Peek: quinceañera en el jardín" : "Peek: quinceañera garden still",
      caption: captions[1] ?? "Hero",
      landscape: false,
    },
    {
      src: MARQUEE.rsvpCard,
      alt: locale === "es" ? "Tarjeta RSVP de Katia Gonzalez" : "Katia Gonzalez RSVP stationery",
      caption: captions[2] ?? "RSVP",
      landscape: true,
    },
  ];

  const href = localePath(locale, PEEK_DEMO_PATH);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <h2
          className="max-w-md text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-tight"
          style={{ ...displayFont, color: "var(--landing-ink)" }}
        >
          {title}
        </h2>
        <Link
          href={href}
          className="hidden shrink-0 text-sm font-semibold underline-offset-[6px] hover:underline sm:inline"
          style={{ color: "var(--landing-rose-deep)" }}
        >
          {peekLabel} →
        </Link>
      </div>

      <ul className="mt-6 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible [&::-webkit-scrollbar]:hidden">
        {frames.map((frame) => (
          <li key={frame.src} className="w-[11.5rem] shrink-0 sm:w-auto">
            <Link
              href={href}
              className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-rose)]"
              aria-label={`${frame.caption}. ${peekLabel}`}
            >
              <div
                className="overflow-hidden rounded-[1.05rem] border bg-[#FFFCFA]"
                style={{
                  borderColor: "var(--landing-champagne, #E8D5B5)",
                  boxShadow:
                    "0 12px 28px rgba(58,42,48,0.08), 0 0 0 1px rgba(196,165,116,0.28)",
                }}
              >
                <div
                  className={`relative overflow-hidden ${
                    frame.landscape ? "aspect-[4/5]" : "aspect-[9/16]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={frame.src}
                    alt={frame.alt}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </div>
                <p
                  className="border-t px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.16em]"
                  style={{
                    borderColor: "var(--landing-champagne, #E8D5B5)",
                    color: "var(--landing-rose-deep)",
                    background: "var(--landing-surface)",
                  }}
                >
                  {frame.caption}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
