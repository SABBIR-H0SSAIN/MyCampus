<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'created_by',
        'title',
        'body',
        'category',
        'is_pinned',
        'published_at',
    ];

    protected $casts = [
        'is_pinned'    => 'boolean',
        'published_at' => 'datetime',
    ];

    /**
     * The admin who created the announcement.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope to only return published announcements.
     * An announcement is "published" when published_at is null OR published_at <= now.
     */
    public function scopePublished($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('published_at')
              ->orWhere('published_at', '<=', now());
        });
    }
}
