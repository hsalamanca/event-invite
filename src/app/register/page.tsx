import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth, isGoogleAuthEnabled } from "@/auth";
import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";
import { safeCallbackUrl } from "@/lib/safe-callback-url";

export const dynamic = "force-dynamic";
export const metadata = { title: "Create account · Ownvite" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const params = (await searchParams) || {};
  const next = safeCallbackUrl(params.callbackUrl, "/events/new?verify=1");
  if (session?.user) redirect(next);

  return (
    <AuthShell
      title="Create your account"
      subtitle="Register once, then create as many invitations as you need — like Evite, without the ads."
    >
      <Suspense fallback={<p className="text-[var(--landing-muted)]">Loading…</p>}>
        <RegisterForm googleEnabled={isGoogleAuthEnabled} />
      </Suspense>
    </AuthShell>
  );
}
