"use client";

import { useRef, useState } from "react";

type ImageUploadProps = {
  slug: string;
  value: string;
  onChange: (url: string) => void;
  labels?: {
    title?: string;
    hint?: string;
    upload?: string;
    uploading?: string;
    orUrl?: string;
    urlPlaceholder?: string;
  };
};

export default function ImageUpload({
  slug,
  value,
  onChange,
  labels = {},
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrl, setShowUrl] = useState(false);

  const t = {
    title: labels.title ?? "Hero image",
    hint: labels.hint ?? "Upload a photo from your device (JPG, PNG, WEBP · max 8MB).",
    upload: labels.upload ?? "Upload image",
    uploading: labels.uploading ?? "Uploading…",
    orUrl: labels.orUrl ?? "Or paste an image URL",
    urlPlaceholder: labels.urlPlaceholder ?? "https://…",
  };

  async function onFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("slug", slug);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="image-upload">
      <div className="head">
        <span className="title">{t.title}</span>
        <p className="hint">{t.hint}</p>
      </div>

      {value ? (
        <div className="preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" />
        </div>
      ) : null}

      <div className="actions">
        <button
          type="button"
          className="upload-btn"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? t.uploading : t.upload}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          className="linkish"
          onClick={() => setShowUrl((v) => !v)}
        >
          {t.orUrl}
        </button>
      </div>

      {showUrl && (
        <input
          className="url-input"
          value={value}
          placeholder={t.urlPlaceholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {error && <p className="err">{error}</p>}

      <style jsx>{`
        .image-upload {
          display: grid;
          gap: 0.65rem;
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
        .preview {
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid color-mix(in srgb, var(--host-muted) 30%, transparent);
          aspect-ratio: 16 / 10;
          background: var(--host-bg);
        }
        .preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
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
          opacity: 0.7;
          cursor: wait;
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
        .url-input {
          min-height: 42px;
          border-radius: 8px;
          border: 1px solid color-mix(in srgb, var(--host-muted) 35%, transparent);
          background: var(--host-bg);
          color: var(--host-text);
          padding: 0.5rem 0.75rem;
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
