<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Product;
use App\Models\ProductVariant;
use App\QueryFilters\CategoryFilter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductFilterController extends Controller
{
    /**
     * Filter options for the shop sidebar: brands, option values and price range
     * of the active products, optionally limited to filter[category].
     */
    public function __invoke(Request $request): JsonResponse
    {
        $products = Product::query()->active();

        if ($category = $request->input('filter.category')) {
            (new CategoryFilter)($products, explode(',', (string) $category), 'category');
        }

        $productIds = $products->pluck('products.id');

        $brands = Brand::query()
            ->active()
            ->whereHas('products', fn (Builder $query) => $query->whereIn('products.id', $productIds))
            ->withCount(['products' => fn (Builder $query) => $query->whereIn('products.id', $productIds)])
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);

        $options = [];

        ProductVariant::query()
            ->where('is_active', true)
            ->whereIn('product_id', $productIds)
            ->orderBy('sort_order')
            ->pluck('options')
            ->each(function (?array $variantOptions) use (&$options) {
                foreach ($variantOptions ?? [] as $name => $value) {
                    $options[$name][$value] = true;
                }
            });

        $prices = Product::query()
            ->whereIn('id', $productIds)
            ->selectRaw('MIN('.Product::EFFECTIVE_PRICE_SQL.') as min, MAX('.Product::EFFECTIVE_PRICE_SQL.') as max')
            ->first();

        return response()->json([
            'data' => [
                'brands' => $brands->map(fn (Brand $brand) => [
                    'name' => $brand->name,
                    'slug' => $brand->slug,
                    'count' => $brand->products_count,
                ]),
                'options' => array_map(fn (array $values) => array_keys($values), $options),
                'price' => [
                    'min' => (float) ($prices->min ?? 0),
                    'max' => (float) ($prices->max ?? 0),
                ],
            ],
        ]);
    }
}
