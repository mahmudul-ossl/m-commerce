"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";

export function CartButton() {
  const count = useCartStore((state) => state.count);

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      nativeButton={false}
      render={<Link href="/cart" />}
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
