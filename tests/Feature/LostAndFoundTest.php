<?php

namespace Tests\Feature;

use App\Models\LostAndFoundItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LostAndFoundTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_lost_and_found_items(): void
    {
        $user = User::factory()->create(['registration_status' => 'approved']);
        $item = LostAndFoundItem::create([
            'user_id' => $user->id,
            'type' => 'lost',
            'title' => 'Black Leather Wallet',
            'category' => 'Wallet',
            'description' => 'Lost near Central Library with student ID card inside.',
            'location' => 'Central Library',
            'latitude' => 22.9008,
            'longitude' => 89.5020,
            'date' => now()->format('Y-m-d'),
            'phone' => '01712345678',
            'status' => 'active',
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/lost-found');
        $response->assertStatus(200);
        $response->assertJsonFragment(['title' => 'Black Leather Wallet']);
    }

    public function test_can_create_report_with_coordinates(): void
    {
        $user = User::factory()->create(['registration_status' => 'approved']);

        $payload = [
            'type' => 'found',
            'title' => 'House Keys with Red Keychain',
            'category' => 'Keys',
            'description' => 'Found on bench in front of CSE Building.',
            'location' => 'CSE Building, KUET',
            'latitude' => 22.9006,
            'longitude' => 89.5024,
            'date' => now()->format('Y-m-d'),
            'phone' => '01799999999',
        ];

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/lost-found', $payload);
        $response->assertStatus(201);

        $this->assertDatabaseHas('lost_and_found_items', [
            'user_id' => $user->id,
            'title' => 'House Keys with Red Keychain',
            'latitude' => 22.9006,
            'longitude' => 89.5024,
        ]);
    }

    public function test_owner_can_resolve_and_delete_item(): void
    {
        $user = User::factory()->create(['registration_status' => 'approved']);
        $item = LostAndFoundItem::create([
            'user_id' => $user->id,
            'type' => 'lost',
            'title' => 'Scientific Calculator',
            'category' => 'Calculator',
            'description' => 'Casio 991EX',
            'location' => 'Room 205',
            'date' => now()->format('Y-m-d'),
            'phone' => '01711111111',
            'status' => 'active',
        ]);

        // Mark resolved
        $updateResponse = $this->actingAs($user, 'sanctum')->putJson("/api/lost-found/{$item->id}", [
            'status' => 'resolved',
        ]);
        $updateResponse->assertStatus(200);

        $this->assertDatabaseHas('lost_and_found_items', [
            'id' => $item->id,
            'status' => 'resolved',
        ]);

        // Delete item
        $deleteResponse = $this->actingAs($user, 'sanctum')->deleteJson("/api/lost-found/{$item->id}");
        $deleteResponse->assertStatus(200);

        $this->assertDatabaseMissing('lost_and_found_items', [
            'id' => $item->id,
        ]);
    }
}
