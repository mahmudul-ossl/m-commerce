<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['cart_id', 'product_variant_id', 'quantity'])]
class CartItem extends Model
{
    /** @return BelongsTo<Cart, $this> */
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    /** @return BelongsTo<ProductVariant, $this> */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    /**
     * Whether the item can still be bought: the product and variant are active
     * and there is enough stock for the quantity in the cart.
     *
     * @return Attribute<bool, never>
     */
    protected function isAvailable(): Attribute
    {
        return Attribute::get(fn () => $this->variant->is_active
            && $this->variant->product->is_active
            && $this->variant->stock >= $this->quantity);
    }

    /** @return Attribute<float, never> */
    protected function lineTotal(): Attribute
    {
        return Attribute::get(fn () => round($this->variant->current_price * $this->quantity, 2));
    }
}
