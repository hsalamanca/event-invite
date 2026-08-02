import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import VerifyEmailClient from "@/components/auth/VerifyEmailClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Verify email · Ownvite" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <AuthShell
      title="Verify email"
      subtitle="Confirming your Ownvite account."
    >
      <Suspense fallback={<p className="text-[var(--mist)]">Loading…</p>}>
        <VerifyEmailClient token={token ?? ""} />
      </Suspense>
    </AuthShell>
  );
}
