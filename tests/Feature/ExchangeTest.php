<?php

namespace Tests\Feature;

use App\Models\ExchangePost;
use App\Models\ExchangeRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExchangeTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_and_create_exchange_posts(): void
    {
        $user = User::factory()->create(['registration_status' => 'approved']);

        $payload = [
            'offering' => 'Physics Textbook Vol 1',
            'desire' => 'Chemistry Textbook Vol 1',
            'description' => 'Clean book with no markings.',
            'phone' => '01712345678',
        ];

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/exchange', $payload);
        $response->assertStatus(201);

        $this->assertDatabaseHas('exchange_posts', [
            'user_id' => $user->id,
            'offering' => 'Physics Textbook Vol 1',
            'desire' => 'Chemistry Textbook Vol 1',
        ]);

        $listResponse = $this->actingAs($user, 'sanctum')->getJson('/api/exchange');
        $listResponse->assertStatus(200);
        $listResponse->assertJsonFragment(['offering' => 'Physics Textbook Vol 1']);
    }

    public function test_can_send_exchange_request_and_owner_accepts(): void
    {
        $owner = User::factory()->create(['registration_status' => 'approved']);
        $partner = User::factory()->create(['registration_status' => 'approved']);

        $post = ExchangePost::create([
            'user_id' => $owner->id,
            'offering' => 'Gaming Mouse',
            'desire' => 'USB-C Hub',
            'description' => 'Working great',
            'phone' => '01711111111',
        ]);

        // Partner sends request
        $reqResponse = $this->actingAs($partner, 'sanctum')->postJson("/api/exchange/{$post->id}/request", [
            'message' => 'I have an Anker 7-in-1 USB-C hub to trade.',
            'phone' => '01755555555',
        ]);
        $reqResponse->assertStatus(201);

        $requestRecord = ExchangeRequest::where('exchange_post_id', $post->id)->first();
        $this->assertNotNull($requestRecord);

        // Owner accepts request
        $acceptResponse = $this->actingAs($owner, 'sanctum')->putJson("/api/exchange/requests/{$requestRecord->id}/accept");
        $acceptResponse->assertStatus(200);

        $this->assertDatabaseHas('exchange_requests', [
            'id' => $requestRecord->id,
            'status' => 'accepted',
        ]);
    }
}
