<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     * 
     */
    public function handle(Request $request, Closure $next, string $role): Response
{
    $user = $request->user();
    $allowed = $user && ($role === 'Administrative'
        ? $user->isHR()
        : $user->department === $role);

    if (! $allowed) {
        abort(403, 'Unauthorized action.');
    }
    return $next($request);
}
}
