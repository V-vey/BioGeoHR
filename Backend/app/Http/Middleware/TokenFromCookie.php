<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TokenFromCookie
{
    /**
     * The token in the Authorization header, or null when there is none or it is a leftover such as
     * "Bearer undefined" (an old page that no longer gets a token sends exactly that). A leftover
     * must not hide the cookie, or the login would loop back to the login page.
     */
    public static function bearer(Request $request): ?string
    {
        $token = $request->bearerToken();

        return in_array(strtolower(trim((string) $token)), ['', 'undefined', 'null'], true) ? null : $token;
    }

    /**
     * The website keeps its login token in an HttpOnly cookie. Sanctum only looks at the
     * Authorization header, so when the request has no real header, copy the token over from the cookie.
     * The phone app sends the header itself, so it passes through untouched.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!self::bearer($request) && $request->cookie('token')) {
            $request->headers->set('Authorization', 'Bearer ' . $request->cookie('token'));
        }

        return $next($request);
    }
}
