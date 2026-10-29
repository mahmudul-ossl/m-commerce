"use client";

import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useCartStore } from "@/stores/cart-store";

export function CartButton() {
  const { data: cart } = useCart();
  const openDrawer = useCartStore((state) => state.openDrawer);
  const count = cart?.count ?? 0;

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      onClick={openDrawer}
      aria-label={count > 0 ? `Cart, ${count} items` : "Cart"}
      className="relative"
    >
      <ShoppingBag className="size-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex size-[1.15rem] items-center justify-center rounded-full bg-brand text-[0.65rem] font-semibold text-brand-foreground tabular-nums">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Button>
  );
}
