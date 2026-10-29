<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductFilterController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json([
    'status' => 'ok',
    'app' => config('app.name'),
    'time' => now()->toIso8601String(),
]));

// Catalog (public)
Route::get('/home', HomeController::class);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);
Route::get('/brands', [BrandController::class, 'index']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/filters', ProductFilterController::class);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/products/{slug}/related', [ProductController::class, 'related']);

// Cart (guests send an X-Cart-Token header; signed-in customers use their account cart)
Route::get('/cart', [CartController::class, 'show']);
Route::delete('/cart', [CartController::class, 'clear']);
Route::post('/cart/items', [CartController::class, 'store'])->middleware('throttle:60,1');
Route::patch('/cart/items/{item}', [CartController::class, 'update'])->whereNumber('item');
Route::delete('/cart/items/{item}', [CartController::class, 'destroy'])->whereNumber('item');

// Authentication (Sanctum SPA cookies)
Route::prefix('auth')->group(function () {
    Route::middleware('throttle:6,1')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [PasswordResetController::class, 'sendLink']);
        Route::post('/reset-password', [PasswordResetController::class, 'reset']);
    });

    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
});

Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');
