import { ProductCard } from "@/components/product/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductCard as ProductCardData } from "@/lib/types";
import { cn } from "@/lib/utils";

const gridClass = "grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10";

type ProductGridProps = {
  products: ProductCardData[];
  /** How many cards at the top to load eagerly. */
  priorityCount?: number;
  className?: string;
};

export function ProductGrid({ products, priorityCount = 0, className }: ProductGridProps) {
  return (
    <div className={cn(gridClass, className)}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < priorityCount} />
      ))}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      <Skeleton className="aspect-[4/5] rounded-xl" />
      <div className="mt-3 space-y-2 px-0.5">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8, className }: { count?: number; className?: string }) {
  return (
    <div className={cn(gridClass, className)} aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
