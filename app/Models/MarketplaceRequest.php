<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarketplaceRequest extends Model
{
    protected $fillable = [
        'user_id',
        'marketplace_listing_id',
        'message',
        'phone',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function marketplaceListing()
    {
        return $this->belongsTo(MarketplaceListing::class);
    }
}
