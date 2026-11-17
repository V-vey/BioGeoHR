<?php

namespace App\Providers;

use App\Models\AuditLog;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
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
        // Wrong passwords can not be tried without end: 5 a minute for one email from one address, 20 a minute for
        // one email from anywhere, and 200 a minute from one address. The answer says to wait, in the shape the
        // website and the phone already read ("authenticated").
        RateLimiter::for('login', function (Request $request) {
            $email = strtolower(is_string($request->input('email')) ? $request->input('email') : '');
            $tooMany = function (Request $request, array $headers) use ($email) {
                // one line a minute for the same email and address, not one for every refused try
                if (Cache::add('login-locked:' . md5($email . '|' . $request->ip()), 1, 60)) {
                    AuditLog::record('login', 'login_locked', 'failed', 'Too many wrong passwords: further tries are refused for a minute', null, $email !== '' ? mb_substr($email, 0, 255) : null);
                }

                return response()->json([
                    'authenticated' => 'Too Many Attempts',
                    'message' => 'Too many login attempts. Please wait a minute and try again.',
                ], 429, $headers);
            };

            return [
                Limit::perMinute(5)->by('login:' . $email . '|' . $request->ip())->response($tooMany),
                Limit::perMinute(20)->by('login-email:' . $email)->response($tooMany),
                Limit::perMinute(200)->by('login-ip:' . $request->ip())->response($tooMany),
            ];
        });

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
