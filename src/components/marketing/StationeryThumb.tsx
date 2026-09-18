import type { EventTemplate } from "@/lib/templates";
import { displayFont } from "@/lib/marketing-theme";

const PRINCESA_SEAL = "/templates/quince-princesa/seal-monogram-kxz.svg";
const PRINCESA_GOWN = "/templates/quince-tiara/gown-back-pink.webp";
const TIARA = "/templates/quince-tiara/tiara-pink-glitter.webp";
const FLORAL_TL = "/templates/quince-tiara/floral-corner-tl.webp";
const FLORAL_BR = "/templates/quince-tiara/floral-corner-br.webp";
const ROSA_HERO = "/templates/quince-rosa-hero.png";

type StationeryThumbProps = {
  template: EventTemplate;
  locale?: "en" | "es";
  featured?: boolean;
};

/** Paper stationery art — never a full-bleed stock photo dump. */
export default function StationeryThumb({
  template,
  locale = "en",
  featured = false,
}: StationeryThumbProps) {
  const name = locale === "es" ? template.nameEs : template.name;
  const headline =
    locale === "es" ? template.headlineEs : template.headline;

  if (template.id === "quince-princesa") {
    return (
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, #FFF7F9 0%, #FFE8EF 55%, #F6E9EC 100%)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PRINCESA_SEAL}
          alt=""
          className="absolute left-1/2 top-[6%] w-[22%] -translate-x-1/2 sm:top-[8%] sm:w-[24%]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PRINCESA_GOWN}
          alt=""
          className="absolute bottom-[-6%] left-1/2 w-[72%] -translate-x-1/2 object-contain"
        />
        <p
          className="absolute left-0 right-0 top-[16%] text-center text-[10px] tracking-[0.28em] sm:top-[18%]"
          style={{ color: "#C9A27A", ...displayFont }}
        >
          MIS XV AÑOS
        </p>
        <p
          className="absolute left-3 right-3 top-[22%] text-center text-[clamp(1.05rem,3.2vw,1.45rem)] leading-tight sm:top-[24%]"
          style={{ color: "#B76E79", ...displayFont, fontWeight: 600 }}
        >
          Katia Xiomara
        </p>
      </div>
    );
  }

  if (template.id === "quince-tiara") {
    return (
      <div
        className="relative h-full w-full overflow-hidden"
        style={{ background: "#FFFCFA" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={FLORAL_TL}
          alt=""
          className="absolute left-0 top-0 w-[42%] object-contain"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={FLORAL_BR}
          alt=""
          className="absolute bottom-0 right-0 w-[42%] object-contain"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={TIARA}
          alt=""
          className="absolute left-1/2 top-[8%] w-[34%] -translate-x-1/2 object-contain"
        />
        <p
          className="absolute left-3 right-3 top-[28%] text-center text-[clamp(1.05rem,3vw,1.35rem)] italic leading-tight"
          style={{ color: "#E8A0B8", ...displayFont, fontWeight: 500 }}
        >
          Quinceañera
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PRINCESA_GOWN}
          alt=""
          className="absolute bottom-[-8%] left-1/2 w-[58%] -translate-x-1/2 object-contain"
        />
      </div>
    );
  }

  if (template.id === "quince-rosa" || template.heroImage.startsWith("/templates/")) {
    return (
      <div
        className="relative flex h-full w-full items-center justify-center p-3"
        style={{ background: template.theme.colors.background }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            template.id === "quince-rosa" ? ROSA_HERO : template.heroImage
          }
          alt=""
          className="max-h-full max-w-full object-contain"
        />
      </div>
    );
  }

  const colors = template.theme.colors;
  return (
    <div
      className="relative flex h-full w-full items-center justify-center p-4"
      style={{
        background: `linear-gradient(180deg, ${colors.background} 0%, ${colors.surface} 100%)`,
      }}
    >
      <div
        className={`flex h-full w-full flex-col items-center justify-center rounded-sm border px-4 text-center ${
          featured ? "py-10" : "py-6"
        }`}
        style={{
          borderColor: colors.accentSecondary,
          background: colors.surface,
          boxShadow: "0 1px 0 rgba(26,23,20,0.04)",
        }}
      >
        <p
          className="text-[10px] uppercase tracking-[0.26em]"
          style={{ color: colors.accentPrimary }}
        >
          {name}
        </p>
        <p
          className="mt-3 leading-tight"
          style={{
            ...displayFont,
            fontSize: featured ? "1.55rem" : "1.25rem",
            fontWeight: 600,
            color: colors.textPrimary,
          }}
        >
          {headline}
        </p>
        <span
          className="mt-5 block h-px w-12"
          style={{ background: colors.accentPrimary }}
        />
      </div>
    </div>
  );
}
