<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** An employee's spouse or child: a name and a birthday, shown on the profile only. */
class FamilyMember extends Model
{
    protected $fillable = ['user_id', 'relationship', 'name', 'birthday'];

    public function user()
    {
        return $this->belongsTo(Users::class, 'user_id');
    }
}
