<?php

namespace App\Http\Controllers;

use App\Models\MarketplaceListing;
use App\Models\MarketplaceRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MarketplaceListingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $listings = MarketplaceListing::with(['user.profile', 'marketplaceRequests.user.profile'])->latest()->get();

        $user = $request->user();
        $favorites = $user ? $user->favoriteListings()->pluck('marketplace_listings.id')->toArray() : [];

        $formatted = $listings->map(function ($listing) use ($request, $favorites) {
            $user = $listing->user;
            $department = $user->department ? $user->department->value : 'N/A';
            
            // Format batch like "'19"
            $batchYear = $user->batch ? substr((string)$user->batch, -2) : 'XX';
            $departmentStr = $department . " '" . $batchYear;

            return [
                'id' => (string) $listing->id,
                'title' => $listing->title,
                'price' => $listing->price,
                'condition' => $listing->condition,
                'category' => $listing->category,
                'seller' => $user->name,
                'sellerAvatar' => $user->profile->avatar_url ?? 'https://api.dicebear.com/9.x/notionists/svg?seed=' . $user->id,
                'sellerRoll' => $user->roll_number,
                'department' => $departmentStr,
                'image' => !empty($listing->images) ? $listing->images[0] : 'https://images.unsplash.com/photo-1574607383476-f517f260d30b?w=600&q=70',
                'images' => $listing->images ?? [],
                'sold' => (bool) $listing->is_sold,
                'views' => $listing->views,
                'location' => $listing->location,
                'phone' => $listing->phone,
                'description' => $listing->description ?: 'No description provided.',
                'selfPosted' => $user->id === $request->user()->id,
                'favorites' => in_array($listing->id, $favorites),
                'postedAt' => $listing->created_at->diffForHumans(),
                'responses' => ($user->id === $request->user()->id) ? $listing->marketplaceRequests->map(function ($req) {
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
                })->toArray() : [],
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
            'title' => 'required|string|max:255',
            'category' => 'required|string',
            'price' => 'required|numeric|min:0',
            'condition' => 'required|string',
            'location' => 'required|string',
            'phone' => 'required|string',
            'description' => 'required|string',
            'images.*' => 'image|max:5120', // 5MB max
        ]);

        $imagePaths = [];
        if ($request->hasFile('images')) {
            $files = $request->file('images');
            $files = is_array($files) ? $files : [$files];
            foreach ($files as $file) {
                $imagePaths[] = '/storage/' . $file->store('marketplace', 'public');
            }
        } elseif ($request->hasFile('images.0')) {
            foreach ($request->file('images') as $file) {
                $imagePaths[] = '/storage/' . $file->store('marketplace', 'public');
            }
        }

        $listing = $request->user()->marketplaceListings()->create([
            'title' => $validated['title'],
            'category' => $validated['category'],
            'price' => $validated['price'],
            'condition' => $validated['condition'],
            'location' => $validated['location'],
            'phone' => $validated['phone'],
            'description' => $validated['description'],
            'images' => !empty($imagePaths) ? $imagePaths : null,
        ]);

        return response()->json(['message' => 'Listing created successfully', 'id' => $listing->id], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $listing = MarketplaceListing::findOrFail($id);

        if ($listing->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'category' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0',
            'condition' => 'sometimes|string',
            'location' => 'sometimes|string',
            'phone' => 'sometimes|string',
            'description' => 'sometimes|string',
            'is_sold' => 'sometimes|boolean',
        ]);

        $listing->update($validated);

        return response()->json(['message' => 'Listing updated successfully']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $listing = MarketplaceListing::findOrFail($id);

        if ($listing->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $listing->delete();

        return response()->json(['message' => 'Listing deleted successfully']);
    }

    /**
     * Display the specified resource and increment views.
     */
    public function show(string $id): JsonResponse
    {
        $listing = MarketplaceListing::findOrFail($id);
        $listing->increment('views');

        return response()->json([
            'message' => 'View recorded',
            'views' => $listing->views
        ]);
    }

    /**
     * Toggle favorite status for the listing.
     */
    public function toggleFavorite(Request $request, string $id): JsonResponse
    {
        $listing = MarketplaceListing::findOrFail($id);
        $request->user()->favoriteListings()->toggle($listing);

        return response()->json(['message' => 'Favorite toggled']);
    }

    /**
     * Display a listing of requests made by the authenticated user.
     */
    public function myRequests(Request $request): JsonResponse
    {
        $requests = $request->user()->marketplaceRequests()->latest()->get()->map(function ($req) {
            return [
                'listingId' => (string) $req->marketplace_listing_id,
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
        $listing = MarketplaceListing::findOrFail($id);

        if ($listing->user_id === $request->user()->id) {
            return response()->json(['message' => 'Cannot request your own listing'], 400);
        }

        if ($listing->marketplaceRequests()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'You have already requested this item'], 400);
        }

        $validated = $request->validate([
            'message' => 'required|string',
            'phone' => 'required|string|max:20',
        ]);

        $marketplaceRequest = $listing->marketplaceRequests()->create([
            'user_id' => $request->user()->id,
            'message' => $validated['message'],
            'phone' => $validated['phone'],
            'status' => 'pending',
        ]);

        return response()->json(['message' => 'Request sent successfully', 'id' => $marketplaceRequest->id], 201);
    }

    /**
     * Accept a request.
     */
    public function acceptRequest(Request $request, string $id): JsonResponse
    {
        $marketplaceRequest = MarketplaceRequest::findOrFail($id);
        $listing = $marketplaceRequest->marketplaceListing;

        if ($listing->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Accept this request
        $marketplaceRequest->update(['status' => 'accepted']);
        
        // Decline all other requests
        $listing->marketplaceRequests()
            ->where('id', '!=', $marketplaceRequest->id)
            ->update(['status' => 'declined']);

        // Mark listing as sold
        $listing->update(['is_sold' => true]);

        return response()->json(['message' => 'Request accepted']);
    }
}
