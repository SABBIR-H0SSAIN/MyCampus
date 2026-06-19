<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExchangeRequest extends Model
{
    protected $fillable = [
        'exchange_post_id',
        'user_id',
        'message',
        'phone',
        'status',
    ];

    public function exchangePost()
    {
        return $this->belongsTo(ExchangePost::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
