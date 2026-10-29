import { cacheLife, cacheTag } from "next/cache";

import { API_URL } from "@/lib/api";
import type { Banner, Category, Paginated, Product, ProductCard } from "@/lib/types";

/**
 * Server-side catalog reads, cached with Cache Components.
 *
 * When the API is unreachable, list reads return an empty fallback with the short
 * `seconds` lifetime, which keeps it out of prerendered pages, so builds work
 * without the API running and a failure is never cached for long.
 */

type ApiResult<T> = { status: "ok"; data: T } | { status: "not_found" } | { status: "error" };

async function getJson<T>(path: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_URL}/api${path}`, {
      headers: { Accept: "application/json" },
    });

    if (response.status === 404) return { status: "not_found" };
    if (!response.ok) return { status: "error" };

    return { status: "ok", data: (await response.json()) as T };
  } catch {
    return { status: "error" };
  }
}

/** Raised when the API cannot be reached, so the error page shows instead of a false 404. */
export class CatalogUnavailableError extends Error {
  constructor() {
    super("The catalog is temporarily unavailable.");
    this.name = "CatalogUnavailableError";
  }
}

/** Category tree for the header menu, mobile nav and footer. */
export async function getCategoryTree(): Promise<Category[]> {
  "use cache";
  cacheTag("categories");

  const result = await getJson<{ data: Category[] }>("/categories");

  if (result.status !== "ok") {
    cacheLife("seconds");
    return [];
  }

  cacheLife("hours");
  return result.data.data;
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

  if (result.status !== "ok") {
    cacheLife("seconds");
    return EMPTY_HOME;
  }

  cacheLife("minutes");
  return result.data.data;
}

/**
 * One page of products. `query` is a Laravel query string such as
 * `filter[category]=men&sort=price&page=2` (see buildProductQuery).
 */
export async function getProducts(query: string): Promise<Paginated<ProductCard>> {
  "use cache";
  cacheTag("products");

  const result = await getJson<Paginated<ProductCard>>(`/products?${query}`);

  if (result.status !== "ok") {
    cacheLife("seconds");
    throw new CatalogUnavailableError();
  }

  cacheLife("minutes");
  return result.data;
}

export type ProductFilters = {
  brands: { name: string; slug: string; count: number }[];
  options: Record<string, string[]>;
  price: { min: number; max: number };
};

/** Filter options for the shop sidebar, optionally limited to one category. */
export async function getProductFilters(category?: string): Promise<ProductFilters> {
  "use cache";
  cacheTag("products", "categories");

  const query = category ? `?filter[category]=${encodeURIComponent(category)}` : "";
  const result = await getJson<{ data: ProductFilters }>(`/products/filters${query}`);

  if (result.status !== "ok") {
    cacheLife("seconds");
    return { brands: [], options: {}, price: { min: 0, max: 0 } };
  }

  cacheLife("minutes");
  return result.data.data;
}

/** A category with its parent and children, or null when it doesn't exist. */
export async function getCategory(slug: string): Promise<Category | null> {
  "use cache";
  cacheTag("categories", `category-${slug}`);

  const result = await getJson<{ data: Category }>(`/categories/${encodeURIComponent(slug)}`);

  if (result.status === "error") {
    cacheLife("seconds");
    throw new CatalogUnavailableError();
  }

  cacheLife("hours");
  return result.status === "ok" ? result.data.data : null;
}

/** Full product detail, or null when it doesn't exist or is hidden. */
export async function getProduct(slug: string): Promise<Product | null> {
  "use cache";
  cacheTag("products", `product-${slug}`);

  const result = await getJson<{ data: Product }>(`/products/${encodeURIComponent(slug)}`);

  if (result.status === "error") {
    cacheLife("seconds");
    throw new CatalogUnavailableError();
  }

  cacheLife("minutes");
  return result.status === "ok" ? result.data.data : null;
}

/** "You may also like" products for a product page. */
export async function getRelatedProducts(slug: string): Promise<ProductCard[]> {
  "use cache";
  cacheTag("products", `product-${slug}`);

  const result = await getJson<{ data: ProductCard[] }>(`/products/${encodeURIComponent(slug)}/related`);

  if (result.status !== "ok") {
    cacheLife("seconds");
    return [];
  }

  cacheLife("hours");
  return result.data.data;
}
