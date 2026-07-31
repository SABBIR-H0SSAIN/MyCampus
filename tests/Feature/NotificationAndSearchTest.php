<?php

namespace Tests\Feature;

use App\Models\MarketplaceListing;
use App\Models\RoommatePost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationAndSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_retrieve_and_mark_notifications_as_read(): void
    {
        $user = User::factory()->create(['registration_status' => 'approved']);

        // Create in-app notification directly in notifications table
        $user->notifications()->create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'type' => 'App\\Notifications\\NewRequestNotification',
            'data' => [
                'title' => 'New Roommate Request',
                'message' => 'Sabbir sent you a roommate inquiry.',
                'link' => '/app/roommates',
            ],
            'read_at' => null,
        ]);

        $listResponse = $this->actingAs($user, 'sanctum')->getJson('/api/notifications');
        $listResponse->assertStatus(200);
        $listResponse->assertJsonFragment(['title' => 'New Roommate Request']);

        // Mark all as read
        $readAllResponse = $this->actingAs($user, 'sanctum')->putJson('/api/notifications/read-all');
        $readAllResponse->assertStatus(200);

        $this->assertEquals(0, $user->unreadNotifications()->count());
    }

    public function test_global_search_returns_grouped_results(): void
    {
        $user = User::factory()->create(['registration_status' => 'approved']);

        MarketplaceListing::create([
            'user_id' => $user->id,
            'title' => 'Microcontroller Arduino Uno Kit',
            'category' => 'Electronics',
            'price' => 750,
            'condition' => 'Good',
            'location' => 'Campus',
            'phone' => '01712345678',
            'description' => 'Complete kit with jumper wires',
        ]);

        RoommatePost::create([
            'user_id' => $user->id,
            'title' => 'Roommate near Arduino lab Fulbarigate',
            'location' => 'Fulbarigate',
            'budget' => 2000,
            'move_in_date' => now()->addDays(5)->format('Y-m-d'),
            'description' => 'Clean room',
            'contact' => '01711111111',
        ]);

        $searchResponse = $this->actingAs($user, 'sanctum')->getJson('/api/search?q=Arduino');
        $searchResponse->assertStatus(200);
        $searchResponse->assertJsonStructure([
            'q',
            'total',
            'groups' => [
                'marketplace',
                'roommates',
            ],
        ]);
        $this->assertGreaterThanOrEqual(2, $searchResponse->json('total'));
    }
}
