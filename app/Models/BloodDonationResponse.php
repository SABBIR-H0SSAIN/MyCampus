<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BloodDonationResponse extends Model
{
    protected $fillable = [
        'blood_request_id',
        'user_id',
    ];

    public function bloodRequest()
    {
        return $this->belongsTo(BloodRequest::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
