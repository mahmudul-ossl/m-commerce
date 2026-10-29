"use client";

import { LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout, useUser } from "@/hooks/use-auth";

export function AccountButton() {
  const { data: user } = useUser();
  const logout = useLogout();
  const router = useRouter();

  if (!user) {
    return (
      <Button
        variant="ghost"
        size="icon-lg"
        nativeButton={false}
        render={<Link href="/login" />}
        aria-label="Sign in"
        className="hidden sm:inline-flex"
      >
        <UserRound className="size-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-lg" aria-label="Account menu" className="hidden sm:inline-flex" />}
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {user.name.charAt(0).toUpperCase()}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <p className="truncate font-medium text-foreground">{user.name}</p>
            <p className="truncate text-xs">{user.email}</p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/account")}>
          <UserRound /> My account
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            logout.mutate(undefined, {
              onSuccess: () => {
                toast.success("You've been signed out.");
                router.push("/");
              },
            })
          }
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
