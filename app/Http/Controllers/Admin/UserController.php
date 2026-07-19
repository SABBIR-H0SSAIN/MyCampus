<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // List all users with optional filtering
    public function index(Request $request)
    {
        $query = User::with('profile');

        if ($request->has('role') && $request->role !== '') {
            $query->where('role', $request->role);
        }

        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('roll_number', 'like', "%{$search}%");
            });
        }

        // Return all users for simpler frontend integration, or paginate. We'll get all for simplicity in a typical admin table, or paginate if preferred. Let's return all since the registrations page does the same.
        $users = $query->latest()->get();

        return response()->json($users);
    }

    // Update a user's role
    public function updateRole(Request $request, User $user)
    {
        $request->validate([
            'role' => 'required|in:student,admin'
        ]);

        if ($user->id === $request->user()->id && $request->role !== 'admin') {
            return response()->json(['message' => 'You cannot remove your own admin role.'], 400);
        }

        $user->role = $request->role;
        $user->save();

        return response()->json(['message' => 'User role updated successfully.', 'user' => $user]);
    }

    // Delete a user
    public function destroy(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 400);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }
}
