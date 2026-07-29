<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarketplaceListing extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'price',
        'condition',
        'category',
        'location',
        'latitude',
        'longitude',
        'phone',
        'images',
        'views',
        'is_sold',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'is_sold' => 'boolean',
        'images' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function marketplaceRequests()
    {
        return $this->hasMany(MarketplaceRequest::class);
    }

    public function bids()
    {
        return $this->hasMany(MarketplaceBid::class, 'marketplace_listing_id');
    }
}
