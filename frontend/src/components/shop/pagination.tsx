"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { useListingNavigation } from "@/components/shop/listing-navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Page numbers to show, with null for a gap: 1 … 4 5 6 … 12. */
function pageList(current: number, last: number): (number | null)[] {
  const pages = new Set([1, last, current - 1, current, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= last).sort((a, b) => a - b);

  return sorted.flatMap((page, index) => (index > 0 && page - sorted[index - 1] > 1 ? [null, page] : [page]));
}

export function Pagination({ currentPage, lastPage }: { currentPage: number; lastPage: number }) {
  const { update } = useListingNavigation();

  if (lastPage <= 1) return null;

  const goTo = (page: number) => {
    update((next) => (page > 1 ? next.set("page", String(page)) : next.delete("page")), { keepPage: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-1.5">
      <Button
        variant="ghost"
        size="icon-lg"
        disabled={currentPage <= 1}
        onClick={() => goTo(currentPage - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft />
      </Button>
      {pageList(currentPage, lastPage).map((page, index) =>
        page === null ? (
          <span key={`gap-${index}`} className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "ghost"}
            size="icon-lg"
            aria-current={page === currentPage ? "page" : undefined}
            onClick={() => goTo(page)}
            className={cn("tabular-nums", page === currentPage && "pointer-events-none")}
          >
            {page}
          </Button>
        ),
      )}
      <Button
        variant="ghost"
        size="icon-lg"
        disabled={currentPage >= lastPage}
        onClick={() => goTo(currentPage + 1)}
        aria-label="Next page"
      >
        <ChevronRight />
      </Button>
    </nav>
  );
}
