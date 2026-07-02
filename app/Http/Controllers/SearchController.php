<?php

namespace App\Http\Controllers;

use App\Models\BloodRequest;
use App\Models\ExchangePost;
use App\Models\LostAndFoundItem;
use App\Models\MarketplaceListing;
use App\Models\Resource;
use App\Models\RoommatePost;
use Illuminate\Http\Request;

/**
 * Cross-module search endpoint.
 *
 * Route: GET /api/search?q=…
 * Middleware: auth:sanctum, EnsureUserApproved (matches all module indexes).
 *
 * Returns up to N hits per module in a single round-trip so the global
 * search bar can render grouped results in one dropdown. Each module only
 * matches a small set of identifying fields (title + 1–2 key columns) to
 * keep noise low and queries fast.
 *
 * Response shape:
 *   { "q": "wal", "total": 4, "groups": { "marketplace": [...], "lostFound": [...] } }
 * Empty groups are omitted so the UI only shows modules with hits.
 */
class SearchController extends Controller
{
    /** Maximum hits returned per module — enough for a dropdown, keeps payload small. */
    protected int $perModuleLimit = 5;

    public function search(Request $request)
    {
        $q = trim((string) $request->query('q', ''));

        // Guard: require at least 2 chars before hitting the DB at all.
        // The frontend also enforces this, but defense in depth.
        if (mb_strlen($q) < 2) {
            return response()->json(['q' => $q, 'total' => 0, 'groups' => []]);
        }

        // Escape LIKE wildcards so a user typing "%" or "_" doesn't get
        // surprise matches. We still use parameter binding (no SQL injection).
        $like = '%' . str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $q) . '%';

        $groups = [];

        // ── 1. Marketplace — title + category ───────────────────────
        $groups['marketplace'] = MarketplaceListing::where(function ($x) use ($like) {
            $x->where('title', 'like', $like)
              ->orWhere('category', 'like', $like);
        })
            ->latest()
            ->limit($this->perModuleLimit)
            ->get(['id', 'title', 'category', 'price', 'images'])
            ->map(fn ($r) => [
                'id'       => (string) $r->id,
                'title'    => $r->title,
                'subtitle' => "{$r->category} · ৳{$r->price}",
                'image'    => $r->images[0] ?? null,
            ]);

        // ── 2. Exchange — offering + desire ─────────────────────────
        $groups['exchange'] = ExchangePost::where(function ($x) use ($like) {
            $x->where('offering', 'like', $like)
              ->orWhere('desire', 'like', $like);
        })
            ->latest()
            ->limit($this->perModuleLimit)
            ->get(['id', 'offering', 'desire', 'status', 'images'])
            ->map(fn ($r) => [
                'id'       => (string) $r->id,
                'title'    => $r->offering,
                'subtitle' => "wants {$r->desire} · {$r->status}",
                'image'    => $r->images[0] ?? null,
            ]);

        // ── 3. Blood Network — hospital + blood_group ───────────────
        $groups['blood'] = BloodRequest::where(function ($x) use ($like) {
            $x->where('hospital', 'like', $like)
              ->orWhere('blood_group', 'like', $like);
        })
            ->latest()
            ->limit($this->perModuleLimit)
            ->get(['id', 'blood_group', 'units', 'hospital', 'priority', 'status'])
            ->map(fn ($r) => [
                'id'       => (string) $r->id,
                'title'    => "{$r->blood_group} · {$r->units} units",
                'subtitle' => "{$r->hospital} · {$r->priority}",
                'image'    => null,
            ]);

        // ── 4. Resources — title + course_code ──────────────────────
        $groups['resources'] = Resource::where(function ($x) use ($like) {
            $x->where('title', 'like', $like)
              ->orWhere('course_code', 'like', $like);
        })
            ->latest()
            ->limit($this->perModuleLimit)
            ->get(['id', 'title', 'course_code', 'resource_type', 'department'])
            ->map(fn ($r) => [
                'id'       => (string) $r->id,
                'title'    => $r->title,
                'subtitle' => "{$r->resource_type} · {$r->course_code}",
                'image'    => null,
            ]);

        // ── 5. Roommates — title + location ─────────────────────────
        $groups['roommates'] = RoommatePost::where(function ($x) use ($like) {
            $x->where('title', 'like', $like)
              ->orWhere('location', 'like', $like);
        })
            ->latest()
            ->limit($this->perModuleLimit)
            ->get(['id', 'title', 'location', 'budget', 'status'])
            ->map(fn ($r) => [
                'id'       => (string) $r->id,
                'title'    => $r->title,
                'subtitle' => "{$r->location} · ৳{$r->budget}/mo · {$r->status}",
                'image'    => null,
            ]);

        // ── 6. Lost & Found — title + category + location ───────────
        $groups['lostFound'] = LostAndFoundItem::where(function ($x) use ($like) {
            $x->where('title', 'like', $like)
              ->orWhere('category', 'like', $like)
              ->orWhere('location', 'like', $like);
        })
            ->latest()
            ->limit($this->perModuleLimit)
            ->get(['id', 'type', 'title', 'category', 'location'])
            ->map(fn ($r) => [
                'id'       => (string) $r->id,
                'title'    => $r->title,
                'subtitle' => strtoupper($r->type) . " · {$r->category} · {$r->location}",
                'image'    => null,
            ]);

        // Drop empty groups so the UI only renders modules with hits.
        $groups = array_filter($groups, fn ($g) => $g->isNotEmpty());

        $totalHits = array_sum(array_map(fn ($g) => $g->count(), $groups));

        return response()->json([
            'q'      => $q,
            'total'  => $totalHits,
            'groups' => $groups,
        ]);
    }
}
