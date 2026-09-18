import Link from "next/link";
import StationeryThumb from "@/components/marketing/StationeryThumb";
import { TEMPLATES } from "@/lib/templates";
import type { Locale } from "@/lib/i18n/config";

const FLORAL_TL = "/templates/quince-tiara/floral-corner-tl.webp";
const FLORAL_BR = "/templates/quince-tiara/floral-corner-br.webp";

/**
 * First-fold craft: live princesa + tiara stationery (phone mock on the lead card).
 * Sized to sit above the fold on a 390-wide phone — not an empty cream void.
 */
export default function HeroCraftMock({
  url,
  peekHref,
  peekLabel,
  locale = "en",
}: {
  url: string;
  peekHref: string;
  peekLabel: string;
  locale?: Locale;
}) {
  const princesa = TEMPLATES.find((tpl) => tpl.id === "quince-princesa");
  const tiara = TEMPLATES.find((tpl) => tpl.id === "quince-tiara");
  if (!princesa || !tiara) return null;

  return (
    <div className="relative mx-auto w-full max-w-[22rem] sm:max-w-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={FLORAL_TL}
        alt=""
        aria-hidden
        className="pointer-events-none absolute -left-8 -top-10 w-[42%] max-w-[9rem] opacity-80 sm:-left-12 sm:-top-12 sm:w-[38%]"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={FLORAL_BR}
        alt=""
        aria-hidden
        className="pointer-events-none absolute -bottom-8 -right-6 w-[40%] max-w-[8.5rem] opacity-75 sm:-bottom-10 sm:-right-8"
      />

      <div className="relative flex items-end gap-2.5 sm:gap-3">
        <Link
          href={peekHref}
          className="landing-float relative z-10 block w-[64%] min-w-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-rose)]"
          aria-label={peekLabel}
        >
          <div
            className="overflow-hidden rounded-[1.15rem] border bg-[#FFFCFA] sm:rounded-[1.45rem]"
            style={{
              borderColor: "var(--landing-line)",
              boxShadow:
                "0 14px 32px rgba(143,78,88,0.14), 0 1px 0 rgba(26,23,20,0.06)",
            }}
          >
            <div
              className="flex items-center gap-1.5 border-b px-2.5 py-1.5 sm:gap-2 sm:px-3 sm:py-2"
              style={{
                borderColor: "var(--landing-line)",
                background: "var(--landing-paper)",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#E8C9B8]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#E8C9B8]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#E8C9B8]" />
              <span
                className="ml-1 flex-1 truncate rounded-full px-2 py-0.5 text-center text-[10px] tracking-wide sm:text-[11px]"
                style={{
                  background: "#FFFCFA",
                  color: "var(--landing-muted)",
                }}
              >
                {url}
              </span>
            </div>
            <div className="relative aspect-[3/3.55] overflow-hidden">
              <StationeryThumb
                template={princesa}
                locale={locale}
                featured
              />
            </div>
          </div>
        </Link>

        <Link
          href="/preview/quince-tiara"
          className="relative z-10 mb-1 w-[36%] min-w-0 rotate-[6deg] overflow-hidden rounded-md border bg-[#FFFCFA] shadow-md sm:mb-3"
          style={{ borderColor: "var(--landing-line)" }}
          aria-label={locale === "es" ? "Quince tiara" : "Quince tiara"}
        >
          <div className="relative aspect-[3/4]">
            <StationeryThumb template={tiara} locale={locale} />
          </div>
        </Link>
      </div>
    </div>
  );
}
