import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { GuestOnly } from "@/components/auth/guest-only";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function LoginPage() {
  return (
    <AuthCard title="Welcome back" description="Sign in to track orders and check out faster.">
      <Suspense>
        <GuestOnly>
          <LoginForm />
        </GuestOnly>
      </Suspense>
    </AuthCard>
  );
}
