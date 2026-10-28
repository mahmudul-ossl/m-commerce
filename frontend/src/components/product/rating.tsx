import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

type RatingProps = {
  value: number;
  count?: number;
  className?: string;
};

/** Read-only star rating, e.g. 4.5 stars (12). */
export function Rating({ value, count, className }: RatingProps) {
  const rounded = Math.round(value * 2) / 2;

  return (
    <div className={cn("flex items-center gap-1.5 text-sm", className)}>
      <div className="flex" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => {
          const fill = Math.min(Math.max(rounded - index, 0), 1);
          return (
            <span key={index} className="relative size-4">
              <Star className="absolute inset-0 size-4 text-border" fill="currentColor" strokeWidth={0} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className="size-4 text-amber-500" fill="currentColor" strokeWidth={0} />
              </span>
            </span>
          );
        })}
      </div>
      <span className="sr-only">Rated {rounded} out of 5</span>
      {count !== undefined && <span className="text-muted-foreground">({count})</span>}
    </div>
  );
}
