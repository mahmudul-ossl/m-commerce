import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
};

export function SectionHeading({ eyebrow, title, href, linkLabel = "View all", className }: SectionHeadingProps) {
  return (
    <div className={cn("mb-8 flex items-end justify-between gap-4", className)}>
      <div>
        {eyebrow && <p className="mb-2 text-xs font-medium tracking-[0.2em] text-brand uppercase">{eyebrow}</p>}
        <h2 className="font-display text-4xl leading-none sm:text-5xl">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="group/link flex shrink-0 items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
        >
          {linkLabel}
          <ArrowRight className="size-4 transition-transform group-hover/link:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
