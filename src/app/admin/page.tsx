import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import AdminDashboard from "@/components/admin/AdminDashboard";
import BrandLogo from "@/components/BrandLogo";
import { isAdminEmail } from "@/lib/admin";
import {
  displayFont,
  paperGrainStyle,
  paperThemeVars,
} from "@/lib/marketing-theme";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Ownvite" };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/admin");
  }
  if (!isAdminEmail(session.user.email)) {
    redirect("/dashboard");
  }

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
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <BrandLogo href="/" tone="ink" height={28} />
            <span
              className="rounded border px-2 py-0.5 text-[10px] uppercase tracking-[0.2em]"
              style={{
                borderColor: "var(--landing-cedar)",
                color: "var(--landing-cedar)",
              }}
            >
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span style={{ color: "var(--landing-muted)" }}>
              {session.user.email}
            </span>
            <Link
              href="/dashboard"
              className="hover:text-[var(--landing-ink)]"
              style={{ color: "var(--landing-muted)" }}
            >
              Host dashboard
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="rounded-md border px-3 py-1.5"
                style={{
                  borderColor: "var(--landing-line)",
                  color: "var(--landing-muted)",
                }}
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <p
          className="text-xs uppercase tracking-[0.28em]"
          style={{ color: "var(--landing-cedar)" }}
        >
          Platform
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
          Admin dashboard
        </h1>
        <p className="mt-2 max-w-2xl" style={{ color: "var(--landing-muted)" }}>
          Manage registered users and every event on Ownvite. Use{" "}
          <strong className="font-medium" style={{ color: "var(--landing-ink)" }}>
            Assist in studio
          </strong>{" "}
          when a host needs help with design, domains, or RSVPs.
        </p>
        <div className="mt-10">
          <AdminDashboard />
        </div>
      </div>
    </main>
  );
}
