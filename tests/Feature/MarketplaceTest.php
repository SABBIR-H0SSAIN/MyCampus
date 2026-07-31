<?php

namespace Tests\Feature;

use App\Models\MarketplaceListing;
use App\Models\MarketplaceRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MarketplaceTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_and_view_marketplace_items(): void
    {
        $user = User::factory()->create(['registration_status' => 'approved']);
        $listing = MarketplaceListing::create([
            'user_id' => $user->id,
            'title' => 'Scientific Calculator Casio FX-991EX',
            'price' => 1200,
            'condition' => 'Like new',
            'category' => 'Electronics',
            'location' => 'Central Library',
            'latitude' => 22.9008,
            'longitude' => 89.5020,
            'phone' => '01712345678',
            'description' => 'Original Classwiz calculator in pristine condition.',
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/marketplace');
        $response->assertStatus(200);
        $response->assertJsonFragment(['title' => 'Scientific Calculator Casio FX-991EX']);

        $showResponse = $this->actingAs($user, 'sanctum')->getJson("/api/marketplace/{$listing->id}");
        $showResponse->assertStatus(200);
        $showResponse->assertJsonStructure(['message', 'views']);
    }

    public function test_can_create_and_update_marketplace_listing(): void
    {
        $user = User::factory()->create(['registration_status' => 'approved']);

        $payload = [
            'title' => 'Wooden Study Table',
            'category' => 'Furniture',
            'price' => 1800,
            'condition' => 'Good',
            'location' => 'Fulbarigate',
            'latitude' => 22.8996,
            'longitude' => 89.5042,
            'phone' => '01722222222',
            'description' => 'Solid wooden study table with 2 drawers.',
        ];

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/marketplace', $payload);
        $response->assertStatus(201);

        $this->assertDatabaseHas('marketplace_listings', [
            'user_id' => $user->id,
            'title' => 'Wooden Study Table',
            'latitude' => 22.8996,
            'longitude' => 89.5042,
        ]);

        $listing = MarketplaceListing::where('title', 'Wooden Study Table')->first();

        // Update listing
        $updateResponse = $this->actingAs($user, 'sanctum')->putJson("/api/marketplace/{$listing->id}", [
            'price' => 1500,
            'is_sold' => true,
        ]);
        $updateResponse->assertStatus(200);

        $this->assertDatabaseHas('marketplace_listings', [
            'id' => $listing->id,
            'price' => 1500,
            'is_sold' => true,
        ]);
    }

    public function test_user_can_toggle_favorite(): void
    {
        $owner = User::factory()->create(['registration_status' => 'approved']);
        $buyer = User::factory()->create(['registration_status' => 'approved']);

        $listing = MarketplaceListing::create([
            'user_id' => $owner->id,
            'title' => 'Mechanical Keyboard',
            'price' => 2500,
            'condition' => 'Like new',
            'category' => 'Electronics',
            'location' => 'Hall-3',
            'phone' => '01711111111',
            'description' => 'Blue switches RGB keyboard.',
        ]);

        // Add to favorite
        $favResponse = $this->actingAs($buyer, 'sanctum')->postJson("/api/marketplace/{$listing->id}/favorite");
        $favResponse->assertStatus(200);

        $this->assertTrue($buyer->favoriteListings()->where('marketplace_listings.id', $listing->id)->exists());

        // Remove from favorite
        $unfavResponse = $this->actingAs($buyer, 'sanctum')->postJson("/api/marketplace/{$listing->id}/favorite");
        $unfavResponse->assertStatus(200);

        $this->assertFalse($buyer->favoriteListings()->where('marketplace_listings.id', $listing->id)->exists());
    }

    public function test_buyer_can_send_inquiry_and_seller_can_accept(): void
    {
        $seller = User::factory()->create(['registration_status' => 'approved']);
        $buyer = User::factory()->create(['registration_status' => 'approved']);

        $listing = MarketplaceListing::create([
            'user_id' => $seller->id,
            'title' => 'Algorithms Textbook (CLRS)',
            'price' => 600,
            'condition' => 'Good',
            'category' => 'Books',
            'location' => 'Campus Library',
            'phone' => '01711111111',
            'description' => 'Hardcover 3rd edition.',
        ]);

        // Buyer sends purchase request
        $reqResponse = $this->actingAs($buyer, 'sanctum')->postJson("/api/marketplace/{$listing->id}/request", [
            'message' => 'I want to buy this book today at library.',
            'phone' => '01744444444',
        ]);
        $reqResponse->assertStatus(201);

        $requestRecord = MarketplaceRequest::where('marketplace_listing_id', $listing->id)->first();
        $this->assertNotNull($requestRecord);

        // Seller accepts request
        $acceptResponse = $this->actingAs($seller, 'sanctum')->putJson("/api/marketplace/requests/{$requestRecord->id}/accept");
        $acceptResponse->assertStatus(200);

        $this->assertDatabaseHas('marketplace_requests', [
            'id' => $requestRecord->id,
            'status' => 'accepted',
        ]);
    }
}
