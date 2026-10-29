"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { useUser } from "@/hooks/use-auth";
import { safeRedirect } from "@/lib/form-errors";

/** Send signed-in customers away from sign-in and register pages. */
export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { data: user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (user) router.replace(safeRedirect(searchParams.get("redirect")));
  }, [user, router, searchParams]);

  return children;
}
