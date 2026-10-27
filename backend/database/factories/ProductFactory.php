<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => ucfirst(fake()->unique()->words(3, true)),
            'short_description' => fake()->sentence(),
            'description' => fake()->paragraphs(2, true),
            'price' => fake()->numberBetween(5, 50) * 100 - 10,
            'sale_price' => null,
            'is_active' => true,
            'is_featured' => false,
        ];
    }

    public function onSale(float $salePrice): static
    {
        return $this->state(fn (array $attributes) => ['sale_price' => $salePrice]);
    }

    public function featured(): static
    {
        return $this->state(fn (array $attributes) => ['is_featured' => true]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => ['is_active' => false]);
    }

    /**
     * Give the product one in-stock variant with no options.
     */
    public function withStock(int $stock = 10): static
    {
        return $this->has(ProductVariant::factory()->state(['stock' => $stock, 'options' => null]), 'variants');
    }
}
