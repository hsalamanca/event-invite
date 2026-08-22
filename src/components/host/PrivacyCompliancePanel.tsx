"use client";

import { useState } from "react";

export function PrivacyCompliancePanel({ slug }: { slug: string }) {
  const [busy, setBusy] = useState<"export" | "delete" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guestEmail, setGuestEmail] = useState("");

  async function exportData() {
    setBusy("export");
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/events/${encodeURIComponent(slug)}/privacy?scope=host`,
        { credentials: "include" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Export failed");
      const blob = new Blob([JSON.stringify(data.export || data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}-privacy-export.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage("Privacy export downloaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setBusy(null);
    }
  }

  async function deleteGuestData() {
    if (!guestEmail.trim()) {
      setError("Enter a guest email to delete.");
      return;
    }
    if (
      !window.confirm(
        `Delete stored RSVP/personal data for "${guestEmail.trim()}"? This cannot be undone.`
      )
    ) {
      return;
    }
    setBusy("delete");
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(slug)}/privacy`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: guestEmail.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setMessage(`Removed data for ${data.deleted || guestEmail.trim()}.`);
      setGuestEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-[var(--slate)]/60 p-4 sm:p-5">
      <div>
        <h3 className="text-sm font-semibold text-[var(--ivory)]">Privacy & compliance</h3>
        <p className="text-xs text-[var(--mist)]">
          Export event guest data for GDPR requests, or erase a guest’s stored details. SMS STOP is
          honored automatically via the Twilio inbound webhook.
        </p>
      </div>

      {error && <p className="text-sm text-rose-300">{error}</p>}
      {message && <p className="text-sm text-emerald-300">{message}</p>}

      <button
        type="button"
        onClick={() => void exportData()}
        disabled={busy !== null}
        className="rounded-full bg-[var(--champagne)] px-4 py-2 text-sm font-semibold text-[var(--ink)] disabled:opacity-60"
      >
        {busy === "export" ? "Exporting…" : "Download privacy export"}
      </button>

      <div className="space-y-2 rounded-xl border border-white/10 bg-[var(--ink)]/30 p-3">
        <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--mist)]">
          Erase guest data
        </label>
        <input
          type="email"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          placeholder="Guest email"
          className="w-full rounded-lg border border-white/15 bg-[var(--ink)] px-3 py-2 text-sm text-[var(--ivory)]"
        />
        <button
          type="button"
          onClick={() => void deleteGuestData()}
          disabled={busy !== null}
          className="rounded-full border border-rose-400/40 px-3 py-1.5 text-xs font-semibold text-rose-200 disabled:opacity-60"
        >
          {busy === "delete" ? "Deleting…" : "Delete matching guest data"}
        </button>
      </div>
    </div>
  );
}
