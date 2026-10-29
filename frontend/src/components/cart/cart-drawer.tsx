"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";

import { CartLine } from "@/components/cart/cart-line";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";

export function CartDrawer() {
  const open = useCartStore((state) => state.drawerOpen);
  const setOpen = useCartStore((state) => state.setDrawerOpen);
  const { data: cart } = useCart();
  const close = () => setOpen(false);

  const items = cart?.items ?? [];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <div className="flex h-(--header-height) items-center border-b px-5">
          <SheetTitle className="font-display text-2xl font-normal">
            Your cart {cart && cart.count > 0 && <span className="text-muted-foreground">({cart.count})</span>}
          </SheetTitle>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span className="mb-5 flex size-16 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="size-7 text-muted-foreground" />
            </span>
            <p className="font-display text-2xl">Your cart is empty</p>
            <p className="mt-2 text-sm text-muted-foreground">Find something you love and it will show up here.</p>
            <Button nativeButton={false} render={<Link href="/shop" />} onClick={close} className="mt-6 h-11 rounded-full px-6">
              Start shopping
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y overflow-y-auto px-5">
              {items.map((item) => (
                <CartLine key={item.id} item={item} onNavigate={close} compact />
              ))}
            </ul>

            <div className="space-y-4 border-t bg-muted/40 p-5">
              <div className="flex items-center justify-between text-base">
                <span>Subtotal</span>
                <span className="font-semibold tabular-nums">{formatPrice(cart?.subtotal ?? 0)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Delivery fee is added at checkout. Pay cash on delivery.</p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={<Link href="/cart" />}
                  onClick={close}
                  className="h-12 rounded-full"
                >
                  View cart
                </Button>
                <Button
                  nativeButton={false}
                  render={<Link href="/checkout" />}
                  onClick={close}
                  className="h-12 rounded-full"
                  aria-disabled={cart?.has_unavailable_items}
                >
                  Checkout
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
