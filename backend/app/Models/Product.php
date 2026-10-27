<?php

namespace App\Models;

use App\Models\Concerns\HasSlug;
use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * @property-read int|string|null $total_stock Sum of active variant stock, when loaded with withSum().
 */
#[Fillable([
    'brand_id', 'name', 'slug', 'short_description', 'description',
    'price', 'sale_price', 'is_active', 'is_featured',
])]
class Product extends Model implements HasMedia
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory, HasSlug, InteractsWithMedia;

    /**
     * SQL for the price a customer actually pays, used for price filters and sorting.
     */
    public const EFFECTIVE_PRICE_SQL = 'COALESCE(products.sale_price, products.price)';

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }

    /** @return BelongsTo<Brand, $this> */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    /** @return BelongsToMany<Category, $this> */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    /** @return HasMany<ProductVariant, $this> */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->orderBy('sort_order');
    }

    /** @param Builder<Product> $query */
    #[Scope]
    protected function active(Builder $query): void
    {
        $query->where('products.is_active', true);
    }

    /**
     * The price the customer pays: the sale price when set, otherwise the regular price.
     *
     * @return Attribute<float, never>
     */
    protected function currentPrice(): Attribute
    {
        return Attribute::get(fn () => (float) ($this->sale_price ?? $this->price));
    }

    /** @return Attribute<bool, never> */
    protected function isOnSale(): Attribute
    {
        return Attribute::get(fn () => $this->sale_price !== null && (float) $this->sale_price < (float) $this->price);
    }

    /** @return Attribute<int|null, never> */
    protected function discountPercent(): Attribute
    {
        return Attribute::get(fn () => $this->is_on_sale
            ? (int) round((1 - (float) $this->sale_price / (float) $this->price) * 100)
            : null);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('images');
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        // Product photos use a 4:5 portrait ratio across the storefront.
        $this->addMediaConversion('thumb')->fit(Fit::Crop, 400, 500)->format('webp');
        $this->addMediaConversion('medium')->fit(Fit::Crop, 800, 1000)->format('webp');
        $this->addMediaConversion('large')->fit(Fit::Max, 1600, 2000)->format('webp');
    }
}
