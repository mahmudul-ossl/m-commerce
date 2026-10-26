import { ApiStatus } from "@/components/api-status";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <ApiStatus />
      <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">M-Commerce</h1>
      <p className="max-w-md text-muted-foreground">
        Storefront coming soon. Phase 0 setup is complete.
      </p>
    </main>
  );
}
