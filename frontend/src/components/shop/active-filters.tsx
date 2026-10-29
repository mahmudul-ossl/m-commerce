"use client";

import { X } from "lucide-react";

import { getList, toggleInList, useListingNavigation } from "@/components/shop/listing-navigation";
import type { ProductFilters } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

type Chip = { label: string; remove: (params: URLSearchParams) => void };

export function ActiveFilters({ filters }: { filters: ProductFilters }) {
  const { params, update } = useListingNavigation();
  const chips: Chip[] = [];

  const brandName = (slug: string) => filters.brands.find((brand) => brand.slug === slug)?.name ?? slug;

  for (const slug of getList(params, "filter[brand]")) {
    chips.push({ label: brandName(slug), remove: (next) => toggleInList(next, "filter[brand]", slug) });
  }
  for (const size of getList(params, "filter[size]")) {
    chips.push({ label: `Size ${size}`, remove: (next) => toggleInList(next, "filter[size]", size) });
  }
  for (const color of getList(params, "filter[color]")) {
    chips.push({ label: color, remove: (next) => toggleInList(next, "filter[color]", color) });
  }

  const min = params.get("filter[min_price]");
  const max = params.get("filter[max_price]");
  if (min || max) {
    const label = min && max ? `${formatPrice(+min)} – ${formatPrice(+max)}` : min ? `From ${formatPrice(+min)}` : `Up to ${formatPrice(+max!)}`;
    chips.push({ label, remove: (next) => (next.delete("filter[min_price]"), next.delete("filter[max_price]")) });
  }
  if (params.get("filter[on_sale]")) chips.push({ label: "On sale", remove: (next) => next.delete("filter[on_sale]") });
  if (params.get("filter[in_stock]")) chips.push({ label: "In stock", remove: (next) => next.delete("filter[in_stock]") });
  if (params.get("filter[search]")) {
    chips.push({ label: `“${params.get("filter[search]")}”`, remove: (next) => next.delete("filter[search]") });
  }

  if (chips.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.label}
          type="button"
          onClick={() => update(chip.remove)}
          className="flex h-8 items-center gap-1.5 rounded-full bg-muted pr-2.5 pl-3 text-sm transition-colors hover:bg-muted/70"
        >
          {chip.label}
          <X className="size-3.5" aria-hidden="true" />
          <span className="sr-only">Remove filter</span>
        </button>
      ))}
      <button
        type="button"
        onClick={() =>
          update((next) => {
            for (const key of [...next.keys()]) if (key.startsWith("filter[")) next.delete(key);
          })
        }
        className="px-2 text-sm font-medium underline underline-offset-4"
      >
        Clear all
      </button>
    </div>
  );
}
