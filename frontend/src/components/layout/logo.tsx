import Link from "next/link";

import { cn } from "@/lib/utils";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "M-Commerce";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("font-display text-2xl leading-none tracking-tight sm:text-[1.7rem]", className)}
      aria-label={`${siteName} home`}
    >
      {siteName}
      <span className="text-brand">.</span>
    </Link>
  );
}
