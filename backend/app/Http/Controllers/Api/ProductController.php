<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductCardResource;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\QueryFilters\CategoryFilter;
use App\QueryFilters\EffectivePriceSort;
use App\QueryFilters\VariantOptionFilter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedSort;
use Spatie\QueryBuilder\Enums\SortDirection;
use Spatie\QueryBuilder\QueryBuilder;

class ProductController extends Controller
{
    private const DEFAULT_PER_PAGE = 12;

    private const MAX_PER_PAGE = 48;

    /**
     * Product listing with filters, sorting and pagination.
     *
     * Filters: filter[category], filter[brand], filter[min_price], filter[max_price],
     * filter[size], filter[color], filter[search], filter[featured], filter[on_sale], filter[in_stock].
     * Sorts: price, -price, newest, -newest, name, -name.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $newest = AllowedSort::field('newest', 'created_at');

        $perPage = min(max((int) $request->integer('per_page', self::DEFAULT_PER_PAGE), 1), self::MAX_PER_PAGE);

        $products = QueryBuilder::for(self::cardQuery())
            ->allowedFilters(
                AllowedFilter::custom('category', new CategoryFilter),
                AllowedFilter::callback('brand', fn (Builder $query, mixed $value) => $query
                    ->whereHas('brand', fn (Builder $brand) => $brand->whereIn('slug', (array) $value))),
                AllowedFilter::callback('min_price', fn (Builder $query, mixed $value) => $query
                    ->whereRaw(Product::EFFECTIVE_PRICE_SQL.' >= CAST(? AS DECIMAL(10,2))', [(float) $value])),
                AllowedFilter::callback('max_price', fn (Builder $query, mixed $value) => $query
                    ->whereRaw(Product::EFFECTIVE_PRICE_SQL.' <= CAST(? AS DECIMAL(10,2))', [(float) $value])),
                AllowedFilter::custom('size', new VariantOptionFilter),
                AllowedFilter::custom('color', new VariantOptionFilter),
                AllowedFilter::callback('search', fn (Builder $query, mixed $value) => $query
                    ->where(fn (Builder $search) => $search
                        ->where('products.name', 'like', '%'.implode(',', (array) $value).'%')
                        ->orWhere('products.short_description', 'like', '%'.implode(',', (array) $value).'%'))),
                AllowedFilter::callback('featured', fn (Builder $query, mixed $value) => $query
                    ->where('products.is_featured', filter_var($value, FILTER_VALIDATE_BOOLEAN))),
                AllowedFilter::callback('on_sale', fn (Builder $query, mixed $value) => filter_var($value, FILTER_VALIDATE_BOOLEAN)
                    ? $query->whereNotNull('products.sale_price')->whereColumn('products.sale_price', '<', 'products.price')
                    : $query),
                AllowedFilter::callback('in_stock', fn (Builder $query, mixed $value) => filter_var($value, FILTER_VALIDATE_BOOLEAN)
                    ? $query->whereHas('variants', fn (Builder $variants) => $variants->where('is_active', true)->where('stock', '>', 0))
                    : $query),
            )
            ->allowedSorts(
                AllowedSort::custom('price', new EffectivePriceSort),
                $newest,
                AllowedSort::field('name'),
            )
            // Pass the AllowedSort itself: a '-newest' string would sort by a column named "newest".
            ->defaultSort((clone $newest)->defaultDirection(SortDirection::Descending))
            ->paginate($perPage)
            ->withQueryString();

        return ProductCardResource::collection($products);
    }

    public function show(string $slug): ProductResource
    {
        $product = Product::query()
            ->active()
            ->where('slug', $slug)
            ->with(['brand', 'media', 'categories', 'variants'])
            ->firstOrFail();

        return ProductResource::make($product);
    }

    /**
     * Other products from the same categories, for "You may also like".
     */
    public function related(string $slug): AnonymousResourceCollection
    {
        $product = Product::query()->active()->where('slug', $slug)->with('categories')->firstOrFail();

        $related = self::cardQuery()
            ->whereKeyNot($product->id)
            ->whereHas('categories', fn (Builder $categories) => $categories
                ->whereIn('categories.id', $product->categories->modelKeys()))
            ->inRandomOrder()
            ->limit(8)
            ->get();

        return ProductCardResource::collection($related);
    }

    /**
     * Active products with everything a product card needs.
     *
     * @return Builder<Product>
     */
    public static function cardQuery(): Builder
    {
        return Product::query()
            ->active()
            ->with(['brand', 'media'])
            ->withSum(['variants as total_stock' => fn (Builder $variants) => $variants->where('is_active', true)], 'stock');
    }
}
