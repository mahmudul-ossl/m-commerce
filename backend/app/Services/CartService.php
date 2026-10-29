<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CartService
{
    /** Most of one item a customer can order at once. */
    public const MAX_QUANTITY_PER_ITEM = 10;

    /**
     * The cart for this request: the user's cart when signed in,
     * otherwise the guest cart for the token (null when there is none yet).
     */
    public function find(?User $user, ?string $token): ?Cart
    {
        if ($user) {
            return $user->cart;
        }

        return $token && Str::isUuid($token)
            ? Cart::query()->whereNull('user_id')->where('token', $token)->first()
            : null;
    }

    /** Find the cart for this request, creating one when needed. */
    public function findOrCreate(?User $user, ?string $token): Cart
    {
        if ($cart = $this->find($user, $token)) {
            return $cart;
        }

        if ($user) {
            $cart = Cart::create(['user_id' => $user->id]);
            // find() cached the missing cart as null on the user; replace it.
            $user->setRelation('cart', $cart);

            return $cart;
        }

        return Cart::create(['token' => (string) Str::uuid()]);
    }

    /**
     * Add a variant, or increase its quantity when it is already in the cart.
     *
     * @throws ValidationException when the variant can't be bought in that quantity
     */
    public function add(Cart $cart, ProductVariant $variant, int $quantity): CartItem
    {
        $item = $cart->items()->firstOrNew(['product_variant_id' => $variant->id]);
        $newQuantity = ($item->exists ? $item->quantity : 0) + $quantity;

        $this->ensurePurchasable($variant, $newQuantity);

        $item->quantity = $newQuantity;
        $item->save();
        $cart->touch();

        return $item;
    }

    /** @throws ValidationException */
    public function update(CartItem $item, int $quantity): CartItem
    {
        $this->ensurePurchasable($item->variant, $quantity);

        $item->update(['quantity' => $quantity]);
        $item->cart->touch();

        return $item;
    }

    public function remove(CartItem $item): void
    {
        $item->delete();
        $item->cart->touch();
    }

    public function clear(Cart $cart): void
    {
        $cart->items()->delete();
        $cart->touch();
    }

    /**
     * Move a guest cart's items into the user's cart after they sign in.
     * Quantities are combined and capped at the available stock.
     */
    public function mergeGuestCart(User $user, ?string $token): void
    {
        $guest = $this->find(null, $token);

        if (! $guest) {
            return;
        }

        DB::transaction(function () use ($user, $guest) {
            $cart = $this->findOrCreate($user, null);
            $guest->load('items.variant');

            foreach ($guest->items as $guestItem) {
                $item = $cart->items()->firstOrNew(['product_variant_id' => $guestItem->product_variant_id]);
                $combined = ($item->exists ? $item->quantity : 0) + $guestItem->quantity;
                $limit = min($guestItem->variant->stock, self::MAX_QUANTITY_PER_ITEM);

                if ($limit < 1) {
                    continue;
                }

                $item->quantity = min($combined, $limit);
                $item->save();
            }

            $guest->delete();
            $cart->touch();
        });
    }

    /** @throws ValidationException */
    private function ensurePurchasable(ProductVariant $variant, int $quantity): void
    {
        if (! $variant->is_active || ! $variant->product->is_active) {
            throw ValidationException::withMessages(['variant_id' => 'This product is no longer available.']);
        }

        if ($quantity > self::MAX_QUANTITY_PER_ITEM) {
            throw ValidationException::withMessages([
                'quantity' => 'You can order up to '.self::MAX_QUANTITY_PER_ITEM.' of each item.',
            ]);
        }

        if ($quantity > $variant->stock) {
            throw ValidationException::withMessages([
                'quantity' => $variant->stock > 0
                    ? "Only {$variant->stock} left in stock."
                    : 'This item is out of stock.',
            ]);
        }
    }
}
