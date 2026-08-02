import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import CreateEventWizard from "@/components/events/CreateEventWizard";
import { getRequestLocale } from "@/lib/i18n/locale";

export const dynamic = "force-dynamic";
export const metadata = { title: "Create event · Ownvite" };

export default async function NewEventPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/events/new");
  }
  const locale = await getRequestLocale();

  return (
    <main className="min-h-screen bg-[var(--ink)] text-[var(--ivory)]">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link
            href="/dashboard"
            className="font-[family-name:var(--font-cormorant)] text-2xl tracking-wide text-[var(--champagne)]"
          >
            Ownvite
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-[var(--mist)] hover:text-[var(--ivory)]"
          >
            ← Dashboard
          </Link>
        </div>
      </header>
      <div className="px-6 py-10">
        <CreateEventWizard
          locale={locale}
          defaultHostName={session.user.name || ""}
        />
      </div>
    </main>
  );
}
