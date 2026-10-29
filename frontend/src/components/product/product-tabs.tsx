import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Product } from "@/lib/types";

/** Description, details and delivery information under the product. */
export function ProductTabs({ product }: { product: Product }) {
  return (
    <Tabs defaultValue="description" className="gap-6">
      <TabsList variant="line" className="h-11 w-full justify-start gap-6 border-b group-data-horizontal/tabs:h-11">
        <TabsTrigger value="description" className="flex-none px-0 text-base">
          Description
        </TabsTrigger>
        <TabsTrigger value="details" className="flex-none px-0 text-base">
          Details
        </TabsTrigger>
        <TabsTrigger value="delivery" className="flex-none px-0 text-base">
          Delivery &amp; returns
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="max-w-2xl">
        {product.description ? (
          // Written by store admins in the Laravel admin panel.
          <div
            className="space-y-4 leading-relaxed text-muted-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground [&_ul]:space-y-1.5"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        ) : (
          <p className="text-muted-foreground">{product.short_description}</p>
        )}
      </TabsContent>

      <TabsContent value="details" className="max-w-2xl">
        <dl className="divide-y text-sm">
          {product.brand && <DetailRow label="Brand" value={product.brand.name} />}
          {product.categories && product.categories.length > 0 && (
            <DetailRow label="Category" value={product.categories.map((category) => category.name).join(", ")} />
          )}
          {Object.entries(product.options).map(([name, values]) => (
            <DetailRow key={name} label={name} value={values.join(", ")} />
          ))}
          <DetailRow label="Payment" value="Cash on delivery" />
        </dl>
      </TabsContent>

      <TabsContent value="delivery" className="max-w-2xl space-y-4 leading-relaxed text-muted-foreground">
        <p>
          Orders are delivered within 2–5 working days. You pay in cash when your order arrives, so there&apos;s nothing to pay
          online.
        </p>
        <p>
          Changed your mind? Return unused items with their tags within 7 days of delivery for an exchange or refund.
        </p>
      </TabsContent>
    </Tabs>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-4 py-3">
      <dt className="text-muted-foreground capitalize">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
