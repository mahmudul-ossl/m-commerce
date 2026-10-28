import Image from "next/image";
import Link from "next/link";

import { Price } from "@/components/product/price";
import type { ProductCard as ProductCardData } from "@/lib/types";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: ProductCardData;
  /** Load the image eagerly, for cards visible without scrolling. */
  priority?: boolean;
  className?: string;
};

export function ProductCard({ product, priority = false, className }: ProductCardProps) {
  const image = product.image?.urls.medium ?? product.image?.urls.original;
  const hoverImage = product.hover_image?.urls.medium ?? product.hover_image?.urls.original;
  const soldOut = product.in_stock === false;

  return (
    <article className={cn("group/card relative flex flex-col", className)}>
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden rounded-xl bg-muted"
        aria-label={product.name}
      >
        {image && (
          <Image
            src={image}
            alt={product.image?.alt ?? product.name}
            fill
            preload={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className={cn(
              "object-cover transition-[opacity,scale] duration-700 ease-out-expo group-hover/card:scale-[1.03]",
              hoverImage && "group-hover/card:opacity-0",
              soldOut && "opacity-60",
            )}
          />
        )}
        {hoverImage && (
          <Image
            src={hoverImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="scale-[1.03] object-cover opacity-0 transition-[opacity,scale] duration-700 ease-out-expo group-hover/card:scale-100 group-hover/card:opacity-100"
          />
        )}

        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {soldOut ? (
            <span className="rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur">Sold out</span>
          ) : (
            product.is_on_sale &&
            product.discount_percent && (
              <span className="rounded-full bg-sale px-2.5 py-1 text-xs font-semibold text-sale-foreground">
                −{product.discount_percent}%
              </span>
            )
          )}
        </div>
      </Link>

      <div className="mt-3 space-y-1 px-0.5">
        {product.brand && (
          <p className="text-xs tracking-wide text-muted-foreground uppercase">{product.brand.name}</p>
        )}
        <h3 className="line-clamp-2 text-[0.95rem] leading-snug font-medium">
          <Link href={`/product/${product.slug}`} className="hover:underline hover:underline-offset-4">
            {product.name}
          </Link>
        </h3>
        <Price price={product.price} currentPrice={product.current_price} size="sm" />
      </div>
    </article>
  );
}
