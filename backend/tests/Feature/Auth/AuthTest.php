<?php

use App\Models\Cart;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;

// Requests from the storefront's origin get Sanctum's session (cookie) handling.
beforeEach(fn () => $this->withHeaders(['Origin' => 'http://localhost:3000', 'Referer' => 'http://localhost:3000/']));

it('registers and signs in a new customer', function () {
    $this->postJson('/api/auth/register', [
        'name' => 'Rahim Uddin',
        'email' => 'rahim@example.com',
        'phone' => '01711000000',
        'password' => 'secret-password',
        'password_confirmation' => 'secret-password',
    ])->assertCreated()->assertJsonPath('data.email', 'rahim@example.com');

    $this->assertAuthenticated('web');
    $this->getJson('/api/user')->assertOk()->assertJsonPath('data.name', 'Rahim Uddin');
});

it('validates registration', function () {
    User::factory()->create(['email' => 'taken@example.com']);

    $this->postJson('/api/auth/register', [
        'name' => '',
        'email' => 'taken@example.com',
        'password' => 'short',
        'password_confirmation' => 'different',
    ])->assertJsonValidationErrors(['name', 'email', 'password']);
});

it('signs in with the right password only', function () {
    $user = User::factory()->create(['email' => 'customer@example.com']);

    $this->postJson('/api/auth/login', ['email' => 'customer@example.com', 'password' => 'wrong'])
        ->assertJsonValidationErrors(['email']);
    $this->assertGuest('web');

    $this->postJson('/api/auth/login', ['email' => 'customer@example.com', 'password' => 'password'])
        ->assertOk()
        ->assertJsonPath('data.id', $user->id);
    $this->assertAuthenticatedAs($user, 'web');
});

it('signs out', function () {
    $this->actingAs(User::factory()->create(), 'web');

    $this->postJson('/api/auth/logout')->assertNoContent();
    $this->assertGuest('web');
});

it('rejects /api/user for guests', function () {
    $this->getJson('/api/user')->assertUnauthorized();
});

it('merges the guest cart into the account cart on sign in', function () {
    $user = User::factory()->create(['email' => 'customer@example.com']);
    $shared = ProductVariant::factory()->for(Product::factory())->create(['stock' => 4]);
    $guestOnly = ProductVariant::factory()->for(Product::factory())->create(['stock' => 10]);

    // Already in the account cart from an earlier visit.
    $this->actingAs($user, 'sanctum')->postJson('/api/cart/items', ['variant_id' => $shared->id, 'quantity' => 2]);
    // The test client keeps resolved users between requests; start the next ones as a guest.
    Auth::forgetGuards();

    $token = $this->postJson('/api/cart/items', ['variant_id' => $shared->id, 'quantity' => 3])->json('data.token');
    $this->withHeader('X-Cart-Token', $token)->postJson('/api/cart/items', ['variant_id' => $guestOnly->id]);

    $this->postJson('/api/auth/login', ['email' => 'customer@example.com', 'password' => 'password', 'cart_token' => $token])->assertOk();

    $items = $user->fresh()->cart->items->keyBy('product_variant_id');
    expect($items[$shared->id]->quantity)->toBe(4) // 2 + 3, capped at stock
        ->and($items[$guestOnly->id]->quantity)->toBe(1);

    // The guest cart is gone.
    expect(Cart::where('token', $token)->exists())->toBeFalse();
});

it('emails a reset link that points to the storefront and resets the password', function () {
    Notification::fake();
    $user = User::factory()->create(['email' => 'customer@example.com']);

    $this->postJson('/api/auth/forgot-password', ['email' => 'customer@example.com'])->assertOk();
    // Same answer for unknown emails.
    $this->postJson('/api/auth/forgot-password', ['email' => 'nobody@example.com'])->assertOk();

    $token = null;
    Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user, &$token) {
        $token = $notification->token;
        $url = $notification->toMail($user)->actionUrl;

        return str_starts_with($url, 'http://localhost:3000/reset-password?token=');
    });

    $this->postJson('/api/auth/reset-password', [
        'token' => $token,
        'email' => 'customer@example.com',
        'password' => 'brand-new-password',
        'password_confirmation' => 'brand-new-password',
    ])->assertOk();

    $this->postJson('/api/auth/login', ['email' => 'customer@example.com', 'password' => 'brand-new-password'])->assertOk();
});
