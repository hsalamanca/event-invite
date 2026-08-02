import type { ReactNode } from "react";
import BrandLogo from "@/components/BrandLogo";

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--ink)] text-[var(--ivory)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 85% 0%, rgba(255,200,87,0.16) 0%, transparent 50%), radial-gradient(ellipse 55% 40% at 8% 90%, rgba(224,122,95,0.14) 0%, transparent 45%), linear-gradient(180deg, #0f1a2e 0%, #121f38 50%, #0f1a2e 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[10%] top-[20%] h-48 w-48 rounded-full blur-3xl"
        style={{
          background: "rgba(201,169,98,0.18)",
          animation: "ownvite-glow-pulse 9s ease-in-out infinite",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[15%] right-[8%] h-56 w-56 rounded-full blur-3xl"
        style={{
          background: "rgba(224,122,95,0.14)",
          animation: "ownvite-glow-pulse 11s ease-in-out 1s infinite",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        <div
          className="mb-10"
          style={{ animation: "ownvite-fade-in 0.7s ease both" }}
        >
          <BrandLogo tone="champagne" height={32} />
        </div>
        <h1
          className="font-[family-name:var(--font-cormorant)] text-4xl leading-tight tracking-tight"
          style={{ animation: "ownvite-fade-up 0.8s ease 0.06s both" }}
        >
          {title}
        </h1>
        <p
          className="mt-3 text-[var(--mist)]"
          style={{ animation: "ownvite-fade-up 0.8s ease 0.12s both" }}
        >
          {subtitle}
        </p>
        <div
          className="mt-8"
          style={{ animation: "ownvite-fade-up 0.85s ease 0.18s both" }}
        >
          {children}
        </div>
        {footer ? (
          <p
            className="mt-8 text-sm text-[var(--mist)]"
            style={{ animation: "ownvite-fade-up 0.8s ease 0.24s both" }}
          >
            {footer}
          </p>
        ) : null}
      </div>
    </main>
  );
}
