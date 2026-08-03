<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Profile extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'avatar_path',
        'cover_path',
        'bio',
        'contact_info',
        'social_links',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['avatar', 'avatar_url', 'cover', 'cover_url'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'contact_info' => 'array',
            'social_links' => 'array',
        ];
    }

    /**
     * Get the avatar URL.
     */
    public function getAvatarAttribute(): ?string
    {
        if ($this->avatar_path) {
            $path = ltrim($this->avatar_path, '/');
            if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                return $path;
            }
            if (str_starts_with($path, 'storage/')) {
                return '/' . $path;
            }
            return '/storage/' . $path;
        }

        if ($this->relationLoaded('user') && $this->user) {
            return "https://ui-avatars.com/api/?name=" . urlencode($this->user->name) . "&background=random";
        }

        return null;
    }

    /**
     * Get the avatar URL (alias for frontend compatibility).
     */
    public function getAvatarUrlAttribute(): ?string
    {
        return $this->getAvatarAttribute();
    }

    /**
     * Get the cover URL.
     */
    public function getCoverAttribute(): ?string
    {
        return $this->cover_path ? asset('storage/' . $this->cover_path) : null;
    }

    /**
     * Get the cover URL (alias for frontend compatibility).
     */
    public function getCoverUrlAttribute(): ?string
    {
        return $this->cover_path ? asset('storage/' . $this->cover_path) : null;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
