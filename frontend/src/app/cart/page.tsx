import type { Metadata } from "next";

import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Your cart",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className="container-page pt-8">
      <h1 className="font-display text-5xl leading-none sm:text-6xl">Your cart</h1>
      <CartView />
    </div>
  );
}
