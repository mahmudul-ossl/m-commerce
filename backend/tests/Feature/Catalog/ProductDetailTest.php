<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;

it('shows a product with variants and grouped options', function () {
    $product = Product::factory()->create(['name' => 'Crew Tee', 'price' => 1000]);
    ProductVariant::factory()->for($product)->create(['options' => ['size' => 'M', 'color' => 'Black'], 'stock' => 3, 'sort_order' => 0]);
    ProductVariant::factory()->for($product)->create(['options' => ['size' => 'L', 'color' => 'Black'], 'stock' => 0, 'sort_order' => 1]);
    ProductVariant::factory()->for($product)->create(['options' => ['size' => 'XL', 'color' => 'Black'], 'is_active' => false]);

    $this->getJson('/api/products/crew-tee')
        ->assertOk()
        ->assertJsonPath('data.name', 'Crew Tee')
        ->assertJsonPath('data.in_stock', true)
        ->assertJsonPath('data.options', ['size' => ['M', 'L'], 'color' => ['Black']])
        ->assertJsonCount(2, 'data.variants')
        ->assertJsonPath('data.variants.0.price', 1000)
        ->assertJsonPath('data.variants.1.in_stock', false);
});

it('uses variant price overrides', function () {
    $product = Product::factory()->create(['name' => 'Watch', 'price' => 1000, 'sale_price' => 900]);
    ProductVariant::factory()->for($product)->create(['price' => 1500, 'options' => ['color' => 'Gold']]);

    $this->getJson('/api/products/watch')
        ->assertJsonPath('data.variants.0.price', 1500)
        ->assertJsonPath('data.variants.0.current_price', 1500);
});

it('returns 404 for inactive or missing products', function () {
    Product::factory()->inactive()->create(['name' => 'Hidden']);

    $this->getJson('/api/products/hidden')->assertNotFound();
    $this->getJson('/api/products/nope')->assertNotFound();
});

it('lists related products from the same category', function () {
    $category = Category::factory()->create();
    $product = Product::factory()->create(['name' => 'Main']);
    $product->categories()->attach($category);
    Product::factory()->create(['name' => 'Sibling'])->categories()->attach($category);
    Product::factory()->create(['name' => 'Unrelated']);

    $response = $this->getJson('/api/products/main/related')->assertOk();

    expect(collect($response->json('data'))->pluck('slug')->all())->toBe(['sibling']);
});

it('generates unique slugs', function () {
    $first = Product::factory()->create(['name' => 'Basic Tee']);
    $second = Product::factory()->create(['name' => 'Basic Tee']);

    expect($first->slug)->toBe('basic-tee')
        ->and($second->slug)->toBe('basic-tee-2');
});
