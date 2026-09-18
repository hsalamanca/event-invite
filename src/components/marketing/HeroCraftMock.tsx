import Link from "next/link";
import { displayFont } from "@/lib/marketing-theme";

const SEAL = "/templates/quince-princesa/seal-monogram-kxz.svg";
const GOWN = "/templates/quince-tiara/gown-back-pink.webp";
const TIARA = "/templates/quince-tiara/tiara-pink-glitter.webp";
const FLORAL_TL = "/templates/quince-tiara/floral-corner-tl.webp";
const FLORAL_BR = "/templates/quince-tiara/floral-corner-br.webp";

export default function HeroCraftMock({
  url,
  peekHref,
  peekLabel,
}: {
  url: string;
  peekHref: string;
  peekLabel: string;
}) {
  return (
    <div className="relative mx-auto flex w-full max-w-[18rem] items-end justify-center sm:max-w-none">
      <Link
        href={peekHref}
        className="landing-float relative z-10 block w-[min(100%,14.75rem)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-rose)] sm:w-[min(100%,18.5rem)]"
        aria-label={peekLabel}
      >
        <div
          className="overflow-hidden rounded-[1.65rem] border bg-[#FFFCFA]"
          style={{
            borderColor: "var(--landing-line)",
            boxShadow:
              "0 18px 40px rgba(143,78,88,0.14), 0 1px 0 rgba(26,23,20,0.06)",
          }}
        >
          <div
            className="flex items-center gap-2 border-b px-3 py-2.5"
            style={{
              borderColor: "var(--landing-line)",
              background: "var(--landing-paper)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#E8C9B8]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#E8C9B8]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#E8C9B8]" />
            <span
              className="ml-1 flex-1 truncate rounded-full px-2.5 py-1 text-center text-[11px] tracking-wide"
              style={{
                background: "#FFFCFA",
                color: "var(--landing-muted)",
              }}
            >
              {url}
            </span>
          </div>
          <div
            className="relative overflow-hidden"
            style={{
              aspectRatio: "3 / 4.15",
              background:
                "linear-gradient(180deg, #FFF7F9 0%, #FFE8EF 58%, #F6E9EC 100%)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={SEAL}
              alt=""
              className="absolute left-1/2 top-[11%] w-[26%] -translate-x-1/2"
            />
            <p
              className="absolute left-0 right-0 top-[32%] text-center text-[10px] tracking-[0.32em]"
              style={{ color: "#C9A27A", ...displayFont }}
            >
              MIS XV AÑOS
            </p>
            <p
              className="absolute left-4 right-4 top-[38%] text-center text-[1.45rem] leading-tight"
              style={{
                color: "#B76E79",
                ...displayFont,
                fontWeight: 600,
              }}
            >
              Katia Xiomara
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={GOWN}
              alt=""
              className="absolute bottom-[-8%] left-1/2 w-[78%] -translate-x-1/2 object-contain"
            />
          </div>
        </div>
      </Link>

      <Link
        href="/preview/quince-tiara"
        className="absolute -right-1 bottom-6 hidden w-[7.5rem] rotate-[7deg] overflow-hidden rounded-md border bg-[#FFFCFA] shadow-md sm:block lg:-right-4 lg:w-[8.5rem]"
        style={{ borderColor: "var(--landing-line)" }}
        aria-label="Quince tiara"
      >
        <div className="relative aspect-[3/4]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={FLORAL_TL}
            alt=""
            className="absolute left-0 top-0 w-[48%]"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={FLORAL_BR}
            alt=""
            className="absolute bottom-0 right-0 w-[48%]"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={TIARA}
            alt=""
            className="absolute left-1/2 top-[10%] w-[40%] -translate-x-1/2"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={GOWN}
            alt=""
            className="absolute bottom-[-10%] left-1/2 w-[70%] -translate-x-1/2"
          />
        </div>
      </Link>
    </div>
  );
}
