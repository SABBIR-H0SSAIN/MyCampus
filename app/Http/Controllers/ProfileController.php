<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    // Get current user profile
    public function show(Request $request)
    {
        $user = $request->user()->load([
            'profile',
            'marketplaceListings' => function($q) { $q->latest()->take(10); },
            'exchangePosts' => function($q) { $q->latest()->take(10); },
            'resources' => function($q) { $q->latest()->take(10); },
            'bloodRequests' => function($q) { $q->latest()->take(10); },
            'roommatePosts' => function($q) { $q->latest()->take(10); },
        ]);

        return response()->json([
            'user' => $user,
        ]);
    }
    // Get specific user profile
    public function getUserProfile($id)
    {
        $user = \App\Models\User::with([
            'profile',
            'marketplaceListings' => function($q) { $q->latest()->take(10); },
            'exchangePosts' => function($q) { $q->latest()->take(10); },
            'resources' => function($q) { $q->latest()->take(10); },
            'bloodRequests' => function($q) { $q->latest()->take(10); },
            'roommatePosts' => function($q) { $q->latest()->take(10); },
        ])
            ->where('id', $id)
            ->orWhere('roll_number', $id)
            ->firstOrFail();
        
        return response()->json([
            'user' => $user,
        ]);
    }
    // Update current user profile
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'contact_number' => ['nullable', 'string', 'max:20'],
            'github' => ['nullable', 'string', 'max:255'],
            'linkedin' => ['nullable', 'string', 'max:255'],
            'website' => ['nullable', 'string', 'max:255'],
        ]);

        $user->update([
            'name' => $validated['name'],
        ]);

        $profile = $user->profile()->firstOrCreate(['user_id' => $user->id]);

        $socialLinks = $profile->social_links ?? [];
        if (array_key_exists('github', $validated)) {
            $socialLinks['github'] = $validated['github'];
        }
        if (array_key_exists('linkedin', $validated)) {
            $socialLinks['linkedin'] = $validated['linkedin'];
        }
        if (array_key_exists('website', $validated)) {
            $socialLinks['website'] = $validated['website'];
        }

        $contactInfo = $profile->contact_info ?? [];
        if (array_key_exists('contact_number', $validated)) {
            $contactInfo['phone'] = $validated['contact_number'];
        }

        $profile->update([
            'bio' => $validated['bio'] ?? $profile->bio,
            'social_links' => $socialLinks,
            'contact_info' => $contactInfo,
        ]);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->load('profile'),
        ]);
    }
    // Upload profile avatar
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'max:2048'], // max 2MB
        ]);

        $user = $request->user();
        $profile = $user->profile()->firstOrCreate(['user_id' => $user->id]);

        if ($profile->avatar_path) {
            Storage::disk('public')->delete($profile->avatar_path);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $profile->update(['avatar_path' => $path]);

        return response()->json([
            'message' => 'Avatar updated successfully',
            'avatar_url' => asset("storage/$path"),
        ]);
    }

    // Upload profile cover photo
    public function uploadCover(Request $request)
    {
        $request->validate([
            'cover' => ['required', 'image', 'max:5120'], // max 5MB
        ]);

        $user = $request->user();
        $profile = $user->profile()->firstOrCreate(['user_id' => $user->id]);

        if ($profile->cover_path) {
            Storage::disk('public')->delete($profile->cover_path);
        }

        $path = $request->file('cover')->store('covers', 'public');
        $profile->update(['cover_path' => $path]);

        return response()->json([
            'message' => 'Cover photo updated successfully',
            'cover_url' => asset("storage/$path"),
        ]);
    }
}
