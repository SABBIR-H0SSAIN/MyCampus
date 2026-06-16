<?php

namespace App\Http\Controllers;

use App\Models\MarketplaceListing;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MarketplaceListingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $listings = MarketplaceListing::with('user.profile')->latest()->get();

        $formatted = $listings->map(function ($listing) use ($request) {
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
                'image' => $listing->image_path ?: 'https://images.unsplash.com/photo-1574607383476-f517f260d30b?w=600&q=70',
                'images' => $listing->image_path ? [$listing->image_path, $listing->image_path] : [],
                'sold' => (bool) $listing->is_sold,
                'location' => $listing->location,
                'phone' => $listing->phone,
                'description' => $listing->description ?: 'No description provided.',
                'selfPosted' => $user->id === $request->user()->id,
                'favorites' => false,
                'postedAt' => $listing->created_at->diffForHumans(),
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

        $imagePath = null;
        if ($request->hasFile('images')) {
            $file = $request->file('images')[0];
            $imagePath = '/storage/' . $file->store('marketplace', 'public');
        }

        $listing = $request->user()->marketplaceListings()->create([
            'title' => $validated['title'],
            'category' => $validated['category'],
            'price' => $validated['price'],
            'condition' => $validated['condition'],
            'location' => $validated['location'],
            'phone' => $validated['phone'],
            'description' => $validated['description'],
            'image_path' => $imagePath,
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
}
