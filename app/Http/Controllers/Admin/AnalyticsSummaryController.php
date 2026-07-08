<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BloodRequest;
use App\Models\ExchangePost;
use App\Models\LostAndFoundItem;
use App\Models\MarketplaceListing;
use App\Models\Report;
use App\Models\Resource;
use App\Models\RoommatePost;
use App\Models\User;
use App\Services\GeminiService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Admin-only endpoint that aggregates platform statistics into a compact,
 * structured payload and asks Gemini to produce a written executive summary
 * (health snapshot, notable trends, recommended actions).
 *
 * Route: POST /api/admin/analytics-summary
 * Middleware: auth:sanctum, EnsureUserApproved, role:admin, ai.ratelimit
 *
 * The stats payload mirrors what the admin dashboard already shows, so the
 * summary stays consistent with the numbers the admin is looking at.
 */
class AnalyticsSummaryController extends Controller
{
    public function __construct(protected GeminiService $gemini) {}

    public function summarize(Request $request): JsonResponse
    {
        $stats = $this->gatherStats();

        // Build a compact, structured prompt (~250-350 tokens). Free tier is
        // 15 RPM / 1000 RPD so we keep it tight but information-rich.
        $prompt = $this->buildPrompt($stats);

        // Bump the output cap to 900 tokens for this endpoint so Gemini can
        // produce a detailed multi-section report. The roommate compatibility
        // endpoint still uses the default 150 via GeminiService::generate().
        $raw = $this->gemini->generate($prompt, 900);

        if (!$raw) {
            return response()->json([
                'message' => 'AI service is temporarily unavailable. Please try again in a moment.',
            ], 503);
        }

        return response()->json([
            'summary'    => trim($raw),
            'generated_at' => now()->toIso8601String(),
            'stats_snapshot' => $stats,
        ]);
    }

    /**
     * Aggregate the same numbers shown on the admin dashboard, plus a much
     * richer set of temporal breakdowns (week-over-week, month-over-month,
     * per-module growth, hourly usage, retention signals) that give Gemini
     * enough context to spot trends — not just describe a snapshot.
     */
    protected function gatherStats(): array
    {
        // ── Headline numbers ────────────────────────────────────────────
        $totalUsers          = User::count();
        $approvedUsers       = User::approved()->count();
        $pendingUsers        = User::pending()->count();
        $rejectedUsers       = User::where('registration_status', 'rejected')->count();

        // ── Active-user counts from Sanctum token activity ──────────────
        // DAU/WAU/MAU = users with token activity in 1 / 7 / 30 days.
        $tokens = DB::table('personal_access_tokens');
        $activeUsers1d  = (clone $tokens)->where('last_used_at', '>=', now()->subDay())->distinct('tokenable_id')->count('tokenable_id');
        $activeUsers7d  = (clone $tokens)->where('last_used_at', '>=', now()->subDays(7))->distinct('tokenable_id')->count('tokenable_id');
        $activeUsers30d = (clone $tokens)->where('last_used_at', '>=', now()->subDays(30))->distinct('tokenable_id')->count('tokenable_id');
        // Local-dev fallback: if no token activity (e.g. fresh DB), use approved-user count
        if ($activeUsers7d === 0) {
            $activeUsers7d = $approvedUsers;
        }

        // ── Content totals ──────────────────────────────────────────────
        $marketplaceCount   = MarketplaceListing::count();
        $marketplaceSold    = MarketplaceListing::where('is_sold', true)->count();
        $resourcesCount     = Resource::count();
        $exchangeCount      = ExchangePost::count();
        $roommateCount      = RoommatePost::count();
        $lostFoundCount     = LostAndFoundItem::count();
        $lostFoundResolved  = LostAndFoundItem::where('status', 'resolved')->count();
        $bloodCount         = BloodRequest::count();

        $openReports        = Report::where('status', 'open')->count();
        $resolvedReports    = Report::where('status', 'resolved')->count();

        // ── 4-week comparison (signups & posts bucketed by week) ────────
        // [this_week(0-6), last_week(7-13), two_weeks_ago(14-20), three_weeks_ago(21-27)]
        $weeklyBuckets = [];
        foreach ([0, 1, 2, 3] as $w) {
            $start = now()->subDays(7 * ($w + 1))->startOfDay();
            $end   = now()->subDays(7 * $w)->endOfDay();
            $weeklyBuckets[] = [
                'label'        => $w === 0 ? 'this_week' : ($w === 1 ? 'last_week' : "weeks_ago_{$w}"),
                'signups'      => User::whereBetween('created_at', [$start, $end])->count(),
                'marketplace'  => MarketplaceListing::whereBetween('created_at', [$start, $end])->count(),
                'resources'    => Resource::whereBetween('created_at', [$start, $end])->count(),
                'exchange'     => ExchangePost::whereBetween('created_at', [$start, $end])->count(),
                'roommates'    => RoommatePost::whereBetween('created_at', [$start, $end])->count(),
                'lost_found'   => LostAndFoundItem::whereBetween('created_at', [$start, $end])->count(),
                'blood'        => BloodRequest::whereBetween('created_at', [$start, $end])->count(),
                'reports'      => Report::whereBetween('created_at', [$start, $end])->count(),
                'token_active' => (clone $tokens)->whereBetween('last_used_at', [$start, $end])->distinct('tokenable_id')->count('tokenable_id'),
            ];
        }
        // Convenience: computed totals + week-over-week growth rates
        $tw  = $weeklyBuckets[0];
        $lw  = $weeklyBuckets[1];
        $twPosts = $tw['marketplace'] + $tw['resources'] + $tw['exchange'] + $tw['roommates'] + $tw['lost_found'] + $tw['blood'];
        $lwPosts = $lw['marketplace'] + $lw['resources'] + $lw['exchange'] + $lw['roommates'] + $lw['lost_found'] + $lw['blood'];
        $growth = [
            'signups_wow'      => $this->pctChange($tw['signups'],    $lw['signups']),
            'posts_wow'        => $this->pctChange($twPosts,          $lwPosts),
            'active_users_wow' => $this->pctChange($tw['token_active'], $lw['token_active']),
            'reports_wow'      => $this->pctChange($tw['reports'],   $lw['reports']),
        ];

        // ── Last 7 days (day-by-day, signups vs total posts) ────────────
        $weeklyData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $start = $date->copy()->startOfDay();
            $end   = $date->copy()->endOfDay();

            $weeklyData[] = [
                'day'    => $date->format('D M j'),
                'users'  => User::whereBetween('created_at', [$start, $end])->count(),
                'posts'  => MarketplaceListing::whereBetween('created_at', [$start, $end])->count()
                         + ExchangePost::whereBetween('created_at', [$start, $end])->count()
                         + RoommatePost::whereBetween('created_at', [$start, $end])->count()
                         + LostAndFoundItem::whereBetween('created_at', [$start, $end])->count()
                         + BloodRequest::whereBetween('created_at', [$start, $end])->count(),
            ];
        }

        // ── 30-day view (weekly buckets, signups + posts + active) ──────
        // Condenses 30 days into 4 readable rows instead of 30 noisy ones.
        $monthlyBuckets = [];
        foreach ([0, 1, 2, 3] as $w) {
            $start = now()->subDays(7 * ($w + 1))->startOfDay();
            $end   = now()->subDays(7 * $w)->endOfDay();
            $monthlyBuckets[] = [
                'label'   => $w === 0 ? 'this_week' : ($w === 1 ? 'last_week' : "weeks_ago_{$w}"),
                'signups' => User::whereBetween('created_at', [$start, $end])->count(),
                'posts'   => MarketplaceListing::whereBetween('created_at', [$start, $end])->count()
                           + ExchangePost::whereBetween('created_at', [$start, $end])->count()
                           + RoommatePost::whereBetween('created_at', [$start, $end])->count()
                           + LostAndFoundItem::whereBetween('created_at', [$start, $end])->count()
                           + BloodRequest::whereBetween('created_at', [$start, $end])->count()
                           + Resource::whereBetween('created_at', [$start, $end])->count(),
                'active'  => (clone $tokens)->whereBetween('last_used_at', [$start, $end])->distinct('tokenable_id')->count('tokenable_id'),
            ];
        }

        // ── Per-module last-7d vs previous-7d growth ────────────────────
        $moduleGrowth = [];
        foreach ([
            'marketplace' => MarketplaceListing::class,
            'resources'   => Resource::class,
            'exchange'    => ExchangePost::class,
            'roommates'   => RoommatePost::class,
            'lost_found'  => LostAndFoundItem::class,
            'blood'       => BloodRequest::class,
        ] as $key => $model) {
            $now7  = $model::where('created_at', '>=', now()->subDays(7))->count();
            $prev7 = $model::whereBetween('created_at', [now()->subDays(14), now()->subDays(7)])->count();
            $moduleGrowth[$key] = [
                'last_7d'      => $now7,
                'prev_7d'      => $prev7,
                'wow_change'   => $this->pctChange($now7, $prev7),
            ];
        }

        // ── Hour-of-day usage (from token activity, last 30d) ───────────
        // Helps Gemini recommend when to post announcements.
        $hourlyRaw = (clone $tokens)
            ->where('last_used_at', '>=', now()->subDays(30))
            ->select(DB::raw('HOUR(last_used_at) as h'), DB::raw('count(*) as c'))
            ->groupBy('h')
            ->pluck('c', 'h')
            ->toArray();
        $hourlyUsage = [];
        for ($h = 0; $h < 24; $h++) {
            $hourlyUsage[$h] = (int) ($hourlyRaw[$h] ?? 0);
        }
        // Compute the peak hour so we don't need to dump 24 numbers
        $peakHour = 0;
        $peakCount = 0;
        foreach ($hourlyUsage as $h => $c) {
            if ($c > $peakCount) { $peakHour = $h; $peakCount = $c; }
        }
        $peakHourLabel = $peakCount > 0 ? sprintf('%02d:00', $peakHour) : 'no data';

        // ── Retention: returning active users ───────────────────────────
        // How many users active in the last 7d were ALSO active in the 7d before that?
        $recentActiveIds = (clone $tokens)
            ->where('last_used_at', '>=', now()->subDays(7))
            ->distinct()->pluck('tokenable_id');
        $previousActiveIds = (clone $tokens)
            ->whereBetween('last_used_at', [now()->subDays(14), now()->subDays(7)])
            ->distinct()->pluck('tokenable_id');
        $retained = count(array_intersect($recentActiveIds->toArray(), $previousActiveIds->toArray()));
        $retentionRate = $recentActiveIds->count() > 0
            ? round(($retained / $recentActiveIds->count()) * 100, 1)
            : 0;

        // ── Activation: new users in last 7d who became active ──────────
        $newUserIdsLast7d = User::where('created_at', '>=', now()->subDays(7))->pluck('id');
        $activatedNewUsers = $newUserIdsLast7d->isEmpty() ? 0 :
            (clone $tokens)
                ->whereIn('tokenable_id', $newUserIdsLast7d)
                ->where('last_used_at', '>=', now()->subDays(7))
                ->distinct('tokenable_id')
                ->count('tokenable_id');
        $activationRate = $newUserIdsLast7d->count() > 0
            ? round(($activatedNewUsers / $newUserIdsLast7d->count()) * 100, 1)
            : 0;

        // ── Engagement ratio: posts-per-active-user (last 7d) ───────────
        $engagementRatio = $activeUsers7d > 0
            ? round($twPosts / $activeUsers7d, 2)
            : 0;

        // ── Top categories per module ───────────────────────────────────
        $topMarketplaceCategories = MarketplaceListing::select('category', DB::raw('count(*) as c'))
            ->groupBy('category')->orderByDesc('c')->limit(5)
            ->get()->map(fn ($r) => "{$r->category} ({$r->c})")->all();

        $topResourceTypes = Resource::select('resource_type', DB::raw('count(*) as c'))
            ->groupBy('resource_type')->orderByDesc('c')->limit(5)
            ->get()->map(fn ($r) => "{$r->resource_type} ({$r->c})")->all();

        // ── Report reasons — what content is being flagged most ─────────
        $topReportReasons = Report::select('reason', DB::raw('count(*) as c'))
            ->groupBy('reason')->orderByDesc('c')->limit(5)
            ->get()->map(fn ($r) => mb_strimwidth($r->reason ?? 'unspecified', 0, 40, '…') . " ({$r->c})")->all();

        // ── Department breakdown of approved users ─────────────────────
        // `department` may be cast to a Department enum, so we coerce to string here.
        $departmentBreakdown = User::approved()
            ->select('department', DB::raw('count(*) as c'))
            ->whereNotNull('department')
            ->groupBy('department')->orderByDesc('c')
            ->get()
            ->map(fn ($r) => ((string) ($r->department?->value ?? $r->department)) . " ({$r->c})")
            ->all();

        return [
            'generated_at'        => now()->format('Y-m-d H:i'),
            'users' => [
                'total'       => $totalUsers,
                'approved'    => $approvedUsers,
                'pending'     => $pendingUsers,
                'rejected'    => $rejectedUsers,
                'active_1d'   => $activeUsers1d,
                'active_7d'   => $activeUsers7d,
                'active_30d'  => $activeUsers30d,
                'departments' => $departmentBreakdown,
            ],
            'content' => [
                'marketplace'        => $marketplaceCount,
                'marketplace_sold'   => $marketplaceSold,
                'resources'          => $resourcesCount,
                'exchange'           => $exchangeCount,
                'roommate_posts'     => $roommateCount,
                'lost_found'         => $lostFoundCount,
                'lost_found_resolved'=> $lostFoundResolved,
                'blood_requests'     => $bloodCount,
            ],
            'reports' => [
                'open'     => $openReports,
                'resolved' => $resolvedReports,
                'top_reasons' => $topReportReasons,
            ],
            'top_categories' => [
                'marketplace' => $topMarketplaceCategories,
                'resources'   => $topResourceTypes,
            ],
            'engagement' => [
                'posts_per_active_user_7d' => $engagementRatio,
                'retention_rate_7d_pct'     => $retentionRate,
                'activation_rate_7d_pct'    => $activationRate,
                'peak_hour_30d'            => $peakHourLabel,
                'peak_hour_count_30d'      => $peakCount,
            ],
            'growth_indicators' => $growth,
            'module_growth_wow' => $moduleGrowth,
            'weekly_buckets_4w' => $weeklyBuckets,
            'monthly_buckets'   => $monthlyBuckets, // alias of weekly_buckets_4w for clarity
            'weekly_activity'   => $weeklyData,
        ];
    }

    /**
     * Compute percent change between two numbers, handling division-by-zero.
     * Returns a signed integer percentage (e.g. +25, -40) or 0 if both are 0.
     */
    protected function pctChange(int $now, int $prev): int
    {
        if ($prev === 0 && $now === 0) return 0;
        if ($prev === 0) return 100; // anything from zero is "infinite" growth; cap at +100
        return (int) round((($now - $prev) / $prev) * 100);
    }

    /**
     * Convert the structured stats payload into a compact natural-language
     * prompt that asks Gemini for an executive summary.
     */
    protected function buildPrompt(array $stats): string
    {
        $lines = [];
        $lines[] = "Snapshot time: {$stats['generated_at']}";
        $u = $stats['users'];
        $lines[] = "USERS: total={$u['total']}, approved={$u['approved']}, pending={$u['pending']}, rejected={$u['rejected']}, active_1d={$u['active_1d']}, active_7d={$u['active_7d']}, active_30d={$u['active_30d']}";
        if (!empty($u['departments'])) {
            $lines[] = "  Departments: " . implode(', ', $u['departments']);
        }

        $c = $stats['content'];
        $lines[] = "CONTENT: marketplace={$c['marketplace']} (sold={$c['marketplace_sold']}), resources={$c['resources']}, exchange={$c['exchange']}, roommate_posts={$c['roommate_posts']}, lost_found={$c['lost_found']} (resolved={$c['lost_found_resolved']}), blood_requests={$c['blood_requests']}";

        $r = $stats['reports'];
        $lines[] = "REPORTS: open={$r['open']}, resolved={$r['resolved']}";
        if (!empty($r['top_reasons'])) {
            $lines[] = "  Top report reasons: " . implode('; ', $r['top_reasons']);
        }

        if (!empty($stats['top_categories']['marketplace'])) {
            $lines[] = "Top marketplace categories: " . implode(', ', $stats['top_categories']['marketplace']);
        }
        if (!empty($stats['top_categories']['resources'])) {
            $lines[] = "Top resource types: " . implode(', ', $stats['top_categories']['resources']);
        }

        // ── Engagement & retention signals ──────────────────────────────
        $e = $stats['engagement'];
        $lines[] = "ENGAGEMENT: posts_per_active_user_7d={$e['posts_per_active_user_7d']}, retention_7d_pct={$e['retention_rate_7d_pct']}%, new_user_activation_7d_pct={$e['activation_rate_7d_pct']}%, peak_hour_30d={$e['peak_hour_30d']} ({$e['peak_hour_count_30d']} sessions)";

        // ── Week-over-week growth deltas (most actionable for Gemini) ───
        $g = $stats['growth_indicators'];
        $lines[] = "WEEK_OVER_WEEK (this week vs last week): signups={$g['signups_wow']}%, total_posts={$g['posts_wow']}%, active_users={$g['active_users_wow']}%, reports={$g['reports_wow']}%";

        // ── Per-module growth (compact) ─────────────────────────────────
        $mgParts = [];
        foreach ($stats['module_growth_wow'] as $key => $m) {
            $sign = $m['wow_change'] > 0 ? '+' : '';
            $mgParts[] = "{$key}: {$m['last_7d']} ({$sign}{$m['wow_change']}%)";
        }
        $lines[] = "MODULE_GROWTH_WOW (last_7d count, week-over-week %): " . implode('; ', $mgParts);

        // ── 4-week trend (compressed) ───────────────────────────────────
        $trendParts = [];
        foreach ($stats['monthly_buckets'] as $b) {
            $trendParts[] = "{$b['label']}: signups={$b['signups']}, posts={$b['posts']}, active_users={$b['active']}";
        }
        $lines[] = "4_WEEK_TREND: " . implode(' | ', $trendParts);

        // ── Last 7 days (daily) ─────────────────────────────────────────
        $weekly = $stats['weekly_activity'];
        $weeklyStr = implode(' | ', array_map(fn ($d) => "{$d['day']}: users={$d['users']}, posts={$d['posts']}", $weekly));
        $lines[] = "LAST_7_DAYS (signups vs posts): {$weeklyStr}";

        $body = implode("\n", $lines);

        // Ask for a detailed, information-dense Markdown report. Target ~450-650 words.
        return <<<PROMPT
You are a senior analytics assistant writing a weekly executive briefing for the admin of MyCampus — a university campus platform (marketplace, resources, exchange, roommates, lost & found, blood requests). You are given the current platform snapshot PLUS week-over-week deltas, a 4-week trend, per-module growth, retention, activation, engagement ratios, and a peak usage hour.

Write a DETAILED executive briefing in plain English using Markdown (no code fences). Structure it as 6 sections. Be specific with the numbers provided; do NOT invent figures.

### 1. Executive Summary
A 2-3 sentence overall assessment combining growth, engagement, and retention signals.

### 2. User Base & Activity Trends
A short paragraph (3-5 sentences) covering:
- Total/approved/pending/rejected user counts and what they imply
- Active user trends (DAU/7d/30d) and how they compare to the user base size
- Week-over-week signup and active-user growth, calling out acceleration or decline using the 4_WEEK_TREND and WEEK_OVER_WEEK lines
- Retention and activation rates and what they signal about product-market fit

### 3. Module-by-Module Content Analysis
For EACH module listed in MODULE_GROWTH_WOW (marketplace, resources, exchange, roommates, lost_found, blood), write 1-2 sentences:
- Current 7-day volume vs previous 7-day volume
- Whether it's accelerating, steady, or declining
- Any context from top categories or content totals (e.g. marketplace sell-through rate, lost_found resolution rate)

### 4. Engagement & Retention Health
A short paragraph interpreting:
- Posts-per-active-user ratio (is content creation healthy or concentrated on a few users?)
- 7d retention rate (are users coming back?)
- New-user activation rate (are signups actually using the product?)
- Peak hour of activity and what it suggests about optimal announcement timing

### 5. Issues & Risks
A bullet list (3-6 bullets) flagging anything concerning with specific numbers. Examples: declining WoW growth, low retention, rising reports, unsold inventory, unresolved lost & found items, low activation.

### 6. Recommended Actions
A numbered list (3-5 actions) of concrete next steps for the admin this week. Reference peak_hour where posting timing matters. Be specific and actionable.

Target length: 450-650 words. Use the actual numbers in the DATA section; do not fabricate.

DATA:
{$body}
PROMPT;
    }
}
