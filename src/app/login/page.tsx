import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth, isGoogleAuthEnabled } from "@/auth";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";
import { safeCallbackUrl } from "@/lib/safe-callback-url";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in · Ownvite" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const params = (await searchParams) || {};
  if (session?.user) redirect(safeCallbackUrl(params.callbackUrl));

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your invitations, guests, and domains."
    >
      <Suspense fallback={<p className="text-[var(--landing-muted)]">Loading…</p>}>
        <LoginForm googleEnabled={isGoogleAuthEnabled} />
      </Suspense>
    </AuthShell>
  );
}
