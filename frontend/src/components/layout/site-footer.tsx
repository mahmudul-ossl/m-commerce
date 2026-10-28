import { Banknote, RotateCcw, Truck } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { Logo } from "@/components/layout/logo";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { getCategoryTree } from "@/lib/catalog";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "M-Commerce";

const PERKS = [
  { icon: Banknote, title: "Cash on delivery", text: "Pay when your order arrives" },
  { icon: Truck, title: "Nationwide shipping", text: "Delivered to your door" },
  { icon: RotateCcw, title: "Easy returns", text: "7 days to change your mind" },
];

const LINKS = {
  Help: [
    { label: "Track your order", href: "/track-order" },
    { label: "Shipping & delivery", href: "/shipping" },
    { label: "Returns & exchanges", href: "/returns" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact us", href: "/contact" },
  ],
  Company: [
    { label: "About us", href: "/about" },
    { label: "Privacy policy", href: "/privacy" },
    { label: "Terms of service", href: "/terms" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t bg-muted/40">
      <div className="container-page grid gap-6 border-b py-8 sm:grid-cols-3">
        {PERKS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-center gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
              <Icon className="size-5 text-brand" />
            </span>
            <div>
              <p className="font-medium">{title}</p>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-5">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Modern essentials, thoughtfully made. Get new arrivals and offers first.
          </p>
          <NewsletterForm />
        </div>

        <FooterColumn title="Shop">
          <li>
            <FooterLink href="/shop">Shop all</FooterLink>
          </li>
          <Suspense fallback={null}>
            <FooterCategories />
          </Suspense>
        </FooterColumn>

        {Object.entries(LINKS).map(([title, links]) => (
          <FooterColumn key={title} title={title}>
            {links.map((link) => (
              <li key={link.href}>
                <FooterLink href={link.href}>{link.label}</FooterLink>
              </li>
            ))}
          </FooterColumn>
        ))}
      </div>

      <div className="border-t">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CopyrightYear /> {siteName}. All rights reserved.
          </p>
          <p>Payment: Cash on delivery</p>
        </div>
      </div>
    </footer>
  );
}

async function CopyrightYear() {
  "use cache";
  return new Date().getFullYear();
}

async function FooterCategories() {
  const categories = await getCategoryTree();

  return categories.map((category) => (
    <li key={category.id}>
      <FooterLink href={`/category/${category.slug}`}>{category.name}</FooterLink>
    </li>
  ));
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
      {children}
    </Link>
  );
}
