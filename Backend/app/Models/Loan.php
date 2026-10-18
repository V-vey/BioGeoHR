<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Carbon\Carbon;

class Loan extends Model
{
    use HasFactory, Notifiable;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    
    protected $fillable = [
        'user_id',
        'loan_type',
        'total_amount',
        'monthly_deduction',
        'remaining_balance',
        'start_date',
        'status'
    ];

    public function user()
    {
       return $this->belongsTo(Users::class, 'user_id', 'id');
    }

    /**
     * The loan that is taken out of this pay period, or null. The one rule, shared by Run Payroll
     * and its preview: the loan is Active, the period is the first cutoff (starts on the 1st to
     * the 15th), and the loan has started by the end of the period.
     */
    public static function dueIn(int|string $userId, string $periodStart, string $periodEnd): ?self
    {
        if (Carbon::parse($periodStart)->day >= 16) {
            return null;
        }

        return static::where('user_id', $userId)
            ->where('status', 'Active')
            ->whereDate('start_date', '<=', $periodEnd)
            ->first();
    }

    /**
     * What this loan takes from a cutoff: the monthly deduction, but never more than the balance
     * or than the net pay there is to take it from, and never below zero.
     */
    public function deductionFor(float $netPayBeforeLoan): float
    {
        return max(0.0, min((float) $this->monthly_deduction, (float) $this->remaining_balance, $netPayBeforeLoan));
    }
}
