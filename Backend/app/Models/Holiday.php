<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Holiday extends Model
{
    public const REGULAR = 'regular';
    public const SPECIAL_NON_WORKING = 'special_non_working';
    public const SPECIAL_WORKING = 'special_working';
    public const TYPES = [self::REGULAR, self::SPECIAL_NON_WORKING, self::SPECIAL_WORKING];

    protected $fillable = [
        'date',
        'name',
        'type',
    ];

    /**
     * The holidays on which nobody is expected to work: regular holidays and special non-working days.
     * A special working day is an ordinary workday, so it is left out: no one is skipped for absence,
     * and a late clock-in is still late.
     */
    public function scopeNonWorking(Builder $query): Builder
    {
        return $query->whereIn('type', [self::REGULAR, self::SPECIAL_NON_WORKING]);
    }
}
