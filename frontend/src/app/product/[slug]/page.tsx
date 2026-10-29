import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid, ProductGridSkeleton } from "@/components/product/product-grid";
import { ProductPurchase } from "@/components/product/product-purchase";
import { ProductTabs } from "@/components/product/product-tabs";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SectionHeading } from "@/components/shared/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { getProduct, getRelatedProducts } from "@/lib/catalog";

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return { title: "Product not found" };

  const image = product.images[0]?.urls.large;

  return {
    title: product.name,
    description: product.short_description ?? undefined,
    openGraph: {
      title: product.name,
      description: product.short_description ?? undefined,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default function ProductPage({ params }: PageProps<"/product/[slug]">) {
  return (
    <div className="container-page pt-6">
      <Suspense fallback={<ProductSkeleton />}>
        {params.then(({ slug }) => (
          <ProductContent slug={slug} />
        ))}
      </Suspense>
    </div>
  );
}

async function ProductContent({ slug }: { slug: string }) {
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          ...(product.categories ?? []).map((category) => ({ label: category.name, href: `/category/${category.slug}` })),
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <ProductGallery
          images={product.images}
          name={product.name}
          badge={
            product.is_on_sale && product.discount_percent ? (
              <span className="rounded-full bg-sale px-3 py-1.5 text-sm font-semibold text-sale-foreground">
                −{product.discount_percent}%
              </span>
            ) : undefined
          }
        />

        <div className="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start">
          {product.brand && (
            <p className="mb-2 text-sm tracking-[0.15em] text-muted-foreground uppercase">{product.brand.name}</p>
          )}
          <h1 className="font-display text-4xl leading-[1.05] sm:text-5xl">{product.name}</h1>
          {product.short_description && <p className="mt-4 text-muted-foreground">{product.short_description}</p>}
          <div className="mt-6">
            <ProductPurchase product={product} />
          </div>
        </div>
      </div>

      <section className="mt-20">
        <ProductTabs product={product} />
      </section>

      <section className="mt-24">
        <SectionHeading eyebrow="More to explore" title="You may also like" />
        <Suspense fallback={<ProductGridSkeleton count={4} />}>
          <RelatedProducts slug={slug} />
        </Suspense>
      </section>
    </>
  );
}

async function RelatedProducts({ slug }: { slug: string }) {
  const related = await getRelatedProducts(slug);
  if (related.length === 0) return <p className="text-muted-foreground">More products coming soon.</p>;

  return <ProductGrid products={related.slice(0, 4)} />;
}

function ProductSkeleton() {
  return (
    <>
      <Skeleton className="h-4 w-64" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <Skeleton className="aspect-[4/5] rounded-2xl" />
        <div className="space-y-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-4/5" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </>
  );
}
