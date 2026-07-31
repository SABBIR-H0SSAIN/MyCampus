<?php

namespace Tests\Feature;

use App\Models\RoommatePost;
use App\Models\RoommateRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoommateTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_roommate_posts(): void
    {
        $user = User::factory()->create(['registration_status' => 'approved']);
        $post = RoommatePost::create([
            'user_id' => $user->id,
            'title' => 'Flat near Fulbarigate',
            'location' => 'Fulbarigate',
            'latitude' => 22.8996,
            'longitude' => 89.5042,
            'budget' => 3000,
            'move_in_date' => now()->addDays(5)->format('Y-m-d'),
            'lifestyle' => ['Non-smoker', 'Quiet'],
            'description' => 'Great flat with clean environment',
            'contact' => '01711111111',
            'status' => 'Open',
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/roommates');
        $response->assertStatus(200);
        $response->assertJsonFragment(['title' => 'Flat near Fulbarigate']);
    }

    public function test_can_create_roommate_post_with_coordinates(): void
    {
        $user = User::factory()->create(['registration_status' => 'approved']);

        $payload = [
            'title' => 'Room available near KUET Gate 1',
            'location' => 'KUET Main Gate',
            'latitude' => 22.8996,
            'longitude' => 89.5042,
            'budget' => 2800,
            'move_in_date' => now()->addDays(10)->format('Y-m-d'),
            'lifestyle' => ['Non-smoker', 'Student focused'],
            'description' => 'Single room with attached balcony and fast Wi-Fi.',
            'contact' => '01722222222',
        ];

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/roommates', $payload);
        $response->assertStatus(201);

        $this->assertDatabaseHas('roommate_posts', [
            'user_id' => $user->id,
            'title' => 'Room available near KUET Gate 1',
            'latitude' => 22.8996,
            'longitude' => 89.5042,
        ]);
    }

    public function test_user_cannot_update_another_users_post(): void
    {
        $owner = User::factory()->create(['registration_status' => 'approved']);
        $stranger = User::factory()->create(['registration_status' => 'approved']);

        $post = RoommatePost::create([
            'user_id' => $owner->id,
            'title' => 'Original Title',
            'location' => 'Fulbarigate',
            'budget' => 2500,
            'move_in_date' => now()->addDays(5)->format('Y-m-d'),
            'description' => 'Description',
            'contact' => '01711111111',
        ]);

        $response = $this->actingAs($stranger, 'sanctum')->putJson("/api/roommates/{$post->id}", [
            'title' => 'Hacked Title',
        ]);

        $response->assertStatus(403);
    }

    public function test_user_can_submit_and_respond_to_roommate_request(): void
    {
        $owner = User::factory()->create(['registration_status' => 'approved']);
        $requester = User::factory()->create(['registration_status' => 'approved']);

        $post = RoommatePost::create([
            'user_id' => $owner->id,
            'title' => 'Roommate needed',
            'location' => 'Teligati',
            'budget' => 2000,
            'move_in_date' => now()->addDays(7)->format('Y-m-d'),
            'description' => 'Shared room',
            'contact' => '01711111111',
        ]);

        // Submit request
        $reqResponse = $this->actingAs($requester, 'sanctum')->postJson("/api/roommates/{$post->id}/request", [
            'message' => 'Hi, I am interested in sharing this flat.',
            'contact_number' => '01733333333',
        ]);
        $reqResponse->assertStatus(201);

        $requestRecord = RoommateRequest::where('roommate_post_id', $post->id)->first();
        $this->assertNotNull($requestRecord);

        // Owner responds / accepts
        $respondResponse = $this->actingAs($owner, 'sanctum')->postJson("/api/roommate-requests/{$requestRecord->id}/respond", [
            'status' => 'Accepted',
        ]);
        $respondResponse->assertStatus(200);

        $this->assertDatabaseHas('roommate_requests', [
            'id' => $requestRecord->id,
            'status' => 'Accepted',
        ]);
    }
}
