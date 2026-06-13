<?php

namespace App\Http\Controllers\Admin;

use App\Enums\RegistrationStatus;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\URL;

class RegistrationController extends Controller
{
    /**
     * List pending registrations (paginated).
     *
     * Supports filtering by status via query parameter.
     */
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status', 'pending');

        $query = User::query();

        if ($status === 'all') {
            // Return all registrations
        } else {
            $query->where('registration_status', $status);
        }

        $registrations = $query
            ->orderByDesc('created_at')
            ->paginate(15)
            ->through(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roll_number' => $user->roll_number,
                'department' => $user->department,
                'batch' => $user->batch,
                'gender' => $user->gender,
                'blood_group' => $user->blood_group,
                'phone' => $user->phone,
                'registration_status' => $user->registration_status,
                'student_id_card_url' => $user->student_id_card_path
                    ? URL::temporarySignedRoute('admin.registrations.id-card', now()->addHours(1), ['user' => $user->id])
                    : null,
                'rejection_reason' => $user->rejection_reason,
                'created_at' => $user->created_at,
                'approved_at' => $user->approved_at,
            ]);

        return response()->json($registrations);
    }

    /**
     * Show a single registration.
     */
    public function show(User $user): JsonResponse
    {
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roll_number' => $user->roll_number,
                'department' => $user->department,
                'batch' => $user->batch,
                'gender' => $user->gender,
                'blood_group' => $user->blood_group,
                'phone' => $user->phone,
                'registration_status' => $user->registration_status,
                'student_id_card_url' => $user->student_id_card_path
                    ? URL::temporarySignedRoute('admin.registrations.id-card', now()->addHours(1), ['user' => $user->id])
                    : null,
                'rejection_reason' => $user->rejection_reason,
                'created_at' => $user->created_at,
                'approved_at' => $user->approved_at,
                'approved_by' => $user->approvedBy?->name,
            ],
        ]);
    }

    /**
     * Approve a user's registration.
     */
    public function approve(Request $request, User $user): JsonResponse
    {
        if ($user->registration_status !== RegistrationStatus::Pending) {
            return response()->json([
                'message' => 'This registration is not in a pending state.',
            ], 422);
        }

        $user->update([
            'registration_status' => RegistrationStatus::Approved,
            'approved_at' => now(),
            'approved_by' => $request->user()->id,
            'rejection_reason' => null,
        ]);

        return response()->json([
            'message' => 'Registration approved successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'registration_status' => $user->registration_status,
            ],
        ]);
    }

    /**
     * Reject a user's registration.
     */
    public function reject(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        if ($user->registration_status !== RegistrationStatus::Pending) {
            return response()->json([
                'message' => 'This registration is not in a pending state.',
            ], 422);
        }

        $user->update([
            'registration_status' => RegistrationStatus::Rejected,
            'rejection_reason' => $request->rejection_reason,
        ]);

        return response()->json([
            'message' => 'Registration rejected.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'registration_status' => $user->registration_status,
                'rejection_reason' => $user->rejection_reason,
            ],
        ]);
    }

    /**
     * Serve the student ID card image.
     *
     * Only accessible to admins. Serves from local disk storage.
     */
    public function idCard(User $user): mixed
    {
        if (!$user->student_id_card_path) {
            abort(404, 'No ID card uploaded.');
        }

        $path = storage_path('app/private/' . $user->student_id_card_path);

        if (!file_exists($path)) {
            abort(404, 'ID card file not found.');
        }

        return response()->file($path);
    }
}
