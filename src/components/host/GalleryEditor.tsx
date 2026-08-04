"use client";

import { useRef, useState } from "react";
import {
  GALLERY_LAYOUTS,
  GALLERY_MAX,
  type GalleryLayout,
  galleryLayoutLabel,
} from "@/lib/gallery";

type GalleryEditorProps = {
  slug: string;
  images: string[];
  layout: GalleryLayout;
  onImagesChange: (images: string[]) => void;
  onLayoutChange: (layout: GalleryLayout) => void;
};

export default function GalleryEditor({
  slug,
  images,
  layout,
  onImagesChange,
  onLayoutChange,
}: GalleryEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlDraft, setUrlDraft] = useState("");
  const [showUrl, setShowUrl] = useState(false);

  const remaining = GALLERY_MAX - images.length;
  const atCap = remaining <= 0;

  async function uploadFiles(files: FileList | File[]) {
    const list = [...files].slice(0, remaining);
    if (!list.length) {
      setError(`Gallery is limited to ${GALLERY_MAX} photos.`);
      return;
    }
    setUploading(true);
    setError(null);
    const next = [...images];
    try {
      for (const file of list) {
        const body = new FormData();
        body.append("file", file);
        body.append("slug", slug);
        const res = await fetch("/api/upload", { method: "POST", body });
        const data = (await res.json()) as { error?: string; url?: string };
        if (!res.ok || !data.url) {
          throw new Error(data.error ?? "Upload failed");
        }
        next.push(data.url);
      }
      onImagesChange(next.slice(0, GALLERY_MAX));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function addUrl() {
    const url = urlDraft.trim();
    if (!url) return;
    if (atCap) {
      setError(`Gallery is limited to ${GALLERY_MAX} photos.`);
      return;
    }
    try {
      // Validate absolute URL
      // eslint-disable-next-line no-new
      new URL(url);
    } catch {
      setError("Enter a full image URL (https://…)");
      return;
    }
    onImagesChange([...images, url].slice(0, GALLERY_MAX));
    setUrlDraft("");
    setError(null);
  }

  function removeAt(index: number) {
    onImagesChange(images.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    const tmp = next[index]!;
    next[index] = next[j]!;
    next[j] = tmp;
    onImagesChange(next);
  }

  return (
    <div className="gallery-editor">
      <div className="head">
        <span className="title">Photo gallery</span>
        <p className="hint">
          Upload up to {GALLERY_MAX} photos, then pick a shape for how they
          appear on the invite.
        </p>
        <p className="count">
          {images.length} / {GALLERY_MAX}
        </p>
      </div>

      <div className="layout-picker" role="group" aria-label="Gallery shape">
        {GALLERY_LAYOUTS.map((id) => (
          <button
            key={id}
            type="button"
            className={`layout-chip${layout === id ? " is-active" : ""}`}
            onClick={() => onLayoutChange(id)}
          >
            <span className={`layout-preview layout-preview--${id}`} aria-hidden />
            {galleryLayoutLabel(id)}
          </button>
        ))}
      </div>

      {images.length > 0 ? (
        <ul className="thumbs">
          {images.map((src, i) => (
            <li key={`${src}-${i}`} className="thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" />
              <div className="thumb-actions">
                <button
                  type="button"
                  aria-label="Move earlier"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label="Move later"
                  disabled={i === images.length - 1}
                  onClick={() => move(i, 1)}
                >
                  →
                </button>
                <button
                  type="button"
                  className="remove"
                  aria-label="Remove photo"
                  onClick={() => removeAt(i)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty">No photos yet — upload a few to get started.</p>
      )}

      <div className="actions">
        <button
          type="button"
          className="upload-btn"
          disabled={uploading || atCap}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading…" : atCap ? "Gallery full" : "Upload photos"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          hidden
          onChange={(e) => {
            const files = e.target.files;
            if (files?.length) void uploadFiles(files);
          }}
        />
        <button
          type="button"
          className="linkish"
          onClick={() => setShowUrl((v) => !v)}
        >
          Or paste a URL
        </button>
      </div>

      {showUrl ? (
        <div className="url-row">
          <input
            className="url-input"
            value={urlDraft}
            placeholder="https://…"
            disabled={atCap}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUrl();
              }
            }}
          />
          <button
            type="button"
            className="add-url"
            disabled={atCap || !urlDraft.trim()}
            onClick={addUrl}
          >
            Add
          </button>
        </div>
      ) : null}

      {error ? <p className="err">{error}</p> : null}

      <style jsx>{`
        .gallery-editor {
          display: grid;
          gap: 0.75rem;
        }
        .title {
          display: block;
          font-size: 0.85rem;
          color: var(--host-muted);
        }
        .hint {
          margin: 0.25rem 0 0;
          font-size: 0.8rem;
          color: var(--host-muted);
          line-height: 1.4;
        }
        .count {
          margin: 0.35rem 0 0;
          font-size: 0.8rem;
          color: var(--host-accent);
          font-weight: 600;
        }
        .layout-picker {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
        }
        .layout-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          min-height: 2.1rem;
          padding: 0.25rem 0.65rem 0.25rem 0.4rem;
          border-radius: 999px;
          border: 1px solid color-mix(in srgb, var(--host-muted) 35%, transparent);
          background: transparent;
          color: var(--host-text);
          font-size: 0.78rem;
          cursor: pointer;
        }
        .layout-chip.is-active {
          border-color: var(--host-accent);
          background: color-mix(in srgb, var(--host-accent) 18%, transparent);
        }
        .layout-preview {
          width: 1.1rem;
          height: 1.1rem;
          background: var(--host-accent);
          flex-shrink: 0;
        }
        .layout-preview--square {
          border-radius: 2px;
        }
        .layout-preview--rectangle {
          width: 1.35rem;
          height: 0.85rem;
          border-radius: 2px;
        }
        .layout-preview--circle {
          border-radius: 50%;
        }
        .layout-preview--heart {
          clip-path: polygon(
            50% 88%,
            10% 52%,
            4% 28%,
            18% 8%,
            38% 10%,
            50% 28%,
            62% 10%,
            82% 8%,
            96% 28%,
            90% 52%
          );
        }
        .layout-preview--diamond {
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
        }
        .layout-preview--hex {
          clip-path: polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%);
        }
        .layout-preview--scatter {
          border-radius: 3px;
          transform: rotate(-12deg);
        }
        .thumbs {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 0.65rem;
        }
        .thumb {
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid color-mix(in srgb, var(--host-muted) 30%, transparent);
          background: var(--host-bg);
        }
        .thumb img {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          display: block;
        }
        .thumb-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
          padding: 0.35rem;
        }
        .thumb-actions button {
          flex: 1;
          min-height: 1.75rem;
          border-radius: 6px;
          border: 1px solid color-mix(in srgb, var(--host-muted) 35%, transparent);
          background: transparent;
          color: var(--host-text);
          font-size: 0.7rem;
          cursor: pointer;
        }
        .thumb-actions button:disabled {
          opacity: 0.35;
          cursor: default;
        }
        .thumb-actions .remove {
          flex-basis: 100%;
          color: #f0a090;
        }
        .empty {
          margin: 0;
          font-size: 0.85rem;
          color: var(--host-muted);
        }
        .actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.65rem;
        }
        .upload-btn {
          min-height: 42px;
          padding: 0 1rem;
          border: none;
          border-radius: 8px;
          background: var(--host-accent);
          color: var(--host-bg);
          font-weight: 600;
          cursor: pointer;
        }
        .upload-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .linkish {
          background: none;
          border: none;
          color: var(--host-muted);
          text-decoration: underline;
          text-underline-offset: 3px;
          cursor: pointer;
          font-size: 0.85rem;
        }
        .url-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 0.5rem;
        }
        .url-input,
        .add-url {
          min-height: 42px;
          border-radius: 8px;
        }
        .url-input {
          border: 1px solid color-mix(in srgb, var(--host-muted) 35%, transparent);
          background: var(--host-bg);
          color: var(--host-text);
          padding: 0.5rem 0.75rem;
        }
        .add-url {
          border: none;
          padding: 0 0.9rem;
          background: color-mix(in srgb, var(--host-accent) 25%, transparent);
          color: var(--host-text);
          font-weight: 600;
          cursor: pointer;
        }
        .add-url:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .err {
          margin: 0;
          color: #f0a090;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
}
