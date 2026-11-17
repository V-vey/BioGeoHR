<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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
        // one line a minute for the same person and page, so a script cannot fill the log
        if (Cache::add('denied:' . ($user?->id ?? 'guest') . '|' . $request->path(), 1, 60)) {
            $needs = $role === 'Administrative' ? 'HR' : $role;   // "Administrative" is how the code names the HR role
            AuditLog::record('admin', 'access_denied', 'failed', "{$request->method()} /{$request->path()} needs the {$needs} role", $user?->id, $user?->email);
        }
        abort(403, 'Unauthorized action.');
    }
    return $next($request);
}
}
