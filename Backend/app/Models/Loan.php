<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

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
}
