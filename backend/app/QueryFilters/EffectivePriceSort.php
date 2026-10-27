<?php

namespace App\QueryFilters;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\Sorts\Sort;

/**
 * Sorts by the price the customer pays (sale price when set).
 *
 * @implements Sort<Product>
 */
class EffectivePriceSort implements Sort
{
    public function __invoke(Builder $query, bool $descending, string $property): void
    {
        $query->orderByRaw(Product::EFFECTIVE_PRICE_SQL.($descending ? ' DESC' : ' ASC'));
    }
}
