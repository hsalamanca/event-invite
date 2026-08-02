import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth, isGoogleAuthEnabled } from "@/auth";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in · Ownvite" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your invitations, guests, and domains."
    >
      <Suspense fallback={<p className="text-[var(--mist)]">Loading…</p>}>
        <LoginForm googleEnabled={isGoogleAuthEnabled} />
      </Suspense>
    </AuthShell>
  );
}
