"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Row = {
  id: string;
  name: string;
  email: string;
  attendance: string;
  guestCount: number;
  checkedIn: boolean;
  checkedInAt: string | null;
  editToken?: string | null;
};

export function CheckInPanel({ slug }: { slug: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(slug)}/check-in`);
      if (!res.ok) return;
      const data = (await res.json()) as { rsvps?: Row[] };
      if (data.rsvps) setRows(data.rsvps);
    } catch {
      /* ignore */
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function checkInById(id: string, checkedIn: boolean) {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(slug)}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rsvpId: id, checkedIn }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error || "Check-in failed");
        return;
      }
      await load();
    } catch {
      setError("Check-in failed");
    } finally {
      setBusy(null);
    }
  }

  async function checkInByCode(raw: string) {
    const value = raw.trim();
    if (!value) return;
    setBusy("scan");
    setError(null);
    setInfo(null);
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(slug)}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: value, checkedIn: true }),
      });
      const data = (await res.json()) as {
        error?: string;
        rsvp?: { name?: string };
      };
      if (!res.ok) {
        setError(data.error || "Check-in failed");
        return;
      }
      setInfo(`Checked in: ${data.rsvp?.name || "guest"}`);
      setCode("");
      await load();
    } catch {
      setError("Check-in failed");
    } finally {
      setBusy(null);
    }
  }

  async function startScanner() {
    setError(null);
    setInfo(null);
    // @ts-expect-error BarcodeDetector is not in all TS libs
    if (typeof window === "undefined" || typeof window.BarcodeDetector !== "function") {
      setError(
        "Camera QR scan needs Chrome/Edge. Paste the guest QR code below instead.",
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      setScanning(true);
      await new Promise((r) => setTimeout(r, 50));
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      // @ts-expect-error BarcodeDetector
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const tick = async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
          rafRef.current = requestAnimationFrame(() => void tick());
          return;
        }
        try {
          const codes = await detector.detect(videoRef.current);
          const value = codes?.[0]?.rawValue;
          if (value) {
            stopScanner();
            await checkInByCode(value);
            return;
          }
        } catch {
          /* keep scanning */
        }
        rafRef.current = requestAnimationFrame(() => void tick());
      };
      rafRef.current = requestAnimationFrame(() => void tick());
    } catch {
      setError("Could not open camera. Paste the guest QR payload instead.");
      setScanning(false);
    }
  }

  function stopScanner() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }

  const attending = rows.filter((r) =>
    r.attendance.toLowerCase().includes("attend"),
  );
  const filtered = attending.filter((r) => {
    const needle = q.trim().toLowerCase();
    if (!needle) return true;
    return (
      r.name.toLowerCase().includes(needle) ||
      r.email.toLowerCase().includes(needle)
    );
  });
  const inCount = attending.filter((r) => r.checkedIn).length;

  return (
    <section className="scroll-mt-24 border-t border-white/10 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-cormorant)] text-2xl">
            Door check-in
          </h2>
          <p className="mt-1 text-sm text-[var(--mist)]">
            {inCount} / {attending.length} checked in · scan per-guest QR or search
          </p>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search guest…"
          className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--champagne)]"
        />
      </div>

      <div className="mt-4 rounded-md border border-white/10 bg-white/[0.02] p-4">
        <div className="flex flex-wrap items-center gap-2">
          {!scanning ? (
            <button
              type="button"
              onClick={() => void startScanner()}
              className="rounded-md bg-[var(--champagne)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
            >
              Scan guest QR
            </button>
          ) : (
            <button
              type="button"
              onClick={stopScanner}
              className="rounded-md border border-white/20 px-3 py-1.5 text-sm"
            >
              Stop scanner
            </button>
          )}
          <form
            className="flex flex-1 flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void checkInByCode(code);
            }}
          >
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste QR payload or guest token"
              className="min-w-[12rem] flex-1 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--champagne)]"
            />
            <button
              type="submit"
              disabled={busy === "scan" || !code.trim()}
              className="rounded-md border border-white/15 px-3 py-1.5 text-sm disabled:opacity-60"
            >
              Check in
            </button>
          </form>
        </div>
        {scanning ? (
          <video
            ref={videoRef}
            className="mt-3 max-h-64 w-full rounded-md bg-black object-cover"
            muted
            playsInline
          />
        ) : null}
      </div>

      {info ? (
        <p className="mt-2 text-sm text-[var(--champagne)]">{info}</p>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm text-[var(--coral)]">{error}</p>
      ) : null}
      <ul className="mt-4 space-y-2">
        {filtered.map((r) => (
          <li
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.02] px-3 py-2.5 text-sm"
          >
            <div>
              <div className="font-medium">{r.name}</div>
              <div className="text-[var(--mist)]">
                {r.email}
                {r.guestCount > 1 ? ` · ${r.guestCount} guests` : ""}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {r.editToken ? (
                <a
                  href={`/api/events/${slug}/qr?token=${encodeURIComponent(r.editToken)}&format=png`}
                  download
                  className="rounded-md border border-white/15 px-2.5 py-1.5 text-xs text-[var(--mist)] hover:border-[var(--champagne)]/40"
                >
                  Guest QR
                </a>
              ) : null}
              <button
                type="button"
                disabled={busy === r.id}
                onClick={() => void checkInById(r.id, !r.checkedIn)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-60 ${
                  r.checkedIn
                    ? "border border-white/20 text-[var(--mist)]"
                    : "bg-[var(--champagne)] text-[var(--ink)]"
                }`}
              >
                {r.checkedIn ? "Undo" : "Check in"}
              </button>
            </div>
          </li>
        ))}
        {filtered.length === 0 ? (
          <li className="py-6 text-sm text-[var(--mist)]">
            No attending guests to check in yet.
          </li>
        ) : null}
      </ul>
    </section>
  );
}
