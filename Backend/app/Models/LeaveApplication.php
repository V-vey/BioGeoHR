<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;

class LeaveApplication extends Model
{
    use HasFactory, Notifiable;

    
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'leave_balance_id',
        'leave_type',
        'start_date',
        'end_date',
        'reason',
        'status',
        'remarks',
    ];

    public function user()
    {
        return $this->belongsTo(Users::class, 'user_id', 'id');
    }

    public function leaveBalance()
    {
        return $this->belongsTo(LeaveBalance::class);
    }

    public const AUTO_REJECT_NOTE = 'Automatically rejected: the leave date passed before it was reviewed.';

    /**
     * A request that was filed ahead of time and is still Pending after its first day has passed.
     * One filed after its own start date (a sick day reported later) is left for HR to decide.
     */
    public function scopeExpiredPending(Builder $query): Builder
    {
        return $query->where('status', 'Pending')
            ->whereDate('start_date', '<', now('Asia/Manila')->toDateString())
            ->whereRaw('DATE(created_at) <= start_date');
    }

    /**
     * Reject every request that expired while it was Pending. Nothing has been taken from the leave
     * balance yet (that happens on approval), so there is nothing to give back. Called whenever the
     * leave list is read, so it needs no scheduled job. Returns how many were rejected.
     */
    public static function rejectExpired(): int
    {
        $rejected = 0;
        foreach (static::expiredPending()->get() as $leave) {
            // the status is checked again in the update itself, so two people reading the list at once reject it once
            $changed = static::whereKey($leave->id)->where('status', 'Pending')
                ->update(['status' => 'Rejected', 'remarks' => self::AUTO_REJECT_NOTE]);
            if ($changed) {
                AuditLog::record(
                    'leave', 'leave_auto_rejected', 'success',
                    "Leave #{$leave->id} (user {$leave->user_id}): the leave date passed while it was still pending",
                    $leave->user_id
                );
                $rejected++;
            }
        }

        return $rejected;
    }
}
