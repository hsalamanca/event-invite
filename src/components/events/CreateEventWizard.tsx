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
  defaultTemplateId,
}: {
  locale?: Locale;
  defaultHostName?: string;
  defaultTemplateId?: string;
}) {
  const t = getDictionary(locale).create;
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<TemplateCategory | "all">("all");
  const [templateId, setTemplateId] = useState(
    defaultTemplateId && TEMPLATES.some((tpl) => tpl.id === defaultTemplateId)
      ? defaultTemplateId
      : TEMPLATES[0]!.id,
  );
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
  const [pasteText, setPasteText] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);

  const suggestedSlug = useMemo(() => slugify(title || "my-event"), [title]);
  const visibleTemplates = useMemo(
    () => templatesByCategory(category),
    [category],
  );

  async function parseWithAi() {
    setAiBusy(true);
    setError(null);
    setAiNote(null);
    try {
      const res = await fetch("/api/ai/parse-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pasteText }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not parse invite");
      const parsed = data.parsed as {
        title?: string;
        hostName?: string;
        dateISO?: string;
        timeLabel?: string;
        venue?: string;
        address?: string;
        about?: string;
        suggestedTemplateId?: string;
      };
      if (parsed.title) setTitle(parsed.title);
      if (parsed.hostName) setHostName(parsed.hostName);
      if (parsed.dateISO) setDateISO(parsed.dateISO);
      if (parsed.timeLabel) setTimeLabel(parsed.timeLabel);
      if (parsed.venue) setVenue(parsed.venue);
      if (parsed.address) setAddress(parsed.address);
      if (parsed.about) setAbout(parsed.about);
      if (
        parsed.suggestedTemplateId &&
        TEMPLATES.some((tpl) => tpl.id === parsed.suggestedTemplateId)
      ) {
        setTemplateId(parsed.suggestedTemplateId);
      }
      setStep(2);
      setAiNote(
        data.engine === "openai"
          ? "Filled from your paste with AI."
          : "Filled from your paste (offline parser).",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Parse failed");
    } finally {
      setAiBusy(false);
    }
  }

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
      <div className="mb-8 flex gap-2 text-xs uppercase tracking-[0.2em] text-[var(--landing-muted)]">
        <span className={step === 1 ? "text-[var(--landing-cedar)]" : ""}>
          1 · {t.stepTemplate}
        </span>
        <span>·</span>
        <span className={step === 2 ? "text-[var(--landing-cedar)]" : ""}>
          2 · {t.stepDetails}
        </span>
      </div>

      {step === 1 ? (
        <div>
          <h1 className="font-[family-name:var(--font-fraunces)] text-4xl tracking-tight">
            {t.pickTemplate}
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--landing-muted)]">{t.pickSupport}</p>

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
                      ? "bg-[var(--landing-cedar)] text-white"
                      : "border border-[var(--landing-line)] text-[var(--landing-muted)] hover:border-white/30 hover:text-[var(--landing-ink)]"
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
                      ? "ring-2 ring-[var(--landing-cedar)]"
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
                        <span className="rounded bg-[var(--landing-cedar)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                          Premium · $7 / Pro
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
                                              : tpl.theme.fonts.display ===
                                                  "Anton"
                                                ? "anton"
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
            <p className="mt-8 text-[var(--landing-muted)]">No templates in this category.</p>
          ) : null}

          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!templateId}
            className="mt-8 rounded-md bg-[var(--landing-cedar)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {t.continue}
          </button>
        </div>
      ) : (
        <div>
          <h1 className="font-[family-name:var(--font-fraunces)] text-4xl tracking-tight">
            {t.detailsTitle}
          </h1>
          <p className="mt-2 text-[var(--landing-muted)]">{t.detailsSupport}</p>

          <div className="mt-6 rounded-xl border border-[var(--landing-line)] bg-white/60 p-4">
            <p className="text-sm font-medium text-[var(--landing-ink)]">
              Paste an invite draft
            </p>
            <p className="mt-1 text-xs text-[var(--landing-muted)]">
              Drop a text message, email, or notes — we’ll fill the fields for you.
            </p>
            <textarea
              rows={4}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={`You're invited to Maya's 30th!\nSaturday, September 12, 2026 at 7:00 PM\nThe Garden Room, 120 Oak Ave`}
              className="mt-3 w-full rounded-md border border-[var(--landing-line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--landing-cedar)]"
            />
            <button
              type="button"
              onClick={() => void parseWithAi()}
              disabled={aiBusy || !pasteText.trim()}
              className="mt-3 rounded-md bg-[var(--landing-ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {aiBusy ? "Parsing…" : "Fill from paste"}
            </button>
            {aiNote ? (
              <p className="mt-2 text-xs text-[var(--landing-cedar)]">{aiNote}</p>
            ) : null}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className="text-[var(--landing-muted)]">{t.title}</span>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-[var(--landing-line)] bg-white px-3 py-2.5 outline-none focus:border-[var(--landing-cedar)]"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--landing-muted)]">{t.host}</span>
              <input
                required
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-[var(--landing-line)] bg-white px-3 py-2.5 outline-none focus:border-[var(--landing-cedar)]"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--landing-muted)]">{t.slug}</span>
              <input
                value={slug}
                placeholder={suggestedSlug}
                onChange={(e) => setSlug(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-[var(--landing-line)] bg-white px-3 py-2.5 outline-none focus:border-[var(--landing-cedar)]"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--landing-muted)]">{t.date}</span>
              <input
                type="date"
                required
                value={dateISO}
                onChange={(e) => setDateISO(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-[var(--landing-line)] bg-white px-3 py-2.5 outline-none focus:border-[var(--landing-cedar)]"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--landing-muted)]">{t.time}</span>
              <input
                required
                value={timeLabel}
                onChange={(e) => setTimeLabel(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-[var(--landing-line)] bg-white px-3 py-2.5 outline-none focus:border-[var(--landing-cedar)]"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--landing-muted)]">{t.venue}</span>
              <input
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-[var(--landing-line)] bg-white px-3 py-2.5 outline-none focus:border-[var(--landing-cedar)]"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[var(--landing-muted)]">{t.address}</span>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-[var(--landing-line)] bg-white px-3 py-2.5 outline-none focus:border-[var(--landing-cedar)]"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-[var(--landing-muted)]">{t.about}</span>
              <textarea
                rows={3}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-[var(--landing-line)] bg-white px-3 py-2.5 outline-none focus:border-[var(--landing-cedar)]"
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
              className="rounded-md border border-[var(--landing-line)] px-5 py-2.5 text-sm"
            >
              {t.back}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-[var(--landing-cedar)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? t.creating : t.create}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
