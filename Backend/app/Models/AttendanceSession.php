<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** One clock-in to clock-out of an attendance day. time_out is empty while it is still running. */
class AttendanceSession extends Model
{
    protected $fillable = ['attendance_id', 'time_in', 'time_out'];

    public function attendance()
    {
        return $this->belongsTo(Attendance::class);
    }
}
