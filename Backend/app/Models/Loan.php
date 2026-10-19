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
        'status',
        'unpaid_amount'
    ];

    public function user()
    {
       return $this->belongsTo(Users::class, 'user_id', 'id');
    }

    public const CARRIES_UNPAID = ['SSS', 'Pag-IBIG'];

    /** Every active loan that has started by the end of the period (an employee can have several). */
   public static function dueIn(int|string $userId, string $periodStart, string $periodEnd): \Illuminate\Support\Collection
    {
        return static::where('user_id', $userId)
            ->where('status', 'Active')
            ->whereDate('start_date', '<=', $periodEnd)
            ->orderBy('id')
            ->get();
    }

    /** The full monthly deduction is taken in the 1st-15th cutoff; the 16th-end collects only what was left unpaid. */
    public function scheduledFor(string $periodStart): float
    {
        return Carbon::parse($periodStart)->day <= 15 ? round((float) $this->monthly_deduction, 2) : 0.0;
    }
    /** What is owed this cutoff: the scheduled part plus any unpaid part carried forward, never more than the balance. */
    public function dueFor(string $periodStart): float
    {
        return min($this->scheduledFor($periodStart) + (float) $this->unpaid_amount, (float) $this->remaining_balance);
    }

    /** What is actually taken: what is due, but never more than the pay left to take it from, and never below zero. */
    public function deductionFor(float $netPayAvailable, string $periodStart): float
    {
        return max(0.0, min($this->dueFor($periodStart), $netPayAvailable));
    }
    /**
     * The one rule shared by Run Payroll and its preview. Walks through the employee's loans, each taking from
     * the pay that is left, and returns the total plus a line per loan: what it took and what it leaves unpaid.
     * Saves nothing.
     */
    public static function planFor(int|string $userId, string $periodStart, string $periodEnd, float $netPayBeforeLoans): array
    {
        $left = $netPayBeforeLoans;
        $total = 0.0;
        $lines = [];

        foreach (static::dueIn($userId, $periodStart, $periodEnd) as $loan) {
            $due = $loan->dueFor($periodStart);
            $taken = $loan->deductionFor($left, $periodStart);
            $left -= $taken;
            $total += $taken;
            $lines[] = [
                'loan'   => $loan,
                'taken'  => round($taken, 2),
                'unpaid' => in_array($loan->loan_type, self::CARRIES_UNPAID, true) ? round(max(0, $due - $taken), 2) : 0.0,
            ];
        }

        return ['total' => round($total, 2), 'lines' => $lines];
    }
    
}
