"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import DomainConnect from "@/components/host/DomainConnect";
import ImageUpload from "@/components/host/ImageUpload";
import InvitePage from "@/components/invite/InvitePage";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { EventRecord, Theme } from "@/lib/types";

const FONT_OPTIONS = [
  "Cormorant Garamond",
  "Fraunces",
  "Source Sans 3",
  "DM Sans",
] as const;

type EventCustomizerProps = {
  event: EventRecord;
  locale?: Locale;
};

type Draft = {
  hostName: string;
  title: string;
  headline: string;
  tagline: string;
  dateISO: string;
  timeLabel: string;
  venue: string;
  address: string;
  about: string;
  heroImage: string;
  customDomain: string;
  colors: Theme["colors"];
  fonts: Theme["fonts"];
};

function toDraft(event: EventRecord): Draft {
  return {
    hostName: event.hostName,
    title: event.title,
    headline: event.headline,
    tagline: event.tagline,
    dateISO: event.dateISO,
    timeLabel: event.timeLabel,
    venue: event.venue,
    address: event.address,
    about: event.about,
    heroImage: event.heroImage,
    customDomain: event.customDomain ?? "",
    colors: { ...event.theme.colors },
    fonts: { ...event.theme.fonts },
  };
}

function toPreviewEvent(base: EventRecord, draft: Draft): EventRecord {
  return {
    ...base,
    hostName: draft.hostName,
    title: draft.title,
    headline: draft.headline,
    tagline: draft.tagline,
    dateISO: draft.dateISO,
    timeLabel: draft.timeLabel,
    venue: draft.venue,
    address: draft.address,
    about: draft.about,
    heroImage: draft.heroImage,
    customDomain: draft.customDomain.trim() || null,
    theme: {
      colors: { ...draft.colors },
      fonts: { ...draft.fonts },
    },
  };
}

export default function EventCustomizer({
  event,
  locale = "en",
}: EventCustomizerProps) {
  const t = getDictionary(locale).host;
  const uploadLabels = getDictionary(locale).upload;
  const [draft, setDraft] = useState<Draft>(() => toDraft(event));
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(toDraft(event));
  }, [event]);

  function updateField<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setSaveMessage(null);
  }

  function updateColor(key: keyof Theme["colors"], value: string) {
    setDraft((prev) => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
    }));
    setSaveMessage(null);
  }

  function updateFont(key: keyof Theme["fonts"], value: string) {
    setDraft((prev) => ({
      ...prev,
      fonts: { ...prev.fonts, [key]: value },
    }));
    setSaveMessage(null);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveMessage(null);

    const body = {
      hostName: draft.hostName,
      title: draft.title,
      headline: draft.headline,
      tagline: draft.tagline,
      dateISO: draft.dateISO,
      timeLabel: draft.timeLabel,
      venue: draft.venue,
      address: draft.address,
      about: draft.about,
      heroImage: draft.heroImage,
      customDomain: draft.customDomain.trim() || null,
      theme: {
        colors: draft.colors,
        fonts: draft.fonts,
      },
    };

    try {
      const res = await fetch(`/api/events/${encodeURIComponent(event.slug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Failed to save event");
      }
      setSaveMessage(t.saved);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const previewEvent = toPreviewEvent(event, draft);

  const shellVars = {
    "--host-bg": "#0F1A2E",
    "--host-surface": "#1A2744",
    "--host-accent": "#C9A962",
    "--host-text": "#F4F0E8",
    "--host-muted": "#9BA8BC",
    "--font-body": '"Source Sans 3", system-ui, sans-serif',
  } as CSSProperties;

  return (
    <div className="host-shell" style={shellVars}>
      <header className="host-header">
        <div>
          <p className="host-eyebrow">Ownvite</p>
          <h1 className="host-title">{t.customize}</h1>
        </div>
        <button
          type="submit"
          form="host-customize-form"
          className="host-save"
          disabled={saving}
        >
          {saving ? t.saving : t.save}
        </button>
      </header>

      <div className="host-layout">
        <form
          id="host-customize-form"
          className="host-form"
          onSubmit={handleSave}
        >
          <fieldset>
            <legend>{t.content}</legend>
            <label>
              <span>{t.hostName}</span>
              <input
                value={draft.hostName}
                onChange={(e) => updateField("hostName", e.target.value)}
              />
            </label>
            <label>
              <span>{t.title}</span>
              <input
                value={draft.title}
                onChange={(e) => updateField("title", e.target.value)}
              />
            </label>
            <label>
              <span>{t.headline}</span>
              <input
                value={draft.headline}
                onChange={(e) => updateField("headline", e.target.value)}
              />
            </label>
            <label>
              <span>{t.tagline}</span>
              <textarea
                rows={2}
                value={draft.tagline}
                onChange={(e) => updateField("tagline", e.target.value)}
              />
            </label>
            <label>
              <span>{t.date}</span>
              <input
                type="date"
                value={draft.dateISO}
                onChange={(e) => updateField("dateISO", e.target.value)}
              />
            </label>
            <label>
              <span>{t.time}</span>
              <input
                value={draft.timeLabel}
                onChange={(e) => updateField("timeLabel", e.target.value)}
              />
            </label>
            <label>
              <span>{t.venue}</span>
              <input
                value={draft.venue}
                onChange={(e) => updateField("venue", e.target.value)}
              />
            </label>
            <label>
              <span>{t.address}</span>
              <input
                value={draft.address}
                onChange={(e) => updateField("address", e.target.value)}
              />
            </label>
            <label>
              <span>{t.about}</span>
              <textarea
                rows={4}
                value={draft.about}
                onChange={(e) => updateField("about", e.target.value)}
              />
            </label>
            <ImageUpload
              slug={event.slug}
              value={draft.heroImage}
              onChange={(url) => updateField("heroImage", url)}
              labels={uploadLabels}
            />
          </fieldset>

          <DomainConnect
            slug={event.slug}
            locale={locale}
            initialDomain={draft.customDomain || event.customDomain}
            onDomainChange={(domain) =>
              updateField("customDomain", domain ?? "")
            }
          />

          <fieldset>
            <legend>{t.colors}</legend>
            <label className="color-row">
              <span>{t.background}</span>
              <input
                type="color"
                value={draft.colors.background}
                onChange={(e) => updateColor("background", e.target.value)}
              />
              <input
                value={draft.colors.background}
                onChange={(e) => updateColor("background", e.target.value)}
              />
            </label>
            <label className="color-row">
              <span>{t.accentPrimary}</span>
              <input
                type="color"
                value={draft.colors.accentPrimary}
                onChange={(e) => updateColor("accentPrimary", e.target.value)}
              />
              <input
                value={draft.colors.accentPrimary}
                onChange={(e) => updateColor("accentPrimary", e.target.value)}
              />
            </label>
            <label className="color-row">
              <span>{t.accentSecondary}</span>
              <input
                type="color"
                value={draft.colors.accentSecondary}
                onChange={(e) => updateColor("accentSecondary", e.target.value)}
              />
              <input
                value={draft.colors.accentSecondary}
                onChange={(e) => updateColor("accentSecondary", e.target.value)}
              />
            </label>
            <label className="color-row">
              <span>{t.textPrimary}</span>
              <input
                type="color"
                value={draft.colors.textPrimary}
                onChange={(e) => updateColor("textPrimary", e.target.value)}
              />
              <input
                value={draft.colors.textPrimary}
                onChange={(e) => updateColor("textPrimary", e.target.value)}
              />
            </label>
          </fieldset>

          <fieldset>
            <legend>{t.fonts}</legend>
            <label>
              <span>{t.display}</span>
              <select
                value={draft.fonts.display}
                onChange={(e) => updateFont("display", e.target.value)}
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{t.body}</span>
              <select
                value={draft.fonts.body}
                onChange={(e) => updateFont("body", e.target.value)}
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
          </fieldset>

          {saveMessage && <p className="host-status ok">{saveMessage}</p>}
          {saveError && <p className="host-status err">{saveError}</p>}
        </form>

        <div className="host-preview">
          <p className="host-preview-label">{t.livePreview}</p>
          <div className="host-preview-frame">
            <div className="host-preview-scale">
              <InvitePage event={previewEvent} locale={locale} />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .host-shell {
          min-height: 100vh;
          background: var(--host-bg);
          color: var(--host-text);
          font-family: var(--font-body);
        }

        .host-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.5rem 1.5rem 1rem;
          border-bottom: 1px solid color-mix(in srgb, var(--host-accent) 25%, transparent);
        }

        .host-eyebrow {
          margin: 0 0 0.25rem;
          font-size: 0.6875rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--host-accent);
        }

        .host-title {
          margin: 0;
          font-size: 1.35rem;
          font-weight: 500;
        }

        .host-save {
          min-height: 44px;
          padding: 0.65rem 1.35rem;
          background: var(--host-accent);
          color: var(--host-bg);
          border: none;
          border-radius: 2px;
          font-family: inherit;
          font-size: 0.9375rem;
          font-weight: 500;
          cursor: pointer;
        }

        .host-save:hover:not(:disabled) {
          filter: brightness(1.05);
        }

        .host-save:disabled {
          opacity: 0.7;
          cursor: wait;
        }

        .host-layout {
          display: grid;
          grid-template-columns: minmax(280px, 380px) 1fr;
          gap: 0;
          min-height: calc(100vh - 5rem);
        }

        .host-form {
          padding: 1.25rem 1.5rem 2.5rem;
          border-right: 1px solid color-mix(in srgb, var(--host-muted) 25%, transparent);
          overflow-y: auto;
          max-height: calc(100vh - 5rem);
        }

        fieldset {
          border: none;
          margin: 0 0 1.75rem;
          padding: 0;
          display: grid;
          gap: 0.9rem;
        }

        legend {
          margin-bottom: 0.5rem;
          font-size: 0.75rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--host-accent);
        }

        label {
          display: grid;
          gap: 0.35rem;
        }

        label span {
          font-size: 0.8125rem;
          color: var(--host-muted);
        }

        input,
        textarea,
        select {
          min-height: 44px;
          padding: 0.6rem 0.75rem;
          background: var(--host-surface);
          border: 1px solid color-mix(in srgb, var(--host-muted) 30%, transparent);
          border-radius: 2px;
          color: var(--host-text);
          font-family: inherit;
          font-size: 0.9375rem;
        }

        textarea {
          min-height: auto;
          resize: vertical;
        }

        input:focus,
        textarea:focus,
        select:focus {
          outline: none;
          border-color: var(--host-accent);
        }

        .color-row {
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 0.5rem;
        }

        .color-row span {
          grid-column: 1 / -1;
        }

        .color-row input[type="color"] {
          width: 44px;
          min-height: 44px;
          padding: 0.2rem;
          cursor: pointer;
        }

        .host-status {
          margin: 0;
          font-size: 0.875rem;
        }

        .host-status.ok {
          color: var(--host-accent);
        }

        .host-status.err {
          color: #e07a5f;
        }

        .host-preview {
          padding: 1rem 1.25rem 1.5rem;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .host-preview-label {
          margin: 0 0 0.75rem;
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--host-muted);
        }

        .host-preview-frame {
          flex: 1;
          border: 1px solid color-mix(in srgb, var(--host-muted) 28%, transparent);
          border-radius: 4px;
          overflow: auto;
          background: #0a1220;
          max-height: calc(100vh - 7rem);
        }

        .host-preview-scale {
          transform-origin: top left;
          width: 100%;
          min-height: 100%;
        }

        @media (max-width: 960px) {
          .host-layout {
            grid-template-columns: 1fr;
          }

          .host-form {
            max-height: none;
            border-right: none;
            border-bottom: 1px solid color-mix(in srgb, var(--host-muted) 25%, transparent);
          }

          .host-preview-frame {
            max-height: 70vh;
          }
        }
      `}</style>
    </div>
  );
}
