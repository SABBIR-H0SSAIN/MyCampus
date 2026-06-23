<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LostAndFoundController extends Controller
{
    public function index(Request $request)
    {
        $items = \App\Models\LostAndFoundItem::with('user.profile')->latest()->get();
        
        $formatted = $items->map(function ($item) use ($request) {
            $user = $item->user;
            $department = $user->department ? $user->department->value : 'N/A';
            $batchYear = $user->batch ? substr((string)$user->batch, -2) : 'XX';
            $departmentStr = $department . " '" . $batchYear;

            return [
                'id' => (string) $item->id,
                'type' => $item->type,
                'title' => $item->title,
                'category' => $item->category,
                'description' => $item->description,
                'location' => $item->location,
                'date' => $item->date->format('Y-m-d'),
                'images' => $item->images ?? [],
                'status' => $item->status,
                'reporter' => $user->name,
                'reporterAvatar' => $user->profile->avatar_url ?? 'https://api.dicebear.com/9.x/notionists/svg?seed=' . $user->id,
                'reporterRoll' => $user->roll_number,
                'department' => $departmentStr,
                'phone' => $user->profile->phone ?? 'N/A', // Using profile phone or N/A
                'selfPosted' => $user->id === $request->user()->id,
                'postedAt' => $item->created_at->diffForHumans(),
            ];
        });

        return response()->json($formatted);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:lost,found',
            'title' => 'required|string|max:255',
            'category' => 'required|string',
            'description' => 'required|string',
            'location' => 'required|string|max:255',
            'date' => 'required|date',
            'images.*' => 'image|max:5120',
        ]);

        $imagePaths = [];
        if ($request->hasFile('images')) {
            $files = is_array($request->file('images')) ? $request->file('images') : [$request->file('images')];
            foreach ($files as $file) {
                $imagePaths[] = '/storage/' . $file->store('lost_and_found', 'public');
            }
        }

        $item = $request->user()->lostAndFoundItems()->create([
            'type' => $validated['type'],
            'title' => $validated['title'],
            'category' => $validated['category'],
            'description' => $validated['description'],
            'location' => $validated['location'],
            'date' => $validated['date'],
            'images' => !empty($imagePaths) ? $imagePaths : null,
            'status' => 'active',
        ]);

        return response()->json(['message' => 'Report created successfully', 'id' => $item->id], 201);
    }

    public function update(Request $request, string $id)
    {
        $item = \App\Models\LostAndFoundItem::findOrFail($id);

        if ($item->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => 'sometimes|in:active,resolved',
        ]);

        $item->update($validated);

        return response()->json(['message' => 'Report updated successfully']);
    }

    public function destroy(Request $request, string $id)
    {
        $item = \App\Models\LostAndFoundItem::findOrFail($id);

        if ($item->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $item->delete();

        return response()->json(['message' => 'Report deleted successfully']);
    }
}
