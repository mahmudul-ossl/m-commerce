<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BannerResource;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductCardResource;
use App\Models\Banner;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    private const SECTION_SIZE = 8;

    /**
     * Everything the home page needs in one request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $banners = Banner::query()->active()->with('media')->orderBy('sort_order')->get();

        $featuredCategories = Category::query()
            ->active()
            ->where('is_featured', true)
            ->with('media')
            ->orderBy('sort_order')
            ->get();

        $featured = ProductController::cardQuery()
            ->where('products.is_featured', true)
            ->latest()
            ->limit(self::SECTION_SIZE)
            ->get();

        $newArrivals = ProductController::cardQuery()
            ->latest()
            ->limit(self::SECTION_SIZE)
            ->get();

        $onSale = ProductController::cardQuery()
            ->whereNotNull('products.sale_price')
            ->whereColumn('products.sale_price', '<', 'products.price')
            ->latest()
            ->limit(self::SECTION_SIZE)
            ->get();

        return response()->json([
            'data' => [
                'banners' => BannerResource::collection($banners)->resolve($request),
                'featured_categories' => CategoryResource::collection($featuredCategories)->resolve($request),
                'featured_products' => ProductCardResource::collection($featured)->resolve($request),
                'new_arrivals' => ProductCardResource::collection($newArrivals)->resolve($request),
                'on_sale' => ProductCardResource::collection($onSale)->resolve($request),
            ],
        ]);
    }
}
