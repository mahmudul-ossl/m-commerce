import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { GuestOnly } from "@/components/auth/guest-only";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default function RegisterPage() {
  return (
    <AuthCard title="Create an account" description="Save your details and see your orders in one place.">
      <Suspense>
        <GuestOnly>
          <RegisterForm />
        </GuestOnly>
      </Suspense>
    </AuthCard>
  );
}
