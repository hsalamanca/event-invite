import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import BrandLogo from "@/components/BrandLogo";
import { GuestBookManager } from "@/components/dashboard/GuestBookManager";
import {
  displayFont,
  paperGrainStyle,
  paperThemeVars,
} from "@/lib/marketing-theme";
import { listGuestBook } from "@/lib/guest-book";

export const dynamic = "force-dynamic";
export const metadata = { title: "Guest book · Ownvite" };

export default async function GuestBookPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/guests");
  }

  const contacts = await listGuestBook(session.user.id);

  return (
    <main className="relative min-h-screen overflow-x-hidden" style={paperThemeVars}>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={paperGrainStyle}
      />
      <header className="relative z-20 border-b border-[var(--landing-line)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <BrandLogo tone="ink" height={28} />
          <Link
            href="/dashboard"
            className="text-sm"
            style={{ color: "var(--landing-muted)" }}
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <p
          className="text-xs uppercase tracking-[0.28em]"
          style={{ color: "var(--landing-cedar)" }}
        >
          Across events
        </p>
        <h1
          className="mt-2"
          style={{
            ...displayFont,
            fontSize: "clamp(2rem, 4vw, 2.75rem)",
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          Guest book
        </h1>
        <p className="mt-2 max-w-lg" style={{ color: "var(--landing-muted)" }}>
          Households, dietary notes, and past RSVPs — invite again without
          retyping.
        </p>

        <div className="mt-10">
          <GuestBookManager initialContacts={contacts} />
        </div>
      </div>
    </main>
  );
}
