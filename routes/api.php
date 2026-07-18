<?php

use App\Http\Controllers\Admin\RegistrationController;
use App\Http\Controllers\Admin\AnnouncementController as AdminAnnouncementController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Admin\AnalyticsSummaryController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\UserController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\MarketplaceListingController;
use App\Http\Controllers\RoommateController;
use App\Http\Middleware\EnsureUserApproved;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| MyCampus API routes. All routes are prefixed with /api automatically.
|
*/

// ──────────────────────────────────────────────
// Public (unauthenticated) routes
// ──────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [RegisterController::class, 'register']);
    Route::post('/login', [LoginController::class, 'login']);
});

// ──────────────────────────────────────────────
// Authenticated routes (any registration status)
// ──────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/user', [UserController::class, 'show']);
    Route::post('/auth/logout', [LoginController::class, 'logout']);
});

// ──────────────────────────────────────────────
// Authenticated + Approved routes
// ──────────────────────────────────────────────
Route::middleware(['auth:sanctum', EnsureUserApproved::class])->group(function () {
    // Profile
    Route::get('/profile', [\App\Http\Controllers\ProfileController::class, 'show']);
    Route::get('/users/{id}/profile', [\App\Http\Controllers\ProfileController::class, 'getUserProfile']);
    Route::put('/profile', [\App\Http\Controllers\ProfileController::class, 'update']);
    Route::post('/profile/avatar', [\App\Http\Controllers\ProfileController::class, 'uploadAvatar']);
    Route::post('/profile/cover', [\App\Http\Controllers\ProfileController::class, 'uploadCover']);

    // Dashboard
    Route::get('/dashboard/stats', [\App\Http\Controllers\DashboardController::class, 'stats']);

    // Global cross-module search (powers the topbar search bar)
    Route::get('/search', [\App\Http\Controllers\SearchController::class, 'search']);

    // Marketplace
    Route::get('/marketplace/requests/my', [MarketplaceListingController::class, 'myRequests']);
    Route::post('/marketplace/{id}/request', [MarketplaceListingController::class, 'storeRequest']);
    Route::put('/marketplace/requests/{id}/accept', [MarketplaceListingController::class, 'acceptRequest']);
    Route::post('marketplace/{id}/favorite', [MarketplaceListingController::class, 'toggleFavorite']);
    Route::apiResource('marketplace', MarketplaceListingController::class)->only(['index', 'store', 'update', 'destroy', 'show']);

    // - Product Exchange
    Route::get('/exchange/requests/my', [\App\Http\Controllers\ExchangeController::class, 'myRequests']);
    Route::post('/exchange/{id}/request', [\App\Http\Controllers\ExchangeController::class, 'storeRequest']);
    Route::put('/exchange/requests/{id}/accept', [\App\Http\Controllers\ExchangeController::class, 'acceptRequest']);
    Route::apiResource('exchange', \App\Http\Controllers\ExchangeController::class)->only(['index', 'store', 'update', 'destroy']);

    // - Blood Donation
    Route::post('/blood-requests/{id}/donate', [\App\Http\Controllers\BloodRequestController::class, 'donate']);
    Route::apiResource('blood-requests', \App\Http\Controllers\BloodRequestController::class)->only(['index', 'store', 'update', 'destroy']);

    // - Resource Hub
    Route::post('/resources/{id}', [\App\Http\Controllers\ResourceController::class, 'update']); // for multipart/form-data
    Route::apiResource('resources', \App\Http\Controllers\ResourceController::class)->only(['index', 'store', 'destroy']);

    // - Roommate Finder
    Route::apiResource('roommates', RoommateController::class);
    Route::post('roommates/{id}/request', [RoommateController::class, 'requestRoommate']);
    Route::get('roommates/{id}/requests', [RoommateController::class, 'getPostRequests']);
    Route::get('my-roommate-requests', [RoommateController::class, 'getMyRequests']);
    Route::post('roommate-requests/{id}/respond', [RoommateController::class, 'respondToRequest']);
    // AI: Roommate compatibility check (rate-limited)
    Route::get('roommates/{id}/compatibility', [\App\Http\Controllers\RoommateCompatibilityController::class, 'check'])
        ->middleware('ai.ratelimit');

    // - Lost & Found
    Route::apiResource('lost-found', \App\Http\Controllers\LostAndFoundController::class)->only(['index', 'store', 'update', 'destroy']);
    
    // - Notifications
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
    Route::put('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
    Route::put('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);
    
    // - Reports
    Route::post('/reports', [ReportController::class, 'store']);

    // Announcements (read-only for students)
    Route::get('/announcements', [AnnouncementController::class, 'index']);
});

// ──────────────────────────────────────────────
// Admin routes (authenticated + approved + admin role)
// ──────────────────────────────────────────────
Route::middleware(['auth:sanctum', EnsureUserApproved::class, 'role:admin'])
    ->prefix('admin')
    ->group(function () {
        // Stats Overview
        Route::get('/stats', [AdminDashboardController::class, 'index']);
        // AI-generated executive summary of platform stats (rate-limited)
        Route::post('/analytics-summary', [AnalyticsSummaryController::class, 'summarize'])
            ->middleware('ai.ratelimit');

        // Registration management
        Route::get('/registrations', [RegistrationController::class, 'index']);
        Route::get('/registrations/{user}', [RegistrationController::class, 'show']);
        Route::post('/registrations/{user}/approve', [RegistrationController::class, 'approve']);
        Route::post('/registrations/{user}/reject', [RegistrationController::class, 'reject']);

        // User management
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::put('/users/{user}/role', [AdminUserController::class, 'updateRole']);
        Route::delete('/users/{user}', [AdminUserController::class, 'destroy']);

        // Announcement management
        Route::get('/announcements', [AdminAnnouncementController::class, 'index']);
        Route::post('/announcements', [AdminAnnouncementController::class, 'store']);
        Route::put('/announcements/{id}', [AdminAnnouncementController::class, 'update']);
        Route::delete('/announcements/{id}', [AdminAnnouncementController::class, 'destroy']);
        Route::post('/announcements/{id}/toggle-pin', [AdminAnnouncementController::class, 'togglePin']);

        // Reports management
        Route::get('/reports', [AdminReportController::class, 'index']);
        Route::put('/reports/{id}/status', [AdminReportController::class, 'updateStatus']);
        Route::delete('/reports/{id}', [AdminReportController::class, 'destroy']);
    });

// ──────────────────────────────────────────────
// Signed route for ID card viewing (temporary access without token)
// ──────────────────────────────────────────────
Route::get('/admin/registrations/{user}/id-card', [RegistrationController::class, 'idCard'])
    ->name('admin.registrations.id-card')
    ->middleware('signed');

// ──────────────────────────────────────────────
// Debug routes (admin only) — local development helpers
// Automatically 404 in production via prevent.production middleware.
// ──────────────────────────────────────────────
Route::middleware(['prevent.production', 'auth:sanctum', EnsureUserApproved::class, 'role:admin'])
    ->prefix('_debug')
    ->group(function () {
        // Quick Gemini connectivity test. Returns model, endpoint, prompt,
        // and the raw Gemini response (or detailed error).
        // Usage: GET /api/_debug/gemini-test[?prompt=...]
        Route::get('/gemini-test', [\App\Http\Controllers\_Debug\GeminiDebugController::class, 'test']);
    });
