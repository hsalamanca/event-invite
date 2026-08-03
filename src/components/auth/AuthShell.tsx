import type { ReactNode } from "react";
import BrandLogo from "@/components/BrandLogo";
import {
  displayFont,
  paperGrainStyle,
  paperThemeVars,
} from "@/lib/marketing-theme";

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
    <main
      className="auth-paper relative min-h-screen overflow-hidden"
      style={paperThemeVars}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={paperGrainStyle}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% -10%, rgba(107,83,56,0.08), transparent 60%)",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        <div className="mb-10">
          <BrandLogo tone="ink" height={32} />
        </div>
        <h1
          style={{
            ...displayFont,
            fontSize: "clamp(2rem, 5vw, 2.75rem)",
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "var(--landing-ink)",
          }}
        >
          {title}
        </h1>
        <p className="mt-3" style={{ color: "var(--landing-muted)" }}>
          {subtitle}
        </p>
        <div className="mt-8">{children}</div>
        {footer ? (
          <p className="mt-8 text-sm" style={{ color: "var(--landing-muted)" }}>
            {footer}
          </p>
        ) : null}
      </div>
    </main>
  );
}
