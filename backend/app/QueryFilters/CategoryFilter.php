<?php

namespace App\QueryFilters;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\Filters\Filter;

/**
 * Filters products by category slug, including products in its subcategories.
 *
 * @implements Filter<Product>
 */
class CategoryFilter implements Filter
{
    public function __invoke(Builder $query, mixed $value, string $property): void
    {
        $categoryIds = Category::query()
            ->active()
            ->whereIn('slug', (array) $value)
            ->get()
            ->flatMap(fn (Category $category) => $category->selfAndDescendantIds())
            ->unique()
            ->all();

        $query->whereHas('categories', fn (Builder $categories) => $categories->whereIn('categories.id', $categoryIds));
    }
}
