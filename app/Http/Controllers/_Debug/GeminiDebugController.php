<?php

namespace App\Http\Controllers\_Debug;

use App\Http\Controllers\Controller;
use App\Services\GeminiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Debug-only controller for quickly testing the Gemini AI integration
 * without going through a full feature flow.
 *
 * Usage:
 *   GET /api/_debug/gemini-test
 *   GET /api/_debug/gemini-test?prompt=Your test prompt
 *
 * Returns the resolved model, the prompt, and the raw Gemini response,
 * or a detailed error if the call fails. Admin-only.
 */
class GeminiDebugController extends Controller
{
    /**
     * Path: GET /api/_debug/gemini-test
     */
    public function test(Request $request, GeminiService $gemini): JsonResponse
    {
        $prompt = $request->query('prompt', 'Reply with exactly this JSON and nothing else: {"hello":"world"}');

        // Resolve the model the service is configured to use.
        // We use reflection so we don't have to expose internals.
        $resolvedModel = null;
        $endpoint      = null;
        try {
            $reflect = new \ReflectionClass($gemini);
            foreach (['model', 'endpoint', 'apiKey'] as $prop) {
                $p = $reflect->getProperty($prop);
                // PHP 8.1+ has public-by-default for reflection, but be explicit
                if (method_exists($p, 'setAccessible')) {
                    $p->setAccessible(true);
                }
                $value = $p->getValue($gemini);
                if ($prop === 'apiKey') {
                    // Mask the API key — never expose it in the response
                    $resolvedApiKey = $value
                        ? substr($value, 0, 4) . '…' . substr($value, -4) . ' (length ' . strlen($value) . ')'
                        : '(empty — check GEMINI_API_KEY in .env)';
                } elseif ($prop === 'model') {
                    $resolvedModel = $value;
                } else {
                    $endpoint = $value;
                }
            }
        } catch (Throwable $e) {
            // Reflection failures shouldn't break the endpoint; we already have enough debug info
        }

        $config = config('services.gemini');

        $startedAt = microtime(true);
        try {
            $result = $gemini->generate($prompt);
            $elapsedMs = (int) ((microtime(true) - $startedAt) * 1000);

            return response()->json([
                'status'           => $result === null ? 'empty' : 'ok',
                'config'           => [
                    'config_model'    => $config['model']         ?? null,
                    'daily_limit'     => $config['daily_limit']    ?? null,
                    'has_api_key'     => !empty($config['key']),
                    'api_key_preview' => $resolvedApiKey ?? null,
                ],
                'resolved_model'   => $resolvedModel,
                'endpoint'         => $endpoint,
                'prompt'           => $prompt,
                'response_chars'   => $result === null ? 0 : strlen($result),
                'response_preview' => $result === null
                    ? '(empty / null)'
                    : (strlen($result) > 800 ? substr($result, 0, 800) . '…[truncated]' : $result),
                'elapsed_ms'       => $elapsedMs,
                'hint'             => $result === null
                    ? 'Empty result usually means the Gemini call failed. Tail storage/logs/laravel.log for the full error body.'
                    : null,
            ]);
        } catch (Throwable $e) {
            $elapsedMs = (int) ((microtime(true) - $startedAt) * 1000);

            Log::error('GeminiDebugController exception', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return response()->json([
                'status'         => 'exception',
                'config'         => [
                    'config_model'    => $config['model']  ?? null,
                    'daily_limit'     => $config['daily_limit'] ?? null,
                    'has_api_key'     => !empty($config['key']),
                    'api_key_preview' => $resolvedApiKey ?? null,
                ],
                'resolved_model' => $resolvedModel,
                'endpoint'       => $endpoint,
                'prompt'         => $prompt,
                'elapsed_ms'     => $elapsedMs,
                'exception'      => [
                    'class'   => get_class($e),
                    'message' => $e->getMessage(),
                ],
            ], 500);
        }
    }
}
