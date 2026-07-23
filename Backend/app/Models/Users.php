<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use Laravel\Sanctum\HasApiTokens;

class Users extends Authenticatable
{
    use HasApiTokens;
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'contact_number',
        'password', 
        'role',
        'position',
        'joined_date',
        'call_time',
        'contract_type',
        'gender',
        'date_of_birth',
        'address',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    public function attendance()
    {
        return $this->hasMany(Attendance::class, 'user_id', 'id');
    }
    public function userLocation()
    {
        return $this->hasMany(UserLocation::class, 'user_id', 'id');
    }
    public function leaveApplication()
    {
        return $this->hasMany(LeaveApplication::class, 'user_id', 'id');
    }
    public function salary()
    {
        return $this->hasOne(Salary::class, 'user_id', 'id');
    }
    public function leaveBalance()
    {
        return $this->hasOne(LeaveBalance::class, 'user_id', 'id');
    }
}
