"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { getList, toggleInList, useListingNavigation } from "@/components/shop/listing-navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { ProductFilters } from "@/lib/catalog";
import { swatchColor } from "@/lib/colors";
import { formatPrice } from "@/lib/format";
import { sortSizes } from "@/lib/sizes";
import { cn } from "@/lib/utils";

export function FilterPanel({ filters }: { filters: ProductFilters }) {
  const { params, update } = useListingNavigation();

  const sizes = sortSizes(filters.options.size ?? []);
  const colors = filters.options.color ?? [];
  const selectedBrands = getList(params, "filter[brand]");
  const selectedSizes = getList(params, "filter[size]");
  const selectedColors = getList(params, "filter[color]");

  const toggleFlag = (key: string, checked: boolean) =>
    update((next) => (checked ? next.set(key, "1") : next.delete(key)));

  return (
    <div className="divide-y">
      <FilterSection title="Availability">
        <label className="flex cursor-pointer items-center gap-3 py-1.5 text-sm">
          <Checkbox
            checked={params.get("filter[in_stock]") === "1"}
            onCheckedChange={(checked) => toggleFlag("filter[in_stock]", checked)}
          />
          In stock only
        </label>
        <label className="flex cursor-pointer items-center gap-3 py-1.5 text-sm">
          <Checkbox
            checked={params.get("filter[on_sale]") === "1"}
            onCheckedChange={(checked) => toggleFlag("filter[on_sale]", checked)}
          />
          On sale
        </label>
      </FilterSection>

      {sizes.length > 0 && (
        <FilterSection title="Size">
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const active = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  aria-pressed={active}
                  onClick={() => update((next) => toggleInList(next, "filter[size]", size))}
                  className={cn(
                    "h-10 min-w-12 rounded-lg border px-3 text-sm transition-colors",
                    active ? "border-primary bg-primary text-primary-foreground" : "hover:border-foreground/40",
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {colors.length > 0 && (
        <FilterSection title="Color">
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => {
              const active = selectedColors.includes(color);
              return (
                <button
                  key={color}
                  type="button"
                  aria-pressed={active}
                  aria-label={color}
                  title={color}
                  onClick={() => update((next) => toggleInList(next, "filter[color]", color))}
                  className={cn(
                    "relative flex size-9 items-center justify-center rounded-full ring-1 ring-black/15 ring-offset-2 ring-offset-background transition-shadow dark:ring-white/20",
                    active && "ring-2 ring-foreground dark:ring-foreground",
                  )}
                  style={{ backgroundColor: swatchColor(color) }}
                >
                  {active && (
                    <Check className="size-4 mix-blend-difference" color="white" strokeWidth={3} />
                  )}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {filters.brands.length > 0 && (
        <FilterSection title="Brand">
          {filters.brands.map((brand) => (
            <label key={brand.slug} className="flex cursor-pointer items-center gap-3 py-1.5 text-sm">
              <Checkbox
                checked={selectedBrands.includes(brand.slug)}
                onCheckedChange={() => update((next) => toggleInList(next, "filter[brand]", brand.slug))}
              />
              <span className="flex-1">{brand.name}</span>
              <span className="text-xs text-muted-foreground tabular-nums">{brand.count}</span>
            </label>
          ))}
        </FilterSection>
      )}

      {filters.price.max > 0 && (
        <FilterSection title="Price">
          <PriceFilter min={filters.price.min} max={filters.price.max} />
        </FilterSection>
      )}
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="py-5 first:pt-0">
      <legend className="mb-3 text-sm font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}

function PriceFilter({ min, max }: { min: number; max: number }) {
  const { params, update } = useListingNavigation();
  const [from, setFrom] = useState(params.get("filter[min_price]") ?? "");
  const [to, setTo] = useState(params.get("filter[max_price]") ?? "");

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        update((next) => {
          if (from) next.set("filter[min_price]", from);
          else next.delete("filter[min_price]");
          if (to) next.set("filter[max_price]", to);
          else next.delete("filter[max_price]");
        });
      }}
    >
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          value={from}
          onChange={(event) => setFrom(event.target.value)}
          placeholder={String(Math.floor(min))}
          aria-label="Minimum price"
          className="h-10"
        />
        <span className="text-muted-foreground">–</span>
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          value={to}
          onChange={(event) => setTo(event.target.value)}
          placeholder={String(Math.ceil(max))}
          aria-label="Maximum price"
          className="h-10"
        />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {formatPrice(min)} – {formatPrice(max)}
        </p>
        <Button type="submit" variant="outline" size="sm">
          Apply
        </Button>
      </div>
    </form>
  );
}
