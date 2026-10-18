<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireAjaxForCookieAuth
{
    /**
     * The website's login lives in a cookie the browser sends by itself, so another site could make
     * the browser send a request that changes data (CSRF). A request that is logged in by the cookie
     * alone, and is not a read, must carry X-Requested-With: only our own pages add it, because a
     * browser asks permission (CORS) before another site may send that header.
     * The phone app sends the token as a header, so it is not affected.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $cookieOnly = !$request->bearerToken() && $request->cookie('token');

        if ($cookieOnly && !$request->isMethodSafe() && $request->header('X-Requested-With') !== 'XMLHttpRequest') {
            return response()->json(['message' => 'Missing request header.'], 419);
        }

        return $next($request);
    }
}
