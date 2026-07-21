<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;

class Salary extends Model
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'attendance_id',
        'salary_basis',
        'working_hours_per_day',
        'working_days_per_month',
    ];
    

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
