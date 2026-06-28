<?php

use App\Http\Controllers\Admin\RegistrationController;
use App\Http\Controllers\Admin\AnnouncementController as AdminAnnouncementController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\UserController;
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
    Route::post('/forgot-password', [ForgotPasswordController::class, 'forgotPassword']);
    Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);
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

    // Dashboard
    Route::get('/dashboard/stats', [\App\Http\Controllers\DashboardController::class, 'stats']);

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

    // - Lost & Found
    Route::apiResource('lost-found', \App\Http\Controllers\LostAndFoundController::class)->only(['index', 'store', 'update', 'destroy']);
    
    // - Notifications
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
    Route::put('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
    Route::put('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);
    // - Reports

    // Announcements (read-only for students)
    Route::get('/announcements', [AnnouncementController::class, 'index']);
});

// ──────────────────────────────────────────────
// Admin routes (authenticated + approved + admin role)
// ──────────────────────────────────────────────
Route::middleware(['auth:sanctum', EnsureUserApproved::class, 'role:admin'])
    ->prefix('admin')
    ->group(function () {
        // Registration management
        Route::get('/registrations', [RegistrationController::class, 'index']);
        Route::get('/registrations/{user}', [RegistrationController::class, 'show']);
        Route::post('/registrations/{user}/approve', [RegistrationController::class, 'approve']);
        Route::post('/registrations/{user}/reject', [RegistrationController::class, 'reject']);

        // Announcement management
        Route::get('/announcements', [AdminAnnouncementController::class, 'index']);
        Route::post('/announcements', [AdminAnnouncementController::class, 'store']);
        Route::put('/announcements/{id}', [AdminAnnouncementController::class, 'update']);
        Route::delete('/announcements/{id}', [AdminAnnouncementController::class, 'destroy']);
        Route::post('/announcements/{id}/toggle-pin', [AdminAnnouncementController::class, 'togglePin']);
    });

// ──────────────────────────────────────────────
// Signed route for ID card viewing (temporary access without token)
// ──────────────────────────────────────────────
Route::get('/admin/registrations/{user}/id-card', [RegistrationController::class, 'idCard'])
    ->name('admin.registrations.id-card')
    ->middleware('signed');
