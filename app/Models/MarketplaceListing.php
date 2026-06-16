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
        'phone',
        'image_path',
        'is_sold',
    ];

    protected $casts = [
        'is_sold' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
