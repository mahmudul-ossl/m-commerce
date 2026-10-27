<?php

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;

function slugs($response): array
{
    return collect($response->json('data'))->pluck('slug')->all();
}

it('lists only active products with card fields', function () {
    $product = Product::factory()->withStock(5)->create(['name' => 'Visible Tee', 'price' => 1000, 'sale_price' => 800]);
    Product::factory()->inactive()->create();

    $response = $this->getJson('/api/products')->assertOk();

    expect(slugs($response))->toBe(['visible-tee']);
    $response->assertJsonPath('data.0.current_price', 800)
        ->assertJsonPath('data.0.is_on_sale', true)
        ->assertJsonPath('data.0.discount_percent', 20)
        ->assertJsonPath('data.0.in_stock', true)
        ->assertJsonPath('meta.total', 1);
});

it('marks products without stock as out of stock', function () {
    Product::factory()->withStock(0)->create();

    $this->getJson('/api/products')->assertJsonPath('data.0.in_stock', false);
});

it('filters by category including subcategories', function () {
    $men = Category::factory()->create(['name' => 'Men']);
    $shirts = Category::factory()->childOf($men)->create(['name' => 'Shirts']);
    $women = Category::factory()->create(['name' => 'Women']);

    Product::factory()->create(['name' => 'Oxford Shirt'])->categories()->attach($shirts);
    Product::factory()->create(['name' => 'Summer Dress'])->categories()->attach($women);

    expect(slugs($this->getJson('/api/products?filter[category]=men')))->toBe(['oxford-shirt'])
        ->and(slugs($this->getJson('/api/products?filter[category]=shirts')))->toBe(['oxford-shirt'])
        ->and(slugs($this->getJson('/api/products?filter[category]=unknown')))->toBe([]);
});

it('filters by brand', function () {
    $brand = Brand::factory()->create(['name' => 'Northwind']);
    Product::factory()->create(['name' => 'Branded', 'brand_id' => $brand->id]);
    Product::factory()->create(['name' => 'Other']);

    expect(slugs($this->getJson('/api/products?filter[brand]=northwind')))->toBe(['branded']);
});

it('filters by the price the customer pays', function () {
    Product::factory()->create(['name' => 'Cheap', 'price' => 500]);
    Product::factory()->create(['name' => 'Discounted', 'price' => 3000, 'sale_price' => 900]);
    Product::factory()->create(['name' => 'Expensive', 'price' => 5000]);

    $response = $this->getJson('/api/products?filter[min_price]=800&filter[max_price]=1000');

    expect(slugs($response))->toBe(['discounted']);
});

it('filters by variant size and color', function () {
    $medium = Product::factory()->create(['name' => 'Medium Black']);
    ProductVariant::factory()->for($medium)->create(['options' => ['size' => 'M', 'color' => 'Black']]);

    $large = Product::factory()->create(['name' => 'Large White']);
    ProductVariant::factory()->for($large)->create(['options' => ['size' => 'L', 'color' => 'White']]);

    expect(slugs($this->getJson('/api/products?filter[size]=M')))->toBe(['medium-black'])
        ->and(slugs($this->getJson('/api/products?filter[color]=White')))->toBe(['large-white'])
        ->and(slugs($this->getJson('/api/products?filter[size]=M,L&sort=name')))->toBe(['large-white', 'medium-black']);
});

it('searches by name', function () {
    Product::factory()->create(['name' => 'Linen Shirt']);
    Product::factory()->create(['name' => 'Denim Jacket']);

    expect(slugs($this->getJson('/api/products?filter[search]=linen')))->toBe(['linen-shirt']);
});

it('filters on sale and featured products', function () {
    Product::factory()->onSale(500)->create(['name' => 'Sale Item', 'price' => 1000]);
    Product::factory()->featured()->create(['name' => 'Featured Item']);

    expect(slugs($this->getJson('/api/products?filter[on_sale]=1')))->toBe(['sale-item'])
        ->and(slugs($this->getJson('/api/products?filter[featured]=1')))->toBe(['featured-item']);
});

it('sorts by effective price and defaults to newest first', function () {
    Product::factory()->create(['name' => 'Old', 'price' => 2000, 'created_at' => now()->subDay()]);
    Product::factory()->create(['name' => 'New On Sale', 'price' => 3000, 'sale_price' => 1000]);

    expect(slugs($this->getJson('/api/products')))->toBe(['new-on-sale', 'old'])
        ->and(slugs($this->getJson('/api/products?sort=price')))->toBe(['new-on-sale', 'old'])
        ->and(slugs($this->getJson('/api/products?sort=-price')))->toBe(['old', 'new-on-sale']);
});

it('rejects unknown filters and sorts', function () {
    $this->getJson('/api/products?filter[secret]=1')->assertBadRequest();
    $this->getJson('/api/products?sort=password')->assertBadRequest();
});

it('paginates with a capped page size', function () {
    Product::factory()->count(3)->create();

    $this->getJson('/api/products?per_page=2')
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('meta.per_page', 2)
        ->assertJsonPath('meta.last_page', 2);

    $this->getJson('/api/products?per_page=500')->assertJsonPath('meta.per_page', 48);
});
