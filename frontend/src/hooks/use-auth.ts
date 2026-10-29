"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cartKey } from "@/hooks/use-cart";
import { api, ApiError, getCartToken, setCartToken } from "@/lib/api";
import type { User } from "@/lib/types";

export const userKey = ["user"] as const;

/** The signed-in customer, or null for guests. */
export function useUser() {
  return useQuery({
    queryKey: userKey,
    queryFn: async () => {
      try {
        const { data } = await api<{ data: User }>("/user");
        return data;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

/** After signing in or out, refresh the user and their cart. */
function useSessionChanged() {
  const queryClient = useQueryClient();

  return async (user: User | null) => {
    // The guest cart was merged into the account (or the session ended); stop sending its token.
    setCartToken(null);
    queryClient.setQueryData(userKey, user);
    await queryClient.invalidateQueries({ queryKey: cartKey });
  };
}

export type LoginInput = { email: string; password: string; remember?: boolean };

export function useLogin() {
  const sessionChanged = useSessionChanged();

  return useMutation({
    mutationFn: (input: LoginInput) =>
      api<{ data: User }>("/auth/login", { method: "POST", body: { ...input, cart_token: getCartToken() } }),
    onSuccess: ({ data }) => sessionChanged(data),
  });
}

export type RegisterInput = {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
};

export function useRegister() {
  const sessionChanged = useSessionChanged();

  return useMutation({
    mutationFn: (input: RegisterInput) =>
      api<{ data: User }>("/auth/register", { method: "POST", body: { ...input, cart_token: getCartToken() } }),
    onSuccess: ({ data }) => sessionChanged(data),
  });
}

export function useLogout() {
  const sessionChanged = useSessionChanged();

  return useMutation({
    mutationFn: () => api<void>("/auth/logout", { method: "POST" }),
    onSettled: () => sessionChanged(null),
  });
}
