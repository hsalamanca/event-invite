"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import {
  TEMPLATE_CATEGORIES,
  TEMPLATES,
  templatesByCategory,
  type TemplateCategory,
} from "@/lib/templates";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export default function CreateEventWizard({
  locale = "en",
  defaultHostName = "",
}: {
  locale?: Locale;
  defaultHostName?: string;
}) {
  const t = getDictionary(locale).create;
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<TemplateCategory | "all">("all");
  const [templateId, setTemplateId] = useState(TEMPLATES[0]!.id);
  const [title, setTitle] = useState("");
  const [hostName, setHostName] = useState(defaultHostName);
  const [dateISO, setDateISO] = useState("");
  const [timeLabel, setTimeLabel] = useState("7:00 PM");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [about, setAbout] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const suggestedSlug = useMemo(() => slugify(title || "my-event"), [title]);
  const visibleTemplates = useMemo(
    () => templatesByCategory(category),
    [category],
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          title,
          hostName,
          dateISO,
          timeLabel,
          venue,
          address,
          about,
          slug: slug || suggestedSlug,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        event?: { slug: string };
      };
      if (!res.ok || !data.event) {
        setError(data.error || t.error);
        return;
      }
      router.push(`/host/${data.event.slug}`);
      router.refresh();
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-5xl">
      <div className="mb-8 flex gap-2 text-xs uppercase tracking-[0.2em] text-[var(--mist)]">
        <span className={step === 1 ? "text-[var(--champagne)]" : ""}>
          1 · {t.stepTemplate}
        </span>
        <span>·</span>
        <span className={step === 2 ? "text-[var(--champagne)]" : ""}>
          2 · {t.stepDetails}
        </span>
      </div>

      {step === 1 ? (
        <div>
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl tracking-tight">
            {t.pickTemplate}
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--mist)]">{t.pickSupport}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {TEMPLATE_CATEGORIES.map((cat) => {
              const active = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium tracking-wide transition ${
                    active
                      ? "bg-[var(--champagne)] text-[var(--ink)]"
                      : "border border-white/15 text-[var(--mist)] hover:border-white/30 hover:text-[var(--ivory)]"
                  }`}
                >
                  {locale === "es" ? cat.labelEs : cat.label}
                </button>
              );
            })}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleTemplates.map((tpl) => {
              const selected = templateId === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setTemplateId(tpl.id)}
                  className={`group overflow-hidden text-left transition ${
                    selected
                      ? "ring-2 ring-[var(--champagne)]"
                      : "ring-1 ring-white/10 hover:ring-white/25"
                  }`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tpl.heroImage}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-x-0 bottom-0 h-1/2"
                      style={{
                        background: `linear-gradient(transparent, ${tpl.theme.colors.background})`,
                      }}
                    />
                    <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
                      {tpl.premium ? (
                        <span className="rounded bg-[var(--champagne)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--ink)]">
                          Premium
                        </span>
                      ) : null}
                      {tpl.categories.slice(0, 2).map((c) => (
                        <span
                          key={c}
                          className="rounded bg-black/45 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-white/90"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div
                    className="px-3 py-3"
                    style={{
                      background: tpl.theme.colors.surface,
                      color: tpl.theme.colors.textPrimary,
                    }}
                  >
                    <p
                      className="text-lg leading-tight"
                      style={{
                        fontFamily: `var(--font-${
                          tpl.theme.fonts.display === "Playfair Display"
                            ? "playfair"
                            : tpl.theme.fonts.display === "Great Vibes"
                              ? "great-vibes"
                              : tpl.theme.fonts.display === "Lora"
                                ? "lora"
                                : tpl.theme.fonts.display === "Fraunces"
                                  ? "fraunces"
                                  : tpl.theme.fonts.display === "Outfit"
                                    ? "outfit"
                                    : tpl.theme.fonts.display === "Bangers"
                                      ? "bangers"
                                      : tpl.theme.fonts.display === "Fredoka"
                                        ? "fredoka"
                                        : tpl.theme.fonts.display === "Baloo 2"
                                          ? "baloo-2"
                                          : tpl.theme.fonts.display ===
                                              "Space Grotesk"
                                            ? "space-grotesk"
                                            : tpl.theme.fonts.display ===
                                                "Press Start 2P"
                                              ? "press-start"
                                              : "cormorant"
                        })`,
                      }}
                    >
                      {locale === "es" ? tpl.nameEs : tpl.name}
                    </p>
                    <p
                      className="mt-1 text-xs leading-snug"
                      style={{ color: tpl.theme.colors.textMuted }}
                    >
                      {locale === "es" ? tpl.descriptionEs : tpl.description}
                    </p>
                    <p
                      className="mt-2 text-[10px] uppercase tracking-[0.14em]"
                      style={{ color: tpl.theme.colors.accentPrimary }}
                    >
                      {locale === "es" ? tpl.inspiredByEs : tpl.inspiredBy}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {visibleTemplates.length === 0 ? (
            <p className="mt-8 text-[var(--mist)]">No templates in this category.</p>
          ) : null}

          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!templateId}
            className="mt-8 rounded-md bg-[var(--champagne)] px-5 py-2.5 text-sm font-semibold text-[var(--ink)] disabled:opacity-50"
          >
            {t.continue}
          </button>
        </div>
      ) : (
        <div>
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl tracking-tight">
            {t.detailsTitle}
          </h1>
          <p className="mt-2 text-[var(--mist)]">{t.detailsSupport}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className="text-[var(--mist)]">{t.title}</span>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-[var(--champagne)]"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--mist)]">{t.host}</span>
              <input
                required
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-[var(--champagne)]"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--mist)]">{t.slug}</span>
              <input
                value={slug}
                placeholder={suggestedSlug}
                onChange={(e) => setSlug(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-[var(--champagne)]"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--mist)]">{t.date}</span>
              <input
                type="date"
                required
                value={dateISO}
                onChange={(e) => setDateISO(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-[var(--champagne)]"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--mist)]">{t.time}</span>
              <input
                required
                value={timeLabel}
                onChange={(e) => setTimeLabel(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-[var(--champagne)]"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--mist)]">{t.venue}</span>
              <input
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-[var(--champagne)]"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--mist)]">{t.address}</span>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-[var(--champagne)]"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-[var(--mist)]">{t.about}</span>
              <textarea
                rows={3}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-white/15 bg-white/5 px-3 py-2.5 outline-none focus:border-[var(--champagne)]"
              />
            </label>
          </div>
          {error ? (
            <p className="mt-4 text-sm text-[var(--coral)]" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-md border border-white/15 px-5 py-2.5 text-sm"
            >
              {t.back}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-[var(--champagne)] px-5 py-2.5 text-sm font-semibold text-[var(--ink)] disabled:opacity-60"
            >
              {loading ? t.creating : t.create}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
