<?php

namespace App\Http\Resources;

use App\Models\Cart;
use App\Models\CartItem;
use App\Services\CartService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Cart */
class CartResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $items = $this->items;

        return [
            // Guests keep this token and send it back in the X-Cart-Token header.
            'token' => $this->user_id ? null : $this->token,
            'items' => $items->map(fn (CartItem $item) => $this->item($item))->values(),
            'count' => (int) $items->sum('quantity'),
            'subtotal' => round((float) $items->filter->is_available->sum('line_total'), 2),
            'has_unavailable_items' => $items->contains(fn (CartItem $item) => ! $item->is_available),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function item(CartItem $item): array
    {
        $variant = $item->variant;
        $product = $variant->product;
        $image = $product->getFirstMedia('images');

        return [
            'id' => $item->id,
            'quantity' => $item->quantity,
            'line_total' => $item->line_total,
            'is_available' => $item->is_available,
            'max_quantity' => min($variant->stock, CartService::MAX_QUANTITY_PER_ITEM),
            'variant' => [
                'id' => $variant->id,
                'sku' => $variant->sku,
                'options' => (object) ($variant->options ?? []),
                'price' => $variant->effective_price,
                'current_price' => $variant->current_price,
                'stock' => $variant->stock,
            ],
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'image' => $image?->getUrl('thumb'),
            ],
        ];
    }
}
