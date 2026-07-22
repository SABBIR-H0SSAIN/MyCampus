<?php

namespace App\Services;

use App\Models\Announcement;
use App\Models\BloodRequest;
use App\Models\ExchangePost;
use App\Models\LostAndFoundItem;
use App\Models\MarketplaceListing;
use App\Models\Resource;
use App\Models\RoommatePost;

/**
 * Service to extract structured RAG context from MyCampus database tables
 * for user queries to feed into the AI Assistant.
 */
class RagRetrieverService
{
    /**
     * Retrieve relevant database records based on user query keywords/filters
     * and format them as grounded text chunks for the LLM prompt.
     */
    public function getContextForQuery(string $query): string
    {
        $rawQuery = trim($query);
        if (mb_strlen($rawQuery) < 2) {
            return '';
        }

        // Clean query terms for wildcard matching
        $terms = array_filter(explode(' ', mb_strtolower($rawQuery)), fn ($t) => mb_strlen($t) >= 2);
        
        $like = '%' . str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $rawQuery) . '%';
        
        $contextChunks = [];

        // ── 1. Roommates (Title, Location) ──────────────────────────────────
        $roommates = RoommatePost::where(function ($q) use ($like, $terms) {
            $q->where('title', 'like', $like)
              ->orWhere('location', 'like', $like);
            foreach ($terms as $t) {
                $termLike = '%' . $t . '%';
                $q->orWhere('title', 'like', $termLike)
                  ->orWhere('location', 'like', $termLike);
            }
        })
            ->latest()
            ->limit(4)
            ->get();

        foreach ($roommates as $r) {
            $contextChunks[] = sprintf(
                "[ROOMMATE #%d] Title: %s | Location: %s | Rent: ৳%d/mo | Status: %s | Details: %s",
                $r->id,
                $r->title,
                $r->location,
                $r->budget,
                $r->status,
                $r->details ? mb_substr($r->details, 0, 100) : 'N/A'
            );
        }

        // ── 2. Marketplace (Title, Category, Description) ────────────────────
        $marketplace = MarketplaceListing::where(function ($q) use ($like, $terms) {
            $q->where('title', 'like', $like)
              ->orWhere('category', 'like', $like);
            foreach ($terms as $t) {
                $termLike = '%' . $t . '%';
                $q->orWhere('title', 'like', $termLike)
                  ->orWhere('category', 'like', $termLike);
            }
        })
            ->latest()
            ->limit(4)
            ->get();

        foreach ($marketplace as $m) {
            $contextChunks[] = sprintf(
                "[MARKETPLACE #%d] Title: %s | Category: %s | Price: ৳%d | Condition: %s",
                $m->id,
                $m->title,
                $m->category,
                $m->price,
                $m->condition ?? 'Good'
            );
        }

        // ── 3. Academic Resources (Title, Course Code, Dept) ───────────────
        $resources = Resource::where(function ($q) use ($like, $terms) {
            $q->where('title', 'like', $like)
              ->orWhere('course_code', 'like', $like);
            foreach ($terms as $t) {
                $termLike = '%' . $t . '%';
                $q->orWhere('title', 'like', $termLike)
                  ->orWhere('course_code', 'like', $termLike);
            }
        })
            ->latest()
            ->limit(4)
            ->get();

        foreach ($resources as $res) {
            $contextChunks[] = sprintf(
                "[RESOURCE #%d] Title: %s | Course: %s | Type: %s | Department: %s",
                $res->id,
                $res->title,
                $res->course_code,
                $res->resource_type,
                $res->department ?? 'General'
            );
        }

        // ── 4. Emergency Blood Requests (Blood group, Hospital) ─────────────
        $blood = BloodRequest::where(function ($q) use ($like, $terms) {
            $q->where('blood_group', 'like', $like)
              ->orWhere('hospital', 'like', $like);
            foreach ($terms as $t) {
                $termLike = '%' . $t . '%';
                $q->orWhere('blood_group', 'like', $termLike)
                  ->orWhere('hospital', 'like', $termLike);
            }
        })
            ->latest()
            ->limit(4)
            ->get();

        foreach ($blood as $b) {
            $contextChunks[] = sprintf(
                "[BLOOD_REQUEST #%d] Group: %s | Units: %d | Hospital: %s | Priority: %s | Status: %s",
                $b->id,
                $b->blood_group,
                $b->units,
                $b->hospital,
                $b->priority,
                $b->status
            );
        }

        // ── 5. Product Exchange (Offering, Desire) ─────────────────────────
        $exchange = ExchangePost::where(function ($q) use ($like, $terms) {
            $q->where('offering', 'like', $like)
              ->orWhere('desire', 'like', $like);
            foreach ($terms as $t) {
                $termLike = '%' . $t . '%';
                $q->orWhere('offering', 'like', $termLike)
                  ->orWhere('desire', 'like', $termLike);
            }
        })
            ->latest()
            ->limit(4)
            ->get();

        foreach ($exchange as $ex) {
            $contextChunks[] = sprintf(
                "[EXCHANGE #%d] Offering: %s | Desired: %s | Status: %s",
                $ex->id,
                $ex->offering,
                $ex->desire,
                $ex->status
            );
        }

        // ── 6. Lost & Found Items ──────────────────────────────────────────
        $lostFound = LostAndFoundItem::where(function ($q) use ($like, $terms) {
            $q->where('title', 'like', $like)
              ->orWhere('location', 'like', $like)
              ->orWhere('category', 'like', $like);
            foreach ($terms as $t) {
                $termLike = '%' . $t . '%';
                $q->orWhere('title', 'like', $termLike)
                  ->orWhere('location', 'like', $termLike);
            }
        })
            ->latest()
            ->limit(4)
            ->get();

        foreach ($lostFound as $lf) {
            $contextChunks[] = sprintf(
                "[LOST_FOUND #%d] Type: %s | Item: %s | Category: %s | Location: %s",
                $lf->id,
                strtoupper($lf->type),
                $lf->title,
                $lf->category,
                $lf->location
            );
        }

        // ── 7. Announcements ───────────────────────────────────────────────
        $announcements = Announcement::where(function ($q) use ($like, $terms) {
            $q->where('title', 'like', $like)
              ->orWhere('category', 'like', $like);
            foreach ($terms as $t) {
                $termLike = '%' . $t . '%';
                $q->orWhere('title', 'like', $termLike);
            }
        })
            ->latest()
            ->limit(3)
            ->get();

        foreach ($announcements as $anc) {
            $contextChunks[] = sprintf(
                "[ANNOUNCEMENT #%d] Title: %s | Category: %s | Content: %s",
                $anc->id,
                $anc->title,
                $anc->category,
                mb_substr($anc->content, 0, 120)
            );
        }

        return implode("\n", $contextChunks);
    }
}
