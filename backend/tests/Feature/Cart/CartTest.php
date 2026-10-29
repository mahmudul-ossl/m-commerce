<?php

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;

function variant(array $attributes = [], array $product = []): ProductVariant
{
    return ProductVariant::factory()
        ->for(Product::factory()->state(['price' => 1000, ...$product]))
        ->create(['stock' => 5, 'options' => ['size' => 'M'], ...$attributes]);
}

it('returns an empty cart for new visitors', function () {
    $this->getJson('/api/cart')
        ->assertOk()
        ->assertJsonPath('data.count', 0)
        ->assertJsonPath('data.token', null);
});

it('creates a guest cart with a token and adds items', function () {
    $variant = variant();

    $response = $this->postJson('/api/cart/items', ['variant_id' => $variant->id, 'quantity' => 2])
        ->assertCreated()
        ->assertJsonPath('data.count', 2)
        ->assertJsonPath('data.subtotal', 2000)
        ->assertJsonPath('data.items.0.variant.id', $variant->id);

    $token = $response->json('data.token');
    expect($token)->toBeString();

    // Adding the same variant again increases its quantity.
    $this->withHeader('X-Cart-Token', $token)
        ->postJson('/api/cart/items', ['variant_id' => $variant->id])
        ->assertJsonPath('data.count', 3)
        ->assertJsonCount(1, 'data.items');

    $this->withHeader('X-Cart-Token', $token)->getJson('/api/cart')->assertJsonPath('data.count', 3);
});

it('uses the sale price for totals', function () {
    $variant = variant(product: ['price' => 1000, 'sale_price' => 750]);

    $this->postJson('/api/cart/items', ['variant_id' => $variant->id, 'quantity' => 2])
        ->assertJsonPath('data.items.0.line_total', 1500)
        ->assertJsonPath('data.subtotal', 1500);
});

it('refuses more than the available stock', function () {
    $variant = variant(['stock' => 2]);

    $this->postJson('/api/cart/items', ['variant_id' => $variant->id, 'quantity' => 3])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['quantity' => 'Only 2 left in stock.']);

    $this->postJson('/api/cart/items', ['variant_id' => variant(['stock' => 0])->id])
        ->assertJsonValidationErrors(['quantity' => 'This item is out of stock.']);
});

it('refuses inactive products', function () {
    $variant = variant(product: ['is_active' => false]);

    $this->postJson('/api/cart/items', ['variant_id' => $variant->id])
        ->assertJsonValidationErrors(['variant_id']);
});

it('updates and removes items', function () {
    $variant = variant();
    $token = $this->postJson('/api/cart/items', ['variant_id' => $variant->id])->json('data.token');
    $itemId = $this->withHeader('X-Cart-Token', $token)->getJson('/api/cart')->json('data.items.0.id');

    $this->withHeader('X-Cart-Token', $token)
        ->patchJson("/api/cart/items/{$itemId}", ['quantity' => 4])
        ->assertJsonPath('data.count', 4);

    $this->withHeader('X-Cart-Token', $token)
        ->patchJson("/api/cart/items/{$itemId}", ['quantity' => 6])
        ->assertJsonValidationErrors(['quantity']);

    $this->withHeader('X-Cart-Token', $token)
        ->deleteJson("/api/cart/items/{$itemId}")
        ->assertJsonPath('data.count', 0);
});

it('does not let one cart change another cart’s items', function () {
    $token = $this->postJson('/api/cart/items', ['variant_id' => variant()->id])->json('data.token');
    $itemId = $this->withHeader('X-Cart-Token', $token)->getJson('/api/cart')->json('data.items.0.id');

    $otherToken = $this->withHeader('X-Cart-Token', '')->postJson('/api/cart/items', ['variant_id' => variant()->id])->json('data.token');

    $this->withHeader('X-Cart-Token', $otherToken)
        ->deleteJson("/api/cart/items/{$itemId}")
        ->assertNotFound();
});

it('flags items that went out of stock and leaves them out of the subtotal', function () {
    $variant = variant(['stock' => 3]);
    $token = $this->postJson('/api/cart/items', ['variant_id' => $variant->id, 'quantity' => 2])->json('data.token');

    $variant->update(['stock' => 1]);

    $this->withHeader('X-Cart-Token', $token)->getJson('/api/cart')
        ->assertJsonPath('data.items.0.is_available', false)
        ->assertJsonPath('data.has_unavailable_items', true)
        ->assertJsonPath('data.subtotal', 0);
});

it('keeps a signed-in customer’s cart on their account', function () {
    $user = User::factory()->create();
    $variant = variant();

    $this->actingAs($user, 'sanctum')->postJson('/api/cart/items', ['variant_id' => $variant->id])
        ->assertJsonPath('data.token', null)
        ->assertJsonPath('data.count', 1);

    expect($user->cart->items)->toHaveCount(1);
});
