"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api, ApiError, setCartToken } from "@/lib/api";
import type { Cart } from "@/lib/types";
import { useCartStore } from "@/stores/cart-store";

export const cartKey = ["cart"] as const;

const EMPTY_CART: Cart = { token: null, items: [], count: 0, subtotal: 0, has_unavailable_items: false };

async function fetchCart(): Promise<Cart> {
  const { data } = await api<{ data: Cart }>("/cart");
  return data;
}

/** The current visitor's cart (guest or account). */
export function useCart() {
  return useQuery({
    queryKey: cartKey,
    queryFn: fetchCart,
    staleTime: 30 * 1000,
    placeholderData: EMPTY_CART,
  });
}

/** Store the server's cart in the query cache and remember a new guest token. */
function useApplyCart() {
  const queryClient = useQueryClient();

  return (cart: Cart) => {
    if (cart.token) setCartToken(cart.token);
    queryClient.setQueryData(cartKey, cart);
  };
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return Object.values(error.errors)[0]?.[0] ?? error.message;
  }
  return "Something went wrong. Please try again.";
}

export function useAddToCart() {
  const applyCart = useApplyCart();
  const openDrawer = useCartStore((state) => state.openDrawer);

  return useMutation({
    mutationFn: (input: { variantId: number; quantity: number }) =>
      api<{ data: Cart }>("/cart/items", {
        method: "POST",
        body: { variant_id: input.variantId, quantity: input.quantity },
      }),
    onSuccess: ({ data }) => {
      applyCart(data);
      openDrawer();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useUpdateCartItem() {
  const applyCart = useApplyCart();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { itemId: number; quantity: number }) =>
      api<{ data: Cart }>(`/cart/items/${input.itemId}`, { method: "PATCH", body: { quantity: input.quantity } }),
    onSuccess: ({ data }) => applyCart(data),
    onError: (error) => {
      toast.error(errorMessage(error));
      queryClient.invalidateQueries({ queryKey: cartKey });
    },
  });
}

export function useRemoveCartItem() {
  const applyCart = useApplyCart();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: number) => api<{ data: Cart }>(`/cart/items/${itemId}`, { method: "DELETE" }),
    // Remove the line straight away; the server response replaces this guess.
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: cartKey });
      const previous = queryClient.getQueryData<Cart>(cartKey);
      if (previous) {
        const items = previous.items.filter((item) => item.id !== itemId);
        queryClient.setQueryData<Cart>(cartKey, {
          ...previous,
          items,
          count: items.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: items.filter((item) => item.is_available).reduce((sum, item) => sum + item.line_total, 0),
        });
      }
      return { previous };
    },
    onSuccess: ({ data }) => applyCart(data),
    onError: (error, _itemId, context) => {
      if (context?.previous) queryClient.setQueryData(cartKey, context.previous);
      toast.error(errorMessage(error));
    },
  });
}
