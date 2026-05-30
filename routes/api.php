<?php

use App\Http\Controllers\Admin\RegistrationController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\UserController;
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
    Route::put('/profile', [\App\Http\Controllers\ProfileController::class, 'update']);
    Route::post('/profile/avatar', [\App\Http\Controllers\ProfileController::class, 'uploadAvatar']);

    // Dashboard
    Route::get('/dashboard/stats', [\App\Http\Controllers\DashboardController::class, 'stats']);

    // Future module routes will be added here:
    // - Marketplace
    // - Product Exchange
    // - Blood Donation
    // - Resource Hub
    // - Roommate Finder
    // - Lost & Found
    // - Announcements
    // - Notifications
    // - Reports
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
    });

// ──────────────────────────────────────────────
// Signed route for ID card viewing (temporary access without token)
// ──────────────────────────────────────────────
Route::get('/admin/registrations/{user}/id-card', [RegistrationController::class, 'idCard'])
    ->name('admin.registrations.id-card')
    ->middleware('signed');
