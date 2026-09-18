"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import StationeryThumb from "@/components/marketing/StationeryThumb";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { displayFont } from "@/lib/marketing-theme";
import {
  GALLERY_OCCASIONS,
  type GalleryOccasionId,
  templatesForOccasion,
  templatePreviewPath,
  templateRegisterPath,
} from "@/lib/template-gallery";

export default function GalleryPicker({ locale = "en" }: { locale?: Locale }) {
  const t = getDictionary(locale).gallery;
  const [occasion, setOccasion] = useState<GalleryOccasionId>("all");
  const templates = useMemo(
    () => templatesForOccasion(occasion),
    [occasion],
  );

  const chipLabel: Record<GalleryOccasionId, string> = {
    all: t.chipAll,
    quince: t.chipQuince,
    wedding: t.chipWedding,
    fiesta: t.chipFiesta,
    birthday: t.chipBirthday,
  };

  return (
    <div>
      <div
        className="mt-8 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mt-10 sm:flex-wrap [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label={t.eyebrow}
      >
        {GALLERY_OCCASIONS.map((chip) => {
          const active = occasion === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setOccasion(chip.id)}
              className="shrink-0 rounded-full px-3.5 py-2 text-xs font-medium tracking-wide transition"
              style={
                active
                  ? {
                      background: "var(--landing-rose)",
                      color: "#FFFCFA",
                    }
                  : {
                      border: "1px solid var(--landing-line)",
                      color: "var(--landing-muted)",
                      background: "var(--landing-surface)",
                    }
              }
            >
              {chipLabel[chip.id]}
            </button>
          );
        })}
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {templates.map((tpl) => {
          const name = locale === "es" ? tpl.nameEs : tpl.name;
          const description =
            locale === "es" ? tpl.descriptionEs : tpl.description;
          const featured = tpl.id === "quince-princesa";
          const lead = tpl.id === "quince-tiara";
          return (
            <li
              key={tpl.id}
              className={
                featured
                  ? "sm:col-span-2 lg:col-span-2"
                  : lead
                    ? "sm:col-span-1 lg:col-span-1"
                    : ""
              }
            >
              <article
                className="flex h-full flex-col overflow-hidden rounded-md border"
                style={{
                  borderColor: "var(--landing-line)",
                  background: "var(--landing-surface)",
                  boxShadow: "0 1px 2px rgba(26,23,20,0.05)",
                }}
              >
                <div
                  className={`relative overflow-hidden ${
                    featured ? "aspect-[4/5] sm:aspect-[5/4]" : "aspect-[3/4]"
                  }`}
                  style={{ background: "var(--landing-blush)" }}
                >
                  <StationeryThumb
                    template={tpl}
                    locale={locale}
                    featured={featured}
                  />
                  {tpl.premium ? (
                    <span
                      className="absolute left-3 top-3 rounded-sm px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white"
                      style={{ background: "var(--landing-cedar)" }}
                    >
                      {t.premium}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col px-4 py-4 sm:px-5 sm:py-5">
                  <h2
                    style={{
                      ...displayFont,
                      fontSize: featured ? "1.75rem" : "1.45rem",
                      fontWeight: 600,
                      color: "var(--landing-ink)",
                    }}
                  >
                    {name}
                  </h2>
                  <p
                    className="mt-2 flex-1 text-sm leading-relaxed"
                    style={{ color: "var(--landing-muted)" }}
                  >
                    {description}
                  </p>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <Link
                      href={templatePreviewPath(tpl.id)}
                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold"
                      style={{
                        background: "var(--landing-blush)",
                        color: "var(--landing-rose-deep)",
                      }}
                    >
                      {t.preview}
                    </Link>
                    <Link
                      href={templateRegisterPath(tpl.id)}
                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold text-white"
                      style={{ background: "var(--landing-cta)" }}
                    >
                      {t.useThis}
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
