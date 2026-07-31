<?php

namespace Tests\Feature;

use App\Models\MarketplaceBid;
use App\Models\MarketplaceListing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MarketplaceBidTest extends TestCase
{
    use RefreshDatabase;

    public function test_buyer_can_place_and_update_bid(): void
    {
        $seller = User::factory()->create(['registration_status' => 'approved']);
        $buyer = User::factory()->create(['registration_status' => 'approved']);

        $listing = MarketplaceListing::create([
            'user_id' => $seller->id,
            'title' => 'Calculus Early Transcendentals',
            'price' => 500,
            'condition' => 'Good',
            'category' => 'Books',
            'location' => 'Library',
            'phone' => '01711111111',
            'description' => 'Great condition book',
        ]);

        // Buyer places bid of 450
        $response = $this->actingAs($buyer, 'sanctum')->postJson("/api/marketplace/{$listing->id}/bids", [
            'amount' => 450,
            'message' => 'Can pick up tomorrow at TSC',
            'phone' => '01722222222',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('marketplace_bids', [
            'marketplace_listing_id' => $listing->id,
            'user_id' => $buyer->id,
            'amount' => 450,
            'status' => 'pending',
        ]);

        // Seller receives notification
        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $seller->id,
            'type' => 'App\\Notifications\\NewBidNotification',
        ]);

        // Buyer updates their bid to 480
        $updateResponse = $this->actingAs($buyer, 'sanctum')->postJson("/api/marketplace/{$listing->id}/bids", [
            'amount' => 480,
            'message' => 'Updated bid to 480',
        ]);
        $updateResponse->assertStatus(201);

        $this->assertDatabaseHas('marketplace_bids', [
            'marketplace_listing_id' => $listing->id,
            'user_id' => $buyer->id,
            'amount' => 480,
        ]);
    }

    public function test_seller_cannot_bid_on_own_listing(): void
    {
        $seller = User::factory()->create(['registration_status' => 'approved']);

        $listing = MarketplaceListing::create([
            'user_id' => $seller->id,
            'title' => 'Desk Lamp',
            'price' => 300,
            'condition' => 'Like new',
            'category' => 'Electronics',
            'location' => 'Hall 2',
            'phone' => '01711111111',
            'description' => 'LED Lamp',
        ]);

        $response = $this->actingAs($seller, 'sanctum')->postJson("/api/marketplace/{$listing->id}/bids", [
            'amount' => 250,
        ]);

        $response->assertStatus(400);
    }

    public function test_seller_can_accept_bid_and_close_listing(): void
    {
        $seller = User::factory()->create(['registration_status' => 'approved']);
        $buyer1 = User::factory()->create(['registration_status' => 'approved']);
        $buyer2 = User::factory()->create(['registration_status' => 'approved']);

        $listing = MarketplaceListing::create([
            'user_id' => $seller->id,
            'title' => 'Graphing Calculator',
            'price' => 1500,
            'condition' => 'Good',
            'category' => 'Electronics',
            'location' => 'Campus',
            'phone' => '01711111111',
            'description' => 'Calculator',
        ]);

        $bid1 = MarketplaceBid::create([
            'marketplace_listing_id' => $listing->id,
            'user_id' => $buyer1->id,
            'amount' => 1300,
            'status' => 'pending',
        ]);

        $bid2 = MarketplaceBid::create([
            'marketplace_listing_id' => $listing->id,
            'user_id' => $buyer2->id,
            'amount' => 1400,
            'status' => 'pending',
        ]);

        // Seller accepts bid2
        $acceptResponse = $this->actingAs($seller, 'sanctum')->putJson("/api/marketplace/bids/{$bid2->id}/accept");
        $acceptResponse->assertStatus(200);

        $this->assertDatabaseHas('marketplace_bids', [
            'id' => $bid2->id,
            'status' => 'accepted',
        ]);

        // Bid1 should be rejected
        $this->assertDatabaseHas('marketplace_bids', [
            'id' => $bid1->id,
            'status' => 'rejected',
        ]);

        // Listing marked as sold
        $this->assertDatabaseHas('marketplace_listings', [
            'id' => $listing->id,
            'is_sold' => true,
        ]);

        // Buyer2 receives acceptance notification
        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $buyer2->id,
            'type' => 'App\\Notifications\\BidAcceptedNotification',
        ]);
    }

    public function test_bidder_can_withdraw_pending_bid(): void
    {
        $seller = User::factory()->create(['registration_status' => 'approved']);
        $buyer = User::factory()->create(['registration_status' => 'approved']);

        $listing = MarketplaceListing::create([
            'user_id' => $seller->id,
            'title' => 'Wireless Mouse',
            'price' => 400,
            'condition' => 'Good',
            'category' => 'Electronics',
            'location' => 'TSC',
            'phone' => '01711111111',
            'description' => 'Mouse',
        ]);

        $bid = MarketplaceBid::create([
            'marketplace_listing_id' => $listing->id,
            'user_id' => $buyer->id,
            'amount' => 350,
            'status' => 'pending',
        ]);

        $withdrawResponse = $this->actingAs($buyer, 'sanctum')->deleteJson("/api/marketplace/bids/{$bid->id}");
        $withdrawResponse->assertStatus(200);

        $this->assertDatabaseHas('marketplace_bids', [
            'id' => $bid->id,
            'status' => 'withdrawn',
        ]);
    }
}
