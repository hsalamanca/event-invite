import { redirect } from "next/navigation";
import { auth, isGoogleAuthEnabled } from "@/auth";
import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Create account · Ownvite" };

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <AuthShell
      title="Create your account"
      subtitle="Register once, then create as many invitations as you need — like Evite, without the ads."
    >
      <RegisterForm googleEnabled={isGoogleAuthEnabled} />
    </AuthShell>
  );
}
