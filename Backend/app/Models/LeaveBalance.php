<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;

class LeaveBalance extends Model
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'sick',
        'vacation',
        'emergency',
        'birthday',
        'solo_parent',
        'paternity',
        'maternity',
    ];

    public function user()
    {
        return $this->belongsTo(Users::class, 'user_id', 'id');
    }

    public function leaveApplication()
    {
        return $this->hasMany(LeaveApplication::class);
    }
}
