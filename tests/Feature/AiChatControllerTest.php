<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AiChatControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_ai_chat(): void
    {
        $response = $this->postJson('/api/ai/chat', ['message' => 'Need roommate in Mirpur']);
        $response->assertStatus(401);
    }

    public function test_authenticated_approved_user_can_access_ai_chat(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/ai/chat', ['message' => 'Search CSE220 notes']);

        $response->assertStatus(200);
        $this->assertTrue(str_contains($response->headers->get('Content-Type'), 'text/event-stream'));
    }
}
