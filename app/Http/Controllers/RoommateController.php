<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RoommatePost;
use App\Models\RoommateRequest;

class RoommateController extends Controller
{
    public function index(Request $request)
    {
        $query = RoommatePost::with('user.profile')->latest();

        if ($request->has('search') && $request->search != '') {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('location', 'like', "%{$request->search}%");
            });
        }

        if ($request->has('lifestyle') && $request->lifestyle != 'All') {
            $query->whereJsonContains('lifestyle', $request->lifestyle);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'budget' => 'required|numeric',
            'move_in_date' => 'required|date',
            'lifestyle' => 'nullable|array',
            'looking_for' => 'nullable|string',
            'description' => 'required|string',
            'contact' => 'required|string|max:255',
            'images' => 'nullable|array',
            'images.*' => 'image|max:5120',
        ]);

        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $imagePaths[] = '/storage/' . $file->store('roommates', 'public');
            }
        }

        $post = new RoommatePost(array_merge($validated, ['images' => $imagePaths]));
        $post->user_id = $request->user()->id;
        $post->save();

        return response()->json($post, 201);
    }

    public function update(Request $request, $id)
    {
        $post = RoommatePost::findOrFail($id);

        if ($post->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'location' => 'sometimes|string|max:255',
            'budget' => 'sometimes|numeric',
            'move_in_date' => 'sometimes|date',
            'lifestyle' => 'nullable|array',
            'looking_for' => 'nullable|string',
            'description' => 'sometimes|string',
            'contact' => 'sometimes|string|max:255',
            'status' => 'sometimes|string|in:Open,Closed',
            'images' => 'nullable|array',
            'images.*' => 'image|max:5120',
        ]);

        $imagePaths = $post->images ?? [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $imagePaths[] = '/storage/' . $file->store('roommates', 'public');
            }
        }

        $post->update(array_merge($validated, ['images' => $imagePaths]));

        return response()->json($post);
    }

    public function destroy(Request $request, $id)
    {
        $post = RoommatePost::findOrFail($id);

        if ($post->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $post->delete();

        return response()->json(['message' => 'Post deleted']);
    }

    public function requestRoommate(Request $request, $id)
    {
        $post = RoommatePost::findOrFail($id);

        if ($post->user_id === $request->user()->id) {
            return response()->json(['message' => 'Cannot request your own post'], 400);
        }

        $validated = $request->validate([
            'message' => 'required|string',
            'contact_number' => 'required|string|max:255',
        ]);

        $existingRequest = RoommateRequest::where('roommate_post_id', $id)
            ->where('requester_id', $request->user()->id)
            ->first();

        if ($existingRequest) {
            return response()->json(['message' => 'Request already sent'], 400);
        }

        $roommateRequest = new RoommateRequest([
            'roommate_post_id' => $id,
            'requester_id' => $request->user()->id,
            'message' => $validated['message'],
            'contact_number' => $validated['contact_number'],
        ]);
        $roommateRequest->save();

        return response()->json(['message' => 'Request sent successfully'], 201);
    }

    public function getPostRequests(Request $request, $id)
    {
        $post = RoommatePost::findOrFail($id);

        if ($post->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $requests = RoommateRequest::with('requester.profile')
            ->where('roommate_post_id', $id)
            ->latest()
            ->get();

        return response()->json($requests);
    }

    public function getMyRequests(Request $request)
    {
        $requests = RoommateRequest::with(['post.user.profile'])
            ->where('requester_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($requests);
    }

    public function respondToRequest(Request $request, $requestId)
    {
        $roommateRequest = RoommateRequest::findOrFail($requestId);
        $post = RoommatePost::findOrFail($roommateRequest->roommate_post_id);

        if ($post->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:Accepted,Declined',
        ]);

        $roommateRequest->status = $validated['status'];
        $roommateRequest->save();

        return response()->json(['message' => 'Request ' . strtolower($validated['status'])]);
    }
}
