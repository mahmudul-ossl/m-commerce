"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const SUGGESTIONS = ["Linen", "Sneakers", "Dress", "Watch"];

export function SearchButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  function search(term: string) {
    const value = term.trim();
    if (!value) return;
    setOpen(false);
    router.push(`/shop?filter[search]=${encodeURIComponent(value)}`);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon-lg" aria-label="Search" />}>
        <Search className="size-5" />
      </SheetTrigger>
      <SheetContent side="top" className="pb-8">
        <div className="container-page pt-6">
          <SheetTitle className="mb-4 font-display text-3xl font-normal">What are you looking for?</SheetTitle>
          <form
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              search(query);
            }}
            className="relative"
          >
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              type="search"
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
              className="h-14 rounded-full pl-12 text-base md:text-base"
            />
          </form>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Popular:</span>
            {SUGGESTIONS.map((term) => (
              <Button key={term} variant="outline" size="sm" className="rounded-full" onClick={() => search(term)}>
                {term}
              </Button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
