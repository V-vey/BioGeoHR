<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;

class Payslip extends Model
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'period_start',
        'period_end',
        'gross_salary',
        'sss',
        'philhealth',
        'pagibig',
        'late_deduction',
        'loan_deduction',
        'net_pay',
    ];

    public function user()
    {
        return $this->belongsTo(Users::class, 'user_id', 'id');
    }
}