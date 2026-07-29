<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LostAndFoundItem extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'category',
        'description',
        'location',
        'latitude',
        'longitude',
        'date',
        'phone',
        'images',
        'status',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'images' => 'array',
        'date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
