"use client";

import { Banknote, Minus, Plus, RotateCcw, ShoppingBag, Truck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Price } from "@/components/product/price";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "@/hooks/use-cart";
import { swatchColor } from "@/lib/colors";
import type { Product, ProductVariant } from "@/lib/types";
import { cn } from "@/lib/utils";

const MAX_QUANTITY = 10;
const LOW_STOCK = 5;

type Selection = Record<string, string>;

function matches(variant: ProductVariant, selection: Selection, ignore?: string) {
  return Object.entries(selection).every(([name, value]) => name === ignore || variant.options[name] === value);
}

/** Variant picker, stock status, quantity and add-to-cart for the product page. */
export function ProductPurchase({ product }: { product: Product }) {
  const optionNames = Object.keys(product.options);

  // Start on the first in-stock variant so the page opens ready to buy.
  const [selection, setSelection] = useState<Selection>(() => {
    const initial = product.variants.find((variant) => variant.in_stock) ?? product.variants[0];
    return initial ? { ...initial.options } : {};
  });
  const [quantity, setQuantity] = useState(1);

  const variant = useMemo(
    () =>
      optionNames.every((name) => selection[name])
        ? product.variants.find((candidate) => matches(candidate, selection))
        : undefined,
    [optionNames, product.variants, selection],
  );

  const stock = variant?.stock ?? 0;
  const inStock = variant?.in_stock ?? false;
  const maxQuantity = Math.max(1, Math.min(stock, MAX_QUANTITY));

  /** Whether choosing `value` for `name` (keeping the other choices) gives an in-stock variant. */
  const isAvailable = (name: string, value: string) =>
    product.variants.some((candidate) => candidate.in_stock && candidate.options[name] === value && matches(candidate, selection, name));

  const select = (name: string, value: string) => {
    setSelection((current) => ({ ...current, [name]: value }));
    setQuantity(1);
  };

  const add = useAddToCart();
  const addToCart = () => {
    if (!variant) return;
    add.mutate({ variantId: variant.id, quantity }, { onSuccess: () => setQuantity(1) });
  };

  // Show a sticky add-to-cart bar on phones once the main buttons scroll up under the header.
  // A scroll listener (not IntersectionObserver) so jumps like "back to top" also update it.
  const actionsRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) * 16 || 64;

    // Cheap to run on every scroll event; React skips re-rendering when the value is unchanged.
    const update = () => {
      const rect = actionsRef.current?.getBoundingClientRect();
      setShowSticky(rect ? rect.bottom < headerHeight : false);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const price = variant?.price ?? product.price;
  const currentPrice = variant?.current_price ?? product.current_price;
  const buttonLabel = add.isPending ? "Adding…" : !variant ? "Select options" : inStock ? "Add to cart" : "Out of stock";

  return (
    <div className="space-y-7">
      <Price price={price} currentPrice={currentPrice} size="lg" />

      {optionNames.map((name) => (
        <fieldset key={name}>
          <legend className="mb-3 flex w-full items-center justify-between text-sm">
            <span>
              <span className="font-semibold capitalize">{name}</span>
              {selection[name] && <span className="text-muted-foreground">: {selection[name]}</span>}
            </span>
          </legend>
          <div className="flex flex-wrap gap-2.5">
            {product.options[name].map((value) => {
              const active = selection[name] === value;
              const available = isAvailable(name, value);

              return name.toLowerCase() === "color" ? (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  aria-label={`${value}${available ? "" : " (unavailable)"}`}
                  title={value}
                  onClick={() => select(name, value)}
                  className={cn(
                    "relative size-10 rounded-full ring-1 ring-black/15 ring-offset-[3px] ring-offset-background transition-shadow dark:ring-white/20",
                    active && "ring-2 ring-foreground dark:ring-foreground",
                    !available && "opacity-40 after:absolute after:inset-0 after:m-auto after:h-px after:w-full after:rotate-45 after:bg-foreground",
                  )}
                  style={{ backgroundColor: swatchColor(value) }}
                />
              ) : (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  aria-label={`${value}${available ? "" : " (unavailable)"}`}
                  onClick={() => select(name, value)}
                  className={cn(
                    "h-11 min-w-14 rounded-lg border px-4 text-sm transition-colors",
                    active ? "border-primary bg-primary text-primary-foreground" : "hover:border-foreground/40",
                    !available && !active && "text-muted-foreground line-through decoration-1",
                  )}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      <StockStatus variant={variant} />

      <div ref={actionsRef} className="flex gap-3">
        <div className="flex h-12 items-center rounded-full border">
          <Button
            variant="ghost"
            size="icon-lg"
            className="rounded-full"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus />
          </Button>
          <span className="w-8 text-center tabular-nums" aria-live="polite" aria-label={`Quantity ${quantity}`}>
            {quantity}
          </span>
          <Button
            variant="ghost"
            size="icon-lg"
            className="rounded-full"
            onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
            disabled={!inStock || quantity >= maxQuantity}
            aria-label="Increase quantity"
          >
            <Plus />
          </Button>
        </div>
        <Button
          size="lg"
          onClick={addToCart}
          disabled={!inStock || add.isPending}
          className="h-12 flex-1 gap-2 rounded-full text-base"
        >
          <ShoppingBag className="size-5" />
          {buttonLabel}
        </Button>
      </div>

      <ul className="grid gap-3 rounded-xl bg-muted/60 p-4 text-sm">
        <li className="flex items-center gap-3">
          <Banknote className="size-5 text-brand" /> Cash on delivery: pay when it arrives
        </li>
        <li className="flex items-center gap-3">
          <Truck className="size-5 text-brand" /> Delivered in 2–5 working days
        </li>
        <li className="flex items-center gap-3">
          <RotateCcw className="size-5 text-brand" /> Easy returns within 7 days
        </li>
      </ul>

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 p-3 backdrop-blur-xl transition-transform duration-300 md:hidden",
          showSticky ? "translate-y-0" : "translate-y-full",
        )}
        aria-hidden={!showSticky}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{product.name}</p>
            <Price price={price} currentPrice={currentPrice} size="sm" />
          </div>
          <Button
            onClick={addToCart}
            disabled={!inStock || add.isPending}
            tabIndex={showSticky ? 0 : -1}
            className="h-11 gap-2 rounded-full px-5"
          >
            <ShoppingBag className="size-4" />
            {inStock ? "Add to cart" : buttonLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StockStatus({ variant }: { variant?: ProductVariant }) {
  if (!variant) {
    return <p className="text-sm text-muted-foreground">This combination isn&apos;t available.</p>;
  }

  if (!variant.in_stock) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="size-2 rounded-full bg-muted-foreground" /> Out of stock
      </p>
    );
  }

  return (
    <p className="flex items-center gap-2 text-sm">
      <span className={cn("size-2 rounded-full", variant.stock <= LOW_STOCK ? "bg-brand" : "bg-success")} />
      {variant.stock <= LOW_STOCK ? (
        <span className="font-medium text-brand">Only {variant.stock} left</span>
      ) : (
        "In stock, ready to ship"
      )}
    </p>
  );
}
