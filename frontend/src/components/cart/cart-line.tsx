"use client";

import { Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { Price } from "@/components/product/price";
import { Button } from "@/components/ui/button";
import { useRemoveCartItem, useUpdateCartItem } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/format";
import type { CartItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type CartLineProps = {
  item: CartItem;
  /** Called when the product link is followed, e.g. to close the drawer. */
  onNavigate?: () => void;
  compact?: boolean;
};

export function CartLine({ item, onNavigate, compact = false }: CartLineProps) {
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const options = Object.entries(item.variant.options);
  const busy = update.isPending || remove.isPending;

  return (
    <li className={cn("flex gap-4 py-5", busy && "opacity-60")}>
      <Link
        href={`/product/${item.product.slug}`}
        onClick={onNavigate}
        className={cn("relative shrink-0 overflow-hidden rounded-lg bg-muted", compact ? "h-24 w-20" : "h-32 w-26 sm:h-36 sm:w-28")}
      >
        {item.product.image && <Image src={item.product.image} alt="" fill sizes="112px" className="object-cover" />}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/product/${item.product.slug}`}
              onClick={onNavigate}
              className="line-clamp-2 font-medium hover:underline hover:underline-offset-4"
            >
              {item.product.name}
            </Link>
            {options.length > 0 && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {options.map(([name, value]) => `${name[0].toUpperCase()}${name.slice(1)}: ${value}`).join(" · ")}
              </p>
            )}
            {!compact && (
              <Price price={item.variant.price} currentPrice={item.variant.current_price} size="sm" className="mt-1" />
            )}
          </div>
          <p className="shrink-0 font-semibold tabular-nums">{formatPrice(item.line_total)}</p>
        </div>

        {!item.is_available && (
          <p className="mt-2 text-sm font-medium text-destructive">
            {item.max_quantity > 0
              ? `Only ${item.max_quantity} left. Lower the quantity to continue.`
              : "Out of stock. Please remove it to continue."}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-3">
          <QuantityStepper
            size="sm"
            value={item.quantity}
            max={Math.max(item.max_quantity, 1)}
            disabled={busy || item.max_quantity === 0}
            onChange={(quantity) => update.mutate({ itemId: item.id, quantity })}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => remove.mutate(item.id)}
            disabled={busy}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="size-4" /> Remove
          </Button>
        </div>
      </div>
    </li>
  );
}
