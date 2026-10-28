"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Sticky header wrapper: transparent at the top of the page,
 * frosted glass with a hairline border once the page scrolls.
 */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-[background-color,border-color,box-shadow] duration-300",
        scrolled
          ? "border-border/70 bg-background/75 shadow-[0_1px_24px_-12px_rgb(0_0_0/0.15)] backdrop-blur-xl backdrop-saturate-150"
          : "border-transparent bg-background",
      )}
    >
      {children}
    </header>
  );
}
