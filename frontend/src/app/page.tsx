import { ArrowRight, PackageOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { ProductGrid, ProductGridSkeleton } from "@/components/product/product-grid";
import { EmptyState } from "@/components/shared/empty-state";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getHomeData } from "@/lib/catalog";

export default function Home() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const home = await getHomeData();
  const hero = home.banners[0];

  if (!hero && home.new_arrivals.length === 0) {
    return (
      <EmptyState
        icon={PackageOpen}
        title="The store is getting ready"
        description="Products will appear here soon. Please check back shortly."
        className="py-32"
      />
    );
  }

  return (
    <>
      {hero && (
        <section className="container-page pt-4 sm:pt-6">
          <div className="relative isolate flex min-h-[62svh] items-end overflow-hidden rounded-2xl bg-muted sm:min-h-[560px]">
            {hero.image && (
              <Image
                src={hero.image.urls.large ?? hero.image.urls.original}
                alt=""
                fill
                preload
                sizes="(min-width: 1280px) 1216px, 100vw"
                className="-z-10 object-cover"
              />
            )}
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <Reveal onLoad delay={0.1} className="max-w-2xl p-6 text-white sm:p-12">
              <p className="mb-4 text-xs font-medium tracking-[0.25em] uppercase text-white/80">New collection</p>
              <h1 className="font-display text-5xl leading-[0.95] sm:text-7xl">{hero.title}</h1>
              {hero.subtitle && <p className="mt-4 max-w-md text-base text-white/85 sm:text-lg">{hero.subtitle}</p>}
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href={hero.link ?? "/shop"} />}
                className="mt-8 h-12 rounded-full bg-white px-7 text-base text-black hover:bg-white/90"
              >
                {hero.button_text ?? "Shop now"}
                <ArrowRight data-icon="inline-end" />
              </Button>
            </Reveal>
          </div>
        </section>
      )}

      {home.featured_categories.length > 0 && (
        <section className="container-page mt-20">
          <SectionHeading eyebrow="Browse" title="Shop by category" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {home.featured_categories.map((category, index) => (
              <Reveal key={category.id} delay={index * 0.06}>
                <Link
                  href={`/category/${category.slug}`}
                  className="group/cat relative block aspect-[4/5] overflow-hidden rounded-xl bg-muted"
                >
                  {category.image && (
                    <Image
                      src={category.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover transition-transform duration-700 ease-out-expo group-hover/cat:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-white sm:p-5">
                    <span className="font-display text-2xl sm:text-3xl">{category.name}</span>
                    <ArrowRight className="size-5 -translate-x-1 opacity-0 transition-all group-hover/cat:translate-x-0 group-hover/cat:opacity-100" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {home.new_arrivals.length > 0 && (
        <section className="container-page mt-24">
          <Reveal>
            <SectionHeading eyebrow="Just in" title="New arrivals" href="/shop" />
          </Reveal>
          <ProductGrid products={home.new_arrivals} priorityCount={4} />
        </section>
      )}

      {home.on_sale.length > 0 && (
        <section className="container-page mt-24">
          <Reveal>
            <SectionHeading eyebrow="Limited time" title="On sale" href="/shop?filter[on_sale]=1" />
          </Reveal>
          <ProductGrid products={home.on_sale.slice(0, 4)} />
        </section>
      )}
    </>
  );
}

function HomeSkeleton() {
  return (
    <>
      <div className="container-page pt-4 sm:pt-6">
        <Skeleton className="min-h-[62svh] rounded-2xl sm:min-h-[560px]" />
      </div>
      <div className="container-page mt-24">
        <Skeleton className="mb-8 h-12 w-64" />
        <ProductGridSkeleton count={4} />
      </div>
    </>
  );
}
