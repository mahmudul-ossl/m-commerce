/**
 * Shop URLs use the same query parameters as the Laravel API
 * (e.g. /shop?filter[size]=M,L&sort=price), so links work in both places.
 */

export const FILTER_KEYS = ["brand", "size", "color", "min_price", "max_price", "on_sale", "in_stock", "search"] as const;

export type FilterKey = (typeof FILTER_KEYS)[number];

export const SORT_OPTIONS = [
  { value: "-newest", label: "Newest" },
  { value: "price", label: "Price: low to high" },
  { value: "-price", label: "Price: high to low" },
  { value: "name", label: "Name: A to Z" },
] as const;

export const DEFAULT_SORT = "-newest";

export const PER_PAGE = 12;

export type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Read a filter value from page search params, e.g. filterValue(params, "size") → "M,L". */
export function filterValue(params: SearchParams, key: FilterKey): string | undefined {
  return first(params[`filter[${key}]`]) || undefined;
}

/**
 * Build the Laravel query string for a listing page, keeping only known parameters
 * so the cache key stays small and unknown input never reaches the API.
 */
export function buildProductQuery(params: SearchParams, category?: string): string {
  const query = new URLSearchParams();

  if (category) query.set("filter[category]", category);

  for (const key of FILTER_KEYS) {
    const value = filterValue(params, key);
    if (value) query.set(`filter[${key}]`, value);
  }

  const sort = first(params.sort);
  if (sort && SORT_OPTIONS.some((option) => option.value === sort)) query.set("sort", sort);

  const page = Number(first(params.page));
  if (Number.isInteger(page) && page > 1) query.set("page", String(page));

  query.set("per_page", String(PER_PAGE));

  return query.toString();
}
