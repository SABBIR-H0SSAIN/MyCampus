<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

/**
 * AiRateLimit Middleware
 *
 * Limits each authenticated user to a configurable number of AI feature
 * calls per calendar day (resets at midnight). The daily limit is read
 * from GEMINI_DAILY_LIMIT in .env (default: 5). Set it to 0 to disable
 * the limit entirely.
 */
class AiRateLimit
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $limit = config('services.gemini.daily_limit', 5);

        // 0 means unlimited — skip the check
        if ($limit === 0) {
            return $next($request);
        }

        // Cache key is unique per user and resets each calendar day
        $cacheKey = "ai_usage_{$user->id}_" . now()->toDateString();
        $usage    = (int) Cache::get($cacheKey, 0);

        if ($usage >= $limit) {
            return response()->json([
                'message'      => "You have reached your daily AI usage limit of {$limit} requests. Please try again tomorrow.",
                'limit'        => $limit,
                'used'         => $usage,
                'resets_at'    => now()->endOfDay()->toIso8601String(),
                'error_code'   => 'AI_RATE_LIMIT_EXCEEDED',
            ], 429);
        }

        // Increment usage counter; TTL keeps it alive until end of day
        $secondsUntilMidnight = now()->secondsUntilEndOfDay() + 1;
        Cache::put($cacheKey, $usage + 1, $secondsUntilMidnight);

        // Pass remaining quota as response headers for the frontend
        $response = $next($request);
        $response->headers->set('X-AI-Usage-Limit', $limit);
        $response->headers->set('X-AI-Usage-Used', $usage + 1);
        $response->headers->set('X-AI-Usage-Remaining', max(0, $limit - $usage - 1));

        return $response;
    }
}
