<?php

namespace App\Http\Controllers;

use App\Services\GeminiService;
use App\Services\RagRetrieverService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AiChatController extends Controller
{
    /**
     * Handle incoming real-time RAG AI chat requests and stream response via SSE.
     */
    public function chat(Request $request, RagRetrieverService $rag, GeminiService $gemini)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:600',
        ]);

        $userQuery = trim($validated['message']);

        // 1. Extract RAG context from live database
        $dbContext = $rag->getContextForQuery($userQuery);

        // 2. Build system prompt with RAG grounding rules
        $prompt = <<<EOT
You are MyCampus AI, a helpful, polite, and concise university campus assistant for student services.
Your role is to help students find information about roommates, marketplace items, emergency blood requests, academic resources, lost & found items, and campus notices.

GROUNDING RULES:
1. Always base your response on the campus database context provided below whenever possible.
2. Whenever referencing a specific item, post, or request from the database context, ALWAYS include its exact tag (e.g. [MARKETPLACE #34], [ROOMMATE #1], [BLOOD_REQUEST #2], [RESOURCE #4], [EXCHANGE #5], [LOST_FOUND #6]). The system uses these tags to automatically render direct interactive links for the student.
3. If no relevant database context is found, politely answer using general knowledge while stating that no matching active posts were found in the campus system.
4. Keep responses clear, concise, and helpful.

CAMPUS DATABASE CONTEXT:
{$dbContext}

USER QUESTION:
{$userQuery}
EOT;

        // 3. Generate content from Gemini LLM
        $aiResponse = $gemini->generate($prompt, 400);

        if (!$aiResponse) {
            $aiResponse = "I'm currently unable to reach the AI engine. Please try again in a moment.";
        }

        // 4. Stream token output back to client via Server-Sent Events (SSE)
        return response()->stream(function () use ($aiResponse) {
            // Split response into readable words/tokens for smooth real-time stream simulation
            $words = preg_split('/(\s+)/u', $aiResponse, -1, PREG_SPLIT_DELIM_CAPTURE);

            foreach ($words as $chunk) {
                if ($chunk === '') {
                    continue;
                }
                echo "data: " . json_encode(['text' => $chunk]) . "\n\n";
                if (ob_get_level() > 0) {
                    ob_flush();
                }
                flush();
                usleep(25000); // 25ms delay for smooth typing cadence
            }

            echo "data: [DONE]\n\n";
            if (ob_get_level() > 0) {
                ob_flush();
            }
            flush();
        }, 200, [
            'Content-Type'      => 'text/event-stream',
            'Cache-Control'     => 'no-cache, no-transform',
            'X-Accel-Buffering' => 'no',
            'Connection'        => 'keep-alive',
        ]);
    }
}
