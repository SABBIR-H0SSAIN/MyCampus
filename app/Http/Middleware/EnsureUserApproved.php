<?php

namespace App\Http\Middleware;

use App\Enums\RegistrationStatus;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserApproved
{
    /**
     * Handle an incoming request.
     *
     * Blocks access for users whose registration has not been approved by an admin.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

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

        return $next($request);
    }
}
