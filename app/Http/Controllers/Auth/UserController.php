<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Get the authenticated user's data.
     *
     * Returns user info with profile, roles, and permissions.
     * Accessible even for pending/rejected users (so the frontend
     * can show appropriate status screens).
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load('profile');

        return response()->json([
            'user' => $user,
            'roles' => [$user->role],
            'permissions' => [],
        ]);
    }
}
