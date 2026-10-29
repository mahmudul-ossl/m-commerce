import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import { ApiError } from "@/lib/api";

/**
 * Show Laravel validation errors (422) next to the matching form fields.
 * Returns a general message for anything that isn't a field error.
 */
export function applyServerErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>): string | null {
  if (error instanceof ApiError && error.status === 422 && Object.keys(error.errors).length > 0) {
    for (const [field, messages] of Object.entries(error.errors)) {
      setError(field as Path<T>, { type: "server", message: messages[0] });
    }
    return null;
  }

  if (error instanceof ApiError && error.status === 429) {
    return "Too many attempts. Please wait a minute and try again.";
  }

  return "Something went wrong. Please try again.";
}

/** Only allow redirects to paths on this site, never to another domain. */
export function safeRedirect(value: string | null, fallback = "/account"): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}
