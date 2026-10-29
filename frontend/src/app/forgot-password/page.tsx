import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Forgot password", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Forgot password?" description="Enter your email and we'll send you a link to reset it.">
      <ForgotPasswordForm />
    </AuthCard>
  );
}
