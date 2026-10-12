<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;

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
        Sanctum::authenticateAccessTokensUsing(function ($accessToken, bool $isValid) {
            if (! $isValid) return false;

            $lastActive = $accessToken->last_used_at ?? $accessToken->created_at;
            if ($lastActive->lt(now()->subMinutes(60))) {
                $accessToken->delete();
                return false;       // the request gets a 401
            }
            // the web's pop-up poll must not count as activity: it puts this value back afterwards
            if (request()->is('api/notifications/poll')) {
                request()->attributes->set('previous_last_used_at', $lastActive);
            }
            return true;
        });
    }
}
