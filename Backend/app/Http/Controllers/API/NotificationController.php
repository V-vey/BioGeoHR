<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\FlaggedAttendance;
use App\Models\LeaveApplication;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    private const NAMES = 3;

    public function poll(Request $request)
    {
        $request->validate([
            'leave'      => 'sometimes|integer|min:0',
            'attendance' => 'sometimes|integer|min:0',
            'flag'       => 'sometimes|integer|min:0',
        ]);

        $this->keepIdleClock($request);

        $latest = [
            'leave'      => (int) LeaveApplication::max('id'),
            'attendance' => (int) Attendance::max('id'),
            'flag'       => (int) FlaggedAttendance::max('id'),
        ];

        $new = [];

        if ($request->has('leave') && $latest['leave'] > (int) $request->leave) {
            $q = LeaveApplication::where('id', '>', $request->leave)->where('status', 'Pending');
            $new['leave'] = $this->summarize($q, fn ($r) => [
                'name'   => $r->user?->name ?? 'An employee',
                'detail' => $r->leave_type,
            ], 'user');
        }

        if ($request->has('attendance') && $latest['attendance'] > (int) $request->attendance) {
            $q = Attendance::where('id', '>', $request->attendance)->whereIn('status', ['Late', 'Absent']);
            $new['attendance'] = $this->summarize($q, fn ($r) => [
                'name'   => $r->user?->name ?? 'An employee',
                'detail' => $r->status,
            ], 'user');
        }

        if ($request->has('flag') && $latest['flag'] > (int) $request->flag) {
            $q = FlaggedAttendance::where('id', '>', $request->flag);
            $new['flag'] = $this->summarize($q, fn ($r) => [
                'name'   => $r->attendance?->user?->name ?? 'An employee',
                'detail' => 'left the school area',
            ], 'attendance.user');
        }

        // kinds with nothing matching (for example a Present row) are dropped
        $new = array_filter($new, fn ($n) => $n['count'] > 0);

        return response()->json(['latest' => $latest, 'new' => $new]);
    }

    private function summarize($query, callable $shape, string $with): array
    {
        $count = (clone $query)->count();
        $items = $count === 0 ? [] : $query->with($with)->orderBy('id')->limit(self::NAMES)->get()->map($shape)->all();

        return ['count' => $count, 'items' => $items];
    }

    private function keepIdleClock(Request $request): void
    {
        $previous = $request->attributes->get('previous_last_used_at');
        $token = $request->user()?->currentAccessToken();
        if ($previous && $token && method_exists($token, 'forceFill')) {
            $token->forceFill(['last_used_at' => $previous])->save();
        }
    }
}
