<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CartResource;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ProductVariant;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Shopping cart for guests (X-Cart-Token header) and signed-in customers.
 */
class CartController extends Controller
{
    public function __construct(private CartService $carts) {}

    public function show(Request $request): JsonResponse
    {
        $cart = $this->carts->find($request->user('sanctum'), $request->header('X-Cart-Token'));

        return $this->respond($cart);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'variant_id' => ['required', 'integer', 'exists:product_variants,id'],
            'quantity' => ['sometimes', 'integer', 'min:1', 'max:'.CartService::MAX_QUANTITY_PER_ITEM],
        ]);

        $cart = $this->carts->findOrCreate($request->user('sanctum'), $request->header('X-Cart-Token'));
        $variant = ProductVariant::with('product')->findOrFail($data['variant_id']);

        $this->carts->add($cart, $variant, $data['quantity'] ?? 1);

        return $this->respond($cart, 201);
    }

    public function update(Request $request, int $item): JsonResponse
    {
        $data = $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:'.CartService::MAX_QUANTITY_PER_ITEM],
        ]);

        [$cart, $cartItem] = $this->ownedItem($request, $item);
        $this->carts->update($cartItem, $data['quantity']);

        return $this->respond($cart);
    }

    public function destroy(Request $request, int $item): JsonResponse
    {
        [$cart, $cartItem] = $this->ownedItem($request, $item);
        $this->carts->remove($cartItem);

        return $this->respond($cart);
    }

    public function clear(Request $request): JsonResponse
    {
        $cart = $this->carts->find($request->user('sanctum'), $request->header('X-Cart-Token'));

        if ($cart) {
            $this->carts->clear($cart);
        }

        return $this->respond($cart);
    }

    /**
     * The cart item, only if it belongs to the current request's cart.
     *
     * @return array{Cart, CartItem}
     */
    private function ownedItem(Request $request, int $itemId): array
    {
        $cart = $this->carts->find($request->user('sanctum'), $request->header('X-Cart-Token'));
        abort_if(! $cart, 404);

        $item = $cart->items()->with('variant.product')->findOrFail($itemId);

        return [$cart, $item];
    }

    private function respond(?Cart $cart, int $status = 200): JsonResponse
    {
        if (! $cart) {
            return response()->json([
                'data' => ['token' => null, 'items' => [], 'count' => 0, 'subtotal' => 0, 'has_unavailable_items' => false],
            ]);
        }

        $cart->load(['items.variant.product.media']);

        return CartResource::make($cart)->response()->setStatusCode($status);
    }
}
