import Link from "next/link";
import MarketingShell from "@/components/marketing/MarketingShell";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { displayFont } from "@/lib/marketing-theme";
import {
  GALLERY_BIRTHDAY_SAMPLE_PATH,
  galleryTemplates,
  templatePreviewPath,
  templateUsePath,
} from "@/lib/template-gallery";

export default function TemplateGallery({
  locale = "en",
  path = "/marketplace",
}: {
  locale?: Locale;
  path?: string;
}) {
  const t = getDictionary(locale).gallery;
  const templates = galleryTemplates();

  return (
    <MarketingShell
      locale={locale}
      path={path}
      maxWidthClass="max-w-6xl"
      headerExtra={
        <Link
          href={localePath(locale, "/preview/quince-princesa")}
          className="hidden text-sm transition hover:text-[var(--landing-ink)] sm:inline"
          style={{ color: "var(--landing-muted)" }}
        >
          {t.peek}
        </Link>
      }
    >
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-12 sm:px-8 sm:pb-24 sm:pt-16">
        <p
          className="text-xs uppercase tracking-[0.28em]"
          style={{ color: "var(--landing-cedar)" }}
        >
          {t.eyebrow}
        </p>
        <h1
          className="mt-3 max-w-xl"
          style={{
            ...displayFont,
            fontSize: "clamp(2.15rem, 7vw, 3.4rem)",
            fontWeight: 600,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            color: "var(--landing-ink)",
          }}
        >
          {t.title}
        </h1>
        <p
          className="mt-4 max-w-lg text-base leading-relaxed sm:text-lg"
          style={{ color: "var(--landing-muted)" }}
        >
          {t.support}
        </p>

        <ul className="mt-10 grid grid-cols-1 gap-5 sm:mt-14 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {templates.map((tpl) => {
            const name = locale === "es" ? tpl.nameEs : tpl.name;
            const description =
              locale === "es" ? tpl.descriptionEs : tpl.description;
            const contained = tpl.heroImage.startsWith("/templates/");
            return (
              <li key={tpl.id}>
                <article
                  className="flex h-full flex-col overflow-hidden rounded-md border bg-white"
                  style={{
                    borderColor: "var(--landing-line)",
                    boxShadow: "0 1px 2px rgba(26,23,20,0.05)",
                  }}
                >
                  <div
                    className="relative aspect-[3/4] overflow-hidden"
                    style={{ background: "var(--landing-paper-2)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tpl.heroImage}
                      alt=""
                      className={
                        contained
                          ? "h-full w-full object-contain p-3"
                          : "h-full w-full object-cover"
                      }
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
                        fontSize: "1.45rem",
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
                    <div className="mt-5 flex flex-col gap-2">
                      <Link
                        href={templatePreviewPath(tpl.id)}
                        className="inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold"
                        style={{
                          border: "1px solid var(--landing-line)",
                          color: "var(--landing-ink)",
                        }}
                      >
                        {t.preview}
                      </Link>
                      <Link
                        href={templateUsePath(tpl.id)}
                        className="inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold text-white"
                        style={{ background: "var(--landing-cedar)" }}
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

        <aside
          className="mt-16 border-t pt-10 sm:mt-20"
          style={{ borderColor: "var(--landing-line)" }}
        >
          <h2
            style={{
              ...displayFont,
              fontSize: "1.65rem",
              fontWeight: 600,
              color: "var(--landing-ink)",
            }}
          >
            {t.otherTitle}
          </h2>
          <p
            className="mt-3 max-w-lg leading-relaxed"
            style={{ color: "var(--landing-muted)" }}
          >
            {t.otherBody}
          </p>
          <Link
            href={localePath(locale, GALLERY_BIRTHDAY_SAMPLE_PATH)}
            className="mt-5 inline-flex min-h-11 items-center text-sm font-medium underline-offset-[6px] hover:underline"
            style={{ color: "var(--landing-cedar)" }}
          >
            {t.birthdayCta}
          </Link>
        </aside>
      </section>
    </MarketingShell>
  );
}
