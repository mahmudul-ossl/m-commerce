"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import type { Category } from "@/lib/types";

export function MegaMenu({ categories }: { categories: Category[] }) {
  return (
    <NavigationMenu className="hidden lg:flex">
      <NavigationMenuList className="gap-1">
        <NavigationMenuItem>
          <NavigationMenuLink render={<Link href="/shop" />} className="px-3 font-medium">
            Shop all
          </NavigationMenuLink>
        </NavigationMenuItem>

        {categories.map((category) => (
          <NavigationMenuItem key={category.id}>
            <NavigationMenuTrigger className="bg-transparent font-medium">{category.name}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[min(40rem,90vw)] grid-cols-[1fr_14rem] gap-2 p-2">
                <ul className="grid content-start gap-1 p-2">
                  <li className="px-2 pb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    {category.name}
                  </li>
                  {category.children?.map((child) => (
                    <li key={child.id}>
                      <NavigationMenuLink render={<Link href={`/category/${child.slug}`} />} className="text-[0.95rem]">
                        {child.name}
                      </NavigationMenuLink>
                    </li>
                  ))}
                  <li className="mt-2 border-t pt-2">
                    <NavigationMenuLink
                      render={<Link href={`/category/${category.slug}`} />}
                      className="font-medium text-brand"
                    >
                      Shop all {category.name}
                      <ArrowRight className="ml-auto" />
                    </NavigationMenuLink>
                  </li>
                </ul>

                <NavigationMenuLink
                  render={<Link href={`/category/${category.slug}`} />}
                  className="group/feature relative block aspect-[4/5] overflow-hidden rounded-md p-0"
                >
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt=""
                      fill
                      sizes="224px"
                      className="object-cover transition-transform duration-700 ease-out-expo group-hover/feature:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-muted" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <p className="font-display text-2xl leading-tight">{category.name}</p>
                    <p className="text-xs text-white/80">New season edit</p>
                  </div>
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
