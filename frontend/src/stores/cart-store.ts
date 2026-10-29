import { create } from "zustand";

type CartUiState = {
  /** Whether the slide-over cart drawer is open. */
  drawerOpen: boolean;
  openDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
};

export const useCartStore = create<CartUiState>((set) => ({
  drawerOpen: false,
  openDrawer: () => set({ drawerOpen: true }),
  setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
}));
