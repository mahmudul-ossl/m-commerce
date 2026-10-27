<?php

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Compact product shape for grids and carousels.
 *
 * @mixin Product
 */
class ProductCardResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $images = $this->relationLoaded('media') ? $this->getMedia('images') : collect();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'price' => (float) $this->price,
            'sale_price' => $this->sale_price !== null ? (float) $this->sale_price : null,
            'current_price' => $this->current_price,
            'is_on_sale' => $this->is_on_sale,
            'discount_percent' => $this->discount_percent,
            'is_featured' => $this->is_featured,
            'in_stock' => $this->when(isset($this->total_stock), fn () => (int) $this->total_stock > 0),
            'brand' => BrandResource::make($this->whenLoaded('brand')),
            'image' => $images->first() ? MediaResource::make($images->first()) : null,
            'hover_image' => $images->get(1) ? MediaResource::make($images->get(1)) : null,
        ];
    }
}
