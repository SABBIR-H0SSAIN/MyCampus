<?php

namespace Tests\Feature;

use App\Models\BloodDonationResponse;
use App\Models\BloodRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BloodRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_blood_requests(): void
    {
        $user = User::factory()->create(['registration_status' => 'approved']);
        BloodRequest::create([
            'user_id' => $user->id,
            'blood_group' => 'B+',
            'units' => 2,
            'hospital' => 'Khulna Medical College Hospital',
            'latitude' => 22.8250,
            'longitude' => 89.5400,
            'date_time' => now()->addDay(),
            'contact' => '01712345678',
            'priority' => 'Emergency',
            'notes' => 'Surgery tomorrow morning',
            'status' => 'Active',
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/blood-requests');
        $response->assertStatus(200);
        $response->assertJsonFragment(['blood_group' => 'B+', 'hospital' => 'Khulna Medical College Hospital']);
    }

    public function test_can_create_blood_request(): void
    {
        $user = User::factory()->create(['registration_status' => 'approved']);

        $payload = [
            'blood_group' => 'O+',
            'units' => 1,
            'hospital' => 'City Hospital, Khulna',
            'latitude' => 22.8188,
            'longitude' => 89.5537,
            'date_time' => now()->addHours(6)->format('Y-m-d H:i:s'),
            'contact' => '01799999999',
            'priority' => 'Standard',
            'notes' => 'Patient admitted in ICU room 302',
        ];

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/blood-requests', $payload);
        $response->assertStatus(201);

        $this->assertDatabaseHas('blood_requests', [
            'user_id' => $user->id,
            'blood_group' => 'O+',
            'latitude' => 22.8188,
            'longitude' => 89.5537,
        ]);
    }

    public function test_user_can_volunteer_and_withdraw_blood_donation(): void
    {
        $requester = User::factory()->create(['registration_status' => 'approved']);
        $donor = User::factory()->create(['registration_status' => 'approved']);

        $request = BloodRequest::create([
            'user_id' => $requester->id,
            'blood_group' => 'A+',
            'units' => 1,
            'hospital' => 'KMCH',
            'date_time' => now()->addDay(),
            'contact' => '01711111111',
            'priority' => 'Standard',
            'status' => 'Active',
        ]);

        // Volunteer to donate
        $donateResponse = $this->actingAs($donor, 'sanctum')->postJson("/api/blood-requests/{$request->id}/donate");
        $donateResponse->assertStatus(200);
        $this->assertDatabaseHas('blood_donation_responses', [
            'blood_request_id' => $request->id,
            'user_id' => $donor->id,
        ]);

        // Withdraw offer
        $withdrawResponse = $this->actingAs($donor, 'sanctum')->postJson("/api/blood-requests/{$request->id}/donate");
        $withdrawResponse->assertStatus(200);
        $this->assertDatabaseMissing('blood_donation_responses', [
            'blood_request_id' => $request->id,
            'user_id' => $donor->id,
        ]);
    }

    public function test_owner_can_resolve_and_delete_blood_request(): void
    {
        $user = User::factory()->create(['registration_status' => 'approved']);
        $request = BloodRequest::create([
            'user_id' => $user->id,
            'blood_group' => 'AB+',
            'units' => 1,
            'hospital' => 'Gazi Medical',
            'date_time' => now()->addDays(2),
            'contact' => '01712345678',
            'priority' => 'Standard',
            'status' => 'Active',
        ]);

        // Update status to Resolved
        $updateResponse = $this->actingAs($user, 'sanctum')->putJson("/api/blood-requests/{$request->id}", [
            'status' => 'Resolved',
        ]);
        $updateResponse->assertStatus(200);
        $this->assertDatabaseHas('blood_requests', [
            'id' => $request->id,
            'status' => 'Resolved',
        ]);

        // Delete request
        $deleteResponse = $this->actingAs($user, 'sanctum')->deleteJson("/api/blood-requests/{$request->id}");
        $deleteResponse->assertStatus(200);
        $this->assertDatabaseMissing('blood_requests', [
            'id' => $request->id,
        ]);
    }
}
