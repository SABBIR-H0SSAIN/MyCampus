<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    // List all announcements (includes unpublished/scheduled)
    public function index(Request $request): JsonResponse
    {
        $category = $request->query('category');
        $query = Announcement::with('author')
            ->orderByDesc('is_pinned')
            ->orderByDesc('created_at');

        if ($category && $category !== 'All') {
            $query->where('category', $category);
        }

        $announcements = $query->get()
            ->map(function (Announcement $a) {
                return [
                    'id'          => (string) $a->id,
                    'title'       => $a->title,
                    'body'        => $a->body,
                    'category'    => $a->category,
                    'isPinned'    => $a->is_pinned,
                    'publishedAt' => $a->published_at?->toDateTimeString(),
                    'author'      => $a->author->name ?? 'Admin',
                    'createdAt'   => $a->created_at->diffForHumans(),
                    'isScheduled' => $a->published_at && $a->published_at->isFuture(),
                ];
            });

        return response()->json($announcements);
    }

    // Create a new announcement
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'body'         => 'required|string',
            'category'     => 'required|in:Academic,Event,Club,Emergency',
            'is_pinned'    => 'sometimes|boolean',
            'published_at' => 'sometimes|nullable|date',
        ]);

        $announcement = Announcement::create([
            'created_by'   => $request->user()->id,
            'title'        => $validated['title'],
            'body'         => $validated['body'],
            'category'     => $validated['category'],
            'is_pinned'    => $validated['is_pinned'] ?? false,
            'published_at' => $validated['published_at'] ?? null,
        ]);

        return response()->json([
            'message' => 'Announcement created successfully.',
            'id'      => $announcement->id,
        ], 201);
    }

    // Update an announcement
    public function update(Request $request, string $id): JsonResponse
    {
        $announcement = Announcement::findOrFail($id);

        $validated = $request->validate([
            'title'        => 'sometimes|string|max:255',
            'body'         => 'sometimes|string',
            'category'     => 'sometimes|in:Academic,Event,Club,Emergency',
            'is_pinned'    => 'sometimes|boolean',
            'published_at' => 'sometimes|nullable|date',
        ]);

        $announcement->update($validated);

        return response()->json(['message' => 'Announcement updated successfully.']);
    }

    // Delete an announcement
    public function destroy(string $id): JsonResponse
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->delete();

        return response()->json(['message' => 'Announcement deleted successfully.']);
    }

    // Toggle pin status
    public function togglePin(string $id): JsonResponse
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->update(['is_pinned' => !$announcement->is_pinned]);

        return response()->json([
            'message'  => $announcement->is_pinned ? 'Announcement pinned.' : 'Announcement unpinned.',
            'isPinned' => $announcement->is_pinned,
        ]);
    }
}
