<?php

namespace App\Http\Resources;

use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ProductVariant */
class ProductVariantResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'options' => (object) ($this->options ?? []),
            'price' => $this->effective_price,
            'current_price' => $this->current_price,
            'stock' => $this->stock,
            'in_stock' => $this->in_stock,
        ];
    }
}
