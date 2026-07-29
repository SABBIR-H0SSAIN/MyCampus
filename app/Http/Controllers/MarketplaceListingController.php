<?php

namespace App\Http\Controllers;

use App\Models\MarketplaceListing;
use App\Models\MarketplaceRequest;
use App\Models\MarketplaceBid;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class MarketplaceListingController extends Controller
{
    // List all marketplace listings
    public function index(Request $request): JsonResponse
    {
        $listings = MarketplaceListing::with(['user.profile', 'marketplaceRequests.user.profile', 'bids.user.profile'])->latest()->get();

        $user = $request->user();
        $favorites = $user ? $user->favoriteListings()->pluck('marketplace_listings.id')->toArray() : [];

        $formatted = $listings->map(function ($listing) use ($request, $favorites) {
            $user = $listing->user;
            $department = $user->department ? $user->department->value : 'N/A';
            
            // Format batch like "'19"
            $batchYear = $user->batch ? substr((string)$user->batch, -2) : 'XX';
            $departmentStr = $department . " '" . $batchYear;

            $activeBids = $listing->bids->where('status', '!=', 'withdrawn');
            $highestBidAmount = $activeBids->max('amount');
            $myBid = $user ? $listing->bids->where('user_id', $user->id)->where('status', '!=', 'withdrawn')->sortByDesc('created_at')->first() : null;

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
                'latitude' => $listing->latitude,
                'longitude' => $listing->longitude,
                'phone' => $listing->phone,
                'description' => $listing->description ?: 'No description provided.',
                'selfPosted' => $user->id === $request->user()->id,
                'favorites' => in_array($listing->id, $favorites),
                'postedAt' => $listing->created_at->diffForHumans(),
                'bidsCount' => $activeBids->count(),
                'highestBid' => $highestBidAmount ? (float) $highestBidAmount : null,
                'myBid' => $myBid ? [
                    'id' => (string) $myBid->id,
                    'amount' => (float) $myBid->amount,
                    'message' => $myBid->message,
                    'status' => $myBid->status,
                    'createdAt' => $myBid->created_at->diffForHumans(),
                ] : null,
                'bids' => $listing->bids->map(function ($bid) use ($request, $user) {
                    $bidUser = $bid->user;
                    $bidDept = ($bidUser && $bidUser->department) ? $bidUser->department->value : null;
                    return [
                        'id' => (string) $bid->id,
                        'amount' => (float) $bid->amount,
                        'message' => $bid->message,
                        'phone' => ($user->id === $request->user()->id || $bid->user_id === $request->user()->id) ? $bid->phone : null,
                        'status' => $bid->status,
                        'bidderName' => $bidUser ? $bidUser->name : 'Student',
                        'bidderAvatar' => $bidUser?->profile?->avatar_url ?? 'https://api.dicebear.com/9.x/notionists/svg?seed=' . ($bidUser ? $bidUser->id : '0'),
                        'bidderRoll' => $bidUser ? $bidUser->roll_number : null,
                        'bidderDepartment' => $bidDept,
                        'isMine' => $bid->user_id === $request->user()->id,
                        'createdAt' => $bid->created_at->diffForHumans(),
                    ];
                })->values()->toArray(),
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

    // Create a new listing
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string',
            'price' => 'required|numeric|min:0',
            'condition' => 'required|string',
            'location' => 'required|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
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
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'phone' => $validated['phone'],
            'description' => $validated['description'],
            'images' => !empty($imagePaths) ? $imagePaths : null,
        ]);

        return response()->json(['message' => 'Listing created successfully', 'id' => $listing->id], 201);
    }

    // Update a listing
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
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'phone' => 'sometimes|string',
            'description' => 'sometimes|string',
            'is_sold' => 'sometimes|boolean',
        ]);

        $listing->update($validated);

        return response()->json(['message' => 'Listing updated successfully']);
    }

    // Delete a listing
    public function destroy(Request $request, string $id): JsonResponse
    {
        $listing = MarketplaceListing::findOrFail($id);

        if ($listing->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $listing->delete();

        return response()->json(['message' => 'Listing deleted successfully']);
    }

    // View a listing and increment views
    public function show(string $id): JsonResponse
    {
        $listing = MarketplaceListing::findOrFail($id);
        $listing->increment('views');

        return response()->json([
            'message' => 'View recorded',
            'views' => $listing->views
        ]);
    }

    // Toggle favorite status
    public function toggleFavorite(Request $request, string $id): JsonResponse
    {
        $listing = MarketplaceListing::findOrFail($id);
        $request->user()->favoriteListings()->toggle($listing);

        return response()->json(['message' => 'Favorite toggled']);
    }

    // List user's requests
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

    // Submit a request for a listing
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

    // Accept a request
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

    // ──────────────────────────────────────────────
    // Bidding System Endpoints
    // ──────────────────────────────────────────────

    // Place or update a bid on a listing
    public function storeBid(Request $request, string $id): JsonResponse
    {
        $listing = MarketplaceListing::with('user')->findOrFail($id);

        if ($listing->user_id === $request->user()->id) {
            return response()->json(['message' => 'You cannot place a bid on your own listing.'], 400);
        }

        if ($listing->is_sold) {
            return response()->json(['message' => 'This listing has already been sold.'], 400);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'message' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:20',
        ]);

        // If user already has a pending bid, update it or create new
        $bid = MarketplaceBid::updateOrCreate(
            [
                'marketplace_listing_id' => $listing->id,
                'user_id' => $request->user()->id,
                'status' => 'pending',
            ],
            [
                'amount' => $validated['amount'],
                'message' => $validated['message'] ?? null,
                'phone' => $validated['phone'] ?? null,
            ]
        );

        // Notify seller about new bid
        $listing->user->notifications()->create([
            'id' => (string) Str::uuid(),
            'type' => 'App\\Notifications\\NewBidNotification',
            'data' => [
                'title' => 'New Bid: ৳' . number_format($bid->amount, 0),
                'message' => $request->user()->name . ' placed a bid on "' . $listing->title . '".',
                'link' => '/app/marketplace?open=' . $listing->id,
            ],
            'read_at' => null,
        ]);

        return response()->json([
            'message' => 'Bid placed successfully!',
            'bid' => [
                'id' => (string) $bid->id,
                'amount' => (float) $bid->amount,
                'message' => $bid->message,
                'status' => $bid->status,
            ]
        ], 201);
    }

    // List bids for a listing
    public function getBids(Request $request, string $id): JsonResponse
    {
        $listing = MarketplaceListing::findOrFail($id);
        $bids = $listing->bids()->with('user.profile')->latest()->get();

        $formatted = $bids->map(function ($bid) use ($request, $listing) {
            $user = $bid->user;
            $dept = ($user && $user->department) ? $user->department->value : null;

            return [
                'id' => (string) $bid->id,
                'amount' => (float) $bid->amount,
                'message' => $bid->message,
                'phone' => ($request->user()->id === $listing->user_id || $bid->user_id === $request->user()->id) ? $bid->phone : null,
                'status' => $bid->status,
                'bidderName' => $user ? $user->name : 'Student',
                'bidderAvatar' => $user?->profile?->avatar_url ?? 'https://api.dicebear.com/9.x/notionists/svg?seed=' . ($user ? $user->id : '0'),
                'bidderRoll' => $user ? $user->roll_number : null,
                'bidderDepartment' => $dept,
                'isMine' => $bid->user_id === $request->user()->id,
                'createdAt' => $bid->created_at->diffForHumans(),
            ];
        });

        return response()->json($formatted);
    }

    // Seller accepts a bid
    public function acceptBid(Request $request, string $id): JsonResponse
    {
        $bid = MarketplaceBid::with(['listing.user', 'user'])->findOrFail($id);
        $listing = $bid->listing;

        if ($listing->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized to manage bids on this listing.'], 403);
        }

        // Mark bid as accepted
        $bid->update(['status' => 'accepted']);

        // Mark other bids as rejected
        $listing->bids()
            ->where('id', '!=', $bid->id)
            ->where('status', 'pending')
            ->update(['status' => 'rejected']);

        // Mark listing as sold
        $listing->update(['is_sold' => true]);

        // Notify winning bidder
        $bid->user->notifications()->create([
            'id' => (string) Str::uuid(),
            'type' => 'App\\Notifications\\BidAcceptedNotification',
            'data' => [
                'title' => 'Bid Accepted!',
                'message' => 'Your bid of ৳' . number_format($bid->amount, 0) . ' for "' . $listing->title . '" was accepted.',
                'link' => '/app/marketplace?open=' . $listing->id,
            ],
            'read_at' => null,
        ]);

        return response()->json(['message' => 'Bid accepted successfully. Listing marked as sold.']);
    }

    // Seller rejects a bid
    public function rejectBid(Request $request, string $id): JsonResponse
    {
        $bid = MarketplaceBid::with('listing')->findOrFail($id);
        $listing = $bid->listing;

        if ($listing->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $bid->update(['status' => 'rejected']);

        return response()->json(['message' => 'Bid declined.']);
    }

    // Bidder withdraws their pending bid
    public function withdrawBid(Request $request, string $id): JsonResponse
    {
        $bid = MarketplaceBid::findOrFail($id);

        if ($bid->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($bid->status !== 'pending') {
            return response()->json(['message' => 'Cannot withdraw a processed bid.'], 400);
        }

        $bid->update(['status' => 'withdrawn']);

        return response()->json(['message' => 'Bid withdrawn successfully.']);
    }
}
