<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TokenFromCookie
{
    /**
     * The website keeps its login token in an HttpOnly cookie. Sanctum only looks at the
     * Authorization header, so when the request has no header, copy the token over from the cookie.
     * The phone app sends the header itself, so it passes through untouched.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->bearerToken() && $request->cookie('token')) {
            $request->headers->set('Authorization', 'Bearer ' . $request->cookie('token'));
        }

        return $next($request);
    }
}