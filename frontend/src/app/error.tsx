"use client";

import { RefreshCw, WifiOff } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <EmptyState
      icon={WifiOff}
      title="Something went wrong"
      description="We couldn't load this page right now. Please try again in a moment."
      className="py-32"
      action={
        <Button size="lg" onClick={reset} className="h-11 gap-2 rounded-full px-6">
          <RefreshCw /> Try again
        </Button>
      }
    />
  );
}
