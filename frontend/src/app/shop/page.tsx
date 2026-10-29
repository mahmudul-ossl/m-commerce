import type { Metadata } from "next";
import { Suspense } from "react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ProductListing, ProductListingSkeleton } from "@/components/shop/product-listing";
import { Skeleton } from "@/components/ui/skeleton";
import { filterValue, type SearchParams } from "@/lib/product-query";

export async function generateMetadata({ searchParams }: PageProps<"/shop">): Promise<Metadata> {
  const search = filterValue(await searchParams, "search");

  return {
    title: search ? `Search: ${search}` : "Shop all",
    description: "Browse our full collection. Cash on delivery nationwide.",
  };
}

export default function ShopPage({ searchParams }: PageProps<"/shop">) {
  return (
    <div className="container-page pt-6 pb-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />
      <Suspense fallback={<ShopSkeleton />}>
        {searchParams.then((params) => (
          <ShopContent searchParams={params} />
        ))}
      </Suspense>
    </div>
  );
}

function ShopContent({ searchParams }: { searchParams: SearchParams }) {
  const search = filterValue(searchParams, "search");
  const onSale = filterValue(searchParams, "on_sale");

  return (
    <>
      <header className="mt-6 mb-10">
        <h1 className="font-display text-5xl leading-none sm:text-6xl">
          {search ? <>Results for “{search}”</> : onSale ? "On sale" : "Shop all"}
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          {search ? "Products matching your search." : "Modern essentials for every day. Pay cash when your order arrives."}
        </p>
      </header>
      <ProductListing searchParams={searchParams} basePath="/shop" />
    </>
  );
}

function ShopSkeleton() {
  return (
    <>
      <div className="mt-6 mb-10 space-y-3">
        <Skeleton className="h-14 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <ProductListingSkeleton />
    </>
  );
}
