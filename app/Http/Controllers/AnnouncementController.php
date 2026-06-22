<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    /**
     * Return all published announcements — pinned first, then latest.
     * Students can only read; no create/edit/delete.
     */
    public function index(Request $request): JsonResponse
    {
        $category = $request->query('category');

        $query = Announcement::with('author.profile')
            ->published()
            ->orderByDesc('is_pinned')
            ->orderByDesc('created_at');

        if ($category && $category !== 'All') {
            $query->where('category', $category);
        }

        $announcements = $query->get()->map(function (Announcement $a) {
            return [
                'id'          => (string) $a->id,
                'title'       => $a->title,
                'body'        => $a->body,
                'category'    => $a->category,
                'isPinned'    => $a->is_pinned,
                'publishedAt' => $a->published_at
                    ? $a->published_at->diffForHumans()
                    : $a->created_at->diffForHumans(),
                'author'      => $a->author->name ?? 'MyCampus Admin',
                'createdAt'   => $a->created_at->toDateString(),
            ];
        });

        return response()->json($announcements);
    }
}
