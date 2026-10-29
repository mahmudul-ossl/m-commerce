import { SearchX } from "lucide-react";
import Link from "next/link";

import { ProductGrid, ProductGridSkeleton } from "@/components/product/product-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { ActiveFilters } from "@/components/shop/active-filters";
import { FilterPanel } from "@/components/shop/filter-panel";
import { ListingNavigationProvider, ListingResults } from "@/components/shop/listing-navigation";
import { MobileFilters } from "@/components/shop/mobile-filters";
import { Pagination } from "@/components/shop/pagination";
import { SortSelect } from "@/components/shop/sort-select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getProductFilters, getProducts } from "@/lib/catalog";
import { buildProductQuery, type SearchParams } from "@/lib/product-query";

type ProductListingProps = {
  searchParams: SearchParams;
  /** Limit the listing to a category (and its subcategories). */
  category?: string;
  /** Where "Clear filters" leads. */
  basePath: string;
};

/** Filter sidebar, toolbar, product grid and pagination for shop and category pages. */
export async function ProductListing({ searchParams, category, basePath }: ProductListingProps) {
  const [products, filters] = await Promise.all([
    getProducts(buildProductQuery(searchParams, category)),
    getProductFilters(category),
  ]);

  const { total, current_page, last_page } = products.meta;

  return (
    <ListingNavigationProvider>
      <div className="grid gap-10 lg:grid-cols-[15rem_1fr] xl:gap-14">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-[calc(var(--header-height)+1.5rem)] max-h-[calc(100svh-var(--header-height)-3rem)] overflow-y-auto pr-2 pb-6">
            <FilterPanel filters={filters} />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-6 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {total} {total === 1 ? "product" : "products"}
            </p>
            <div className="flex items-center gap-2">
              <MobileFilters filters={filters} total={total} />
              <SortSelect />
            </div>
          </div>

          <ActiveFilters filters={filters} />

          <ListingResults>
            {products.data.length > 0 ? (
              <>
                <ProductGrid products={products.data} priorityCount={4} className="lg:grid-cols-3" />
                <Pagination currentPage={current_page} lastPage={last_page} />
              </>
            ) : (
              <EmptyState
                icon={SearchX}
                title="No products found"
                description="Try removing a filter or searching for something else."
                action={
                  <Button variant="outline" nativeButton={false} render={<Link href={basePath} />} className="rounded-full">
                    Clear filters
                  </Button>
                }
              />
            )}
          </ListingResults>
        </div>
      </div>
    </ListingNavigationProvider>
  );
}

export function ProductListingSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[15rem_1fr] xl:gap-14">
      <div className="hidden space-y-8 lg:block">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
          </div>
        ))}
      </div>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-40 rounded-full" />
        </div>
        <ProductGridSkeleton count={6} className="lg:grid-cols-3" />
      </div>
    </div>
  );
}
