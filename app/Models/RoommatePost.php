<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoommatePost extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'location',
        'latitude',
        'longitude',
        'budget',
        'move_in_date',
        'lifestyle',
        'looking_for',
        'description',
        'contact',
        'status',
        'images',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'lifestyle' => 'array',
        'move_in_date' => 'date',
        'images' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function requests()
    {
        return $this->hasMany(RoommateRequest::class);
    }
}
