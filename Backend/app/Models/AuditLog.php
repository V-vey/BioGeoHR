<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;

class AuditLog extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'user_id',
        'email',
        'category',
        'action',
        'status',
        'description',
        'ip_address',
    ];

    public static function record(string $category, string $action, string $status = 'success', ?string $details = null, $userId = null, ?string $email = null): void
    {
        try {
            static::create([
                'user_id'    => $userId ?? auth()->id(),
                'email'      => $email,
                'category'   => $category,
                'action'     => $action,
                'status'     => $status,
                'description' => $details,
                'ip_address' => request()->ip(),
            ]);
        } catch (\Throwable $e) {
            report($e);   // logging must never break the real request
        }
    }

    public function user()
    {
        return $this->belongsTo(Users::class, 'user_id', 'id');
    }
}
