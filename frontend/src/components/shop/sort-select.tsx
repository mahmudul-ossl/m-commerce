"use client";

import { ChevronDown } from "lucide-react";

import { useListingNavigation } from "@/components/shop/listing-navigation";
import { DEFAULT_SORT, SORT_OPTIONS } from "@/lib/product-query";

export function SortSelect() {
  const { params, update } = useListingNavigation();

  return (
    <label className="relative flex items-center">
      <span className="sr-only">Sort by</span>
      <select
        value={params.get("sort") ?? DEFAULT_SORT}
        onChange={(event) =>
          update((next) => {
            if (event.target.value === DEFAULT_SORT) next.delete("sort");
            else next.set("sort", event.target.value);
          })
        }
        className="h-10 cursor-pointer appearance-none rounded-full border bg-background pr-9 pl-4 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 size-4 text-muted-foreground" />
    </label>
  );
}
