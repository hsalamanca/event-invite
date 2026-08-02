import AuthShell from "@/components/auth/AuthShell";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata = { title: "Forgot password · Ownvite" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset password"
      subtitle="Enter your email and we’ll send a reset link."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
