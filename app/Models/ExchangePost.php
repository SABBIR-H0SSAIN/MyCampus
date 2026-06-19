<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExchangePost extends Model
{
    protected $fillable = [
        'user_id',
        'offering',
        'desire',
        'description',
        'phone',
        'images',
        'status',
    ];

    protected $casts = [
        'images' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function exchangeRequests()
    {
        return $this->hasMany(ExchangeRequest::class);
    }
}
