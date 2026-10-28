import { Compass } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <EmptyState
      icon={Compass}
      title="Page not found"
      description="The page you're looking for has moved or doesn't exist yet."
      className="py-32"
      action={
        <Button size="lg" nativeButton={false} render={<Link href="/shop" />} className="h-11 rounded-full px-6">
          Continue shopping
        </Button>
      }
    />
  );
}
