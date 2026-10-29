"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useTransition } from "react";

import { cn } from "@/lib/utils";

type ListingNavigation = {
  /** True while new results are loading after a filter, sort or page change. */
  isPending: boolean;
  /** Current URL search params (read-only copy). */
  params: URLSearchParams;
  /** Change the URL params; resets to page 1 unless `keepPage` is set. */
  update: (change: (params: URLSearchParams) => void, options?: { keepPage?: boolean }) => void;
};

const ListingNavigationContext = createContext<ListingNavigation | null>(null);

export function ListingNavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const update = useCallback<ListingNavigation["update"]>(
    (change, options = {}) => {
      const next = new URLSearchParams(searchParams.toString());
      change(next);
      if (!options.keepPage) next.delete("page");

      const query = next.toString();
      startTransition(() => {
        router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  return (
    <ListingNavigationContext.Provider value={{ isPending, params: new URLSearchParams(searchParams.toString()), update }}>
      {children}
    </ListingNavigationContext.Provider>
  );
}

export function useListingNavigation(): ListingNavigation {
  const context = useContext(ListingNavigationContext);
  if (!context) throw new Error("useListingNavigation must be used inside ListingNavigationProvider");
  return context;
}

/** Fades the results while a new page of products loads. */
export function ListingResults({ children }: { children: React.ReactNode }) {
  const { isPending } = useListingNavigation();

  return (
    <div
      aria-busy={isPending}
      className={cn("transition-opacity duration-200", isPending && "pointer-events-none opacity-50")}
    >
      {children}
    </div>
  );
}

/** Helpers for comma-separated multi-value filters such as filter[size]=M,L. */
export function getList(params: URLSearchParams, key: string): string[] {
  return params.get(key)?.split(",").filter(Boolean) ?? [];
}

export function toggleInList(params: URLSearchParams, key: string, value: string) {
  const values = getList(params, key);
  const next = values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

  if (next.length) params.set(key, next.join(","));
  else params.delete(key);
}
