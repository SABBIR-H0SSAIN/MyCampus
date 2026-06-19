<?php

namespace App\Http\Controllers;

use App\Models\ExchangePost;
use App\Models\ExchangeRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ExchangeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $posts = ExchangePost::with(['user.profile', 'exchangeRequests.user.profile'])->latest()->get();

        $formatted = $posts->map(function ($post) use ($request) {
            $user = $post->user;
            $department = $user->department ? $user->department->value : 'N/A';
            $batchYear = $user->batch ? substr((string)$user->batch, -2) : 'XX';
            $departmentStr = $department . " '" . $batchYear;

            return [
                'id' => (string) $post->id,
                'owner' => $user->name,
                'department' => $departmentStr,
                'offering' => $post->offering,
                'desire' => $post->desire,
                'description' => $post->description,
                'phone' => $post->phone,
                'image' => !empty($post->images) ? $post->images[0] : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=70',
                'images' => $post->images ?? [],
                'status' => $post->status,
                'selfPosted' => $user->id === $request->user()->id,
                'postedAt' => $post->created_at->diffForHumans(),
                'responses' => $post->exchangeRequests->map(function ($req) {
                    $reqUser = $req->user;
                    return [
                        'id' => (string) $req->id,
                        'responderName' => $reqUser->name,
                        'responderAvatar' => $reqUser->profile->avatar_url ?? 'https://api.dicebear.com/9.x/notionists/svg?seed=' . $reqUser->id,
                        'responderPhone' => $req->phone,
                        'message' => $req->message,
                        'status' => $req->status,
                        'date' => $req->created_at->diffForHumans(),
                    ];
                })->toArray(),
            ];
        });

        return response()->json($formatted);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'offering' => 'required|string|max:255',
            'desire' => 'required|string|max:255',
            'description' => 'required|string',
            'phone' => 'required|string|max:20',
            'images.*' => 'image|max:5120', // 5MB max
        ]);

        $imagePaths = [];
        if ($request->hasFile('images')) {
            $files = $request->file('images');
            $files = is_array($files) ? $files : [$files];
            foreach ($files as $file) {
                $imagePaths[] = '/storage/' . $file->store('exchange', 'public');
            }
        } elseif ($request->hasFile('images.0')) {
            foreach ($request->file('images') as $file) {
                $imagePaths[] = '/storage/' . $file->store('exchange', 'public');
            }
        }

        $post = $request->user()->exchangePosts()->create([
            'offering' => $validated['offering'],
            'desire' => $validated['desire'],
            'description' => $validated['description'],
            'phone' => $validated['phone'],
            'images' => !empty($imagePaths) ? $imagePaths : null,
        ]);

        return response()->json(['message' => 'Exchange post created successfully', 'id' => $post->id], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $post = ExchangePost::findOrFail($id);

        if ($post->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'offering' => 'sometimes|string|max:255',
            'desire' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'phone' => 'sometimes|string|max:20',
        ]);

        $post->update($validated);

        return response()->json(['message' => 'Exchange post updated successfully']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $post = ExchangePost::findOrFail($id);

        if ($post->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $post->delete();

        return response()->json(['message' => 'Exchange post deleted successfully']);
    }

    /**
     * Display a listing of requests made by the authenticated user.
     */
    public function myRequests(Request $request): JsonResponse
    {
        $requests = $request->user()->exchangeRequests()->latest()->get()->map(function ($req) {
            return [
                'exchangeId' => (string) $req->exchange_post_id,
                'status' => $req->status,
                'message' => $req->message,
                'date' => $req->created_at->diffForHumans(),
            ];
        });

        return response()->json($requests);
    }

    /**
     * Store a newly created request in storage.
     */
    public function storeRequest(Request $request, string $id): JsonResponse
    {
        $post = ExchangePost::findOrFail($id);

        if ($post->user_id === $request->user()->id) {
            return response()->json(['message' => 'Cannot request your own exchange post'], 400);
        }

        if ($post->exchangeRequests()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'You have already requested this exchange'], 400);
        }

        $validated = $request->validate([
            'message' => 'required|string',
            'phone' => 'required|string|max:20',
        ]);

        $exchangeRequest = $post->exchangeRequests()->create([
            'user_id' => $request->user()->id,
            'message' => $validated['message'],
            'phone' => $validated['phone'],
            'status' => 'pending',
        ]);

        return response()->json(['message' => 'Request sent successfully', 'id' => $exchangeRequest->id], 201);
    }

    /**
     * Accept a request.
     */
    public function acceptRequest(Request $request, string $id): JsonResponse
    {
        $exchangeRequest = ExchangeRequest::findOrFail($id);
        $post = $exchangeRequest->exchangePost;

        if ($post->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Accept this request
        $exchangeRequest->update(['status' => 'accepted']);
        
        // Decline all other requests
        $post->exchangeRequests()
            ->where('id', '!=', $exchangeRequest->id)
            ->update(['status' => 'declined']);

        // Mark post as completed
        $post->update(['status' => 'Completed']);

        return response()->json(['message' => 'Exchange request accepted']);
    }
}
