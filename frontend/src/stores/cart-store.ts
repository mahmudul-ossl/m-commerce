import { create } from "zustand";

type CartState = {
  /** Number of items in the cart, shown on the header badge. Filled in Phase 4. */
  count: number;
  setCount: (count: number) => void;
};

export const useCartStore = create<CartState>((set) => ({
  count: 0,
  setCount: (count) => set({ count }),
}));
