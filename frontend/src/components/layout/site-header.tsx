import { Suspense } from "react";

import { AccountButton } from "@/components/layout/account-button";
import { CartButton } from "@/components/layout/cart-button";
import { HeaderShell } from "@/components/layout/header-shell";
import { Logo } from "@/components/layout/logo";
import { MegaMenu } from "@/components/layout/mega-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchButton } from "@/components/layout/search-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { getCategoryTree } from "@/lib/catalog";

export function SiteHeader() {
  return (
    <>
      <div className="bg-primary px-4 py-2 text-center text-xs text-primary-foreground sm:text-[0.8rem]">
        Cash on delivery nationwide · Easy 7-day returns
      </div>
      <HeaderShell>
        <div className="container-page flex h-(--header-height) items-center gap-2">
          <div className="flex flex-1 items-center gap-1 lg:flex-none lg:gap-8">
            <Suspense fallback={<MobileNav categories={[]} />}>
              <CategoryNav variant="mobile" />
            </Suspense>
            <Logo />
          </div>

          <div className="hidden flex-1 justify-center lg:flex">
            <Suspense fallback={null}>
              <CategoryNav variant="desktop" />
            </Suspense>
          </div>

          <div className="flex flex-1 items-center justify-end gap-0.5 lg:flex-none">
            <SearchButton />
            <ThemeToggle />
            <AccountButton />
            <CartButton />
          </div>
        </div>
      </HeaderShell>
    </>
  );
}

async function CategoryNav({ variant }: { variant: "mobile" | "desktop" }) {
  const categories = await getCategoryTree();

  return variant === "mobile" ? <MobileNav categories={categories} /> : <MegaMenu categories={categories} />;
}
