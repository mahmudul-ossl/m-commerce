<?php

namespace App\QueryFilters;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\Filters\Filter;

/**
 * Filters products that have an active variant with the given option value,
 * e.g. filter[size]=M,L or filter[color]=Black.
 *
 * @implements Filter<Product>
 */
class VariantOptionFilter implements Filter
{
    public function __invoke(Builder $query, mixed $value, string $property): void
    {
        $query->whereHas('variants', fn (Builder $variants) => $variants
            ->where('is_active', true)
            ->whereIn("options->{$property}", (array) $value));
    }
}
