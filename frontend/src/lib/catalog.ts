import { cacheLife, cacheTag } from "next/cache";

import { API_URL } from "@/lib/api";
import type { Banner, Category, ProductCard } from "@/lib/types";

/**
 * Server-side catalog reads, cached with Cache Components.
 *
 * A failed request returns an empty fallback with the short `seconds` lifetime,
 * which keeps it out of prerendered pages, so builds work without the API
 * running and a failure is never cached for long.
 */
async function getJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}/api${path}`, {
      headers: { Accept: "application/json" },
    });

    return response.ok ? ((await response.json()) as T) : null;
  } catch {
    return null;
  }
}

/** Category tree for the header menu, mobile nav and footer. */
export async function getCategoryTree(): Promise<Category[]> {
  "use cache";
  cacheTag("categories");

  const result = await getJson<{ data: Category[] }>("/categories");

  if (!result) {
    cacheLife("seconds");
    return [];
  }

  cacheLife("hours");
  return result.data;
}

export type HomeData = {
  banners: Banner[];
  featured_categories: Category[];
  featured_products: ProductCard[];
  new_arrivals: ProductCard[];
  on_sale: ProductCard[];
};

const EMPTY_HOME: HomeData = {
  banners: [],
  featured_categories: [],
  featured_products: [],
  new_arrivals: [],
  on_sale: [],
};

/** Home page sections. */
export async function getHomeData(): Promise<HomeData> {
  "use cache";
  cacheTag("products", "categories", "banners");

  const result = await getJson<{ data: HomeData }>("/home");

  if (!result) {
    cacheLife("seconds");
    return EMPTY_HOME;
  }

  cacheLife("minutes");
  return result.data;
}
