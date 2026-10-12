<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\FlaggedAttendance;
use App\Models\LeaveApplication;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // how many names one kind of event may carry; the rest are only counted
    private const NAMES = 3;

    /**
     * What is new since the last poll, for the web's pop-up messages.
     *
     * The page sends the newest id of each kind it has already seen (leave, attendance, flag).
     * Without them the answer holds only the current newest ids, which is how the page starts.
     * Only cheap indexed queries run here, and nothing is ever listed in full.
     */
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

    /**
     * Polling must not keep a forgotten tab logged in: the 60-minute idle timer counts requests,
     * so this one puts the token's "last used" time back to what it was before the poll.
     * (AppServiceProvider saved the earlier value while it checked the token.)
     */
    private function keepIdleClock(Request $request): void
    {
        $previous = $request->attributes->get('previous_last_used_at');
        $token = $request->user()?->currentAccessToken();
        if ($previous && $token && method_exists($token, 'forceFill')) {
            $token->forceFill(['last_used_at' => $previous])->save();
        }
    }
}
