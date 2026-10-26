export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

const MUTATING_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/**
 * Fetch the Sanctum CSRF cookie. Required once before any
 * state-changing request from the browser (login, cart, checkout).
 */
export async function ensureCsrfCookie(): Promise<void> {
  if (readCookie("XSRF-TOKEN")) return;
  await fetch(`${API_URL}/sanctum/csrf-cookie`, { credentials: "include" });
}

/**
 * Call the Laravel API. `path` is relative to `/api`, e.g. `api("/products")`.
 */
export async function api<T>(path: string, { body, headers, ...init }: ApiOptions = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();

  if (MUTATING_METHODS.includes(method)) {
    await ensureCsrfCookie();
  }

  const xsrfToken = readCookie("XSRF-TOKEN");

  const response = await fetch(`${API_URL}/api${path}`, {
    ...init,
    method,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body !== undefined && { "Content-Type": "application/json" }),
      ...(xsrfToken && { "X-XSRF-TOKEN": xsrfToken }),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.message ?? response.statusText, response.status, data.errors);
  }

  return data as T;
}
