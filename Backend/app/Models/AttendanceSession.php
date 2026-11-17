<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** One clock-in to clock-out of an attendance day, at the place it was clocked in. time_out is empty while it is still running. */
class AttendanceSession extends Model
{
    protected $fillable = ['attendance_id', 'location_id', 'time_in', 'time_out'];

    public function attendance()
    {
        return $this->belongsTo(Attendance::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }
}
