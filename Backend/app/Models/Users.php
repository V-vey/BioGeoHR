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
        'image_path',
        'name',
        'email',
        'contact_number',
        'password', 
        'department',
        'position',
        'call_time',
        'contract_type',
        'employment_status',
        'date_of_birth',
        'gender',
        'nationality',
        'tin',
        'sss_number',
        'philhealth_number',
        'pagibig_number',
        'address',
        'is_active'
    ];

    /**
     * How each government number is written: digits grouped with dashes. A field may have more
     * than one accepted length (a TIN is 9 digits, or 12 with the branch code).
     */
    public const GOV_ID_GROUPS = [
        'tin'               => [[3, 3, 3], [3, 3, 3, 3]], // 123-456-789(-000)
        'sss_number'        => [[2, 7, 1]],               // 12-3456789-0
        'philhealth_number' => [[2, 9, 1]],               // 12-345678901-2
        'pagibig_number'    => [[4, 4, 4]],               // 1234-5678-9012
    ];

    /**
     * 1234567890 or "12 3456789 0" become 12-3456789-0. Nothing becomes null. A number of the wrong
     * length is left as typed, so validation can refuse it.
     */
    public static function formatGovId(string $field, $value): ?string
    {
        $digits = preg_replace('/\D/', '', (string) $value);
        if ($digits === '') {
            return null;
        }
        foreach (self::GOV_ID_GROUPS[$field] as $groups) {
            if (array_sum($groups) === strlen($digits)) {
                $parts = [];
                $at = 0;
                foreach ($groups as $size) {
                    $parts[] = substr($digits, $at, $size);
                    $at += $size;
                }
                return implode('-', $parts);
            }
        }
        return is_string($value) ? trim($value) : null;
    }

    /** The regex a formatted number must match, built from the same groups. */
    public static function govIdRegex(string $field): string
    {
        $options = array_map(
            fn ($groups) => implode('-', array_map(fn ($n) => '\d{' . $n . '}', $groups)),
            self::GOV_ID_GROUPS[$field],
        );
        return '/^(?:' . implode('|', $options) . ')$/';
    }

    public function setTinAttribute($value): void
    {
        $this->attributes['tin'] = self::formatGovId('tin', $value);
    }

    public function setSssNumberAttribute($value): void
    {
        $this->attributes['sss_number'] = self::formatGovId('sss_number', $value);
    }

    public function setPhilhealthNumberAttribute($value): void
    {
        $this->attributes['philhealth_number'] = self::formatGovId('philhealth_number', $value);
    }

    public function setPagibigNumberAttribute($value): void
    {
        $this->attributes['pagibig_number'] = self::formatGovId('pagibig_number', $value);
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */

    public function isHR(): bool
    {
        return $this->department === 'Administrative'
            && str_starts_with($this->position ?? '', 'HR');
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean'
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

    /** Spouse first, then the children, oldest first. Shown on the profile only. */
    public function familyMembers()
    {
        return $this->hasMany(FamilyMember::class, 'user_id', 'id')
            ->orderByRaw("relationship = 'Spouse' DESC")
            ->orderBy('birthday')
            ->orderBy('id');
    }
}
