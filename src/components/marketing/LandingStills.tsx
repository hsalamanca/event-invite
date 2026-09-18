import Link from "next/link";
import StationeryThumb from "@/components/marketing/StationeryThumb";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/config";
import { galleryTemplates } from "@/lib/template-gallery";

export default function LandingStills({
  locale = "en",
  title,
}: {
  locale?: Locale;
  title: string;
}) {
  const thumbs = galleryTemplates().slice(0, 8);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <h2
          className="max-w-md font-[family-name:var(--font-fraunces)] text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-tight"
          style={{ color: "var(--landing-ink)" }}
        >
          {title}
        </h2>
        <Link
          href={localePath(locale, "/marketplace")}
          className="hidden shrink-0 text-sm font-medium underline-offset-[6px] hover:underline sm:inline"
          style={{ color: "var(--landing-rose-deep)" }}
        >
          {locale === "es" ? "Ver plantillas" : "Browse templates"}
        </Link>
      </div>
      <div className="mt-6 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {thumbs.map((tpl) => (
          <Link
            key={tpl.id}
            href={localePath(locale, `/preview/${tpl.id}`)}
            className="relative h-40 w-28 shrink-0 overflow-hidden rounded-md border sm:h-48 sm:w-36"
            style={{
              borderColor: "var(--landing-line)",
              background: "var(--landing-surface)",
            }}
          >
            <StationeryThumb template={tpl} locale={locale} />
          </Link>
        ))}
      </div>
    </div>
  );
}
