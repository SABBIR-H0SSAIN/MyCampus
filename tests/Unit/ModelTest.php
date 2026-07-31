<?php

namespace Tests\Unit;

use App\Models\BloodRequest;
use App\Models\LostAndFoundItem;
use App\Models\MarketplaceListing;
use App\Models\RoommatePost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_model_has_expected_relationships_and_scopes(): void
    {
        $user = User::factory()->create(['role' => 'student', 'registration_status' => 'approved']);
        $user->profile()->create(['bio' => 'Student Bio']);

        $this->assertNotNull($user->profile);
        $this->assertEquals('student', $user->role);
        $this->assertTrue(User::approved()->where('id', $user->id)->exists());
    }

    public function test_coordinate_attributes_and_casts_on_posts(): void
    {
        $user = User::factory()->create();

        $roommate = RoommatePost::create([
            'user_id' => $user->id,
            'title' => 'Test Roommate',
            'location' => 'Fulbarigate',
            'latitude' => 22.8996123,
            'longitude' => 89.5042123,
            'budget' => 3000,
            'move_in_date' => now()->format('Y-m-d'),
            'description' => 'Test',
            'contact' => '01700000000',
        ]);

        $this->assertEqualsWithDelta(22.8996123, (float) $roommate->latitude, 0.00001);
        $this->assertEqualsWithDelta(89.5042123, (float) $roommate->longitude, 0.00001);

        $blood = BloodRequest::create([
            'user_id' => $user->id,
            'blood_group' => 'O+',
            'units' => 1,
            'hospital' => 'KMCH',
            'latitude' => 22.8250,
            'longitude' => 89.5400,
            'date_time' => now(),
            'contact' => '01700000000',
            'priority' => 'Emergency',
            'status' => 'Active',
        ]);

        $this->assertEqualsWithDelta(22.8250, (float) $blood->latitude, 0.00001);
        $this->assertEqualsWithDelta(89.5400, (float) $blood->longitude, 0.00001);

        $market = MarketplaceListing::create([
            'user_id' => $user->id,
            'title' => 'Test Item',
            'price' => 500,
            'condition' => 'Good',
            'category' => 'Books',
            'location' => 'Library',
            'latitude' => 22.9000,
            'longitude' => 89.5000,
            'phone' => '01700000000',
            'description' => 'Test',
        ]);

        $this->assertEqualsWithDelta(22.9000, (float) $market->latitude, 0.00001);
        $this->assertEqualsWithDelta(89.5000, (float) $market->longitude, 0.00001);

        $lostFound = LostAndFoundItem::create([
            'user_id' => $user->id,
            'type' => 'lost',
            'title' => 'Lost ID Card',
            'category' => 'Card',
            'description' => 'Lost ID Card',
            'location' => 'Auditorium',
            'latitude' => 22.9010,
            'longitude' => 89.5015,
            'date' => now()->format('Y-m-d'),
            'phone' => '01700000000',
            'status' => 'active',
        ]);

        $this->assertEqualsWithDelta(22.9010, (float) $lostFound->latitude, 0.00001);
        $this->assertEqualsWithDelta(89.5015, (float) $lostFound->longitude, 0.00001);
    }
}
