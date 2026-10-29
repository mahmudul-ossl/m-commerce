<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

/**
 * Cookie-based (Sanctum SPA) sign in for the storefront.
 */
class AuthController extends Controller
{
    public function __construct(private CartService $carts) {}

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'cart_token' => ['nullable', 'string'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => $data['password'],
        ]);

        Auth::guard('web')->login($user);
        $request->session()->regenerate();
        $this->carts->mergeGuestCart($user, $data['cart_token'] ?? null);

        return UserResource::make($user)->response()->setStatusCode(201);
    }

    public function login(Request $request): UserResource
    {
        $data = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['sometimes', 'boolean'],
            'cart_token' => ['nullable', 'string'],
        ]);

        if (! Auth::guard('web')->attempt(
            ['email' => $data['email'], 'password' => $data['password']],
            $data['remember'] ?? false,
        )) {
            throw ValidationException::withMessages([
                'email' => 'These details don’t match our records.',
            ]);
        }

        $request->session()->regenerate();

        /** @var User $user */
        $user = Auth::guard('web')->user();
        $this->carts->mergeGuestCart($user, $data['cart_token'] ?? null);

        return UserResource::make($user);
    }

    public function logout(Request $request): Response
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }

    public function user(Request $request): JsonResponse
    {
        // Always 200: a resource for a just-created model would otherwise answer 201.
        return UserResource::make($request->user())->response()->setStatusCode(200);
    }
}
