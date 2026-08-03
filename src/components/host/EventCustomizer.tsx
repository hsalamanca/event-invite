"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import DomainConnect from "@/components/host/DomainConnect";
import ImageUpload from "@/components/host/ImageUpload";
import InvitePage from "@/components/invite/InvitePage";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { TEMPLATES, getTemplate } from "@/lib/templates";
import {
  suggestSpanishAbout,
  suggestSpanishFaq,
  suggestSpanishScheduleTitle,
} from "@/lib/i18n/event-content";
import type {
  CustomQuestion,
  EventRecord,
  FaqItem,
  ScheduleItem,
  Theme,
} from "@/lib/types";

const FONT_OPTIONS = [
  "Cormorant Garamond",
  "Fraunces",
  "Playfair Display",
  "Lora",
  "Great Vibes",
  "Source Sans 3",
  "DM Sans",
  "Outfit",
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
  aboutEs: string;
  heroImage: string;
  customDomain: string;
  visibility: EventRecord["visibility"];
  capacity: string;
  registryUrl: string;
  registryLabel: string;
  published: boolean;
  templateId: string;
  colors: Theme["colors"];
  fonts: Theme["fonts"];
  rsvpPrompt: string;
  rsvpDeadline: string;
  customQuestions: CustomQuestion[];
  schedule: ScheduleItem[];
  faqs: FaqItem[];
  galleryText: string;
  parking: string;
  dressCode: string;
  whatToBring: string;
  contactEmail: string;
  contactPhone: string;
  hotelInfo: string;
  travelInfo: string;
  spotifyUrl: string;
  thankYouMessage: string;
  invitePassword: string;
  coHostEmailsText: string;
  checkInEnabled: boolean;
  showOwnviteFooter: boolean;
};

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

function toDraft(event: EventRecord, locale: Locale = "en"): Draft {
  const schedule = (event.schedule ?? []).map((item) => ({
    ...item,
    title:
      locale === "es"
        ? item.titleEs ||
          suggestSpanishScheduleTitle(item.title) ||
          item.title
        : item.title,
    description:
      locale === "es"
        ? item.descriptionEs || item.description || ""
        : item.description || "",
  }));
  const faqs = (event.faqs ?? []).map((item) => {
    const suggested = suggestSpanishFaq(item.question, item.answer);
    return {
      ...item,
      question:
        locale === "es"
          ? item.questionEs || suggested.question || item.question
          : item.question,
      answer:
        locale === "es"
          ? item.answerEs || suggested.answer || item.answer
          : item.answer,
    };
  });
  return {
    hostName: event.hostName,
    title: event.title,
    headline: event.headline,
    tagline: event.tagline,
    dateISO: event.dateISO,
    timeLabel: event.timeLabel,
    venue: event.venue,
    address: event.address,
    about:
      locale === "es"
        ? event.aboutEs ||
          suggestSpanishAbout(event.about) ||
          event.about
        : event.about,
    aboutEs: event.aboutEs || "",
    heroImage: event.heroImage,
    customDomain: event.customDomain ?? "",
    visibility: event.visibility ?? "public",
    capacity: event.capacity != null ? String(event.capacity) : "",
    registryUrl: event.registryUrl ?? "",
    registryLabel: event.registryLabel ?? "",
    published: event.published ?? true,
    templateId: event.templateId || "evening",
    colors: { ...event.theme.colors },
    fonts: { ...event.theme.fonts },
    rsvpPrompt: event.rsvpFields.prompt ?? "",
    rsvpDeadline: event.rsvpFields.deadline ?? "",
    customQuestions: [...(event.rsvpFields.customQuestions ?? [])],
    schedule,
    faqs,
    galleryText: (event.gallery ?? []).join("\n"),
    parking: event.parking ?? "",
    dressCode: event.dressCode ?? "",
    whatToBring: event.whatToBring ?? "",
    contactEmail: event.contactEmail ?? "",
    contactPhone: event.contactPhone ?? "",
    hotelInfo: event.hotelInfo ?? "",
    travelInfo: event.travelInfo ?? "",
    spotifyUrl: event.spotifyUrl ?? "",
    thankYouMessage: event.thankYouMessage ?? "",
    invitePassword: "",
    coHostEmailsText: (event.coHostEmails ?? []).join(", "),
    checkInEnabled: event.checkInEnabled ?? false,
    showOwnviteFooter: event.showOwnviteFooter ?? true,
  };
}

function mergeLocalizedContent(
  base: EventRecord,
  draft: Draft,
  locale: Locale,
): Pick<EventRecord, "about" | "aboutEs" | "schedule" | "faqs"> {
  if (locale === "es") {
    return {
      about: base.about,
      aboutEs: draft.about,
      schedule: draft.schedule.map((d) => {
        const prev = (base.schedule ?? []).find((s) => s.id === d.id);
        return {
          id: d.id,
          time: d.time,
          title: prev?.title || d.title,
          titleEs: d.title,
          description: prev?.description || "",
          descriptionEs: d.description || "",
        };
      }),
      faqs: draft.faqs.map((d) => {
        const prev = (base.faqs ?? []).find((f) => f.id === d.id);
        return {
          id: d.id,
          question: prev?.question || d.question,
          answer: prev?.answer || d.answer,
          questionEs: d.question,
          answerEs: d.answer,
        };
      }),
    };
  }

  return {
    about: draft.about,
    aboutEs:
      draft.aboutEs ||
      suggestSpanishAbout(draft.about) ||
      base.aboutEs ||
      null,
    schedule: draft.schedule.map((d) => {
      const prev = (base.schedule ?? []).find((s) => s.id === d.id);
      return {
        id: d.id,
        time: d.time,
        title: d.title,
        titleEs:
          prev?.titleEs || suggestSpanishScheduleTitle(d.title) || undefined,
        description: d.description || "",
        descriptionEs: prev?.descriptionEs || "",
      };
    }),
    faqs: draft.faqs.map((d) => {
      const prev = (base.faqs ?? []).find((f) => f.id === d.id);
      const suggested = suggestSpanishFaq(d.question, d.answer);
      return {
        id: d.id,
        question: d.question,
        answer: d.answer,
        questionEs: prev?.questionEs || suggested.question,
        answerEs: prev?.answerEs || suggested.answer,
      };
    }),
  };
}

function toPreviewEvent(
  base: EventRecord,
  draft: Draft,
  locale: Locale = "en",
): EventRecord {
  const capacityNum = draft.capacity.trim()
    ? Number(draft.capacity)
    : null;
  const localized = mergeLocalizedContent(base, draft, locale);
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
    about: localized.about,
    aboutEs: localized.aboutEs,
    heroImage: draft.heroImage,
    customDomain: draft.customDomain.trim() || null,
    visibility: draft.visibility,
    capacity:
      capacityNum != null && Number.isFinite(capacityNum) && capacityNum > 0
        ? capacityNum
        : null,
    registryUrl: draft.registryUrl.trim() || null,
    registryLabel: draft.registryLabel.trim() || null,
    published: draft.published,
    templateId: draft.templateId || base.templateId || "evening",
    theme: {
      colors: { ...draft.colors },
      fonts: { ...draft.fonts },
    },
    rsvpFields: {
      ...base.rsvpFields,
      prompt: draft.rsvpPrompt,
      deadline: draft.rsvpDeadline,
      customQuestions: draft.customQuestions,
    },
    schedule: localized.schedule,
    faqs: localized.faqs,
    gallery: draft.galleryText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    parking: draft.parking,
    dressCode: draft.dressCode,
    whatToBring: draft.whatToBring,
    contactEmail: draft.contactEmail,
    contactPhone: draft.contactPhone,
    hotelInfo: draft.hotelInfo,
    travelInfo: draft.travelInfo,
    spotifyUrl: draft.spotifyUrl,
    thankYouMessage: draft.thankYouMessage,
    invitePasswordHash: null,
    coHostEmails: draft.coHostEmailsText
      .split(/[,\n]/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
    checkInEnabled: draft.checkInEnabled,
    showOwnviteFooter: draft.showOwnviteFooter,
  };
}

export default function EventCustomizer({
  event,
  locale = "en",
}: EventCustomizerProps) {
  const t = getDictionary(locale).host;
  const uploadLabels = getDictionary(locale).upload;
  const [draft, setDraft] = useState<Draft>(() => toDraft(event, locale));
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setDraft(toDraft(event, locale));
  }, [event, locale]);

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

    const preview = toPreviewEvent(event, draft, locale);
    const localized = mergeLocalizedContent(event, draft, locale);
    const body: Record<string, unknown> = {
      hostName: draft.hostName,
      title: draft.title,
      headline: draft.headline,
      tagline: draft.tagline,
      dateISO: draft.dateISO,
      timeLabel: draft.timeLabel,
      venue: draft.venue,
      address: draft.address,
      about: localized.about,
      aboutEs: localized.aboutEs,
      heroImage: draft.heroImage,
      customDomain: draft.customDomain.trim() || null,
      visibility: draft.visibility,
      capacity: preview.capacity,
      registryUrl: preview.registryUrl,
      registryLabel: preview.registryLabel,
      published: draft.published,
      templateId: draft.templateId,
      theme: {
        colors: draft.colors,
        fonts: draft.fonts,
      },
      rsvpFields: {
        ...event.rsvpFields,
        prompt: draft.rsvpPrompt,
        deadline: draft.rsvpDeadline,
        customQuestions: draft.customQuestions,
      },
      schedule: localized.schedule,
      faqs: localized.faqs,
      gallery: preview.gallery,
      parking: draft.parking,
      dressCode: draft.dressCode,
      whatToBring: draft.whatToBring,
      contactEmail: draft.contactEmail,
      contactPhone: draft.contactPhone,
      hotelInfo: draft.hotelInfo,
      travelInfo: draft.travelInfo,
      spotifyUrl: draft.spotifyUrl,
      thankYouMessage: draft.thankYouMessage,
      coHostEmails: preview.coHostEmails,
      checkInEnabled: draft.checkInEnabled,
      showOwnviteFooter:
        event.tier === "pro" || event.tier === "studio"
          ? false
          : true,
    };

    if (draft.invitePassword.trim()) {
      body.invitePassword = draft.invitePassword.trim();
    }
    if (draft.visibility !== "private") {
      body.clearInvitePassword = true;
    }

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
      updateField("invitePassword", "");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const previewEvent = toPreviewEvent(event, draft, locale);

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
        <div className="host-header-actions">
          <button
            type="button"
            className="host-preview-toggle"
            onClick={() => setShowPreview((v) => !v)}
          >
            {showPreview ? "Edit" : t.livePreview}
          </button>
          <button
            type="submit"
            form="host-customize-form"
            className="host-save"
            disabled={saving}
          >
            {saving ? t.saving : t.save}
          </button>
        </div>
      </header>

      <div className={`host-layout ${showPreview ? "show-preview" : ""}`}>
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
                rows={5}
                value={draft.about}
                onChange={(e) => updateField("about", e.target.value)}
                placeholder={t.aboutHtmlHint}
              />
              <span className="field-hint">{t.aboutHtmlHint}</span>
            </label>
            <ImageUpload
              slug={event.slug}
              value={draft.heroImage}
              onChange={(url) => updateField("heroImage", url)}
              labels={uploadLabels}
            />
          </fieldset>

          <fieldset>
            <legend>{t.applyTemplate}</legend>
            <p className="field-hint">{t.applyTemplateHint}</p>
            <label>
              <span>{t.applyTemplate}</span>
              <select
                defaultValue=""
                onChange={(e) => {
                  const id = e.target.value;
                  if (!id) return;
                  const tpl = getTemplate(id);
                  const stockHeroes = new Set(
                    TEMPLATES.map((t) => t.heroImage),
                  );
                  setDraft((prev) => {
                    const keepCustomHero =
                      Boolean(prev.heroImage) &&
                      !stockHeroes.has(prev.heroImage);
                    return {
                      ...prev,
                      templateId: tpl.id,
                      // Store English stock copy; invite preview localizes via locale
                      headline: tpl.headline,
                      tagline: tpl.tagline,
                      // Keep uploaded/custom photos when switching templates
                      heroImage: keepCustomHero
                        ? prev.heroImage
                        : tpl.heroImage,
                      colors: { ...tpl.theme.colors },
                      fonts: { ...tpl.theme.fonts },
                    };
                  });
                  setSaveMessage(null);
                  e.target.value = "";
                }}
              >
                <option value="">—</option>
                {TEMPLATES.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {locale === "es" ? tpl.nameEs : tpl.name}
                    {tpl.premium ? " · Premium" : ""}
                  </option>
                ))}
              </select>
            </label>
          </fieldset>

          <fieldset>
            <legend>{t.settings}</legend>
            <label>
              <span>{t.visibility}</span>
              <select
                value={draft.visibility}
                onChange={(e) =>
                  updateField(
                    "visibility",
                    e.target.value as EventRecord["visibility"],
                  )
                }
              >
                <option value="public">{t.visibilityPublic}</option>
                <option value="unlisted">{t.visibilityUnlisted}</option>
                <option value="private">Private (password)</option>
              </select>
            </label>
            {draft.visibility === "private" ? (
              <label>
                <span>
                  Invite password
                  {event.invitePasswordHash ? " (leave blank to keep)" : ""}
                </span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={draft.invitePassword}
                  onChange={(e) =>
                    updateField("invitePassword", e.target.value)
                  }
                  placeholder="Set a password guests must enter"
                />
              </label>
            ) : null}
            <label>
              <span>{t.capacity}</span>
              <input
                type="number"
                min={1}
                placeholder={t.capacityHint}
                value={draft.capacity}
                onChange={(e) => updateField("capacity", e.target.value)}
              />
            </label>
            <label>
              <span>{t.registryUrl}</span>
              <input
                type="url"
                placeholder="https://…"
                value={draft.registryUrl}
                onChange={(e) => updateField("registryUrl", e.target.value)}
              />
            </label>
            <label>
              <span>Registry label</span>
              <input
                value={draft.registryLabel}
                onChange={(e) => updateField("registryLabel", e.target.value)}
                placeholder="Gift registry"
              />
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={draft.published}
                onChange={(e) => updateField("published", e.target.checked)}
              />
              <span>{t.published}</span>
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={draft.checkInEnabled}
                onChange={(e) =>
                  updateField("checkInEnabled", e.target.checked)
                }
              />
              <span>Enable door check-in</span>
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={
                  event.tier === "pro" || event.tier === "studio"
                    ? false
                    : draft.showOwnviteFooter
                }
                disabled={event.tier === "pro" || event.tier === "studio"}
                onChange={(e) =>
                  updateField("showOwnviteFooter", e.target.checked)
                }
              />
              <span>
                {event.tier === "pro" || event.tier === "studio"
                  ? "Ownvite footer removed (Pro)"
                  : "Show Ownvite footer (upgrade to Pro to remove)"}
              </span>
            </label>
            <label>
              <span>Co-host emails</span>
              <input
                value={draft.coHostEmailsText}
                onChange={(e) =>
                  updateField("coHostEmailsText", e.target.value)
                }
                placeholder="friend@email.com, planner@email.com"
              />
              <span className="field-hint">
                Co-hosts can open this studio and manage guests.
              </span>
            </label>
          </fieldset>

          <fieldset>
            <legend>RSVP questions</legend>
            <label>
              <span>RSVP prompt</span>
              <textarea
                rows={2}
                value={draft.rsvpPrompt}
                onChange={(e) => updateField("rsvpPrompt", e.target.value)}
              />
            </label>
            <label>
              <span>RSVP deadline</span>
              <input
                type="date"
                value={draft.rsvpDeadline}
                onChange={(e) => updateField("rsvpDeadline", e.target.value)}
              />
            </label>
            <p className="field-hint">
              Meal choice and custom questions appear on the invite form and in
              the meal dashboard below.
            </p>
            {draft.customQuestions.map((q, idx) => (
              <div key={q.id} className="nested-block">
                <label>
                  <span>Question label</span>
                  <input
                    value={q.label}
                    onChange={(e) => {
                      const next = [...draft.customQuestions];
                      next[idx] = { ...q, label: e.target.value };
                      updateField("customQuestions", next);
                    }}
                  />
                </label>
                <label>
                  <span>Type</span>
                  <select
                    value={q.type}
                    onChange={(e) => {
                      const next = [...draft.customQuestions];
                      next[idx] = {
                        ...q,
                        type: e.target.value as CustomQuestion["type"],
                      };
                      updateField("customQuestions", next);
                    }}
                  >
                    <option value="meal">Meal</option>
                    <option value="multiple">Multiple choice</option>
                    <option value="checkbox">Checkboxes</option>
                    <option value="short">Short text</option>
                  </select>
                </label>
                {q.type !== "short" ? (
                  <label>
                    <span>Options (one per line)</span>
                    <textarea
                      rows={3}
                      value={(q.options ?? []).join("\n")}
                      onChange={(e) => {
                        const next = [...draft.customQuestions];
                        next[idx] = {
                          ...q,
                          options: e.target.value
                            .split("\n")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        };
                        updateField("customQuestions", next);
                      }}
                    />
                  </label>
                ) : null}
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={Boolean(q.required)}
                    onChange={(e) => {
                      const next = [...draft.customQuestions];
                      next[idx] = { ...q, required: e.target.checked };
                      updateField("customQuestions", next);
                    }}
                  />
                  <span>Required</span>
                </label>
                <button
                  type="button"
                  className="host-ghost-btn"
                  onClick={() =>
                    updateField(
                      "customQuestions",
                      draft.customQuestions.filter((x) => x.id !== q.id),
                    )
                  }
                >
                  Remove question
                </button>
              </div>
            ))}
            <button
              type="button"
              className="host-ghost-btn"
              onClick={() =>
                updateField("customQuestions", [
                  ...draft.customQuestions,
                  {
                    id: newId("q"),
                    type: "short",
                    label: "New question",
                    options: [],
                    required: false,
                  },
                ])
              }
            >
              + Add question
            </button>
          </fieldset>

          <fieldset>
            <legend>Celebration extras</legend>
            <p className="field-hint">
              Schedule, FAQ, parking, gallery, Spotify, and guest logistics.
            </p>
            <div className="nested-block">
              <span className="nested-label">Day-of schedule</span>
              {draft.schedule.map((item, idx) => (
                <div key={item.id} className="nested-row">
                  <input
                    placeholder="Time"
                    value={item.time}
                    onChange={(e) => {
                      const next = [...draft.schedule];
                      next[idx] = { ...item, time: e.target.value };
                      updateField("schedule", next);
                    }}
                  />
                  <input
                    placeholder="Title"
                    value={item.title}
                    onChange={(e) => {
                      const next = [...draft.schedule];
                      next[idx] = { ...item, title: e.target.value };
                      updateField("schedule", next);
                    }}
                  />
                  <button
                    type="button"
                    className="host-ghost-btn"
                    onClick={() =>
                      updateField(
                        "schedule",
                        draft.schedule.filter((x) => x.id !== item.id),
                      )
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="host-ghost-btn"
                onClick={() =>
                  updateField("schedule", [
                    ...draft.schedule,
                    {
                      id: newId("sch"),
                      time: "",
                      title: "",
                      description: "",
                    },
                  ])
                }
              >
                + Add schedule row
              </button>
            </div>

            <div className="nested-block">
              <span className="nested-label">FAQ</span>
              {draft.faqs.map((item, idx) => (
                <div key={item.id} className="stack-gap">
                  <input
                    placeholder="Question"
                    value={item.question}
                    onChange={(e) => {
                      const next = [...draft.faqs];
                      next[idx] = { ...item, question: e.target.value };
                      updateField("faqs", next);
                    }}
                  />
                  <textarea
                    rows={2}
                    placeholder="Answer"
                    value={item.answer}
                    onChange={(e) => {
                      const next = [...draft.faqs];
                      next[idx] = { ...item, answer: e.target.value };
                      updateField("faqs", next);
                    }}
                  />
                  <button
                    type="button"
                    className="host-ghost-btn"
                    onClick={() =>
                      updateField(
                        "faqs",
                        draft.faqs.filter((x) => x.id !== item.id),
                      )
                    }
                  >
                    Remove FAQ
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="host-ghost-btn"
                onClick={() =>
                  updateField("faqs", [
                    ...draft.faqs,
                    { id: newId("faq"), question: "", answer: "" },
                  ])
                }
              >
                + Add FAQ
              </button>
            </div>

            <label>
              <span>Gallery image URLs (one per line)</span>
              <textarea
                rows={3}
                value={draft.galleryText}
                onChange={(e) => updateField("galleryText", e.target.value)}
              />
            </label>
            <label>
              <span>Parking</span>
              <textarea
                rows={2}
                value={draft.parking}
                onChange={(e) => updateField("parking", e.target.value)}
              />
            </label>
            <label>
              <span>Dress code</span>
              <input
                value={draft.dressCode}
                onChange={(e) => updateField("dressCode", e.target.value)}
              />
            </label>
            <label>
              <span>What to bring</span>
              <textarea
                rows={2}
                value={draft.whatToBring}
                onChange={(e) => updateField("whatToBring", e.target.value)}
              />
            </label>
            <label>
              <span>Hotel / stay</span>
              <textarea
                rows={2}
                value={draft.hotelInfo}
                onChange={(e) => updateField("hotelInfo", e.target.value)}
              />
            </label>
            <label>
              <span>Travel</span>
              <textarea
                rows={2}
                value={draft.travelInfo}
                onChange={(e) => updateField("travelInfo", e.target.value)}
              />
            </label>
            <label>
              <span>Contact email</span>
              <input
                type="email"
                value={draft.contactEmail}
                onChange={(e) => updateField("contactEmail", e.target.value)}
              />
            </label>
            <label>
              <span>Contact phone</span>
              <input
                value={draft.contactPhone}
                onChange={(e) => updateField("contactPhone", e.target.value)}
              />
            </label>
            <label>
              <span>Spotify playlist URL</span>
              <input
                type="url"
                value={draft.spotifyUrl}
                onChange={(e) => updateField("spotifyUrl", e.target.value)}
              />
            </label>
            <label>
              <span>Thank-you message (after RSVP)</span>
              <textarea
                rows={2}
                value={draft.thankYouMessage}
                onChange={(e) =>
                  updateField("thankYouMessage", e.target.value)
                }
              />
            </label>
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
              <InvitePage
                event={previewEvent}
                locale={locale}
                trackViews={false}
              />
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

        .host-header-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
        }

        .host-preview-toggle {
          display: none;
          min-height: 44px;
          padding: 0.65rem 1rem;
          background: transparent;
          border: 1px solid color-mix(in srgb, var(--host-muted) 40%, transparent);
          border-radius: 2px;
          color: var(--host-text);
          font-family: inherit;
          font-size: 0.875rem;
          cursor: pointer;
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

        .host-mobile-save {
          display: none;
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

        .checkbox-row {
          display: flex !important;
          flex-direction: row !important;
          align-items: center;
          gap: 0.65rem;
        }

        .checkbox-row input[type="checkbox"] {
          width: auto;
          min-height: auto;
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

        .field-hint {
          margin: 0 0 0.75rem;
          font-size: 0.8rem;
          color: var(--host-muted);
          line-height: 1.4;
        }

        .nested-block {
          display: grid;
          gap: 0.65rem;
          padding: 0.75rem;
          border: 1px solid color-mix(in srgb, var(--host-muted) 28%, transparent);
          border-radius: 2px;
        }

        .nested-label {
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--host-muted);
        }

        .nested-row {
          display: grid;
          grid-template-columns: 0.8fr 1.2fr auto;
          gap: 0.4rem;
        }

        .stack-gap {
          display: grid;
          gap: 0.45rem;
        }

        .host-ghost-btn {
          min-height: 36px;
          padding: 0.4rem 0.75rem;
          background: transparent;
          border: 1px solid color-mix(in srgb, var(--host-muted) 40%, transparent);
          border-radius: 2px;
          color: var(--host-text);
          font-family: inherit;
          font-size: 0.8125rem;
          cursor: pointer;
          justify-self: start;
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
          .host-header {
            position: sticky;
            top: 0;
            z-index: 15;
            background: color-mix(in srgb, var(--host-bg) 94%, transparent);
            backdrop-filter: blur(10px);
            padding: 1rem;
          }

          .host-preview-toggle {
            display: inline-flex;
            align-items: center;
          }

          .host-layout {
            grid-template-columns: 1fr;
          }

          .host-form {
            max-height: none;
            border-right: none;
            border-bottom: none;
            padding-bottom: 5.5rem;
          }

          .host-preview {
            display: none;
            padding: 0.75rem 1rem 5.5rem;
          }

          .host-layout.show-preview .host-form {
            display: none;
          }

          .host-layout.show-preview .host-preview {
            display: flex;
          }

          .host-preview-frame {
            max-height: calc(100dvh - 8rem);
          }

          .nested-row {
            grid-template-columns: 1fr;
          }

          .host-mobile-save {
            display: flex;
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 20;
            gap: 0.5rem;
            padding: 0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom));
            background: color-mix(in srgb, var(--host-bg) 92%, transparent);
            border-top: 1px solid color-mix(in srgb, var(--host-accent) 25%, transparent);
            backdrop-filter: blur(12px);
          }

          .host-mobile-save .host-save,
          .host-mobile-save .host-preview-toggle {
            flex: 1;
            display: inline-flex;
            justify-content: center;
            align-items: center;
          }
        }
      `}</style>

      <div className="host-mobile-save">
        <button
          type="button"
          className="host-preview-toggle"
          onClick={() => setShowPreview((v) => !v)}
        >
          {showPreview ? "Edit" : t.livePreview}
        </button>
        <button
          type="submit"
          form="host-customize-form"
          className="host-save"
          disabled={saving}
        >
          {saving ? t.saving : t.save}
        </button>
      </div>
    </div>
  );
}
