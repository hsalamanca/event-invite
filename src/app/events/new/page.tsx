import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import BrandLogo from "@/components/BrandLogo";
import CreateEventWizard from "@/components/events/CreateEventWizard";
import { getRequestLocale } from "@/lib/i18n/locale";
import { paperGrainStyle, paperThemeVars } from "@/lib/marketing-theme";

export const dynamic = "force-dynamic";
export const metadata = { title: "Create event" };

export default async function NewEventPage({
  searchParams,
}: {
  searchParams?: Promise<{ template?: string }>;
}) {
  const session = await auth();
  const params = (await searchParams) || {};
  const template =
    typeof params.template === "string" ? params.template.trim() : "";
  const user = session?.user;
  if (!user?.id) {
    const next = template
      ? `/events/new?template=${encodeURIComponent(template)}`
      : "/events/new";
    redirect(`/register?callbackUrl=${encodeURIComponent(next)}`);
  }
  const locale = await getRequestLocale();

  return (
    <main
      className="paper-surface relative min-h-screen overflow-x-hidden"
      style={paperThemeVars}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={paperGrainStyle}
      />
      <header className="sticky top-0 z-30 border-b border-[var(--landing-line)] bg-[#FBF6F2]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5 sm:px-8 sm:py-4">
          <BrandLogo href="/dashboard" tone="paper" height={28} />
          <Link
            href="/dashboard"
            className="text-sm hover:text-[var(--landing-ink)]"
            style={{ color: "var(--landing-muted)" }}
          >
            ← Dashboard
          </Link>
        </div>
      </header>
      <div className="relative z-10 px-5 py-6 sm:px-8 sm:py-8">
        <CreateEventWizard
          locale={locale}
          defaultHostName={user.name || ""}
          defaultTemplateId={template || undefined}
        />
      </div>
    </main>
  );
}
