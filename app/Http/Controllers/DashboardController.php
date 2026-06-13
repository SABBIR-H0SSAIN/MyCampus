<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get the dashboard statistics for the authenticated user
     */
    public function stats(Request $request)
    {
        $user = $request->user();
        $profile = $user->profile;

        // In the future, these will be real counts from DB relations
        // e.g. $user->listings()->count()
        // For now, we return 0 for not-yet-implemented features
        // and the real score from the profile.

        return response()->json([
            'stats' => [
                'totalAds' => 0,
                'activeListings' => 0,
                'sold' => 0,
                'resources' => 0,
                'downloads' => 0,
                'bloodPosts' => 0,
                'exchanges' => 0,
                'roommatePosts' => 0,
                'profileViews' => 0,
                'score' => $profile->score ?? 0,
            ]
        ]);
    }
}
