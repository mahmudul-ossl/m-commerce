"use client";

import { ChevronDown, Menu, Package, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { Category } from "@/lib/types";

export function MobileNav({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon-lg" className="-ml-2 lg:hidden" aria-label="Open menu" />}>
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[88vw] max-w-sm gap-0 p-0">
        <div className="flex h-(--header-height) items-center border-b px-4">
          <SheetTitle render={<div />}>
            <Logo />
          </SheetTitle>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Main">
          <Link href="/shop" onClick={close} className="flex items-center rounded-md px-3 py-3 text-base font-medium hover:bg-muted">
            Shop all
          </Link>

          {categories.map((category) => (
            <details key={category.id} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-md px-3 py-3 text-base font-medium hover:bg-muted [&::-webkit-details-marker]:hidden">
                {category.name}
                <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <ul className="mb-2 ml-3 border-l pl-3">
                {category.children?.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/category/${child.slug}`}
                      onClick={close}
                      className="block rounded-md px-3 py-2.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href={`/category/${category.slug}`}
                    onClick={close}
                    className="block rounded-md px-3 py-2.5 font-medium text-brand hover:bg-muted"
                  >
                    Shop all {category.name}
                  </Link>
                </li>
              </ul>
            </details>
          ))}
        </nav>

        <div className="grid gap-1 border-t p-2">
          <Link href="/login" onClick={close} className="flex items-center gap-3 rounded-md px-3 py-3 hover:bg-muted">
            <UserRound className="size-5" /> Sign in / Register
          </Link>
          <Link href="/track-order" onClick={close} className="flex items-center gap-3 rounded-md px-3 py-3 hover:bg-muted">
            <Package className="size-5" /> Track your order
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
