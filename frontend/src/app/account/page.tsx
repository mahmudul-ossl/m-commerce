import type { Metadata } from "next";

import { AccountOverview } from "@/components/account/account-overview";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default function AccountPage() {
  return (
    <div className="container-page max-w-3xl pt-8">
      <h1 className="font-display text-5xl leading-none sm:text-6xl">My account</h1>
      <div className="mt-10">
        <AccountOverview />
      </div>
    </div>
  );
}
