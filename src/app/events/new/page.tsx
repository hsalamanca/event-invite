import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import BrandLogo from "@/components/BrandLogo";
import CreateEventWizard from "@/components/events/CreateEventWizard";
import { getRequestLocale } from "@/lib/i18n/locale";
import { paperGrainStyle, paperThemeVars } from "@/lib/marketing-theme";

export const dynamic = "force-dynamic";
export const metadata = { title: "Create event · Ownvite" };

export default async function NewEventPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/events/new");
  }
  const locale = await getRequestLocale();

  return (
    <main
      className="relative min-h-screen overflow-x-hidden"
      style={paperThemeVars}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={paperGrainStyle}
      />
      <header className="relative z-20 border-b border-[var(--landing-line)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
          <BrandLogo href="/dashboard" tone="ink" height={28} />
          <Link
            href="/dashboard"
            className="text-sm hover:text-[var(--landing-ink)]"
            style={{ color: "var(--landing-muted)" }}
          >
            ← Dashboard
          </Link>
        </div>
      </header>
      <div className="relative z-10 px-5 py-10 sm:px-8">
        <CreateEventWizard
          locale={locale}
          defaultHostName={session.user.name || ""}
        />
      </div>
    </main>
  );
}
