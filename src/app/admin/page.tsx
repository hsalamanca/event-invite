import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { isAdminEmail } from "@/lib/admin";

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
    <main className="min-h-screen bg-[var(--ink)] text-[var(--ivory)]">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="font-[family-name:var(--font-cormorant)] text-2xl tracking-wide text-[var(--champagne)]"
            >
              Ownvite
            </Link>
            <span className="rounded border border-[var(--champagne)]/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-[var(--champagne)]">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[var(--mist)]">{session.user.email}</span>
            <Link
              href="/dashboard"
              className="text-[var(--mist)] hover:text-[var(--ivory)]"
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
                className="rounded-md border border-white/15 px-3 py-1.5 text-[var(--mist)]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--champagne)]">
          Platform owner
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-cormorant)] text-4xl tracking-tight">
          Admin dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--mist)]">
          Manage registered users and every event on Ownvite. Use{" "}
          <strong className="font-medium text-[var(--ivory)]">
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
