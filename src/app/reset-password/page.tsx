import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Set new password · Ownvite" };

function Inner({ token }: { token: string }) {
  return <ResetPasswordForm token={token} />;
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <AuthShell title="Choose a new password" subtitle="Use at least 8 characters.">
      <Suspense fallback={<p className="text-[var(--mist)]">Loading…</p>}>
        <Inner token={token ?? ""} />
      </Suspense>
    </AuthShell>
  );
}
