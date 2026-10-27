<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    /**
     * Active categories as a nested tree, for the navigation menu.
     */
    public function index(): AnonymousResourceCollection
    {
        $categories = Category::query()
            ->active()
            ->with('media')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return CategoryResource::collection($this->buildTree($categories));
    }

    /**
     * A category with its subcategories and breadcrumb parents.
     */
    public function show(string $slug): CategoryResource
    {
        $category = Category::query()
            ->active()
            ->where('slug', $slug)
            ->with([
                'media',
                'parent.parent',
                'children' => fn (HasMany $children) => $children->where('is_active', true)->with('media'),
            ])
            ->firstOrFail();

        return CategoryResource::make($category);
    }

    /**
     * Nest categories under their parents. Children of inactive parents are dropped.
     *
     * @param  Collection<int, Category>  $categories
     * @return Collection<int, Category>
     */
    private function buildTree(Collection $categories, ?int $parentId = null): Collection
    {
        return $categories
            ->where('parent_id', $parentId)
            ->each(fn (Category $category) => $category->setRelation('children', $this->buildTree($categories, $category->id)))
            ->values();
    }
}
