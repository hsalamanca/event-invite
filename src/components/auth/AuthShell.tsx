import Link from "next/link";
import type { ReactNode } from "react";

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
            "radial-gradient(ellipse 80% 60% at 80% 0%, rgba(224,122,95,0.14) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 10% 90%, rgba(201,169,98,0.1) 0%, transparent 45%), linear-gradient(180deg, #0f1a2e 0%, #121f38 50%, #0f1a2e 100%)",
        }}
      />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        <Link
          href="/"
          className="mb-10 font-[family-name:var(--font-cormorant)] text-2xl tracking-wide text-[var(--champagne)]"
        >
          Ownvite
        </Link>
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl leading-tight tracking-tight">
          {title}
        </h1>
        <p className="mt-3 text-[var(--mist)]">{subtitle}</p>
        <div className="mt-8">{children}</div>
        {footer ? (
          <p className="mt-8 text-sm text-[var(--mist)]">{footer}</p>
        ) : null}
      </div>
    </main>
  );
}
