<?php

namespace App\Models;

use Database\Factories\ProductVariantFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property array<string, string>|null $options e.g. {"size": "M", "color": "Black"}
 */
#[Fillable(['product_id', 'sku', 'options', 'price', 'sale_price', 'stock', 'is_active', 'sort_order'])]
class ProductVariant extends Model
{
    /** @use HasFactory<ProductVariantFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Regular price, falling back to the product's price.
     *
     * @return Attribute<float, never>
     */
    protected function effectivePrice(): Attribute
    {
        return Attribute::get(fn () => (float) ($this->price ?? $this->product->price));
    }

    /**
     * The price the customer pays for this variant.
     *
     * @return Attribute<float, never>
     */
    protected function currentPrice(): Attribute
    {
        return Attribute::get(function () {
            if ($this->price !== null) {
                return (float) ($this->sale_price ?? $this->price);
            }

            return $this->sale_price !== null ? (float) $this->sale_price : $this->product->current_price;
        });
    }

    /** @return Attribute<bool, never> */
    protected function inStock(): Attribute
    {
        return Attribute::get(fn () => $this->is_active && $this->stock > 0);
    }
}
