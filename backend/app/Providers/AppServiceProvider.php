<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Password reset emails link to the storefront, not to Laravel.
        ResetPassword::createUrlUsing(function (object $user, string $token) {
            $frontend = rtrim(explode(',', (string) config('app.frontend_url'))[0], '/');

            return $frontend.'/reset-password?'.http_build_query(['token' => $token, 'email' => $user->getEmailForPasswordReset()]);
        });
    }
}
