"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-auth";
import type { User } from "@/lib/types";

/**
 * Only render for signed-in customers; send guests to sign in and back here afterwards.
 * The API enforces access too; this keeps guests from seeing an empty page.
 */
export function RequireAuth({ children }: { children: (user: User) => React.ReactNode }) {
  const { data: user, isPending } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isPending && user === null) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isPending, user, router, pathname]);

  if (!user) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  return children(user);
}
