<?php

namespace App\Models;

use App\Enums\Department;
use App\Enums\Gender;
use App\Enums\RegistrationStatus;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'roll_number',
        'department',
        'batch',
        'gender',
        'blood_group',
        'phone',
        'registration_status',
        'student_id_card_path',
        'rejection_reason',
        'approved_at',
        'approved_by',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'department' => Department::class,
            'gender' => Gender::class,
            'registration_status' => RegistrationStatus::class,
            'approved_at' => 'datetime',
            'batch' => 'integer',
        ];
    }

    /**
     * Get the user's profile.
     */
    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class);
    }

    /**
     * Get the admin who approved this user.
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Check if the user's registration is approved.
     */
    public function isApproved(): bool
    {
        return $this->registration_status === RegistrationStatus::Approved;
    }

    /**
     * Check if the user's registration is pending.
     */
    public function isPending(): bool
    {
        return $this->registration_status === RegistrationStatus::Pending;
    }

    /**
     * Check if the user's registration is rejected.
     */
    public function isRejected(): bool
    {
        return $this->registration_status === RegistrationStatus::Rejected;
    }

    /**
     * Scope: only pending registrations.
     */
    public function scopePending($query)
    {
        return $query->where('registration_status', RegistrationStatus::Pending);
    }

    /**
     * Scope: only approved users.
     */
    public function scopeApproved($query)
    {
        return $query->where('registration_status', RegistrationStatus::Approved);
    }

    /**
     * Scope: only rejected users.
     */
    public function scopeRejected($query)
    {
        return $query->where('registration_status', RegistrationStatus::Rejected);
    }
    /**
     * Get the marketplace listings associated with the user.
     */
    public function marketplaceListings()
    {
        return $this->hasMany(MarketplaceListing::class);
    }

    public function favoriteListings()
    {
        return $this->belongsToMany(MarketplaceListing::class, 'marketplace_favorites');
    }

    public function exchangePosts()
    {
        return $this->hasMany(ExchangePost::class);
    }

    public function exchangeRequests()
    {
        return $this->hasMany(ExchangeRequest::class);
    }

    public function marketplaceRequests()
    {
        return $this->hasMany(MarketplaceRequest::class);
    }
}
