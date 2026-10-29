"use client";

import { ArrowRight, Banknote, ShoppingBag } from "lucide-react";
import Link from "next/link";

import { CartLine } from "@/components/cart/cart-line";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/format";

export function CartView() {
  const { data: cart, isPlaceholderData } = useCart();

  if (!cart || isPlaceholderData) {
    return (
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className="flex gap-4">
              <Skeleton className="h-36 w-28 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-56 rounded-xl" />
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Browse the shop and add something you love."
        className="py-24"
        action={
          <Button size="lg" nativeButton={false} render={<Link href="/shop" />} className="h-11 rounded-full px-6">
            Start shopping
          </Button>
        }
      />
    );
  }

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
      <ul className="divide-y border-y">
        {cart.items.map((item) => (
          <CartLine key={item.id} item={item} />
        ))}
      </ul>

      <aside className="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start">
        <div className="space-y-4 rounded-xl bg-muted/50 p-6">
          <h2 className="font-display text-2xl">Order summary</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Items ({cart.count})</dt>
              <dd className="tabular-nums">{formatPrice(cart.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="text-muted-foreground">Calculated at checkout</dd>
            </div>
            <div className="flex justify-between border-t pt-3 text-base font-semibold">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(cart.subtotal)}</dd>
            </div>
          </dl>

          {cart.has_unavailable_items && (
            <p className="text-sm text-destructive">Some items are no longer available. Update them to check out.</p>
          )}

          {cart.has_unavailable_items ? (
            <Button disabled className="h-12 w-full rounded-full text-base">
              Checkout
            </Button>
          ) : (
            <Button nativeButton={false} render={<Link href="/checkout" />} className="h-12 w-full gap-2 rounded-full text-base">
              Checkout <ArrowRight data-icon="inline-end" />
            </Button>
          )}

          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Banknote className="size-4 text-brand" /> Pay with cash when your order arrives.
          </p>
        </div>
        <Link href="/shop" className="mt-4 block text-center text-sm underline underline-offset-4">
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
