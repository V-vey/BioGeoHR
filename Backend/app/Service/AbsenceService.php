<?php
namespace App\Service;

use App\Models\Attendance;
use App\Models\Holiday;
use App\Models\LeaveApplication;
use App\Models\Users;
use Carbon\Carbon;

class AbsenceService
{
    public function sync(Carbon $from, Carbon $to): int
    {
        $created = 0;
        $staff = Users::active()->has('salary')->get();

        foreach ($from->copy()->daysUntil($to) as $date) {
            if ($date->isSunday() || $date->isSaturday() || Holiday::whereDate('date', $date)->exists()) continue;

            foreach ($staff as $u) {
                if ($date->lt($u->created_at->startOfDay())) continue;
                $hasRecord = Attendance::where('user_id', $u->id)->whereDate('date', $date)->exists();
                $onLeave = LeaveApplication::where('user_id', $u->id)->where('status', 'Approved')
                    ->whereDate('start_date', '<=', $date)->whereDate('end_date', '>=', $date)->exists();
                if ($hasRecord || $onLeave) continue;

                Attendance::create(['user_id' => $u->id, 'status' => 'Absent', 'date' => $date->toDateString()]);
                $created++;
            }
        }
        return $created;
    }
}