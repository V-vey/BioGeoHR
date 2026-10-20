<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AuditLog;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'category' => 'nullable|string',
            'status'   => 'nullable|in:success,failed',
            'from'     => 'nullable|date',
            'to'       => 'nullable|date',
            'per_page' => 'nullable|integer|min:1|max:100',
            'search'   => 'nullable|string|max:100',
        ]);

        $logs = AuditLog::with('user:id,name')
            // a user's name or email; a failed login has no user, only the email that was typed, so that counts too
            ->when(trim((string) $request->input('search')), function ($q, $term) {
                $like = '%' . addcslashes($term, '%_\\') . '%';   // % and _ typed by the user must not act as wildcards
                $q->where(function ($q) use ($like) {
                    $q->where('email', 'like', $like)
                        ->orWhereHas('user', fn ($u) => $u->where('name', 'like', $like)->orWhere('email', 'like', $like));
                });
            })
            ->when($request->category, fn ($q, $v) => $q->where('category', $v))
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->when($request->from, fn ($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($request->to, fn ($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->orderByDesc('id')
            ->paginate($request->integer('per_page', 20));

        return response()->json($logs);
    }
}
