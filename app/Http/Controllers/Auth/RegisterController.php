<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class RegisterController extends Controller
{
    // Handle a registration request. Creates a new user with pending status and stores the student ID card. The user must wait for admin approval before they can log in.
    public function register(RegisterRequest $request): JsonResponse
    {
        // Store the student ID card
        $idCardPath = $request->file('student_id_card')->store('id-cards', 'local');

        // Create the user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'roll_number' => $request->roll_number,
            'department' => $request->department,
            'batch' => $request->batch,
            'gender' => $request->gender,
            'blood_group' => $request->blood_group,
            'phone' => $request->phone,
            'student_id_card_path' => $idCardPath,
            'registration_status' => 'pending',
        ]);


        // Create empty profile
        $user->profile()->create();

        return response()->json([
            'message' => 'Registration submitted successfully. Please wait for admin approval.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roll_number' => $user->roll_number,
                'registration_status' => $user->registration_status,
            ],
        ], 201);
    }
}
