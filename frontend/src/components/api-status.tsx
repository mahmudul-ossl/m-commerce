"use client";

import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

type Health = { status: string; app: string; time: string };

export function ApiStatus() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["health"],
    queryFn: () => api<Health>("/health"),
    retry: false,
  });

  if (isPending) return <Badge variant="secondary">Checking API…</Badge>;
  if (isError) return <Badge variant="destructive">API unreachable</Badge>;

  return <Badge>API connected · {data.app}</Badge>;
}
