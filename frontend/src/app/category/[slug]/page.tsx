import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Breadcrumbs, type Crumb } from "@/components/shared/breadcrumbs";
import { ProductListing, ProductListingSkeleton } from "@/components/shop/product-listing";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategory } from "@/lib/catalog";
import type { SearchParams } from "@/lib/product-query";
import type { Category } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const category = await getCategory((await params).slug);

  return category
    ? { title: category.name, description: category.description ?? `Shop ${category.name}.` }
    : { title: "Category not found" };
}

export default function CategoryPage({ params, searchParams }: PageProps<"/category/[slug]">) {
  return (
    <div className="container-page pt-6 pb-8">
      <Suspense fallback={<CategorySkeleton />}>
        {Promise.all([params, searchParams]).then(([{ slug }, query]) => (
          <CategoryContent slug={slug} searchParams={query} />
        ))}
      </Suspense>
    </div>
  );
}

async function CategoryContent({ slug, searchParams }: { slug: string; searchParams: SearchParams }) {
  const category = await getCategory(slug);
  if (!category) notFound();

  const siblings = category.children?.length ? category.children : [];

  return (
    <>
      <Breadcrumbs items={crumbs(category)} />
      <header className="mt-6 mb-10">
        <h1 className="font-display text-5xl leading-none sm:text-6xl">{category.name}</h1>
        {category.description && <p className="mt-3 max-w-xl text-muted-foreground">{category.description}</p>}

        {siblings.length > 0 && (
          <div className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
            {siblings.map((child) => (
              <Link
                key={child.id}
                href={`/category/${child.slug}`}
                className="h-9 shrink-0 rounded-full border px-4 text-sm leading-9 transition-colors hover:border-foreground/40 hover:bg-muted"
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}
      </header>
      <ProductListing searchParams={searchParams} category={category.slug} basePath={`/category/${category.slug}`} />
    </>
  );
}

function crumbs(category: Category): Crumb[] {
  const items: Crumb[] = [{ label: category.name }];
  for (let parent = category.parent; parent; parent = parent.parent) {
    items.unshift({ label: parent.name, href: `/category/${parent.slug}` });
  }
  return [{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, ...items];
}

function CategorySkeleton() {
  return (
    <>
      <Skeleton className="h-4 w-48" />
      <div className="mt-6 mb-10 space-y-3">
        <Skeleton className="h-14 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <ProductListingSkeleton />
    </>
  );
}
