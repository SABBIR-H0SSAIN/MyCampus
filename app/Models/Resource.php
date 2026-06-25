<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Resource extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'department',
        'course_code',
        'semester',
        'academic_year',
        'resource_type',
        'file_path',
        'file_name',
        'file_size',
        'external_links',
    ];

    protected $casts = [
        'external_links' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
