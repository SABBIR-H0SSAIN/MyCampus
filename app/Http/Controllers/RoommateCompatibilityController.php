<?php

namespace App\Http\Controllers;

use App\Models\RoommatePost;
use App\Services\GeminiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoommateCompatibilityController extends Controller
{
    public function __construct(protected GeminiService $gemini) {}

    /**
     * Check AI-powered compatibility between the auth user and a roommate post.
     *
     * Route: GET /api/roommates/{id}/compatibility
     * Middleware: auth:sanctum, EnsureUserApproved, ai.ratelimit
     *
     * Prompt is intentionally concise to minimise token usage on the free tier.
     */
    public function check(Request $request, int $id): JsonResponse
    {
        $post = RoommatePost::with('user.profile')->findOrFail($id);

        // Don't check compatibility with your own post
        if ($post->user_id === $request->user()->id) {
            return response()->json([
                'message' => 'You cannot check compatibility with your own post.',
            ], 400);
        }

        $authUser = $request->user();
        $authUser->load('profile');

        // ── Compact context variables ──────────────────────────────────────────
        $lifestyleStr = $post->lifestyle ? implode(', ', $post->lifestyle) : 'none';
        // Truncate long free-text fields to keep prompt short
        $postDesc  = mb_strimwidth($post->description  ?? '', 0, 120, '…');
        $bio       = $authUser->profile?->bio ?? '';
        $bioShort  = mb_strimwidth($bio, 0, 80, '…');
        $department = $authUser->department?->value ?? $authUser->department ?? 'Unknown';
        $batch      = $authUser->batch ?? '?';
        $gender     = $authUser->gender?->value ?? $authUser->gender ?? '?';

        // ── Compact prompt (~120 tokens vs ~300 before) ────────────────────────
        $prompt = <<<PROMPT
Rate roommate compatibility between these two students. Reply ONLY with valid JSON, no markdown.

POST: title="{$post->title}", location="{$post->location}", budget=৳{$post->budget}/mo, lifestyle=[{$lifestyleStr}], desc="{$postDesc}"
STUDENT: dept={$department}, batch={$batch}, gender={$gender}, bio="{$bioShort}"

JSON format: {"score":<0-100>,"label":"<Excellent Match|Good Match|Fair Match|Poor Match>","reason":"<1 sentence>"}
PROMPT;

        $raw = $this->gemini->generate($prompt);

        if (!$raw) {
            return response()->json([
                'message' => 'AI service is temporarily unavailable. Please try again in a moment.',
            ], 503);
        }

        // Strip markdown code fences if Gemini wraps response in ```json ... ```
        $json = preg_replace('/^```json\s*/i', '', trim($raw));
        $json = preg_replace('/```$/', '', trim($json));

        $result = json_decode(trim($json), true);

        if (json_last_error() !== JSON_ERROR_NONE || !isset($result['score'])) {
            return response()->json([
                'message' => 'Failed to parse AI response. Please try again.',
                'raw'     => $raw,
            ], 500);
        }

        // Clamp score to 0–100 for safety
        $result['score'] = max(0, min(100, (int) $result['score']));

        return response()->json($result);
    }
}
