<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;

class Attendance extends Model
{
    use HasFactory, Notifiable;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    
    protected $fillable = [
        'user_id',
        'location_id',
        'status',
        'date',
        'time_in',
        'time_out',
        'remarks'
    ];

    public function user()
    {
       return $this->belongsTo(Users::class, 'user_id', 'id');
    }
    public function location()
    {
        return $this->belongsTo(Location::class, 'location_id');
    }
    public function salary()
    {
        return $this->hasMany(Salary::class);
    }
    public function flaggedAttendances()
    {
        return $this->hasMany(FlaggedAttendance::class);
    }

    /** The in/out pairs of this day (an employee may clock in again after clocking out). */
    public function sessions()
    {
        return $this->hasMany(AttendanceSession::class);
    }

    /**
     * A day clocked before sessions existed, or entered by HR by hand, has its times only on the
     * row itself. Give it its first session before a second one is added.
     */
    public function ensureFirstSession(): void
    {
        if ($this->time_in && !$this->sessions()->exists()) {
            $this->sessions()->create(['time_in' => $this->time_in, 'time_out' => $this->time_out]);
        }
    }

    /**
     * SQL for "seconds worked" of an attendance row, to use inside a query on the attendances table:
     * the finished sessions added up (the time between sessions is not counted), or, for a day with
     * no sessions, the plain clock-in to clock-out. 0 when it is still running or was never clocked.
     */
    public static function workedSecondsSql(): string
    {
        return "COALESCE(
            (SELECT SUM(TIME_TO_SEC(TIMEDIFF(s.time_out, s.time_in)))
               FROM attendance_sessions s
              WHERE s.attendance_id = attendances.id AND s.time_out IS NOT NULL AND s.time_out >= s.time_in),
            CASE WHEN attendances.time_in IS NOT NULL AND attendances.time_out IS NOT NULL
                      AND attendances.time_out >= attendances.time_in
                 THEN TIME_TO_SEC(TIMEDIFF(attendances.time_out, attendances.time_in)) ELSE 0 END
        )";
    }

    /** How many in/out pairs this day has (a day without sessions counts as one if it was clocked). */
    public static function sessionCountSql(): string
    {
        return "COALESCE(NULLIF((SELECT COUNT(*) FROM attendance_sessions s2 WHERE s2.attendance_id = attendances.id), 0),
                         CASE WHEN attendances.time_in IS NOT NULL THEN 1 ELSE 0 END)";
    }
}
