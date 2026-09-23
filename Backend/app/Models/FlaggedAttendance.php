<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;

class FlaggedAttendance extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'attendance_id',
        'out_at',
        'in_at',
    ];

    public function attendance()
    {
        return $this->belongsTo(Attendance::class, 'attendance_id', 'id');
    }
}
