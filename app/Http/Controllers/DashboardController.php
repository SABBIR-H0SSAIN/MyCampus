<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    // Get dashboard stats
    public function stats(Request $request)
    {
        $user = $request->user();
        $profile = $user->profile;

        $totalAds = $user->marketplaceListings()->count();
        $activeListings = $user->marketplaceListings()->where('is_sold', false)->count();
        $sold = $user->marketplaceListings()->where('is_sold', true)->count();
        $resourcesCount = $user->resources()->count();
        $bloodPosts = $user->bloodRequests()->count();
        $exchanges = $user->exchangePosts()->count();
        $roommatePosts = $user->roommatePosts()->count();

        // Fetch urgent blood request
        $urgentBloodRequest = \App\Models\BloodRequest::with('user')
            ->where('priority', 'Emergency')
            ->where('status', 'Active')
            ->orderBy('created_at', 'desc')
            ->first();

        $urgent = null;
        if ($urgentBloodRequest) {
            $urgent = [
                'id' => $urgentBloodRequest->id,
                'group' => $urgentBloodRequest->blood_group,
                'units' => $urgentBloodRequest->units,
                'hospital' => $urgentBloodRequest->hospital,
                'posted' => $urgentBloodRequest->created_at->diffForHumans(),
                'emergency' => true,
                'status' => 'Active',
            ];
        }

        // Recent Activity
        $recentActivities = collect();
        foreach ($user->marketplaceListings()->latest()->take(3)->get() as $ad) {
            $recentActivities->push(['id' => 'm_'.$ad->id, 'text' => 'You posted an ad: '.$ad->title, 'time' => $ad->created_at->diffForHumans(), 'created_at' => $ad->created_at]);
        }
        foreach ($user->bloodRequests()->latest()->take(3)->get() as $b) {
            $recentActivities->push(['id' => 'b_'.$b->id, 'text' => 'You requested blood: '.$b->blood_group, 'time' => $b->created_at->diffForHumans(), 'created_at' => $b->created_at]);
        }
        
        $recentActivity = $recentActivities->sortByDesc('created_at')->take(5)->values()->map(function($a) {
            unset($a['created_at']);
            return $a;
        });

        if ($recentActivity->isEmpty()) {
            $recentActivity->push([
                'id' => 'welcome',
                'text' => 'Welcome to MyCampus! Start by exploring the resources or posting an ad.',
                'time' => 'Just now',
            ]);
        }

        // Fetch unread notifications
        $unreadNotifications = $user->unreadNotifications->map(function($notification) {
            return [
                'id' => $notification->id,
                'title' => $notification->data['title'] ?? 'New Notification',
                'time' => $notification->created_at->diffForHumans(),
                'unread' => true,
            ];
        });

        return response()->json([
            'stats' => [
                'totalAds' => $totalAds,
                'activeListings' => $activeListings,
                'sold' => $sold,
                'resources' => $resourcesCount,
                'downloads' => 0,
                'bloodPosts' => $bloodPosts,
                'exchanges' => $exchanges,
                'roommatePosts' => $roommatePosts,
                'profileViews' => 0,
                'score' => $profile->score ?? 0,
            ],
            'urgentBloodRequest' => $urgent,
            'recentActivity' => $recentActivity,
            'unreadNotifs' => $unreadNotifications,
        ]);
    }
}
