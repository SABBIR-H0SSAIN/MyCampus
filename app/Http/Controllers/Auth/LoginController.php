<?php

namespace App\Http\Controllers\Auth;

use App\Enums\RegistrationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class LoginController extends Controller
{
    /**
     * Handle a login request.
     *
     * Validates credentials and checks registration status before issuing a token.
     * - Pending users get a 403 with status info.
     * - Rejected users get a 403 with rejection reason.
     * - Approved users get a Sanctum token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'The provided credentials are incorrect.',
            ], 401);
        }

        // Check registration status
        if ($user->registration_status === RegistrationStatus::Pending) {
            return response()->json([
                'message' => 'Your registration is pending admin approval.',
                'registration_status' => 'pending',
            ], 403);
        }

        if ($user->registration_status === RegistrationStatus::Rejected) {
            return response()->json([
                'message' => 'Your registration has been rejected.',
                'registration_status' => 'rejected',
                'rejection_reason' => $user->rejection_reason,
            ], 403);
        }

        // Create Sanctum token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'user' => $user->load('profile', 'roles'),
            'token' => $token,
        ]);
    }

    /**
     * Handle a logout request.
     *
     * Revokes the current access token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }
}
