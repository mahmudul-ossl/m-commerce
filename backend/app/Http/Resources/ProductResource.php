<?php

namespace App\Http\Resources;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;

/**
 * Full product detail for the product page.
 *
 * @mixin Product
 */
class ProductResource extends ProductCardResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $variants = $this->variants->where('is_active', true)->values();

        return [
            ...parent::toArray($request),
            'short_description' => $this->short_description,
            'description' => $this->description,
            'in_stock' => $variants->contains(fn (ProductVariant $variant) => $variant->in_stock),
            'images' => MediaResource::collection($this->getMedia('images')),
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),
            'options' => $this->optionValues($variants),
            'variants' => ProductVariantResource::collection($variants),
        ];
    }

    /**
     * Distinct values for each option, e.g. {"size": ["S", "M"], "color": ["Black"]},
     * in the order the variants are sorted.
     *
     * @param  iterable<ProductVariant>  $variants
     * @return array<string, list<string>>
     */
    private function optionValues(iterable $variants): array
    {
        $options = [];

        foreach ($variants as $variant) {
            foreach ($variant->options ?? [] as $name => $value) {
                $options[$name] ??= [];

                if (! in_array($value, $options[$name], true)) {
                    $options[$name][] = $value;
                }
            }
        }

        return $options;
    }
}
