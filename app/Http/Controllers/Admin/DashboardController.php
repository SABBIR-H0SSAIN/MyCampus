<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\MarketplaceListing;
use App\Models\Resource;
use App\Models\ExchangePost;
use App\Models\RoommatePost;
use App\Models\LostAndFoundItem;
use App\Models\BloodRequest;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    // Get real-time stats and analytics for the admin dashboard.
    public function index()
    {
        // 1. Stats Overview
        $totalUsers = User::count();
        $pendingRegistrations = User::pending()->count();
        $marketplaceItems = MarketplaceListing::count();
        $resources = Resource::count();
        
        // Active users (last 7 days from token usage)
        $activeUsers = DB::table('personal_access_tokens')
            ->where('last_used_at', '>=', now()->subDays(7))
            ->distinct('tokenable_id')
            ->count();
            
        // Fallback for local development if tokens are empty
        if ($activeUsers === 0) {
            $activeUsers = User::approved()->count();
        }

        // Fetch open reports count from database
        $openReports = Report::where('status', 'open')->count();

        // 2. Weekly Activity Chart (last 7 days)
        $weeklyData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $dayName = $date->format('D');
            $startOfDay = $date->copy()->startOfDay();
            $endOfDay = $date->copy()->endOfDay();

            // Count new registrations on this day
            $usersCount = User::whereBetween('created_at', [$startOfDay, $endOfDay])->count();

            // Count posts (Marketplace + Exchange + Roommate + Lost/Found + Blood Requests)
            $mCount = MarketplaceListing::whereBetween('created_at', [$startOfDay, $endOfDay])->count();
            $eCount = ExchangePost::whereBetween('created_at', [$startOfDay, $endOfDay])->count();
            $rCount = RoommatePost::whereBetween('created_at', [$startOfDay, $endOfDay])->count();
            $lCount = LostAndFoundItem::whereBetween('created_at', [$startOfDay, $endOfDay])->count();
            $bCount = BloodRequest::whereBetween('created_at', [$startOfDay, $endOfDay])->count();
            $postsCount = $mCount + $eCount + $rCount + $lCount + $bCount;

            $weeklyData[] = [
                'day' => $dayName,
                'users' => $usersCount,
                'posts' => $postsCount,
            ];
        }

        // 3. Pending Registrations preview (limit 5)
        $pendingUsers = User::pending()
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'roll_number' => $u->roll_number,
                    'department' => $u->department,
                    'created_at' => $u->created_at->diffForHumans(),
                ];
            });

        // 4. Recent Reports (limit 5)
        $recentReports = Report::with('user')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->id,
                    'reason' => $r->reason,
                    'status' => $r->status,
                    'reporter_name' => $r->user->name,
                    'created_at' => $r->created_at->diffForHumans(),
                ];
            });

        return response()->json([
            'analytics' => [
                'totalUsers' => $totalUsers,
                'activeUsers' => $activeUsers,
                'pendingRegistrations' => $pendingRegistrations,
                'marketplaceItems' => $marketplaceItems,
                'resources' => $resources,
                'openReports' => $openReports,
                'weekly' => $weeklyData,
            ],
            'pendingUsers' => $pendingUsers,
            'recentReports' => $recentReports,
        ]);
    }
}
