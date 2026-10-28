import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type PriceProps = {
  price: number;
  currentPrice: number;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-2xl",
};

/** Current price, with the original price struck through when on sale. */
export function Price({ price, currentPrice, size = "md", className }: PriceProps) {
  const onSale = currentPrice < price;

  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2 tabular-nums", sizes[size], className)}>
      <span className={cn("font-semibold", onSale && "text-sale")}>
        {onSale && <span className="sr-only">Sale price </span>}
        {formatPrice(currentPrice)}
      </span>
      {onSale && (
        <s className="text-[0.85em] text-muted-foreground">
          <span className="sr-only">Original price </span>
          {formatPrice(price)}
        </s>
      )}
    </p>
  );
}
