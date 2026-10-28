import { UserRound } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function AccountButton() {
  return (
    <Button
      variant="ghost"
      size="icon-lg"
      nativeButton={false}
      render={<Link href="/login" />}
      aria-label="Account"
      className="hidden sm:inline-flex"
    >
      <UserRound className="size-5" />
    </Button>
  );
}
