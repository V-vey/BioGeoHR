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
        'user_location_id',
        'date',
        'time_in',
        'time_out'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
    public function location()
    {
        return $this->hasMany(Location::class);
    }
    public function salary()
    {
        return $this->hasMany(Salary::class);
    }
    public function userLocation()
    {
        return $this->hasOne(UserLocation::class);
    }
}
