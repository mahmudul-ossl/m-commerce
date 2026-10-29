"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { FilterPanel } from "@/components/shop/filter-panel";
import { useListingNavigation } from "@/components/shop/listing-navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { ProductFilters } from "@/lib/catalog";
import { FILTER_KEYS } from "@/lib/product-query";

export function MobileFilters({ filters, total }: { filters: ProductFilters; total: number }) {
  const [open, setOpen] = useState(false);
  const { params, isPending } = useListingNavigation();
  const activeCount = FILTER_KEYS.filter((key) => key !== "search" && params.has(`filter[${key}]`)).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" className="h-10 gap-2 rounded-full px-4 lg:hidden" />}>
        <SlidersHorizontal />
        Filters
        {activeCount > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[0.7rem] text-primary-foreground">
            {activeCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85svh] gap-0 rounded-t-2xl p-0">
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-muted" aria-hidden="true" />
        <SheetTitle className="px-5 pt-4 pb-2 font-display text-2xl font-normal">Filters</SheetTitle>
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <FilterPanel filters={filters} />
        </div>
        <div className="border-t p-4">
          <Button className="h-12 w-full rounded-full text-base" onClick={() => setOpen(false)} disabled={isPending}>
            {isPending ? "Updating…" : `Show ${total} ${total === 1 ? "product" : "products"}`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
