"use client";

import { LogOut, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { RequireAuth } from "@/components/auth/require-auth";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/use-auth";

export function AccountOverview() {
  const logout = useLogout();
  const router = useRouter();

  return (
    <RequireAuth>
      {(user) => (
        <div className="space-y-8">
          <section className="rounded-xl border p-6">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Profile</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-muted-foreground">Name</dt>
                <dd className="mt-1 font-medium">{user.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Email</dt>
                <dd className="mt-1 font-medium break-all">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Phone</dt>
                <dd className="mt-1 font-medium">{user.phone ?? "Not added"}</dd>
              </div>
            </dl>
          </section>

          <section className="flex flex-col items-center rounded-xl bg-muted/50 px-6 py-10 text-center">
            <Package className="size-8 text-muted-foreground" />
            <h2 className="mt-3 font-display text-2xl">No orders yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">Orders you place will appear here.</p>
            <Button nativeButton={false} render={<Link href="/shop" />} className="mt-5 h-11 rounded-full px-6">
              Start shopping
            </Button>
          </section>

          <Button
            variant="outline"
            className="h-11 gap-2 rounded-full px-5"
            disabled={logout.isPending}
            onClick={() =>
              logout.mutate(undefined, {
                onSuccess: () => {
                  toast.success("You've been signed out.");
                  router.push("/");
                },
              })
            }
          >
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      )}
    </RequireAuth>
  );
}
