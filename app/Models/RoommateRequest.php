<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoommateRequest extends Model
{
    protected $fillable = [
        'roommate_post_id',
        'requester_id',
        'message',
        'contact_number',
        'status',
    ];

    public function post()
    {
        return $this->belongsTo(RoommatePost::class, 'roommate_post_id');
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }
}
