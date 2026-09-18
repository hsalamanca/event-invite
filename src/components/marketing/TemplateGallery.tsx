import Link from "next/link";
import MarketingShell from "@/components/marketing/MarketingShell";
import GalleryPicker from "@/components/marketing/GalleryPicker";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { displayFont } from "@/lib/marketing-theme";
import { GALLERY_BIRTHDAY_SAMPLE_PATH } from "@/lib/template-gallery";

export default function TemplateGallery({
  locale = "en",
  path = "/marketplace",
}: {
  locale?: Locale;
  path?: string;
}) {
  const t = getDictionary(locale).gallery;

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
          style={{ color: "var(--landing-rose)" }}
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

        <GalleryPicker locale={locale} />

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
