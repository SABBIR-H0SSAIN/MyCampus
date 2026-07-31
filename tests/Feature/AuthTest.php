<?php

namespace Tests\Feature;

use App\Enums\RegistrationStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_register_with_valid_details(): void
    {
        Storage::fake('public');

        $payload = [
            'name' => 'New Student',
            'email' => 'student.new@kuet.ac.bd',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'roll_number' => '2207199',
            'department' => 'CSE',
            'batch' => 2022,
            'gender' => 'male',
            'phone' => '01712345678',
            'student_id_card' => UploadedFile::fake()->image('id_card.jpg'),
        ];

        $response = $this->postJson('/api/auth/register', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email' => 'student.new@kuet.ac.bd',
            'roll_number' => '2207199',
            'registration_status' => RegistrationStatus::Pending->value,
            'role' => 'student',
        ]);
    }

    public function test_registration_fails_on_duplicate_email_or_roll(): void
    {
        Storage::fake('public');

        User::factory()->create([
            'email' => 'existing@kuet.ac.bd',
            'roll_number' => '2207101',
        ]);

        $payload = [
            'name' => 'Duplicate Student',
            'email' => 'existing@kuet.ac.bd',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'roll_number' => '2207101',
            'department' => 'CSE',
            'batch' => 2022,
            'gender' => 'male',
            'phone' => '01712345678',
            'student_id_card' => UploadedFile::fake()->image('id_card.jpg'),
        ];

        $response = $this->postJson('/api/auth/register', $payload);
        $response->assertStatus(422);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'approved@kuet.ac.bd',
            'password' => bcrypt('secret123'),
            'registration_status' => 'approved',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'approved@kuet.ac.bd',
            'password' => 'secret123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['token', 'user']);
    }

    public function test_user_cannot_login_with_invalid_password(): void
    {
        User::factory()->create([
            'email' => 'user@kuet.ac.bd',
            'password' => bcrypt('correct-password'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'user@kuet.ac.bd',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401);
    }

    public function test_unapproved_user_blocked_from_protected_endpoints(): void
    {
        $pendingUser = User::factory()->create([
            'registration_status' => 'pending',
        ]);

        $response = $this->actingAs($pendingUser, 'sanctum')
            ->getJson('/api/dashboard/stats');

        $response->assertStatus(403);
    }

    public function test_authenticated_user_can_view_and_update_profile(): void
    {
        $user = User::factory()->create(['name' => 'Original Name', 'registration_status' => 'approved']);
        $user->profile()->create(['bio' => 'Original bio']);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/profile');
        $response->assertStatus(200);

        $updateResponse = $this->actingAs($user, 'sanctum')->putJson('/api/profile', [
            'name' => 'Updated Name',
            'bio' => 'Updated campus bio',
        ]);
        $updateResponse->assertStatus(200);
        $this->assertDatabaseHas('profiles', [
            'user_id' => $user->id,
            'bio' => 'Updated campus bio',
        ]);
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
        ]);
    }

    public function test_user_can_logout(): void
    {
        $user = User::factory()->create(['registration_status' => 'approved']);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/auth/logout');
        $response->assertStatus(200);
    }
}
