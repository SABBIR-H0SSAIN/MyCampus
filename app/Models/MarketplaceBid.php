<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MarketplaceBid extends Model
{
    use HasFactory;

    protected $fillable = [
        'marketplace_listing_id',
        'user_id',
        'amount',
        'message',
        'phone',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function listing(): BelongsTo
    {
        return $this->belongsTo(MarketplaceListing::class, 'marketplace_listing_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
