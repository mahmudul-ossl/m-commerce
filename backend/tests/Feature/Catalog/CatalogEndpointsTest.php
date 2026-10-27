<?php

use App\Models\Banner;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;

it('returns the active category tree', function () {
    $men = Category::factory()->create(['name' => 'Men', 'sort_order' => 0]);
    Category::factory()->childOf($men)->create(['name' => 'Shirts']);
    Category::factory()->childOf($men)->inactive()->create(['name' => 'Hidden']);
    Category::factory()->create(['name' => 'Women', 'sort_order' => 1]);

    $this->getJson('/api/categories')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.slug', 'men')
        ->assertJsonCount(1, 'data.0.children')
        ->assertJsonPath('data.0.children.0.slug', 'shirts')
        ->assertJsonPath('data.1.slug', 'women');
});

it('shows a category with its parent for breadcrumbs', function () {
    $men = Category::factory()->create(['name' => 'Men']);
    Category::factory()->childOf($men)->create(['name' => 'Shirts']);

    $this->getJson('/api/categories/shirts')
        ->assertOk()
        ->assertJsonPath('data.parent.slug', 'men');

    $this->getJson('/api/categories/missing')->assertNotFound();
});

it('lists active brands', function () {
    Brand::factory()->create(['name' => 'Northwind']);
    Brand::factory()->create(['name' => 'Gone', 'is_active' => false]);

    $this->getJson('/api/brands')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.slug', 'northwind');
});

it('returns filter options for a category', function () {
    $category = Category::factory()->create(['name' => 'Men']);
    $brand = Brand::factory()->create(['name' => 'Northwind']);

    $tee = Product::factory()->create(['brand_id' => $brand->id, 'price' => 1000, 'sale_price' => 700]);
    $tee->categories()->attach($category);
    ProductVariant::factory()->for($tee)->create(['options' => ['size' => 'M', 'color' => 'Black']]);

    $shirt = Product::factory()->create(['price' => 2500]);
    $shirt->categories()->attach($category);
    ProductVariant::factory()->for($shirt)->create(['options' => ['size' => 'L', 'color' => 'Black']]);

    Product::factory()->create(['price' => 9999]); // other category

    $this->getJson('/api/products/filters?filter[category]=men')
        ->assertOk()
        ->assertJsonPath('data.brands.0.slug', 'northwind')
        ->assertJsonPath('data.brands.0.count', 1)
        ->assertJsonPath('data.options.size', ['M', 'L'])
        ->assertJsonPath('data.options.color', ['Black'])
        ->assertJsonPath('data.price.min', 700)
        ->assertJsonPath('data.price.max', 2500);
});

it('returns home page sections', function () {
    Banner::factory()->create(['title' => 'Big Sale']);
    Category::factory()->featured()->create(['name' => 'Men']);
    Product::factory()->featured()->create(['name' => 'Star']);
    Product::factory()->onSale(500)->create(['name' => 'Deal', 'price' => 1000]);

    $this->getJson('/api/home')
        ->assertOk()
        ->assertJsonPath('data.banners.0.title', 'Big Sale')
        ->assertJsonPath('data.featured_categories.0.slug', 'men')
        ->assertJsonPath('data.featured_products.0.slug', 'star')
        ->assertJsonCount(2, 'data.new_arrivals')
        ->assertJsonPath('data.on_sale.0.slug', 'deal');
});
