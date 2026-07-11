<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    protected string $apiKey;
    /**
     * Default Gemini model. We use the `-latest` alias so the model auto-updates
     * to whatever currently works for this API key — Google's "stable" version
     * names (gemini-2.0-flash, gemini-2.5-flash, etc.) are frequently retired
     * for new users or move behind billing, while the *-latest aliases always
     * resolve to a currently-supported model with working free-tier access.
     */
    protected string $model;
    protected string $endpoint;

    /** Maximum number of automatic retries on 429 rate-limit responses */
    protected int $maxRetries = 2;

    public function __construct()
    {
        $this->apiKey   = config('services.gemini.key');
        $this->model    = config('services.gemini.model', 'gemini-flash-lite-latest');
        $this->endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent";
    }

    /**
     * Send a text prompt to Gemini and get back the text response.
     * Automatically retries once on 429 (rate-limit) with a short delay.
     *
     * @param  string      $prompt
     * @param  int|null    $maxOutputTokens  Override the default output token cap.
     *                                       Pass null to use the service default (150).
     * @return string|null  Returns null on failure so callers can show a user-friendly error.
     */
    public function generate(string $prompt, ?int $maxOutputTokens = null): ?string
    {
        $attempt = 0;
        $tokenCap = $maxOutputTokens ?? 150;

        while ($attempt <= $this->maxRetries) {
            try {
                $response = Http::timeout(30)->post("{$this->endpoint}?key={$this->apiKey}", [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt],
                            ],
                        ],
                    ],
                    'generationConfig' => [
                        'temperature'     => 0.4,
                        'maxOutputTokens' => $tokenCap, // caller-controlled (default 150 for short replies)
                    ],
                ]);

                // On 429: wait and retry
                if ($response->status() === 429) {
                    $attempt++;
                    if ($attempt > $this->maxRetries) {
                        Log::warning('Gemini API rate-limited after retries', [
                            'model'  => $this->model,
                            'status' => 429,
                        ]);
                        return null;
                    }
                    // Exponential backoff: 5s, 10s
                    sleep(5 * $attempt);
                    continue;
                }

                if ($response->failed()) {
                    Log::error('Gemini API error', [
                        'status' => $response->status(),
                        'body'   => $response->body(),
                    ]);
                    return null;
                }

                $data = $response->json();

                return $data['candidates'][0]['content']['parts'][0]['text'] ?? null;

            } catch (\Throwable $e) {
                Log::error('Gemini service exception: ' . $e->getMessage());
                return null;
            }
        }

        return null;
    }
}
