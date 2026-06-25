<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BloodRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'blood_group',
        'units',
        'hospital',
        'date_time',
        'contact',
        'priority',
        'notes',
        'status',
    ];

    protected $casts = [
        'date_time' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function responses()
    {
        return $this->hasMany(BloodDonationResponse::class);
    }
}
